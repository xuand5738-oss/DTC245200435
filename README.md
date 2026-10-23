# Đề 11 — Hệ thống đặt vé xem phim / sự kiện

Môn học: Triển khai và Quản trị Hệ thống Phần mềm.

## Phạm vi

Website quản lý suất chiếu, ghế và đặt vé, thanh toán giả lập. Stack dự kiến: Express, MySQL, phpMyAdmin, Nginx, Prometheus, Grafana, Loki và Promtail. Tất cả dịch vụ chạy bằng Docker Compose trên WSL theo lựa chọn của sinh viên.

Chỉ sử dụng tài liệu học phần đã cung cấp. Dữ liệu phim/sự kiện, suất chiếu và ghế do sinh viên cung cấp; chưa thêm dữ liệu mẫu. Không tích hợp thanh toán thật.

## Trạng thái

Đã lập phạm vi, khung báo cáo và mã nguồn ứng dụng Express + MySQL + phpMyAdmin. Chưa có dữ liệu nghiệp vụ. Các thành phần Nginx, giám sát và log sẽ được bổ sung ở những nhiệm vụ tiếp theo.

## Chạy ứng dụng trong Ubuntu WSL

```bash
cd /mnt/d/DTC245200435
cp .env.example .env  # chỉ làm nếu chưa có .env
# Sửa hai mật khẩu trong .env thành hai mật khẩu mạnh khác nhau trước khi chạy.
docker compose up -d --build
bash scripts/check-app.sh
```

Môi trường hiện tại đã có `.env` sinh mật khẩu ngẫu nhiên và không đưa vào Git. Không ghi đè tệp này. Không đổi mật khẩu trong `.env` khi DB đã khởi tạo mà chưa đổi mật khẩu tài khoản tương ứng trong MySQL.

- Website: http://localhost:8280
- phpMyAdmin: http://localhost:8281 — máy chủ `db`, tài khoản là `MYSQL_USER` và mật khẩu `MYSQL_PASSWORD` trong `.env`. Chưa cấu hình tự đăng nhập. Không chụp mật khẩu vào báo cáo.
- MySQL không công bố cổng ra Windows. Dữ liệu nằm trong volume `topic11_mysql_data`, độc lập với hệ thống cũ.
- Dừng bằng `docker compose stop`; chạy lại bằng `docker compose up -d`. Không dùng `docker compose down -v` vì sẽ xóa dữ liệu.

Trang ban đầu hiện thông báo chưa có suất chiếu là đúng thiết kế khi chưa được cung cấp dữ liệu. Xem `docs/du-lieu-can-cung-cap.md`.

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
