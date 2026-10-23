# BÁO CÁO THỰC HÀNH

**Môn:** Triển khai và Quản trị Hệ thống Phần mềm  
**Đề 11:** Hệ thống đặt vé xem phim / sự kiện  
**Họ và tên:** [Sinh viên điền]  
**Mã số sinh viên:** [Sinh viên xác nhận]  
**Lớp:** [Sinh viên điền]  
**Giảng viên:** [Sinh viên điền]

> Bản thảo cho người mới học. Chỉ điền kết quả sau khi đã thực hiện. Ảnh do sinh viên tự chụp. Khi dàn trang hoàn chỉnh, báo cáo phải đạt tối thiểu 10 trang.

## 1. Mục tiêu và phạm vi

Đề tài triển khai website đặt vé xem phim hoặc sự kiện, quản lý suất chiếu và ghế, với thanh toán giả lập. Ứng dụng sử dụng MySQL và công cụ quản trị phpMyAdmin. Hệ thống bổ sung Nginx reverse proxy, giám sát Prometheus/Grafana, log tập trung Loki/Promtail và các biện pháp bảo mật. Các dịch vụ được khai báo bằng Docker Compose.

Dữ liệu demo giả định được tạo sau khi sinh viên cho phép: một suất chiếu, tám ghế và một lượt đặt vé thử. Môi trường thực hành được chọn là WSL trên Windows thay cho máy ảo VMware trong bài lab.

## 2. Chuẩn bị môi trường

Môi trường đã kiểm tra: Ubuntu 24.04.5 LTS trên WSL 2; Docker Engine 29.1.3; Docker Compose 2.40.3+ds1-0ubuntu1~24.04.1. Lệnh docker version trả về cả Client và Server, xác nhận Docker Engine có phản hồi. Phiên Linux hiện chạy bằng tài khoản root. Chưa triển khai container của đề tài.

Để tự kiểm tra và chụp ảnh, mở terminal Ubuntu-24.04, chạy lần lượt:

```bash
cat /etc/os-release
docker version
docker compose version
```

Trên PowerShell, dùng `wsl --list --verbose` để thấy bản Ubuntu sử dụng WSL 2. Ảnh cần hiện rõ lệnh và kết quả; không để mật khẩu xuất hiện trong ảnh.

**Ảnh cần tự chụp sau khi môi trường hoạt động:** kết quả kiểm tra WSL, Docker và Compose. Chưa cần chụp ở nhiệm vụ lập khung báo cáo.

## 3. Kiến trúc và cách hoạt động

Giai đoạn ứng dụng: trình duyệt truy cập cổng 8280 trên localhost, được chuyển vào cổng 3000 của container Express. Ứng dụng kết nối MySQL qua tên dịch vụ `db` trong mạng backend. phpMyAdmin công bố cổng 8281, kết nối cùng MySQL để xem cấu trúc và dữ liệu. MySQL không công bố cổng ra máy chủ. Mạng backend dùng `internal: true`; dữ liệu được giữ trong named volume. Nginx sẽ được bổ sung trong nhiệm vụ tiếp theo, hiện chưa nằm trên luồng truy cập.

## 4. Quản lý mã nguồn trên GitHub

Repository: https://github.com/xuand5738-oss/DTC245200435

[Bổ sung các commit, cấu trúc thư mục và hướng dẫn dựng hệ thống khi đã triển khai.]

## 5. Triển khai ứng dụng, MySQL và phpMyAdmin

### 5.1. Cấu trúc dữ liệu

MySQL có ba bảng: `showtimes` lưu tên, thời điểm và giá suất chiếu; `seats` lưu nhãn ghế; `bookings` lưu suất chiếu, ghế, tên người đặt và trạng thái thanh toán. Khóa ngoại giữ liên kết dữ liệu. Ràng buộc UNIQUE trên cặp `showtime_id, seat_id` ngăn hai lượt đặt cùng ghế trong cùng suất chiếu, kể cả khi gửi yêu cầu đồng thời.

### 5.2. Khởi động

Trong terminal Ubuntu, vào `/mnt/d/DTC245200435`, chạy `docker compose up -d --build`. Compose đợi MySQL healthy rồi khởi động ứng dụng. Chạy `bash scripts/check-app.sh` để kiểm tra cấu hình, dịch vụ, kết nối DB và các bảng; script không thêm dữ liệu.

### 5.3. Luồng đặt vé

Người dùng chọn suất chiếu, ghế và nhập họ tên. Ứng dụng ghi một booking ở trạng thái `pending`. Nút xác nhận thanh toán giả lập đổi trạng thái thành `simulated_paid`, không kết nối ngân hàng và không thu tiền thật. Câu SQL nhận đầu vào dùng tham số, nội dung hiển thị được escape HTML.

**Đã kiểm chứng:** suất chiếu demo “Hành trình khám phá” lúc 19:30 ngày 25/10/2026, giá 75.000 VND; tám ghế A1–A4, B1–B4. Khách Demo đặt A1 thành công, thanh toán giả lập và kiểm tra bản ghi trong DB. Dữ liệu giả định được sinh viên cho phép, không lấy từ nguồn bên ngoài.

### 5.4. Ảnh sinh viên tự chụp

1. Website `http://localhost:8280` hiển thị suất chiếu, giờ và giá vé; trang `/showtimes/1` hiển thị A1 đã đặt và các ghế còn lại có thể chọn.
2. Sau khi tự đăng nhập phpMyAdmin tại `http://localhost:8281`, mở database `ticket_booking` để chụp ba bảng. Không để mật khẩu xuất hiện.
3. Trang `http://localhost:8280/bookings/1` hiển thị vé A1 đã thanh toán giả lập. Trong phpMyAdmin mở bảng bookings, đối chiếu id 1, showtime_id 1, seat_id trỏ tới A1 và payment_status `simulated_paid`. Đây là ảnh sinh viên tự chụp.

### 5.5. Kết quả đã kiểm tra

Docker Compose khởi động đủ app, db và phpmyadmin. Endpoint `/health` trả `status: ok` và `database: connected`. Website và phpMyAdmin trả HTTP 200. Yêu cầu đặt vé thiếu thông tin bị từ chối với HTTP 400; mã suất chiếu không tồn tại trả HTTP 404. Sau khi được phép tạo demo, script `scripts/demo.js` xác nhận đặt vé trả 303, yêu cầu đặt trùng ghế trả 409 và chỉ có một booking cho A1 trong suất này. Thanh toán trả 303; trạng thái DB là `simulated_paid` và trang vé hiển thị đúng. Đăng nhập phpMyAdmin bằng tài khoản ứng dụng thành công, xem được ba bảng. Chưa kiểm thử tải hay tranh chấp đồng thời; phép thử trùng ghế hiện gửi tuần tự.

Express 4.22.3 và mysql2 3.24.6 được khóa bằng package-lock.json; npm audit khi build không báo lỗ hổng tại thời điểm kiểm tra. Đây chỉ là kiểm tra thư viện npm, chưa phải quét image hay đánh giá toàn bộ bảo mật.

## 6. Cấu hình Nginx reverse proxy

Nginx nhận yêu cầu ở cổng 8280 của máy chủ, chuyển tiếp tới `app:3000` bằng `proxy_pass`. Container app không còn công bố cổng ra Windows. Các header Host, X-Real-IP, X-Forwarded-For và X-Forwarded-Proto được chuyển tới backend. Đề cho phép HTTPS tự ký hoặc security headers; bài này chọn security headers, chưa triển khai HTTPS.

File `nginx/default.conf` đặt X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy và Content-Security-Policy; ẩn phiên bản Nginx. Kiểm tra bằng `docker compose exec nginx nginx -t` và `curl -I http://localhost:8280/`. `/health` qua Nginx phải trả database connected. Chụp trang website qua cổng 8280 và kết quả curl chứa các header để minh chứng.

## 7. Giám sát với Prometheus và Grafana

Prometheus lấy metrics mỗi 15 giây theo `monitoring/prometheus.yml`. Bốn job là chính Prometheus, Nginx exporter, MySQL exporter và cAdvisor. Prometheus chỉ nối mạng monitor; MySQL exporter nối cả backend và monitor để chuyển số liệu từ DB mà không nối trực tiếp Prometheus vào DB.

Grafana được provision datasource và dashboard từ file Git. Dashboard `De 11 - Container, Nginx, MySQL` có tám panel: tình trạng targets, kết nối Nginx, tốc độ request, MySQL alive, số kết nối MySQL, tốc độ query, CPU container và RAM container. Bộ lọc `name=~"topic11-.*"` tránh đưa container dự án cũ vào panel của bài này.

Đã kiểm tra `up` của bốn targets bằng 1, `nginx_up=1`, `mysql_up=1`, có chuỗi RAM của container topic11. Grafana API xác nhận dashboard có tám panel. Mở `http://localhost:8290/targets` để tự chụp targets; đăng nhập Grafana `http://localhost:8300`, user admin, mật khẩu GRAFANA_PASSWORD trong `.env`, vào dashboard để tự chụp. Không đưa mật khẩu vào báo cáo.

## 8. Log tập trung với Loki và Promtail

Nginx ghi request thành JSON vào volume nginx_logs, file booking-access.log. Promtail gắn volume chỉ đọc, thêm nhãn project=topic11 và job=nginx, đọc status/method từ JSON rồi gửi Loki. Loki lưu log trong volume riêng; Grafana dùng datasource Loki để truy vấn. Không gắn Docker socket cho Promtail. File cấu hình nằm trong thư mục logging.

Ba query đã trả kết quả: `{project="topic11",job="nginx"}` (log tổng); `{project="topic11",job="nginx",status="200"}` (truy cập thành công); `{project="topic11",job="nginx"} | json | status = 404` (trang không tồn tại). Mở Grafana Explore, chọn Loki, Last 15 minutes; chụp từng query và log kết quả. Xem hướng dẫn trong docs/logql.md. Nếu log cũ ngoài khoảng chọn, truy cập lại trang chủ và /trang-khong-ton-tai để sinh log mới.

## 9. Hardening hệ thống

1. Container app chạy USER node trong Dockerfile; kiểm tra UID thực tế là 1000, giảm quyền của tiến trình.
2. App có read_only=true, cap_drop ALL và no-new-privileges. Docker inspect xác nhận cả ba; giảm khả năng ghi filesystem và tăng quyền.
3. MySQL nằm ở backend internal, không publish cổng; app không publish cổng. Prometheus không nối backend, chỉ exporter DB nối hai mạng. Các giao diện quản trị chỉ bind 127.0.0.1.
4. Mật khẩu riêng được sinh ngẫu nhiên, giữ trong .env và bị .gitignore loại bỏ; .env.example không chứa bí mật thật. Không dùng tài khoản root để ứng dụng kết nối DB.
5. Tài khoản ứng dụng chỉ SELECT, INSERT, UPDATE trên ticket_booking; không GRANT OPTION. Script verify-hardening.js xác nhận CREATE TABLE bị từ chối. Exporter chỉ có quyền giám sát riêng, không quyền sửa dữ liệu nghiệp vụ.
6. Security headers ở Nginx và giới hạn body; ứng dụng dùng SQL tham số và escape HTML. Các header được xác nhận qua HTTP thực tế.

Các cấu hình này dành cho bài thực hành. Chưa có đăng nhập/phân quyền người dùng ở website, chưa HTTPS, chưa audit image; không coi đây là cấu hình sẵn sàng công khai Internet. cAdvisor cần privileged và mount hệ thống chỉ đọc để lấy metrics trong WSL, là ngoại lệ có đặc quyền cao của bộ giám sát, không phải hardening cho mọi container.

## 10. Kiểm tra tổng thể và demo

**Sự cố môi trường đã gặp:** website trong WSL trả HTTP 200, nhưng sau khi phiên WSL kết thúc thì Windows không kết nối được; container bị dừng và khởi động lại ở lần gọi WSL tiếp theo. Giữ phiên Ubuntu tương tác mở bằng `start-wsl.ps1` giúp Windows truy cập lại cả website và phpMyAdmin với HTTP 200. Không thay đổi dữ liệu DB để xử lý sự cố này.

Hệ thống gồm 11 dịch vụ Compose. Script verify-stack.py xác nhận website qua Nginx, kết nối DB, phpMyAdmin HTTP 200, bốn security headers, bốn target UP, metrics Nginx/MySQL/container, dashboard tám panel và ba LogQL có dữ liệu. Script demo.js kiểm chứng vé demo và chống đặt lại ghế; verify-hardening.js kiểm tra UID và quyền DB.

Sự cố log: access.log mặc định của image Nginx là symlink tới stdout; Promtail không đọc được như file thường. Đã chuyển sang booking-access.log và glob booking-*.log. Sau khi Promtail gửi lô đầu, ba query trả lần lượt log tổng, log thành công và log 404. Không cần thêm dữ liệu nghiệp vụ để tạo log kiểm tra.

## 11. Kết quả và tài liệu tham khảo

Đã kiểm chứng các nhóm kỹ thuật của đề: ứng dụng/DB, Nginx, giám sát, log và hardening. Mã nguồn và cấu hình được push theo từng mốc. Sinh viên cần tự chụp minh chứng, điền bìa và trình bày demo; các mục này không thể được coi là hoàn thành chỉ bằng kiểm tra tự động.

Tài liệu tham khảo: De_Tai_Thuc_Hanh - TKQT HTPM K23.pdf (trang 1–2 và đề 11); chapter01–chapter09 và slide tương ứng; các bài lab 1–8 đã cung cấp. Dữ liệu demo giả định được sinh viên cho phép. Không sử dụng nội dung tham khảo ngoài danh sách học phần để viết báo cáo.
