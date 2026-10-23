'use strict';
const mysql=require('mysql2/promise');
const assert=require('node:assert/strict');
assert.match(process.env.DB_NAME,/^topic11_test_[a-f0-9]{12}$/);
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,dateStrings:true,charset:'utf8mb4'});
 try{
  if(process.argv[2]==='prepare'){
   for(const label of ['A1','A2','A3','A4','B1','B2','B3','B4'])await db.execute('INSERT INTO seats(label) VALUES(?)',[label]);
   const [[seat]]=await db.query("SELECT id FROM seats WHERE hall_id IS NULL AND label='A1'");
   await db.execute("INSERT INTO bookings(showtime_id,seat_id,customer_name,payment_status,ticket_price,paid_at,checkin_token) VALUES(1,?,'Legacy paid fixture','simulated_paid',123456,UTC_TIMESTAMP(),?)",[seat.id,require('node:crypto').randomBytes(24).toString('hex')]);
   const [bookings]=await db.query('SELECT * FROM bookings WHERE showtime_id=1 ORDER BY id');
   await db.execute("INSERT INTO app_settings(setting_key,setting_value) VALUES('test_legacy_snapshot',?)",[JSON.stringify(bookings)]);
  }else{
   const [[snapshot]]=await db.query("SELECT setting_value FROM app_settings WHERE setting_key='test_legacy_snapshot'");
   const [bookings]=await db.query('SELECT * FROM bookings WHERE showtime_id=1 ORDER BY id');assert.equal(JSON.stringify(bookings),snapshot.setting_value);
   const [[show]]=await db.query('SELECT s.*,h.row_count,h.col_count FROM showtimes s JOIN halls h ON h.id=s.hall_id WHERE s.id=1');
   assert.equal(show.row_count,2);assert.equal(show.col_count,4);assert.equal(Number(show.price),123456);
   const [seats]=await db.execute('SELECT * FROM seats WHERE hall_id=? ORDER BY row_no,col_no',[show.hall_id]);assert.equal(seats.length,8);
   assert.deepEqual(seats.map(s=>s.label),['A1','A2','A3','A4','B1','B2','B3','B4']);
   assert.equal(bookings[0].seat_id,seats[0].id);
   const [[rooms]]=await db.query("SELECT COUNT(*) n FROM halls WHERE name='Phòng 8 ghế · Demo'");assert.equal(rooms.n,1);
   const crypto=require('node:crypto'),token=crypto.randomBytes(32).toString('hex');
   const [[admin]]=await db.query("SELECT id FROM users WHERE role='admin' AND is_locked=0 LIMIT 1");
   await db.execute('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 5 MINUTE))',[crypto.createHash('sha256').update(token).digest('hex'),admin.id]);
   const ticket=await fetch('http://127.0.0.1:3000/bookings/'+bookings[0].id,{headers:{Cookie:'booking_session='+token}});
   assert.equal(ticket.status,200);const html=await ticket.text();assert.ok(html.includes('Phòng 8 ghế · Demo'));assert.ok(html.includes('Rạp / Phòng chiếu'));
   console.log('PASS legacy hall repair: 8 original seat IDs, paid booking snapshot unchanged, correct 2x4 layout, second run creates no duplicate room');
  }
 }finally{await db.end();}
})().catch(e=>{console.error(e.stack);process.exit(1);});
