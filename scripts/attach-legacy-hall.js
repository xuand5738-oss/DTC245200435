'use strict';
// Manual, transactional repair of the original eight-seat demo. Never run on startup.
const mysql=require('mysql2/promise');
const assert=require('node:assert/strict');
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',dateStrings:true});
 try{
  await db.beginTransaction();
  const [[show]]=await db.execute('SELECT * FROM showtimes WHERE id=1 FOR UPDATE');
  assert.ok(show&&!show.deleted&&!show.cancelled,'Original demo is missing or archived; no changes made');
  if(show.hall_id){
   const [[invalid]]=await db.execute('SELECT COUNT(*) n FROM bookings b JOIN seats t ON t.id=b.seat_id WHERE b.showtime_id=1 AND NOT(t.hall_id<=>?)',[show.hall_id]);
   assert.equal(invalid.n,0,'Existing room and booked seats disagree; manual review required');
   await db.rollback();console.log('Showtime 1 already has a room; no changes made.');return;
  }
  const [seats]=await db.execute('SELECT * FROM seats WHERE hall_id IS NULL ORDER BY id FOR UPDATE');
  assert.equal(seats.length,8,'Expected exactly eight legacy seats');
  assert.deepEqual(seats.map(s=>s.label).sort(),['A1','A2','A3','A4','B1','B2','B3','B4']);
  const [[other]]=await db.execute('SELECT COUNT(*) n FROM bookings b JOIN seats t ON t.id=b.seat_id WHERE t.hall_id IS NULL AND b.showtime_id<>1');
  assert.equal(other.n,0,'Legacy seats are used by another showtime; no changes made');
  const [before]=await db.execute('SELECT * FROM bookings WHERE showtime_id=1 ORDER BY id FOR UPDATE');
  let [[cinema]]=await db.execute("SELECT id FROM cinemas WHERE name='Rạp Ánh Sao · Demo' AND deleted=0 ORDER BY id LIMIT 1 FOR UPDATE");
  if(!cinema){const [r]=await db.execute("INSERT INTO cinemas(name,address) VALUES('Rạp Vé 11 · Demo','Địa chỉ giả lập phục vụ thực hành')");cinema={id:r.insertId};}
  const [hall]=await db.execute("INSERT INTO halls(cinema_id,name,row_count,col_count,cleanup_minutes) VALUES(?,'Phòng 8 ghế · Demo',2,4,15)",[cinema.id]);
  for(const seat of seats)await db.execute('UPDATE seats SET hall_id=?,row_no=?,col_no=? WHERE id=?',[hall.insertId,seat.label.charCodeAt(0)-64,Number(seat.label.slice(1)),seat.id]);
  await db.execute('UPDATE showtimes SET hall_id=? WHERE id=1',[hall.insertId]);
  const [after]=await db.execute('SELECT * FROM bookings WHERE showtime_id=1 ORDER BY id');
  assert.deepEqual(after,before,'Booking records must remain identical');
  const [[counts]]=await db.execute('SELECT COUNT(*) n FROM seats WHERE hall_id=?',[hall.insertId]);assert.equal(counts.n,8);
  await db.execute("INSERT INTO audit_events(action,entity_id) VALUES('showtime.attach_legacy_hall',1)");
  await db.commit();console.log(JSON.stringify({showtime_id:1,cinema_id:cinema.id,hall_id:hall.insertId,seats:8,bookings_preserved:before.length,booking_records_unchanged:true}));
 }catch(e){await db.rollback();throw e;}finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
