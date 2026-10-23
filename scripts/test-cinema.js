'use strict';
const assert=require('node:assert/strict');
const mysql=require('mysql2/promise');
const {passwordHash}=require('/app/auth');
assert.match(process.env.DB_NAME,/^topic11_test_[a-f0-9]{12}$/,'Never run integration fixtures in the live DB');
const password='IntegrationOnly-'+require('node:crypto').randomBytes(12).toString('hex');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
class Client{
 constructor(){this.cookies={};}
 async request(path,fields){
  const headers={Cookie:Object.entries(this.cookies).map(([k,v])=>k+'='+v).join('; ')};
  const options={headers,redirect:'manual'};
  if(fields!==undefined){options.method='POST';options.body=new URLSearchParams({_csrf:this.cookies.booking_csrf||'',...fields});}
  const r=await fetch('http://127.0.0.1:3000'+path,options);
  for(const cookie of r.headers.getSetCookie()){const [k,v]=cookie.split(';')[0].split('=');this.cookies[k]=v;}
  return {code:r.status,body:await r.text(),location:r.headers.get('location')};
 }
 async login(name){await this.request('/login');const r=await this.request('/login',{username:name,password});assert.equal(r.code,303,r.body);}
 async save(path,values,expected=303){const r=await this.request(path,values);assert.equal(r.code,expected,path+' '+r.body.slice(-1000));return r;}
}
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,dateStrings:true,charset:'utf8mb4'});
 const one=async(sql,args=[])=>{const [[r]]=await db.execute(sql,args);return r;};
 try{
  const migrated=await one("SELECT s.movie_id,s.price,m.duration,m.age_rating FROM showtimes s JOIN movies m ON m.id=s.movie_id WHERE s.title='Legacy active test'");
  assert.ok(migrated.movie_id);assert.equal(Number(migrated.price),123456);assert.equal(migrated.duration,null);assert.equal(migrated.age_rating,null);
  assert.equal((await one("SELECT COUNT(*) AS n FROM movies WHERE title='Legacy active test'")).n,1);
  assert.equal((await one("SELECT COUNT(*) AS n FROM movies WHERE title='Legacy deleted test'")).n,0);
  for(const [name,role] of [['admin','admin'],['customer','customer']])await db.execute('INSERT INTO users(username,display_name,password_hash,role) VALUES(?,?,?,?)',[name,name,await passwordHash(password),role]);
  for(let attempt=0;attempt<20;attempt++){try{if((await fetch('http://127.0.0.1:3000/health')).ok)break;}catch{}await pause(250);}
  const admin=new Client(),customer=new Client();await admin.login('admin');await customer.login('customer');
  const cin=async name=>{await admin.save('/admin/cinemas/save',{name,address:'Địa chỉ kiểm thử',hotline:'000',image:''});return (await one('SELECT id FROM cinemas WHERE name=?',[name])).id;};
  const ca=await cin('Test A'),cb=await cin('Test B');
  await admin.save('/admin/movies/save',{title:'Phim kiểm thử',director:'Kiểm thử',actors:'',duration:'90',language:'Tiếng Việt',genre:'Kiểm thử',country:'',synopsis:'Nội dung kiểm thử',trailer:'',poster:'',banner:'',age_rating:'P',status:'showing'});const movie=(await one('SELECT id FROM movies WHERE title=?',['Phim kiểm thử'])).id;
  await admin.save('/admin/movies/'+movie+'/hide',{});assert.equal((await new Client().request('/movies/'+movie)).code,404);await admin.save('/admin/movies/'+movie+'/hide',{});
  await admin.save('/admin/movies/save',{id:movie,title:'Phim kiểm thử đã sửa',director:'Kiểm thử',actors:'',duration:90,language:'Tiếng Việt',genre:'Kiểm thử',country:'',synopsis:'Đã sửa',trailer:'',poster:'',banner:'',age_rating:'T13',status:'showing'});
  assert.equal((await one('SELECT title FROM movies WHERE id=?',[movie])).title,'Phim kiểm thử đã sửa');
  const hall=async(name,cinema)=>{await admin.save('/admin/halls/save',{name,cinema_id:cinema,row_count:1,col_count:4,cleanup_minutes:15});const h=(await one('SELECT id FROM halls WHERE name=?',[name])).id;await admin.save(`/admin/halls/${h}/seats`,{cell_1_1:'regular',cell_1_2:'vip',cell_1_3:'couple',cell_1_4:'aisle',vip:10000,couple:20000});return h;};
  const ha=await hall('Hall A',ca),hb=await hall('Hall B',cb);
  assert.ok((await admin.request('/admin/movies')).body.includes('/admin/showtimes?movie_id='+movie));
  const rooms=(await admin.request('/admin/halls?cinema_id='+ca)).body;
  assert.ok(rooms.includes('Hall A'));assert.ok(!rooms.includes('Hall B'));
  assert.ok(rooms.includes('/admin/showtimes?hall_id='+ha));
  await admin.save('/admin/showtimes/save',{movie_id:movie,hall_id:ha,starts_at:'2030-06-10T19:00',price:80000,format:'2D'});const sa=(await one('SELECT id FROM showtimes WHERE hall_id=?',[ha])).id;
  await admin.save('/admin/showtimes/save',{movie_id:movie,hall_id:ha,starts_at:'2030-06-10T20:40',price:80000,format:'2D'},409);
  await admin.save('/admin/showtimes/save',{movie_id:movie,hall_id:ha,starts_at:'2030-06-10T20:45',price:80000,format:'2D'});const sa2=(await one('SELECT MAX(id) AS id FROM showtimes')).id;
  await admin.save('/admin/showtimes/save',{movie_id:movie,hall_id:hb,starts_at:'2030-06-10T19:00',price:80000,format:'2D'});
  await admin.save(`/admin/halls/${ha}/seats`,{cell_1_1:'regular',cell_1_2:'vip',cell_1_3:'couple',cell_1_4:'aisle',vip:0,couple:0},400);
  for(const [name,role,cinema] of [['manager','manager',ca],['staff','staff',ca],['staffb','staff',cb],['support','support',ca]])await admin.save('/admin/users/save',{username:name,display_name:name,password,role,cinema_id:cinema,phone:'',email:''});
  const manager=new Client(),staff=new Client(),staffb=new Client(),support=new Client();await manager.login('manager');await staff.login('staff');await staffb.login('staffb');await support.login('support');
  assert.equal((await manager.request('/admin/showtimes?hall_id='+hb)).code,404);
  assert.equal((await staff.request('/booking-options')).code,403);
  const filtered=(await admin.request('/admin/showtimes?hall_id='+ha)).body;
  assert.ok(filtered.includes('/admin/bookings?showtime_id='+sa));
  assert.ok(!filtered.includes('/admin/showtimes?edit='+(await one('SELECT id FROM showtimes WHERE hall_id=?',[hb])).id+'"'));
  const exchangeOptions=JSON.parse((await customer.request('/booking-options?showtime_id='+sa)).body);
  assert.equal(exchangeOptions.length,3);assert.ok(exchangeOptions.every(s=>s.label!=='A4'));
  assert.equal((await admin.request('/admin/bookings?showtime_id=invalid')).code,400);
  assert.equal((await manager.request('/admin/movies')).code,403);assert.equal((await staff.request('/admin/reports')).code,403);assert.equal((await support.request('/admin/settings')).code,403);assert.equal((await customer.request('/admin/users')).code,403);
  assert.equal((await staff.request('/bookings/1')).code,403);
  await manager.save('/admin/showtimes/save',{movie_id:movie,hall_id:hb,starts_at:'2030-06-11T19:00',price:80000,format:'2D'},403);
  await manager.save('/admin/users/save',{username:'outsider',display_name:'X',password,role:'staff',cinema_id:cb,phone:'',email:''},403);
  await admin.save('/admin/pricing/save',{name:'Giá học sinh',format:'2D',day_type:'weekday',holiday_date:'',start_hour:0,end_hour:24,audience:'student',amount:60000,priority:10,active:1});
  await admin.save('/admin/vouchers/save',{code:'TEST10',kind:'percent',amount:10,min_total:0,quantity:1,starts_at:'2020-01-01T00:00',ends_at:'2040-01-01T00:00',active:1});
  await admin.save('/admin/products/save',{name:'Combo kiểm thử',category:'Combo',description:'',price:30000,image:'',active:1});const product=(await one('SELECT id FROM products')).id;
  const seat=(label,h)=>one('SELECT id FROM seats WHERE hall_id=? AND label=?',[h,label]);const a1=await seat('A1',ha),a2=await seat('A2',ha),aisle=await seat('A4',ha);
  for(const client of [admin,manager,staff,support])await client.save('/bookings',{showtime_id:sa,seat_id:a1.id,customer_name:'Forbidden'},403);
  assert.equal((await admin.request('/my-bookings')).code,403);
  assert.equal((await admin.request('/membership')).code,403);
  const adminShow=(await admin.request('/showtimes/'+sa)).body;
  assert.ok(!adminShow.includes('data-booking-form'));assert.ok(!adminShow.includes('Tiếp tục đặt vé'));
  await customer.save('/bookings',{showtime_id:sa,seat_id:aisle.id,customer_name:'Test'},400);
  await customer.save('/bookings',{showtime_id:sa,seat_id:(await seat('A1',hb)).id,customer_name:'Test'},400);
  const booked=await customer.save('/bookings',{showtime_id:sa,seat_id:a2.id,customer_name:'Test',audience:'student',voucher:'TEST10',phone:'0123456789',email:'test@example.invalid',['fnb_'+product]:1});const bid=Number(booked.location.split('/').pop());
  await admin.save('/bookings/'+bid+'/pay',{},403);
  await admin.save('/bookings/'+bid+'/request',{kind:'cancel',reason:'Forbidden'},403);
  const adminTicket=(await admin.request('/bookings/'+bid)).body;
  assert.ok(adminTicket.includes('CHI TIẾT GIAO DỊCH'));assert.ok(!adminTicket.includes('action="/bookings/'+bid+'/pay"'));assert.ok(!adminTicket.includes('href="/my-bookings"'));
  let b=await one('SELECT * FROM bookings WHERE id=?',[bid]);assert.equal(Number(b.ticket_price),70000);assert.equal(Number(b.discount_amount),10000);assert.equal(Number(b.fnb_total),30000);await admin.save('/admin/showtimes/'+sa+'/delete',{},409);
  await customer.save('/bookings',{showtime_id:sa,seat_id:a1.id,customer_name:'Test',voucher:'TEST10'},400);
  await customer.save('/bookings',{showtime_id:sa,seat_id:a2.id,customer_name:'Test'},409);
  await customer.save('/bookings/'+bid+'/pay',{});await customer.save('/bookings/'+bid+'/pay',{});assert.equal((await one('SELECT points FROM users WHERE username="customer"')).points,9);
  assert.equal((await customer.request('/bookings/'+bid+'/qr.svg')).code,200);
  await staffb.save('/admin/checkin',{token:b.checkin_token},403);await staff.save('/admin/checkin',{token:b.checkin_token},200);await staff.save('/admin/checkin',{token:b.checkin_token},409);
  const r2=await customer.save('/bookings',{showtime_id:sa2,seat_id:a1.id,customer_name:'Test',phone:'0123456789'});const bid2=Number(r2.location.split('/').pop());await customer.save('/bookings/'+bid2+'/pay',{});
  await customer.save('/bookings/'+bid2+'/request',{kind:'exchange',reason:'Đổi kiểm thử',target_showtime_id:sa,target_seat_id:a1.id});const req1=(await one('SELECT MAX(id) AS id FROM booking_requests')).id;await support.save('/admin/requests/'+req1+'/approve',{});assert.equal((await one('SELECT showtime_id FROM bookings WHERE id=?',[bid2])).showtime_id,sa);
  await customer.save('/bookings/'+bid2+'/request',{kind:'cancel',reason:'Hủy kiểm thử'});const req2=(await one('SELECT MAX(id) AS id FROM booking_requests')).id;await support.save('/admin/requests/'+req2+'/approve',{});assert.equal((await one('SELECT booking_status FROM bookings WHERE id=?',[bid2])).booking_status,'cancelled');await customer.save('/bookings/'+bid2+'/pay',{},409);
  const r3=await customer.save('/bookings',{showtime_id:sa2,seat_id:a1.id,customer_name:'Test'});const bid3=Number(r3.location.split('/').pop());await customer.save('/bookings/'+bid3+'/pay',{});const token3=(await one('SELECT checkin_token FROM bookings WHERE id=?',[bid3])).checkin_token;
  const racing=await Promise.all([staff.request('/admin/checkin',{token:token3}),staff.request('/admin/checkin',{token:token3})]);assert.deepEqual(racing.map(r=>r.code).sort(),[200,409]);
  await admin.save('/admin/tiers/save',{name:'Thân thiết kiểm thử',min_points:0,discount_percent:5});await admin.save('/admin/rewards/save',{name:'Quà kiểm thử',points_required:1,quantity:1});const reward=(await one('SELECT id FROM rewards')).id;await customer.save('/membership/redeem/'+reward,{});await customer.save('/membership/redeem/'+reward,{},400);
  await admin.save('/admin/content/save',{title:'Tin kiểm thử',kind:'news',body:'Nội dung thuần văn bản',image:'',link:'',published:1,sort_order:0});const news=(await one('SELECT id FROM content_posts')).id;assert.equal((await new Client().request('/news/'+news)).code,200);
  await admin.save('/admin/settings/momo',{enabled:1});assert.equal((await admin.request('/admin/settings')).code,200);
  const mediaResponse=await fetch('http://127.0.0.1:3000/admin/upload',{method:'POST',headers:{Cookie:Object.entries(admin.cookies).map(([k,v])=>k+'='+v).join('; '),'X-CSRF-Token':admin.cookies.booking_csrf,'Content-Type':'image/svg+xml'},body:'<svg></svg>'});assert.equal(mediaResponse.status,400);
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/s1sAAAAASUVORK5CYII=','base64');
  const uploaded=await fetch('http://127.0.0.1:3000/admin/upload',{method:'POST',headers:{Cookie:Object.entries(admin.cookies).map(([k,v])=>k+'='+v).join('; '),'X-CSRF-Token':admin.cookies.booking_csrf,'Content-Type':'image/png'},body:png});assert.equal(uploaded.status,200);const image=await uploaded.json();assert.match(image.path,/^\/uploads\/[a-f0-9]{32}\.png$/);assert.equal((await new Client().request(image.path)).code,200);
  const report=await manager.request('/admin/reports?group=cinema');assert.equal(report.code,200);assert.ok(!report.body.includes('Test B'));assert.equal((await admin.request('/admin/reports.csv')).code,200);
  const paymentFuture=await admin.request('/admin/reports.csv?basis=payment&from=2030-06-10&to=2030-06-10');
  assert.equal(paymentFuture.body.trim().split(/\r?\n/).length,1,'Future showtime must not move current payment revenue into 2030');
  const showtimeFuture=await admin.request('/admin/reports.csv?basis=showtime&from=2030-06-10&to=2030-06-10');
  assert.ok(showtimeFuture.body.includes('2030-06-10'));assert.ok(showtimeFuture.body.includes('Tổng lượt ghế'));
  const paymentCsv=(await admin.request('/admin/reports.csv?basis=payment')).body;
  assert.ok(paymentCsv.includes('Nhóm theo ngày thanh toán'));assert.ok(paymentCsv.includes(',"","",'),'Payment report must not mix showtime capacity into payment cohorts');
  assert.equal((await admin.request('/admin/reports?basis=invalid')).code,400);
  const uid=(await one('SELECT id FROM users WHERE username="customer"')).id;await admin.save('/admin/users/'+uid+'/lock',{});assert.equal((await customer.request('/my-bookings')).code,303);await admin.save('/admin/users/'+uid+'/lock',{});
  const sb=(await one('SELECT id FROM showtimes WHERE hall_id=?',[hb])).id;
  await manager.save('/admin/showtimes/'+sb+'/delete',{},403);
  await admin.save('/admin/showtimes/'+sb+'/cancel',{});
  assert.ok((await admin.request('/admin/showtimes')).body.includes('/admin/showtimes/'+sb+'/delete'));
  await admin.save('/admin/showtimes/'+sb+'/delete',{});
  assert.equal((await new Client().request('/showtimes/'+sb)).code,404);
  assert.equal((await one('SELECT deleted FROM showtimes WHERE id=?',[sb])).deleted,1);
  for(const key of ['','movies','cinemas','halls','showtimes','pricing','bookings','checkin','vouchers','tiers','rewards','products','reports','users','content','settings'])assert.equal((await admin.request('/admin'+(key?'/'+key:''))).code,200,key);
  await admin.save('/admin/content/'+news+'/delete',{});assert.equal((await new Client().request('/news/'+news)).code,404);
  console.log('PASS isolated integration: CRUD, hidden movie, hall/seat types, overlap & cleanup, tenant RBAC, pricing, voucher limit, F&B snapshots, payment idempotency, QR/replay, exchange/refund, loyalty/rewards, CMS, account lock and CSV reports');
 }finally{await db.end();}
})().catch(e=>{console.error(e.stack);process.exit(1);});
