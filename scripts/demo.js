'use strict';
// Run inside app container. Uses only explicitly authorized fictional demo data.
const mysql = require('mysql2/promise');
const assert = require('node:assert/strict');
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',dateStrings:true});
 try {
  const title='Suất chiếu demo — Hành trình khám phá';
  let [[show]]=await db.execute('SELECT id FROM showtimes WHERE title=? AND starts_at=?',[title,'2026-10-25 19:30:00']);
  if(!show){const [r]=await db.execute('INSERT INTO showtimes(title,starts_at,price) VALUES(?,?,?)',[title,'2026-10-25 19:30:00',75000]);show={id:r.insertId};}
  for(const label of ['A1','A2','A3','A4','B1','B2','B3','B4'])await db.execute('INSERT INTO seats(label) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM seats WHERE label=?)',[label,label]);
  const [[seat]]=await db.execute('SELECT id FROM seats WHERE label=?',['A1']);
  const base='http://127.0.0.1:3000';
  const home=await fetch(base);assert.equal(home.status,200);assert.ok((await home.text()).includes(title));
  let [[booking]]=await db.execute('SELECT id FROM bookings WHERE showtime_id=? AND seat_id=?',[show.id,seat.id]);
  if(!booking){const r=await fetch(base+'/bookings',{method:'POST',body:new URLSearchParams({showtime_id:show.id,seat_id:seat.id,customer_name:'Khách Demo'}),redirect:'manual'});assert.equal(r.status,303);booking={id:Number(r.headers.get('location').split('/').pop())};}
  let [[before]]=await db.execute('SELECT customer_name,payment_status FROM bookings WHERE id=?',[booking.id]);
  assert.equal(before.customer_name,'Khách Demo','Existing seat belongs to someone else; do not alter it');
  const duplicate=await fetch(base+'/bookings',{method:'POST',body:new URLSearchParams({showtime_id:show.id,seat_id:seat.id,customer_name:'Khách Demo'}),redirect:'manual'});assert.equal(duplicate.status,409);
  const paid=await fetch(base+'/bookings/'+booking.id+'/pay',{method:'POST',redirect:'manual'});assert.equal(paid.status,303);
  const [[after]]=await db.execute('SELECT payment_status FROM bookings WHERE id=?',[booking.id]);assert.equal(after.payment_status,'simulated_paid');
  const ticket=await fetch(base+'/bookings/'+booking.id);assert.ok((await ticket.text()).includes('Đã thanh toán giả lập'));
  const seats=await fetch(base+'/showtimes/'+show.id);assert.ok((await seats.text()).includes('(Đã đặt)'));
  const [[count]]=await db.execute('SELECT COUNT(*) AS total FROM bookings WHERE showtime_id=? AND seat_id=?',[show.id,seat.id]);assert.equal(Number(count.total),1);
  console.log(JSON.stringify({home:200,booking_id:booking.id,showtime_id:show.id,duplicate:409,payment:after.payment_status,bookings_for_A1:count.total,ticket_url:'http://localhost:8280/bookings/'+booking.id,showtime_url:'http://localhost:8280/showtimes/'+show.id},null,2));
  const [rows]=await db.execute('SELECT b.id,s.title,s.starts_at,t.label AS seat,b.customer_name,b.payment_status FROM bookings b JOIN showtimes s ON s.id=b.showtime_id JOIN seats t ON t.id=b.seat_id WHERE b.id=?',[booking.id]);console.log(JSON.stringify(rows,null,2));
 } finally {await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
