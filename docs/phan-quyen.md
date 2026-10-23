# Đăng nhập và phân quyền website

Trang đăng nhập: http://localhost:8280/login. Đây là tài khoản website, độc lập với tài khoản phpMyAdmin và Grafana.

| Vai trò | Quyền |
|---|---|
| Chưa đăng nhập | Xem suất chiếu và trạng thái ghế; đăng nhập để đặt vé |
| khachhang — customer | Đặt vé, xem danh sách vé của mình, mở và thanh toán giả lập vé mình sở hữu |
| admin — admin | Xem toàn bộ vé, mở/thanh toán giả lập mọi vé, xem trang quản trị và thêm suất chiếu |

Mật khẩu demo lưu tại máy trong `.env`: WEB_ADMIN_PASSWORD và WEB_CUSTOMER_PASSWORD. Không đưa mật khẩu vào Git. Script seed chỉ tạo tài khoản chưa tồn tại, không tự đổi mật khẩu tài khoản cũ. Website chưa có đăng ký tự do hay giao diện thay đổi vai trò.

## Triển khai trên DB đã có

Trong Ubuntu WSL, ở thư mục dự án:

```bash
bash scripts/apply-auth.sh
```

Script sinh mật khẩu nếu chưa có, tạo bảng users/sessions và cột bookings.user_id bằng quyền quản trị DB, build app, tạo hai tài khoản demo rồi nạp lại proxy. Không xóa hay tự gán lại các vé cũ. Vé cũ có user_id NULL chỉ quản trị viên xem được.

Với DB mới, file db/init/03-auth.sql được MySQL chạy tự động; vẫn chạy apply-auth.sh để tạo hai tài khoản website. Không thay quyền tài khoản DB đang có. Mỗi mật khẩu được băm bằng scrypt với salt riêng, không lưu mật khẩu rõ trong users. Token phiên ngẫu nhiên chỉ lưu bản SHA-256 trong DB, thời hạn 8 giờ; logout vô hiệu hóa phiên. Cookie HttpOnly/SameSite=Strict, có token CSRF cho POST. Trên localhost HTTP cookie chưa bật Secure; khi triển khai HTTPS phải cấu hình COOKIE_SECURE=true.

Mọi kiểm tra vai trò và quyền sở hữu thực hiện ở server; không tin user_id hay role gửi từ form. Khách truy cập vé không thuộc mình nhận 404 để tránh tiết lộ vé tồn tại. Trang quản trị trả 403 cho khách đã đăng nhập.

## Kiểm chứng và ảnh sinh viên tự chụp

Chạy `python scripts/verify-auth.py` trên Windows. Lần đầu script tạo một vé A2 cho Khách Demo phân quyền, thanh toán giả lập; các lần sau dùng vé đã có. Script kiểm tra đăng nhập, chặn /admin, chặn GET/POST vé người khác, CSRF, vai trò giả mạo trong form, vé sở hữu và cookie đăng xuất không dùng lại được.

Đăng nhập admin, mở /admin để tự chụp bảng quản trị. Đăng xuất, đăng nhập khachhang, mở /my-bookings để tự chụp vé của mình; mở /admin để chụp thông báo không có quyền. Không tự chụp ảnh trong quá trình xây dựng. Không cần sửa báo cáo theo lựa chọn phạm vi hiện tại.
