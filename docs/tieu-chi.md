# Theo dõi yêu cầu đề tài 11

Nguồn: De_Tai_Thuc_Hanh - TKQT HTPM K23.pdf, trang 1–2 và đề 11 trang 4.

## Phạm vi sinh viên xác nhận ngày 24/10/2026

Sinh viên yêu cầu không tiếp tục phần báo cáo và giữ tài khoản GitHub hiện tại; sinh viên sẽ xác nhận yêu cầu tên tài khoản với giảng viên. Đây là lựa chọn về phạm vi thực hiện, không phải xác nhận giảng viên miễn yêu cầu gốc. Các tệp báo cáo đã có được giữ nguyên.

Rà soát kỹ thuật cuối: 11 dịch vụ chạy; app và DB healthy; cấu hình Nginx hợp lệ; bốn targets UP; nginx_up/mysql_up bằng 1; metrics container có dữ liệu; Grafana có tám panel; ba LogQL có kết quả. UID app 1000, không có ALL PRIVILEGES/GRANT OPTION, CREATE TABLE bị từ chối. Không tạo thêm vé trong lần rà soát này. Ảnh và trình bày trực tiếp vẫn do sinh viên thực hiện.

| Tiêu chí | Điểm | Bằng chứng cần có | Trạng thái |
|---|---:|---|---|
| GitHub | 1,5 | Source, cấu hình, README hướng dẫn chạy, 3 commit có ý nghĩa theo các mốc | Đã push source, cấu hình, README và đủ ba mốc; tài khoản xuand5738-oss chưa theo MSSV |
| Ứng dụng và DB | 1,5 | Website đặt vé hoạt động, kết nối MySQL, phpMyAdmin hoạt động | Đã kiểm chứng bằng demo: đặt vé, trùng ghế 409, thanh toán, đối chiếu DB, đăng nhập phpMyAdmin; chờ sinh viên chụp minh chứng |
| Nginx | 1,5 | Website qua reverse proxy, HTTPS tự ký hoặc security headers; commit riêng | Đạt kiểm tra: nginx -t, HTTP 200, 4 security headers; commit 201ea21 |
| Prometheus và Grafana | 1,5 | Metrics và dashboard container, web server, DB; commit riêng | Đạt kiểm tra: 4 targets UP, metrics 3 tầng, 8 panel; commit ca5ed5a |
| Loki và Promtail | 1,5 | Log tập trung và 3 truy vấn LogQL có kết quả; commit riêng | Đạt kiểm tra: 3 query trả log; commit 3d26c86 |
| Hardening | 1,5 | 4 biện pháp có cấu hình và kết quả kiểm tra | Đã xác nhận non-root, read-only, cap_drop/no-new-privileges, mạng/cổng, DB hạn quyền, headers, bí mật ngoài Git |
| Tổng thể và trình bày | 1,0 | Docker Compose, demo, ảnh do sinh viên chụp, giải thích được hệ thống | 11 dịch vụ chạy và kiểm tra tổng thể đạt; sinh viên cần chụp ảnh và trình bày |

Báo cáo bắt buộc tối thiểu 10 trang, có bìa thông tin sinh viên và đề tài, kiến trúc, cách hoạt động, kết quả và hình minh họa. Bản Markdown là bản thảo; số trang chỉ được xác nhận sau khi dàn trang.

## Các nhiệm vụ

1. Phạm vi, tiêu chí và khung báo cáo — đã hoàn thành.
2. Kiểm tra WSL và Docker; ghi hướng dẫn môi trường thực tế — đã xác nhận WSL 2, Ubuntu 24.04.5, Docker Engine và Compose hoạt động; sinh viên chưa chụp ảnh minh chứng.
3. Ứng dụng, MySQL và phpMyAdmin — đã hoàn thành kiểm tra kỹ thuật bằng dữ liệu demo được sinh viên cho phép. Chưa có ảnh do sinh viên tự chụp.
4. Nginx reverse proxy và security headers — đã hoàn thành kỹ thuật.
5. Prometheus, exporter và Grafana cho đủ ba tầng giám sát — đã hoàn thành kỹ thuật.
6. Loki, Promtail và 3 truy vấn LogQL — đã hoàn thành kỹ thuật.
7. Hardening và kiểm chứng — đã hoàn thành các biện pháp liệt kê trong báo cáo.
8. Kiểm tra toàn hệ thống đã đạt. Có bản Markdown và Word gồm bìa + 11 chương bắt đầu trang mới; thiếu trình render nên chưa xác nhận số trang in, chưa có ảnh sinh viên và thông tin bìa đầy đủ.

Mỗi nhiệm vụ hoàn thành phải có commit và push. Chỉ đánh dấu hoàn thành sau khi kiểm tra. Cài đặt hoặc thay đổi môi trường cần được thông báo; không tự thêm dữ liệu nghiệp vụ.
