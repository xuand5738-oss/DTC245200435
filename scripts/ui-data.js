'use strict';
// Read-only baseline for comparing the rendered website with the same MySQL data.
const mysql=require('mysql2/promise');
const ui=require('/app/ui');
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',dateStrings:true});
 try{
  const [shows]=await db.query('SELECT s.*, (SELECT COUNT(*) FROM seats) AS seat_count, (SELECT COUNT(*) FROM bookings b WHERE b.showtime_id=s.id) AS booked_count FROM showtimes s ORDER BY s.starts_at');
  const [bookings]=await db.query('SELECT b.*,s.title,s.starts_at,s.price,t.label,u.username FROM bookings b JOIN showtimes s ON s.id=b.showtime_id JOIN seats t ON t.id=b.seat_id LEFT JOIN users u ON u.id=b.user_id ORDER BY b.id');
  console.log(JSON.stringify({shows:shows.map(s=>({...s,formatted_time:ui.time(s.starts_at),formatted_price:ui.money(s.price)})),bookings:bookings.map(b=>({id:b.id,title:b.title,label:b.label,username:b.username,payment_status:b.payment_status,formatted_time:ui.time(b.starts_at),formatted_price:ui.money(b.price)}))}));
 }finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
