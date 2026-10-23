'use strict';
// Read-only baseline for comparing the rendered website with the same MySQL data.
const mysql=require('mysql2/promise');
const ui=require('/app/ui');
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',dateStrings:true});
 try{
  const [shows]=await db.query("SELECT s.*,COALESCE(m.title,s.title) AS title,(SELECT COUNT(*) FROM seats t WHERE t.active=1 AND t.hall_id<=>s.hall_id) AS seat_count,(SELECT COUNT(*) FROM bookings b WHERE b.showtime_id=s.id AND b.booking_status='active') AS booked_count FROM showtimes s LEFT JOIN movies m ON m.id=s.movie_id WHERE s.deleted=0 AND s.cancelled=0 AND (s.movie_id IS NULL OR (m.deleted=0 AND m.hidden=0 AND m.status='showing' AND COALESCE(m.age_rating,'')<>'C')) ORDER BY s.starts_at");
  const [bookings]=await db.query('SELECT b.*,COALESCE(m.title,s.title) AS title,s.starts_at,COALESCE(b.ticket_price,s.price)-b.discount_amount+b.fnb_total AS price,t.label,u.username FROM bookings b JOIN showtimes s ON s.id=b.showtime_id LEFT JOIN movies m ON m.id=s.movie_id JOIN seats t ON t.id=b.seat_id LEFT JOIN users u ON u.id=b.user_id ORDER BY b.id');
  console.log(JSON.stringify({shows:shows.map(s=>({...s,formatted_time:ui.time(s.starts_at),formatted_price:ui.money(s.price)})),bookings:bookings.map(b=>({id:b.id,title:b.title,label:b.label,username:b.username,payment_status:b.payment_status,formatted_time:ui.time(b.starts_at),formatted_price:ui.money(b.price)}))}));
 }finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
