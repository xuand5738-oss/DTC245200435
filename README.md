# Đề 11 — Hệ thống đặt vé xem phim / sự kiện

Môn học: Triển khai và Quản trị Hệ thống Phần mềm.

## Phạm vi

Website quản lý suất chiếu, ghế và đặt vé, thanh toán giả lập. Stack dự kiến: Express, MySQL, phpMyAdmin, Nginx, Prometheus, Grafana, Loki và Promtail. Tất cả dịch vụ chạy bằng Docker Compose trên WSL theo lựa chọn của sinh viên.

Chỉ sử dụng tài liệu học phần đã cung cấp. Sinh viên đã cho phép tạo demo: 1 suất chiếu giả định, 8 ghế và 1 vé thanh toán giả lập. Không tích hợp thanh toán thật.

## Trạng thái

Đã chạy ứng dụng Express + MySQL + phpMyAdmin, kiểm chứng đặt vé demo, chống trùng ghế, thanh toán giả lập và đăng nhập phpMyAdmin. Các thành phần Nginx, giám sát và log sẽ được bổ sung ở những nhiệm vụ tiếp theo.

## Chạy ứng dụng trong Ubuntu WSL

Trên máy hiện tại, cần giữ một phiên Ubuntu mở để tránh WSL tự dừng sau khi lệnh kết thúc. Từ PowerShell chạy:

```powershell
cd D:\DTC245200435
powershell -ExecutionPolicy Bypass -File .\start-wsl.ps1
```

Giữ cửa sổ này mở trong lúc dùng website. Script chỉ khởi động stack và mở phiên Bash, không thay đổi dữ liệu. Nếu đóng phiên cuối cùng rồi website không truy cập được, chạy lại script. Việc này khác với `docker compose up -d`: cờ `-d` giữ container chạy nền nhưng không giữ phiên WSL hoạt động trên máy hiện tại.

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

Database mới khởi tạo chưa có dữ liệu. Để tạo lại demo đã được cho phép trên môi trường hiện tại:

```bash
docker compose exec -T app node < scripts/demo.js
```

Script tạo suất chiếu và ghế còn thiếu, đặt vé A1 nếu chưa có và xác nhận thanh toán giả lập. Chạy lại không tạo thêm vé A1. Script dừng nếu ghế này thuộc người đặt khác. Dữ liệu demo là giả định, không lấy từ nguồn ngoài. Xem `docs/du-lieu-can-cung-cap.md`.

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
