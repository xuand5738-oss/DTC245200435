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

Dữ liệu nghiệp vụ do sinh viên cung cấp. Môi trường thực hành được chọn là WSL trên Windows thay cho máy ảo VMware trong bài lab.

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

[Bổ sung sơ đồ, luồng trình duyệt → Nginx → ứng dụng → MySQL, mạng và volume theo cấu hình thực tế.]

## 4. Quản lý mã nguồn trên GitHub

Repository: https://github.com/xuand5738-oss/DTC245200435

[Bổ sung các commit, cấu trúc thư mục và hướng dẫn dựng hệ thống khi đã triển khai.]

## 5. Triển khai ứng dụng, MySQL và phpMyAdmin

[Bổ sung dữ liệu được cung cấp, các bước chạy, đặt vé và thanh toán giả lập; ảnh website và dữ liệu DB khớp nhau.]

## 6. Cấu hình Nginx reverse proxy

[Bổ sung cấu hình, giải thích chuyển tiếp yêu cầu, HTTPS/security headers và kết quả kiểm tra.]

## 7. Giám sát với Prometheus và Grafana

[Bổ sung exporter, targets và dashboard cho container, web server, database.]

## 8. Log tập trung với Loki và Promtail

[Bổ sung luồng thu thập log, 3 truy vấn LogQL theo nhãn thực tế, ý nghĩa và kết quả từng truy vấn.]

## 9. Hardening hệ thống

[Ghi ít nhất 4 biện pháp đã áp dụng: vị trí cấu hình, mục đích và cách kiểm chứng. Không chỉ liệt kê tên.]

## 10. Kiểm tra tổng thể và demo

[Bổ sung kết quả Docker Compose, kịch bản đặt vé, đối chiếu DB, metrics, log và bảo mật. Ghi lỗi gặp phải và cách xử lý thực tế.]

## 11. Kết quả và tài liệu tham khảo

[Đối chiếu các tiêu chí với bằng chứng; ghi phần còn hạn chế. Tài liệu tham khảo chỉ gồm tài liệu học phần đã cung cấp, trừ khi sinh viên cho phép bổ sung.]
