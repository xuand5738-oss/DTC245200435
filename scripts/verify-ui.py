"""Read-only comparisons of website views and a MySQL baseline. No screenshots."""
from pathlib import Path
import json,http.cookiejar,urllib.request,urllib.parse,re,html
data=json.loads(Path('tmp/ui-data.json').read_text(encoding='utf-8-sig'))
env=dict(l.split('=',1) for l in Path('.env').read_text().splitlines() if '=' in l)
base='http://127.0.0.1:8280'
def normalized(value): return ' '.join(html.unescape(re.sub('<[^>]+>',' ',value)).split())
class Browser:
    def __init__(self):
        self.cookies=http.cookiejar.CookieJar()
        self.op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))
    def get(self,path):
        with self.op.open(base+path,timeout=20) as response:
            assert response.code==200
            return response.read().decode()
    def login(self,user,key):
        self.get('/login');token=next(c.value for c in self.cookies if c.name=='booking_csrf')
        request=urllib.request.Request(base+'/login',data=urllib.parse.urlencode({'username':user,'password':env[key],'_csrf':token}).encode())
        with self.op.open(request,timeout=20) as response: assert response.code==200
visitor=Browser();home=visitor.get('/');css=visitor.get('/assets/styles.css');js=visitor.get('/assets/site.js')
assert "font-family:'Segoe UI',Arial,sans-serif" in css
assert '@media(max-width:680px)' in css
assert 'data-selected-seat' in js
assert '<html lang="vi">' in home
assert not re.search(r'(?:src|href)="https?://',home),'External assets are not permitted'
admin=Browser();admin.login('admin','WEB_ADMIN_PASSWORD');overview=normalized(admin.get('/admin/showtimes'))+normalized(admin.get('/admin/bookings'))
customer=Browser();customer.login('khachhang','WEB_CUSTOMER_PASSWORD');mine=normalized(customer.get('/my-bookings'))
for show in data['shows']:
    expected=[show['title'],show['formatted_time'],show['formatted_price']]
    detail=normalized(visitor.get('/showtimes/'+str(show['id'])))
    for value in expected:
        assert normalized(value) in normalized(home),('home',value)
        assert normalized(value) in detail,('seat view',value)
        assert normalized(value) in overview,('admin',value)
    free=max(0,int(show['seat_count'])-int(show['booked_count']))
    assert f"{free} / {show['seat_count']} ghế còn trống" in normalized(home)
    assert f"{free} / {show['seat_count']} ghế trống" in detail
for booking in data['bookings']:
    ticket=normalized(admin.get('/bookings/'+str(booking['id'])))
    for value in [booking['title'],booking['label'],booking['formatted_time'],booking['formatted_price']]: assert normalized(value) in ticket
    code='#'+str(booking['id']).zfill(4)
    if booking['username']=='khachhang':
        assert code in mine
        own=normalized(customer.get('/bookings/'+str(booking['id'])))
        for value in [booking['title'],booking['label'],booking['formatted_time'],booking['formatted_price']]: assert normalized(value) in own
    else: assert code not in mine
print('PASS shared Vietnamese font stack, local assets, responsive styles, exact MySQL title/time/price/seat counts and role-scoped booking views')
print('Checked',len(data['shows']),'showtimes and',len(data['bookings']),'bookings; no business data changed, no screenshots captured.')
