"""Exercise real login and role/ownership guards using authorized demo accounts.
Creates one customer demo booking on A2 if the customer has no bookings yet.
"""
from pathlib import Path
import urllib.request,urllib.error,urllib.parse,http.cookiejar,re
from html.parser import HTMLParser
env=dict(l.split('=',1) for l in Path('.env').read_text().splitlines() if '=' in l)
base='http://127.0.0.1:8280'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None
class Client:
    def __init__(self):
        self.jar=http.cookiejar.CookieJar()
        self.opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar),NoRedirect)
    def request(self,path,data=None):
        req=urllib.request.Request(base+path,data=urllib.parse.urlencode(data).encode() if data is not None else None)
        try: response=self.opener.open(req,timeout=20)
        except urllib.error.HTTPError as error: response=error
        return response.code,response.headers,response.read().decode()
    def csrf(self): return next(c.value for c in self.jar if c.name=='booking_csrf')
    def login(self,user,password):
        assert self.request('/login')[0]==200
        code,headers,_=self.request('/login',{'username':user,'password':password,'_csrf':self.csrf(),'role':'admin'})
        assert code==303,(user,code)
        cookie=next(c for c in self.jar if c.name=='booking_session')
        assert cookie.has_nonstandard_attr('HttpOnly')
        return headers['Location']

anonymous=Client()
assert anonymous.request('/bookings/1')[0]==303
assert anonymous.request('/admin')[0]==303
admin=Client(); assert admin.login('admin',env['WEB_ADMIN_PASSWORD'])=='/admin'
wrong=Client();wrong.request('/login')
assert wrong.request('/login',{'username':'admin','password':'incorrect-demo-password','_csrf':wrong.csrf()})[0]==401
customer=Client(); assert customer.login('khachhang',env['WEB_CUSTOMER_PASSWORD'])=='/my-bookings'
assert admin.request('/admin')[0]==200
assert admin.request('/admin/showtimes',{'_csrf':admin.csrf()})[0]==400
assert admin.request('/bookings/1')[0]==200
assert customer.request('/admin')[0]==403
assert customer.request('/admin/showtimes',{'title':'SHOULD NOT INSERT','_csrf':customer.csrf()})[0]==403
assert customer.request('/bookings/1')[0]==404
assert customer.request('/bookings/1/pay',{'_csrf':customer.csrf()})[0]==404
assert customer.request('/bookings',{})[0]==403
assert customer.request('/logout',{'_csrf':'é'*64})[0]==403
code,_,html=customer.request('/my-bookings');assert code==200
match=re.search(r'href="/bookings/(\d+)"',html)
if match: booking_id=match.group(1)
else:
    code,_,show=customer.request('/showtimes/1');assert code==200
    class SeatParser(HTMLParser):
        value=None
        def handle_starttag(self,tag,attrs):
            a=dict(attrs)
            if tag=='input' and a.get('name')=='seat_id' and a.get('data-label')=='A2' and 'disabled' not in a: self.value=a['value']
    seat=SeatParser();seat.feed(show)
    assert seat.value,'A2 is not free; do not change another booking'
    code,headers,_=customer.request('/bookings',{'showtime_id':'1','seat_id':seat.value,'customer_name':'Khách Demo phân quyền','user_id':'1','_csrf':customer.csrf()})
    assert code==303
    booking_id=headers['Location'].split('/')[-1]
assert customer.request('/bookings/'+booking_id)[0]==200
assert customer.request('/bookings/'+booking_id+'/pay',{'_csrf':customer.csrf()})[0]==303
assert 'Đã thanh toán giả lập' in customer.request('/bookings/'+booking_id)[2]
assert admin.request('/bookings/'+booking_id)[0]==200
# Login rotates tokens and logout invalidates the server-side session.
saved_cookie='; '.join(c.name+'='+c.value for c in customer.jar)
assert customer.request('/logout',{'_csrf':customer.csrf()})[0]==303
replay=urllib.request.Request(base+'/my-bookings',headers={'Cookie':saved_cookie})
try: response=urllib.request.build_opener(NoRedirect).open(replay,timeout=20)
except urllib.error.HTTPError as error: response=error
assert response.code==303
assert customer.request('/my-bookings')[0]==303
print('PASS login admin/customer, anonymous guard, admin-only GET/POST, ownership GET/POST, CSRF, customer booking/payment and logout replay rejection')
print('Customer demo booking id:',booking_id)
