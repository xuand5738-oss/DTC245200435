"""Compare existing showtimes with the movie catalog, details and admin catalog."""
from pathlib import Path
import json,urllib.request,urllib.parse,http.cookiejar,re,html
baseline=json.loads(Path('tmp/ui-data.json').read_text(encoding='utf-8-sig'))
env=dict(l.split('=',1) for l in Path('.env').read_text().splitlines() if '=' in l)
base='http://127.0.0.1:8280'
jar=http.cookiejar.CookieJar();op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
def get(path):
    with op.open(base+path,timeout=20) as response:
        assert response.code==200
        return response.read().decode()
def plain(s):return ' '.join(html.unescape(re.sub('<[^>]+>',' ',s)).split())
home=get('/');catalog=get('/movies')
for show in baseline['shows']:
    assert show['movie_id'],'A public showtime must be linked to a movie'
    assert show['title'] in plain(home)
    assert show['title'] in plain(catalog)
    assert '/movies/'+str(show['movie_id']) in catalog
    detail=get('/movies/'+str(show['movie_id']))
    assert '/showtimes/'+str(show['id']) in detail
    assert plain(show['formatted_price']) in plain(detail)
    assert plain(show['formatted_time']) in plain(detail)
get('/login');token=next(c.value for c in jar if c.name=='booking_csrf')
request=urllib.request.Request(base+'/login',data=urllib.parse.urlencode({'username':'admin','password':env['WEB_ADMIN_PASSWORD'],'_csrf':token}).encode())
with op.open(request,timeout=20) as response:assert response.code==200
admin=get('/admin/movies')
for show in baseline['shows']:assert show['title'] in plain(admin)
print('PASS home, movie catalog, movie details, showtime links and admin movie catalog agree for',len(baseline['shows']),'public showtimes; no data changed.')
