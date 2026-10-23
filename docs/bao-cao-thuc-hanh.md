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

**Chưa kiểm chứng luồng đặt vé thành công:** đang chờ dữ liệu phim, suất chiếu, ghế và giá vé từ sinh viên. Không thêm dữ liệu mẫu.

### 5.4. Ảnh sinh viên tự chụp

1. Website `http://localhost:8280` ở trạng thái chờ dữ liệu — chỉ minh chứng ứng dụng truy cập được.
2. Sau khi tự đăng nhập phpMyAdmin tại `http://localhost:8281`, mở database `ticket_booking` để chụp ba bảng. Không để mật khẩu xuất hiện.
3. Sau khi sinh viên cung cấp dữ liệu: chụp chọn ghế, thông tin vé, thanh toán giả lập và bản ghi tương ứng trong DB. Chưa thể chụp phần này hiện tại.

### 5.5. Kết quả đã kiểm tra

Docker Compose khởi động đủ app, db và phpmyadmin. Endpoint `/health` trả `status: ok` và `database: connected`. Website và phpMyAdmin trả HTTP 200. Yêu cầu đặt vé thiếu thông tin bị từ chối với HTTP 400; mã suất chiếu không tồn tại trả HTTP 404. Ba bảng showtimes, seats và bookings đều có 0 bản ghi, đúng yêu cầu chưa thêm dữ liệu. Chưa kiểm tra đặt vé thành công, tranh chấp ghế và thanh toán giả lập trên dữ liệu thật.

Express 4.22.3 và mysql2 3.24.6 được khóa bằng package-lock.json; npm audit khi build không báo lỗ hổng tại thời điểm kiểm tra. Đây chỉ là kiểm tra thư viện npm, chưa phải quét image hay đánh giá toàn bộ bảo mật.

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
