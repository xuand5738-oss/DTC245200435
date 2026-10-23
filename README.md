# Đề 11 — Hệ thống đặt vé xem phim / sự kiện

Môn: Triển khai và Quản trị Hệ thống Phần mềm.

## Phạm vi và trạng thái

Đã triển khai website Express + MySQL + phpMyAdmin, Nginx reverse proxy, Prometheus + Grafana, Loki + Promtail và các biện pháp hardening. Toàn bộ 11 dịch vụ chạy bằng Docker Compose trong Ubuntu WSL 2. Nginx có security headers theo phương án đề bài cho phép; chưa HTTPS.

Website có phim, rạp/phòng, sơ đồ ghế, lịch chiếu, đặt vé, ưu đãi/bắp nước, thanh toán giả lập, QR/check-in, đổi/hủy, thành viên, CMS, phân quyền và báo cáo CSV. Dữ liệu lấy từ MySQL; giao diện dùng phông chữ tiếng Việt, VND và múi giờ Việt Nam. Prometheus có 4 target, Grafana có dashboard 8 panel cho container/web/DB; có 3 truy vấn LogQL trong tài liệu.

Thanh toán, hoàn tiền và cấu hình cổng thanh toán đều là giả lập nội bộ, không thu tiền thật. Dữ liệu demo hư cấu được tạo theo yêu cầu của sinh viên; không lấy phim/ảnh từ nguồn ngoài.

## Cấu hình môi trường mới

Cần Ubuntu WSL 2, Docker Engine, Docker Compose, Python 3 và kết nối mạng để tải image lần đầu. Các lệnh Bash dưới đây chạy trong Ubuntu tại thư mục dự án:

```bash
cd /mnt/d/DTC245200435
```

Chỉ khi chưa có `.env`, sao chép mẫu:

```bash
cp .env.example .env
```

Điền cấu hình trước khi khởi động:

| Biến | Mục đích |
|---|---|
| MYSQL_DATABASE, MYSQL_USER | Tên DB và tài khoản ứng dụng |
| MYSQL_PASSWORD | Mật khẩu DB ứng dụng |
| MYSQL_ROOT_PASSWORD | Mật khẩu quản trị MySQL |
| MYSQL_EXPORTER_PASSWORD | Mật khẩu exporter, chỉ dùng chữ và số |
| GRAFANA_PASSWORD | Mật khẩu tài khoản admin của Grafana |
| WEB_ADMIN_PASSWORD, WEB_CUSTOMER_PASSWORD | Tùy chọn; script thiết lập web tự sinh nếu chưa có |

Thay mọi giá trị `REPLACE_WITH_...` bằng mật khẩu mạnh, khác nhau. Máy hiện tại đã có `.env`; không sao chép đè hoặc đưa tệp này vào Git. Không đổi mật khẩu trong `.env` của DB đã có dữ liệu mà chưa đổi mật khẩu tài khoản tương ứng trong MySQL.

## Triển khai lần đầu

```bash
docker compose config --quiet
docker compose up -d --build --wait
bash scripts/apply-auth.sh
bash scripts/check-app.sh
```

DB mới tự chạy các tệp trong `db/init/` để tạo schema, quyền và migration. `apply-auth.sh` tạo tài khoản web ban đầu, tự sinh mật khẩu web còn thiếu vào `.env` cục bộ, không in mật khẩu. Mật khẩu web được băm scrypt; script không đặt lại mật khẩu tài khoản đã tồn tại. DB nghiệp vụ chưa có phim/rạp/vé cho đến khi nhập hoặc chủ động tạo demo.

## Khởi động lại và nâng cấp

Trên máy hiện tại, từ PowerShell:

```powershell
cd D:\DTC245200435
powershell -ExecutionPolicy Bypass -File .\start-wsl.ps1
```

Giữ phiên Ubuntu này mở khi sử dụng website. Trên máy thực hành, WSL có thể dừng sau khi phiên cuối kết thúc; `docker compose up -d` không thay thế việc giữ phiên WSL hoạt động. Script trên chỉ khởi động stack và mở Bash, không tạo demo.

Sau khi cập nhật mã nguồn, trong Ubuntu:

```bash
docker compose up -d --build --wait
docker compose exec -T nginx nginx -s reload
```

Reload Nginx để cập nhật upstream khi container app được tạo lại. Với DB từ phiên bản chưa có tài khoản web, chạy `bash scripts/apply-auth.sh`; với DB chưa có nghiệp vụ rạp chiếu/migration liên kết phim, chạy `bash scripts/apply-cinema.sh`. Script nâng cấp rạp chiếu tạo bản sao lưu cục bộ trong `tmp/` trước khi áp dụng schema. Không chạy seed mỗi lần mở website.

Dừng bằng `docker compose stop`, chạy lại bằng `docker compose up -d`. Không dùng `docker compose down -v` nếu cần giữ dữ liệu vì tùy chọn `-v` xóa volume.

## Địa chỉ và đăng nhập

| Thành phần | Địa chỉ | Tài khoản / ghi chú |
|---|---|---|
| Website | http://127.0.0.1:8280 | Qua Nginx; đăng nhập tại /login |
| Admin website | http://127.0.0.1:8280/admin | admin / WEB_ADMIN_PASSWORD trong .env |
| Khách hàng | http://127.0.0.1:8280/login | khachhang / WEB_CUSTOMER_PASSWORD trong .env |
| phpMyAdmin | http://127.0.0.1:8281 | Máy chủ db; MYSQL_USER / MYSQL_PASSWORD |
| Prometheus | http://127.0.0.1:8290/targets | 4 target phải UP |
| Grafana | http://127.0.0.1:8300/d/topic11 | admin / GRAFANA_PASSWORD |
| Grafana Explore | http://127.0.0.1:8300/explore | Chọn datasource Loki |
| Loki API | http://127.0.0.1:8310 | Chỉ công bố trên localhost |

Tài khoản website, phpMyAdmin và Grafana là các hệ thống đăng nhập riêng. Không đưa mật khẩu vào ảnh minh chứng. App và MySQL không công bố cổng trực tiếp ra Windows. Dữ liệu MySQL nằm trong volume `topic11_mysql_data`; ảnh tải lên, giám sát và log có volume riêng. Promtail đọc file Nginx qua volume, không đọc Docker socket.

## Phân quyền hiện tại

- **Khách hàng:** đặt và thanh toán giả lập vé của mình, Vé của tôi, Thành viên, yêu cầu đổi/hủy và đổi quà.
- **Admin tối cao:** quản trị hệ thống, xem và xử lý giao dịch; không được đặt vé, xác nhận thanh toán hay sử dụng trang vé/thành viên cá nhân.
- **Quản lý rạp:** lịch chiếu, báo cáo và nhân viên thuộc rạp được phân công.
- **Nhân viên soát vé:** check-in tại rạp được phân công.
- **CSKH:** xem giao dịch, tạo và duyệt yêu cầu đổi/hủy theo quyền hỗ trợ.

Admin tạo tài khoản và phân công rạp trong Tài khoản & RBAC. Phim → Lịch chiếu → Vé và Rạp → Phòng → Sơ đồ ghế → Lịch chiếu có liên kết lọc/chọn sẵn dữ liệu. Mọi quyền được kiểm tra ở server. Vé cũ chưa gắn khách hàng vẫn giữ cho admin quản lý. Chi tiết chức năng và giới hạn trong [tài liệu quản trị](docs/admin-mo-rong.md).

## Tạo dữ liệu demo và thử đặt vé

Chạy thủ công trong Ubuntu:

```bash
docker compose exec -T app node < scripts/seed-cinema-demo.js
```

Script thêm 3 phim (2 đang chiếu, 1 sắp chiếu), 1 rạp, 2 phòng với 48 ghế, 4 suất vào ngày kế tiếp lúc chạy lần đầu, 3 sản phẩm bắp nước, mã VE11DEMO, 1 hạng thành viên, 1 quà đổi điểm và 2 nội dung trang chủ. Script không tạo vé hoặc thanh toán. Dấu `demo_catalog_v1` ngăn thêm lại khi chạy lần nữa, bảo toàn các chỉnh sửa/xóa sau đó. Lịch và thời hạn voucher không tự gia hạn; admin cần cập nhật khi demo vào ngày khác. Poster/trailer để trống cho đến khi người dùng cung cấp nội dung được phép.

1. Đăng nhập **khachhang**, mở phim/suất đang bán và chọn ghế còn trống.
2. Nhập thông tin người đặt, chọn đối tượng, voucher/bắp nước nếu cần; tạo vé rồi kiểm tra chi tiết tổng tiền.
3. Xác nhận thanh toán giả lập. Vé có QR và xuất hiện trong **Vé của tôi**.
4. Đăng nhập **admin**, mở **Giao dịch** để kiểm tra vé, xử lý đổi/hủy và xem báo cáo. Admin không đặt vé thay khách.
5. Báo cáo mặc định theo **ngày thanh toán** giờ Việt Nam. Chọn **Ngày chiếu và lấp đầy** để xem sức chứa cộng qua từng suất; tổng lượt ghế không phải số ghế đã bán. CSV dùng cùng bộ lọc/chế độ.

`scripts/demo.js` là script lịch sử dùng phiên admin, không còn phù hợp với phân quyền hiện tại: yêu cầu đặt/thanh toán bị trả 403. Không dùng script này để tạo lại demo; dùng `seed-cinema-demo.js` và tài khoản khách hàng như trên. Các vé demo cũ vẫn giữ trong lịch sử.

## Kiểm tra kỹ thuật

Chạy trong Ubuntu:

```bash
bash scripts/check-app.sh
python3 scripts/verify-stack.py
docker compose exec -T app node < scripts/verify-hardening.js
```

`verify-stack.py` kiểm tra website, DB health, phpMyAdmin HTTP, headers, metrics, dashboard và 3 LogQL. Đợi Prometheus scrape và Promtail gửi log sau khi khởi động. `verify-hardening.js` kiểm tra UID khác root, DB không có ALL PRIVILEGES/GRANT OPTION và bị từ chối CREATE TABLE.

Kiểm thử nghiệp vụ trên DB tạm riêng:

```bash
bash scripts/test-cinema.sh
```

Bộ kiểm thử kiểm tra CRUD, lịch trùng, ghế, quyền theo rạp, giá/ưu đãi/bắp nước, thanh toán, QR/check-in, đổi/hủy, điểm thưởng, CMS và báo cáo CSV. Script tạo DB ngẫu nhiên và container `app-test` không công bố cổng, rồi dọn chúng; không tạo giao dịch trong DB chính. Cần Docker và cấu hình quyền quản trị DB sẵn trong Compose.

Nếu chủ động muốn kiểm tra đăng nhập trên DB chính, chạy `python3 scripts/verify-auth.py`. Script dùng hai tài khoản demo và có thể tạo tối đa một vé A2 của lịch demo cũ khi khách chưa có vé; không dùng script này như lệnh khởi động hay seed cho DB mới.

## Hardening và giới hạn

App chạy bằng USER node (UID 1000), filesystem read-only với volume ảnh riêng, bỏ capabilities và bật no-new-privileges. DB nằm trong mạng backend internal, tài khoản ứng dụng chỉ có SELECT/INSERT/UPDATE. Nginx có security headers; web dùng cookie HttpOnly/SameSite, CSRF và kiểm tra vai trò/chủ vé ở server. Bí mật nằm ngoài Git.

Bản thực hành chỉ dùng localhost, chưa HTTPS, chưa đăng ký tự do, chưa tích hợp thanh toán/hoàn tiền thật và chưa kiểm thử tải. cAdvisor dùng privileged để thu metrics là ngoại lệ giám sát của cấu hình thực hành, không áp dụng như mẫu production.

## Các mốc commit theo đề bài

| Mốc | Commit |
|---|---|
| Nginx reverse proxy và security headers | 201ea21 |
| Prometheus, Grafana và exporter | ca5ed5a |
| Loki, Promtail và LogQL | 3d26c86 |
| Hardening và kiểm tra | 5cc6a49 |

Các thay đổi tiếp theo được commit/push riêng. Tài khoản GitHub hiện tại là `xuand5738-oss`; sinh viên chọn giữ nguyên và tự xác nhận yêu cầu đặt tên theo MSSV với giảng viên.

## Tài liệu và minh chứng

- [Tiêu chí và phạm vi nộp bài](docs/tieu-chi.md).
- [Chức năng quản trị và giới hạn giả lập](docs/admin-mo-rong.md).
- [Phân quyền](docs/phan-quyen.md), [giao diện](docs/giao-dien.md).
- [Truy vấn LogQL](docs/logql.md), [hướng dẫn demo và ảnh](docs/huong-dan-demo.md).
- [Bản thảo báo cáo](docs/bao-cao-thuc-hanh.md), chưa phải bản nộp hoàn chỉnh: cần bổ sung bìa, ảnh và cập nhật theo hệ thống hiện tại.

Sinh viên đã yêu cầu không tiếp tục phần báo cáo. Yêu cầu gốc về tối thiểu 10 trang, ảnh minh chứng và trình bày vẫn cần sinh viên hoàn tất hoặc xác nhận với giảng viên. Khi cần minh chứng, mở đúng màn hình để sinh viên tự chụp; không tự động chụp ảnh. Tệp tạm, trích xuất PDF, bản sao lưu và `.env` không thuộc mã nguồn nộp bài.
