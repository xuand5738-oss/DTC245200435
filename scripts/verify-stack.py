"""Read-only HTTP checks; create only HTTP access logs, never booking records."""
import json, urllib.request, urllib.parse, urllib.error, base64
from pathlib import Path

def get(url, headers=None):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers or {}), timeout=20) as response:
        return response.status, response.headers, response.read()

status, headers, body = get('http://127.0.0.1:8280/')
assert status == 200
for name in ['X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Content-Security-Policy']:
    assert headers.get(name), name
assert json.loads(get('http://127.0.0.1:8280/health')[2])['database'] == 'connected'
assert get('http://127.0.0.1:8281/')[0] == 200
for query in ['up','nginx_up','mysql_up','container_memory_working_set_bytes{name=~"topic11-.*"}']:
    url='http://127.0.0.1:8290/api/v1/query?'+urllib.parse.urlencode({'query':query})
    rows=json.loads(get(url)[2])['data']['result']
    assert rows, query
    if query in ['up','nginx_up','mysql_up']:
        assert all(float(r['value'][1]) == 1 for r in rows), query
    print('PASS metrics',query,'series',len(rows))
env=dict(l.split('=',1) for l in Path('.env').read_text().splitlines() if '=' in l)
auth={'Authorization':'Basic '+base64.b64encode(('admin:'+env['GRAFANA_PASSWORD']).encode()).decode()}
dashboard=json.loads(get('http://127.0.0.1:8300/api/dashboards/uid/topic11',auth)[2])['dashboard']
assert len(dashboard['panels']) == 8
print('PASS Grafana authenticated dashboard, 8 panels')
try: get('http://127.0.0.1:8280/trang-khong-ton-tai')
except urllib.error.HTTPError as error: assert error.code == 404
for query in ['{project="topic11",job="nginx"}','{project="topic11",job="nginx",status="200"}','{project="topic11",job="nginx"} | json | status = 404']:
    url='http://127.0.0.1:8310/loki/api/v1/query_range?'+urllib.parse.urlencode({'query':query,'since':'1h','limit':10})
    rows=json.loads(get(url)[2])['data']['result']
    count=sum(len(r.get('values',[])) for r in rows)
    assert count>0, query
    print('PASS LogQL',query,'lines',count)
print('PASS website, DB health, phpMyAdmin HTTP, headers, metrics, dashboard and 3 LogQL queries')
