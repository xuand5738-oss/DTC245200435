"""Generate local setup passwords without printing or committing credentials."""
from pathlib import Path
import secrets,json
root=Path(__file__).resolve().parent.parent
p=root/'.env';text=p.read_text(encoding='utf-8-sig')
env=dict(line.split('=',1) for line in text.splitlines() if '=' in line)
for key in ['WEB_ADMIN_PASSWORD','WEB_CUSTOMER_PASSWORD']:
    if not env.get(key):
        env[key]=secrets.token_urlsafe(18)
        text+='\n'+key+'='+env[key]+'\n'
p.write_text(text,encoding='utf-8')
(root/'tmp').mkdir(exist_ok=True)
(root/'tmp/web-users.json').write_text(json.dumps({k:env[k] for k in ['WEB_ADMIN_PASSWORD','WEB_CUSTOMER_PASSWORD']}),encoding='utf-8')
print('Local web account setup ready; no passwords printed.')
