# Hướng dẫn tự chụp minh chứng và trình bày

Không có ảnh tự động được tạo. Chạy start-wsl.ps1 và giữ terminal Ubuntu mở.

| Thứ tự | Mở phần cần chụp | Nội dung cần thấy | Mục báo cáo |
|---|---|---|---|
| 1 | Repository GitHub | Source, README và các commit Nginx, monitoring, logging | 4 |
| 2 | http://localhost:8280 | Suất chiếu demo, giờ và giá | 5 |
| 3 | http://localhost:8280/showtimes/1 | A1 đã đặt, các ghế khác còn chọn được | 5 |
| 4 | http://localhost:8280/bookings/1 | Tên Khách Demo, A1, đã thanh toán giả lập | 5 |
| 5 | http://localhost:8281 | Đăng nhập, mở ticket_booking, bookings, đối chiếu id 1 | 5 |
| 6 | Terminal Ubuntu: curl -I http://localhost:8280/ | Nginx và bốn security headers | 6 |
| 7 | http://localhost:8290/targets | Bốn targets UP | 7 |
| 8 | http://localhost:8300/d/topic11 | Dashboard đủ container, web, DB; Last 15 minutes | 7 |
| 9–11 | http://localhost:8300/explore | Chọn Loki, từng query trong logql.md và kết quả | 8 |
| 12 | Terminal: docker compose exec -T app node < scripts/verify-hardening.js | UID non-root, CREATE TABLE denied và grants | 9 |
| 13 | Terminal: docker compose ps | Đủ 11 dịch vụ đang chạy | 10 |

phpMyAdmin dùng MYSQL_USER/MYSQL_PASSWORD; Grafana dùng admin/GRAFANA_PASSWORD. Đọc trong .env tại máy; không chụp hay đưa mật khẩu lên Git.

## Kịch bản trình bày

1. Giải thích luồng trình duyệt → Nginx → Express → MySQL. Chỉ Nginx công bố cổng website.
2. Mở suất chiếu, chỉ ra A1 đã đặt. Mở vé và đối chiếu DB. Muốn đặt thêm vé, dùng một ghế còn trống và tên demo; thao tác đó sẽ tạo thêm dữ liệu nên chỉ thực hiện khi sinh viên quyết định demo thêm.
3. Giải thích ràng buộc UNIQUE(showtime_id, seat_id), thanh toán giả lập và SQL tham số.
4. Mở targets rồi dashboard; giải thích metrics khác log: metrics cho biết xu hướng/số lượng, log cho biết từng yêu cầu cụ thể.
5. Chạy ba LogQL: tổng log, 200 và 404. Nếu không thấy log mới, truy cập trang chủ và /trang-khong-ton-tai, đợi vài giây rồi refresh.
6. Trình bày ít nhất bốn biện pháp hardening; chứng minh bằng cấu hình và script, không chỉ đọc tên biện pháp.

## Hoàn thiện bản nộp

Điền họ tên, MSSV, lớp và giảng viên trên bìa. Kiểm tra yêu cầu tài khoản GitHub đặt theo MSSV với giảng viên: tài khoản repository hiện tại là xuand5738-oss, chưa khớp yêu cầu này; không tự đổi tên tài khoản. Chèn ảnh tự chụp và chú thích vào bản báo cáo. Chưa có ảnh hoặc buổi trình bày thực tế thì tiêu chí minh chứng/trình bày vẫn cần sinh viên hoàn thành.
