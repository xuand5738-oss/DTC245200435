'use strict';
// Explicit CLI setup only: never run automatically on application start.
const fs=require('node:fs');
const mysql=require('mysql2/promise');
const {passwordHash}=require('./auth');
(async()=>{
 const input=JSON.parse(fs.readFileSync(0,'utf8'));
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 try{
  for(const [username,role,name,key] of [['admin','admin','Quản trị viên','WEB_ADMIN_PASSWORD'],['khachhang','customer','Khách Demo','WEB_CUSTOMER_PASSWORD']]){
   const [[exists]]=await db.execute('SELECT id FROM users WHERE username=?',[username]);
   if(exists){console.log('Account already exists: '+username+'; password unchanged');continue;}
   if(typeof input[key]!=='string'||input[key].length<12)throw Error('Password must have at least 12 characters');
   await db.execute('INSERT INTO users(username,display_name,password_hash,role) VALUES(?,?,?,?)',[username,name,await passwordHash(input[key]),role]);
   console.log('Created '+username+' role='+role);
  }
 }finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
