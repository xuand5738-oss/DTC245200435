# Theo dõi yêu cầu đề tài 11

Nguồn: De_Tai_Thuc_Hanh - TKQT HTPM K23.pdf, trang 1–2 và đề 11 trang 4.

| Tiêu chí | Điểm | Bằng chứng cần có | Trạng thái |
|---|---:|---|---|
| GitHub | 1,5 | Source, cấu hình, README hướng dẫn chạy, 3 commit có ý nghĩa theo các mốc | Đang làm |
| Ứng dụng và DB | 1,5 | Website đặt vé hoạt động, kết nối MySQL, phpMyAdmin hoạt động | Chưa làm |
| Nginx | 1,5 | Website qua reverse proxy, HTTPS tự ký hoặc security headers; commit riêng | Chưa làm |
| Prometheus và Grafana | 1,5 | Metrics và dashboard container, web server, DB; commit riêng | Chưa làm |
| Loki và Promtail | 1,5 | Log tập trung và 3 truy vấn LogQL có kết quả; commit riêng | Chưa làm |
| Hardening | 1,5 | 4 biện pháp có cấu hình và kết quả kiểm tra | Chưa làm |
| Tổng thể và trình bày | 1,0 | Docker Compose, demo, ảnh do sinh viên chụp, giải thích được hệ thống | Chưa làm |

Báo cáo bắt buộc tối thiểu 10 trang, có bìa thông tin sinh viên và đề tài, kiến trúc, cách hoạt động, kết quả và hình minh họa. Bản Markdown là bản thảo; số trang chỉ được xác nhận sau khi dàn trang.

## Các nhiệm vụ

1. Phạm vi, tiêu chí và khung báo cáo — đã hoàn thành.
2. Kiểm tra WSL và Docker; ghi hướng dẫn môi trường thực tế — đã xác nhận WSL 2, Ubuntu 24.04.5, Docker Engine và Compose hoạt động; sinh viên chưa chụp ảnh minh chứng.
3. Ứng dụng, MySQL và phpMyAdmin; nhận dữ liệu nghiệp vụ từ sinh viên.
4. Nginx reverse proxy và HTTPS/security headers.
5. Prometheus, exporter và Grafana cho đủ ba tầng giám sát.
6. Loki, Promtail và 3 truy vấn LogQL.
7. Hoàn thiện 4 biện pháp hardening và kiểm chứng.
8. Kiểm tra toàn hệ thống, demo và hoàn thiện báo cáo tối thiểu 10 trang.

Mỗi nhiệm vụ hoàn thành phải có commit và push. Chỉ đánh dấu hoàn thành sau khi kiểm tra. Cài đặt hoặc thay đổi môi trường cần được thông báo; không tự thêm dữ liệu nghiệp vụ.
