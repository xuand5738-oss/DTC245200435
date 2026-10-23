'use strict';
const assert=require('node:assert/strict');
const mysql=require('mysql2/promise');
(async()=>{
 assert.notEqual(process.getuid(),0);console.log('PASS app runs as non-root uid='+process.getuid());
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 try{
  const [grants]=await db.query('SHOW GRANTS');const text=JSON.stringify(grants);
  assert.ok(!/ALL PRIVILEGES|GRANT OPTION/.test(text));console.log('PASS app DB account has no ALL PRIVILEGES or GRANT OPTION');
  try{await db.query('CREATE TABLE __permission_probe (id INT)');throw Error('Unexpected CREATE permission');}catch(e){assert.equal(e.code,'ER_TABLEACCESS_DENIED_ERROR');console.log('PASS CREATE TABLE denied');}
  console.log(text);
 }finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exit(1);});
