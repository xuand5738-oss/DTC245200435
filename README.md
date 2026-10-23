# Đề 11 — Hệ thống đặt vé xem phim / sự kiện

Môn học: Triển khai và Quản trị Hệ thống Phần mềm.

## Phạm vi

Website quản lý suất chiếu, ghế và đặt vé, thanh toán giả lập. Stack dự kiến: Express, MySQL, phpMyAdmin, Nginx, Prometheus, Grafana, Loki và Promtail. Tất cả dịch vụ chạy bằng Docker Compose trên WSL theo lựa chọn của sinh viên.

Chỉ sử dụng tài liệu học phần đã cung cấp. Dữ liệu phim/sự kiện, suất chiếu và ghế do sinh viên cung cấp; chưa thêm dữ liệu mẫu. Không tích hợp thanh toán thật.

## Trạng thái

Đã lập phạm vi và khung báo cáo, kiểm tra Ubuntu 24.04.5 trên WSL 2, Docker Engine 29.1.3 và Compose 2.40.3 hoạt động. Chưa triển khai ứng dụng; chưa có lệnh khởi chạy hệ thống để xác nhận.

Kiểm tra môi trường từ PowerShell:

```powershell
wsl --list --verbose
wsl -d Ubuntu-24.04 -- bash -lc 'cat /etc/os-release; docker version; docker compose version'
```

## Tài liệu dự án

- `docs/tieu-chi.md`: tiêu chí và bằng chứng cần kiểm tra.
- `docs/bao-cao-thuc-hanh.md`: bản thảo báo cáo, cập nhật sau từng nhiệm vụ.

## Quy trình thực hiện

Hoàn thành và kiểm tra từng nhiệm vụ, sau đó commit và push lên GitHub. Các mốc triển khai Nginx, giám sát và log có commit riêng theo yêu cầu đề tài. Khi cần ảnh minh chứng, mở đúng trang hoặc kết quả để sinh viên tự chụp; không tự động chụp ảnh. Không ghi kết quả thành công khi chưa kiểm chứng.

Không đưa mật khẩu, khóa riêng hoặc dữ liệu bí mật vào Git. Các tệp trích xuất PDF trong `tmp/` chỉ phục vụ đọc tài liệu, không thuộc mã nguồn nộp bài.
