'use strict';
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const hashToken = value => crypto.createHash('sha256').update(value).digest('hex');
async function passwordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}
async function verifyPassword(password, stored) {
  const [salt, encoded] = stored.split(':');
  if (!salt || !encoded || !/^[a-f0-9]{128}$/.test(encoded)) return false;
  return crypto.timingSafeEqual(await scrypt(password, salt, 64), Buffer.from(encoded, 'hex'));
}
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(x => x.trim().split('=')).filter(x => x.length === 2));
}
function installAuth(app, pool, route, page, esc) {
  const options = { httpOnly: true, sameSite: 'strict', path: '/', secure: process.env.COOKIE_SECURE === 'true' };
  // Bounded login throttling, scoped by both client and username.
  const failures = new Map();
  app.use((req,res,next)=>(async () => {
    res.set('Cache-Control','no-store');
    const jar = cookies(req);
    req.csrf = /^[a-f0-9]{64}$/.test(jar.booking_csrf || '') ? jar.booking_csrf : crypto.randomBytes(32).toString('hex');
    if (req.csrf !== jar.booking_csrf) res.cookie('booking_csrf', req.csrf, options);
    if (/^[a-f0-9]{64}$/.test(jar.booking_session || '')) {
      const [[user]] = await pool.execute('SELECT u.id,u.username,u.display_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()', [hashToken(jar.booking_session)]);
      req.user = user || null;
    }
  })().then(()=>next()).catch(next));
  app.use((req,res,next)=>{
    if (req.method === 'POST') {
      const supplied = String(req.body._csrf || '');
      if (!/^[a-f0-9]{64}$/.test(supplied) || !crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(req.csrf))) return res.status(403).send(page('Yêu cầu bị từ chối','<section>Phiên biểu mẫu không hợp lệ. Tải lại trang rồi thử lại.</section>',req));
    }
    next();
  });
  app.get('/login', (req,res)=>res.send(page('Đăng nhập',`<section><form method="post" action="/login"><input type="hidden" name="_csrf" value="${req.csrf}"><label>Tài khoản <input name="username" required maxlength="50" autocomplete="username"></label><label>Mật khẩu <input type="password" name="password" required maxlength="200" autocomplete="current-password"></label><button>Đăng nhập</button></form></section>`,req)));
  app.post('/login',route(async(req,res)=>{
    const username=String(req.body.username||'').trim();const password=String(req.body.password||'');
    if(username.length>50||password.length>200)return res.sendStatus(400);
    const key=req.ip+'|'+username.toLowerCase();const now=Date.now();
    for(const [k,v] of failures)if(v.until<now)failures.delete(k);
    const failure=failures.get(key);
    if(failure&&failure.count>=5)return res.status(429).send(page('Thử lại sau','<section>Quá nhiều lần đăng nhập sai. Vui lòng chờ 15 phút.</section>',req));
    const [[user]]=await pool.execute('SELECT * FROM users WHERE username=?',[username]);
    // Perform scrypt for nonexistent users too, avoiding an inexpensive user probe.
    const dummy='0'.repeat(32)+':'+ '0'.repeat(128);
    const valid=await verifyPassword(password,user?user.password_hash:dummy);
    if(!user||!valid){if(failures.size>=10000)failures.delete(failures.keys().next().value);failures.set(key,{count:(failure?failure.count:0)+1,until:failure?failure.until:now+900000});return res.status(401).send(page('Đăng nhập thất bại','<section>Tài khoản hoặc mật khẩu không đúng. <a href="/login">Thử lại</a></section>',req));}
    failures.delete(key);
    const old=cookies(req).booking_session;
    if(old)await pool.execute('UPDATE sessions SET expires_at=UTC_TIMESTAMP() WHERE token_hash=?',[hashToken(old)]);
    const token=crypto.randomBytes(32).toString('hex');
    await pool.execute('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))',[hashToken(token),user.id]);
    res.cookie('booking_session',token,{...options,maxAge:8*60*60*1000});
    res.cookie('booking_csrf',crypto.randomBytes(32).toString('hex'),options);
    res.redirect(303,user.role==='admin'?'/admin':'/my-bookings');
  }));
  app.post('/logout',route(async(req,res)=>{
    const token=cookies(req).booking_session;
    if(token)await pool.execute('UPDATE sessions SET expires_at=UTC_TIMESTAMP() WHERE token_hash=?',[hashToken(token)]);
    res.clearCookie('booking_session',options);res.clearCookie('booking_csrf',options);res.redirect(303,'/login');
  }));
}
module.exports={installAuth,passwordHash,hashToken};
