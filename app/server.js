'use strict';
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '8kb' }));
const pool = mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',timezone:'+07:00',dateStrings:true,connectionLimit:5});
const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => Number(value).toLocaleString('vi-VN')+' đ';
const time = value => esc(String(value).replace('T',' ').slice(0,16));
const page = (title,body) => `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>body{font:17px system-ui;background:#f3f5f9;color:#18243b;margin:0}main{max-width:940px;margin:40px auto;padding:24px}header,section{background:white;padding:24px;border-radius:14px;margin-bottom:20px}a{color:#2456b5}label{display:block;margin:16px 0}input,button{padding:12px;font:inherit}button{background:#2456b5;color:white;border:0;border-radius:8px;cursor:pointer}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #ddd}.seats{display:flex;gap:16px;flex-wrap:wrap}.seat{border:1px solid #ccc;border-radius:8px;padding:12px}small{color:#526079}</style><main><header><a href="/">ĐỀ 11 · ĐẶT VÉ</a><h1>${esc(title)}</h1><small>Thực hành triển khai hệ thống · Thanh toán giả lập</small></header>${body}</main></html>`;
app.use((req,res,next)=>{const start=Date.now();res.on('finish',()=>console.log(JSON.stringify({time:new Date().toISOString(),method:req.method,path:req.path,status:res.statusCode,duration_ms:Date.now()-start})));next();});
const route = handler => (req,res,next)=>Promise.resolve(handler(req,res)).catch(next);
app.get('/health',route(async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}));
app.get('/',route(async(req,res)=>{
 const [rows]=await pool.query('SELECT id,title,starts_at,price FROM showtimes ORDER BY starts_at');
 res.send(page('Suất chiếu / sự kiện',`<section>${rows.length?'<table><tr><th>Tên</th><th>Thời gian (Việt Nam)</th><th>Giá vé</th><th></th></tr>'+rows.map(r=>`<tr><td>${esc(r.title)}</td><td>${time(r.starts_at)}</td><td>${money(r.price)}</td><td><a href="/showtimes/${r.id}">Chọn ghế</a></td></tr>`).join('')+'</table>':'<h2>Chưa có suất chiếu</h2><p>Hệ thống đang chờ dữ liệu do sinh viên cung cấp. Chưa thêm dữ liệu mẫu.</p>'}</section>`));
}));
app.get('/showtimes/:id',route(async(req,res)=>{
 if(!/^\d+$/.test(req.params.id))return res.status(400).send(page('Yêu cầu không hợp lệ','<section>Mã suất chiếu không hợp lệ.</section>'));
 const [[show]]=await pool.execute('SELECT * FROM showtimes WHERE id=?',[req.params.id]);
 if(!show)return res.status(404).send(page('Không tìm thấy','<section>Suất chiếu không tồn tại.</section>'));
 const [seats]=await pool.execute('SELECT s.id,s.label,b.id AS booked FROM seats s LEFT JOIN bookings b ON b.seat_id=s.id AND b.showtime_id=? ORDER BY s.id',[show.id]);
 res.send(page(show.title,`<section><p>${time(show.starts_at)} · ${money(show.price)}</p>${seats.length?`<form method="post" action="/bookings"><input type="hidden" name="showtime_id" value="${show.id}"><div class="seats">${seats.map(s=>`<label class="seat"><input type="radio" name="seat_id" value="${s.id}" ${s.booked?'disabled':'required'}> ${esc(s.label)} ${s.booked?'(Đã đặt)':''}</label>`).join('')}</div><label>Họ tên người đặt <input name="customer_name" maxlength="100" required autocomplete="name"></label><button>Đặt vé</button></form>`:'<p>Chưa có dữ liệu ghế.</p>'}</section>`));
}));
app.post('/bookings',route(async(req,res)=>{
 const {showtime_id,seat_id}=req.body;const name=String(req.body.customer_name||'').trim();
 if(!/^\d+$/.test(String(showtime_id))||!/^\d+$/.test(String(seat_id))||!name||name.length>100)return res.status(400).send(page('Thiếu thông tin','<section>Chọn suất chiếu, ghế và nhập họ tên hợp lệ.</section>'));
 try{const [result]=await pool.execute('INSERT INTO bookings(showtime_id,seat_id,customer_name) VALUES(?,?,?)',[showtime_id,seat_id,name]);res.redirect(303,'/bookings/'+result.insertId);}
 catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).send(page('Ghế đã được đặt','<section>Ghế vừa được đặt. Vui lòng quay lại chọn ghế khác.</section>'));if(e.code==='ER_NO_REFERENCED_ROW_2')return res.status(400).send(page('Dữ liệu không hợp lệ','<section>Suất chiếu hoặc ghế không tồn tại.</section>'));throw e;}
}));
app.get('/bookings/:id',route(async(req,res)=>{
 if(!/^\d+$/.test(req.params.id))return res.sendStatus(400);
 const [[b]]=await pool.execute('SELECT b.*,s.title,s.starts_at,s.price,t.label FROM bookings b JOIN showtimes s ON s.id=b.showtime_id JOIN seats t ON t.id=b.seat_id WHERE b.id=?',[req.params.id]);
 if(!b)return res.status(404).send(page('Không tìm thấy vé','<section>Mã đặt vé không tồn tại.</section>'));
 res.send(page('Thông tin đặt vé',`<section><p>Mã vé: ${b.id}</p><p>${esc(b.title)} · ${time(b.starts_at)}</p><p>Ghế: ${esc(b.label)}</p><p>Người đặt: ${esc(b.customer_name)}</p><p>Giá vé: ${money(b.price)}</p><p>Trạng thái: ${b.payment_status==='simulated_paid'?'Đã thanh toán giả lập':'Chờ thanh toán giả lập'}</p>${b.payment_status==='pending'?`<form method="post" action="/bookings/${b.id}/pay"><button>Xác nhận thanh toán giả lập</button></form>`:''}<p>Không thu tiền thật. Không nhập thông tin thẻ ngân hàng.</p></section>`));
}));
app.post('/bookings/:id/pay',route(async(req,res)=>{
 if(!/^\d+$/.test(req.params.id))return res.sendStatus(400);
 const [r]=await pool.execute("UPDATE bookings SET payment_status='simulated_paid' WHERE id=?",[req.params.id]);
 if(!r.affectedRows)return res.sendStatus(404);
 res.redirect(303,'/bookings/'+req.params.id);
}));
app.use((req,res)=>res.status(404).send(page('Không tìm thấy','<section>Trang không tồn tại.</section>')));
app.use((err,req,res,next)=>{console.error(JSON.stringify({event:'request_error',code:err.code||'INTERNAL_ERROR'}));res.status(500).send(page('Lỗi hệ thống','<section>Không xử lý được yêu cầu. Vui lòng thử lại.</section>'));});
const server=app.listen(3000,'0.0.0.0',()=>console.log('Booking app listening on port 3000'));
process.on('SIGTERM',()=>server.close(()=>pool.end().then(()=>process.exit(0))));
