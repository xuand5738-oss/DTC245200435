'use strict';
// Explicitly authorized fictional catalog. Run manually, never at app startup.
const mysql=require('mysql2/promise');
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',dateStrings:true});
 try{
  await db.beginTransaction();
  const [[marker]]=await db.execute("SELECT setting_key FROM app_settings WHERE setting_key='demo_catalog_v1' FOR UPDATE");
  if(marker){await db.rollback();console.log('Demo catalog already installed; existing edits preserved.');return;}
  const insert=async(table,values)=>{const keys=Object.keys(values);const [r]=await db.execute(`INSERT INTO ${table}(${keys.join(',')}) VALUES(${keys.map(()=>'?')})`,Object.values(values));return r.insertId;};
  const cinema=await insert('cinemas',{name:'Rạp Ánh Sao · Demo',address:'Khu trải nghiệm Vé 11 — địa chỉ giả lập phục vụ bài thực hành',hotline:'',image:''});
  const halls=[];
  for(const name of ['Phòng 01 · Demo','Phòng 02 · Demo']){
   const id=await insert('halls',{cinema_id:cinema,name,row_count:4,col_count:6,cleanup_minutes:15});halls.push(id);
   for(let row=1;row<=4;row++)for(let col=1;col<=6;col++)await insert('seats',{hall_id:id,label:String.fromCharCode(64+row)+col,row_no:row,col_no:col,seat_type:row===4?'vip':'regular',surcharge:row===4?15000:0,active:1});
  }
  const films=[
   {title:'Bầu trời ngày mai · Demo',director:'Đạo diễn Minh An (giả lập)',actors:'Mai Anh, Hoàng Nam (nhân vật giả lập)',duration:100,genre:'Phiêu lưu / Gia đình',synopsis:'Hai người bạn lên đường tìm lại đài quan sát bỏ quên và khám phá ý nghĩa của tình bạn. Nội dung phim hoàn toàn giả lập cho bài thực hành.',age_rating:'P',status:'showing'},
   {title:'Chuyến tàu mùa hạ · Demo',director:'Đạo diễn Hải Bình (giả lập)',actors:'Linh Chi, Tuấn Phong (nhân vật giả lập)',duration:110,genre:'Tình cảm / Hành trình',synopsis:'Một chuyến tàu đưa những người trẻ trở về thị trấn ven biển, nơi họ học cách bắt đầu lại. Nội dung phim hoàn toàn giả lập cho bài thực hành.',age_rating:'T13',status:'showing'},
   {title:'Bí mật đảo Mây · Demo',director:'Đạo diễn Thu Hà (giả lập)',actors:'Nhóm nhân vật hoạt hình giả lập',duration:95,genre:'Hoạt hình / Phiêu lưu',synopsis:'Những cư dân nhỏ trên đảo Mây cùng giải câu đố để bảo vệ khu vườn của mình. Phim sắp chiếu giả lập, chưa có lịch mở bán.',age_rating:'P',status:'coming'}
  ];
  const ids=[];for(const film of films)ids.push(await insert('movies',{...film,language:'Tiếng Việt',country:'Việt Nam (bối cảnh giả lập)',trailer:'',poster:'',banner:'',hidden:0,deleted:0}));
  const [[clock]]=await db.query("SELECT DATE_FORMAT(DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 HOUR),'%Y-%m-%d') AS today");
  const day=new Date(clock.today+'T00:00:00Z');day.setUTCDate(day.getUTCDate()+1);const tomorrow=day.toISOString().slice(0,10);
  for(const [movie,hall,at] of [[0,0,'18:00'],[1,1,'19:00'],[0,0,'20:00'],[1,1,'21:15']]){
   const start=tomorrow+' '+at+':00';await db.execute('INSERT INTO showtimes(title,movie_id,hall_id,starts_at,ends_at,price,format) VALUES(?,?,?,?,DATE_ADD(?,INTERVAL ? MINUTE),?,?)',[films[movie].title,ids[movie],halls[hall],start,start,films[movie].duration,75000,'2D']);
  }
  for(const [name,price,description] of [['Bắp ngọt · Demo',35000,'Một phần bắp ngọt giả lập.'],['Nước trái cây · Demo',25000,'Một ly nước trái cây giả lập.'],['Combo hai người · Demo',85000,'Một bắp lớn và hai nước — sản phẩm giả lập.']])await insert('products',{name,price,description,category:'Menu giả lập',image:'',active:1});
  await insert('vouchers',{code:'VE11DEMO',kind:'percent',amount:10,min_total:75000,quantity:30,starts_at:clock.today+' 00:00:00',ends_at:tomorrow+' 23:59:59',active:1});
  await insert('membership_tiers',{name:'Thành viên Demo',min_points:0,discount_percent:0});
  await insert('rewards',{name:'Bắp nhỏ · Quà giả lập',points_required:50,quantity:20});
  await insert('content_posts',{title:'Khám phá thế giới phim tại Vé 11 · Demo',kind:'banner',body:'Chọn phim, chọn giờ và chọn ghế yêu thích. Toàn bộ nội dung trong bộ demo phục vụ bài thực hành; thanh toán giả lập.',image:'',link:'/movies/'+ids[0],published:1,sort_order:1});
  await insert('content_posts',{title:'Hướng dẫn đặt vé và dùng mã VE11DEMO',kind:'news',body:'Đăng nhập bằng tài khoản khách hàng, chọn suất chiếu và ghế, thêm bắp nước nếu muốn. Mã VE11DEMO giảm 10% cho hóa đơn đủ điều kiện trong thời gian cấu hình. Kiểm tra tổng tiền trước khi xác nhận thanh toán giả lập. Vé đã thanh toán có mã QR để nhân viên soát vé. Đây là dữ liệu giả lập; không thu tiền thật.',image:'',link:'',published:1,sort_order:2});
  await insert('app_settings',{setting_key:'demo_catalog_v1',setting_value:JSON.stringify({cinema,halls,movies:ids,date:tomorrow})});
  await db.commit();console.log('Installed fictional demo: 3 movies, 1 cinema, 2 halls, 48 seats, 4 showtimes, 3 products, 1 voucher, membership/reward and 2 posts. No bookings or payments created.');
 }catch(e){await db.rollback();throw e;}finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
