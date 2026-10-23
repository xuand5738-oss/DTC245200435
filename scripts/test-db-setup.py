from pathlib import Path
import secrets,re
root=Path(__file__).resolve().parent.parent
env=dict(l.split('=',1) for l in (root/'.env').read_text().splitlines() if '=' in l)
user=env['MYSQL_USER'];assert re.fullmatch(r'[A-Za-z0-9_]+',user)
name='topic11_test_'+secrets.token_hex(6)
sql=f'CREATE DATABASE `{name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE `{name}`;\n'
for file in ['01-schema.sql','03-auth.sql','04-cinema.sql']:
    sql+=(root/'db/init'/file).read_text()+'\n'
sql+="INSERT INTO showtimes(title,starts_at,price) VALUES('Legacy active test','2031-01-01 19:00:00',123456);\n"
sql+="INSERT INTO showtimes(title,starts_at,price,deleted) VALUES('Legacy deleted test','2031-01-01 19:00:00',123456,1);\n"
for _ in range(2):sql+=(root/'db/init/05-link-legacy-movies.sql').read_text()+'\n'
sql+=f"GRANT SELECT,INSERT,UPDATE ON `{name}`.* TO '{user}'@'%';\n"
(root/'tmp').mkdir(exist_ok=True)
(root/'tmp/integration-setup.sql').write_text(sql)
(root/'tmp/integration-cleanup.sql').write_text(f"REVOKE ALL PRIVILEGES ON `{name}`.* FROM '{user}'@'%';\nDROP DATABASE `{name}`;\n")
print(name)
