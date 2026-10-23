# Giao diện và đồng bộ dữ liệu

Giao diện sử dụng cùng layout, điều hướng theo vai trò, màu tím trên nền sáng, form, bảng, thẻ vé và thông báo trên các trang. Không tải ảnh, font, CSS hoặc script từ dịch vụ bên ngoài. Họ chữ thống nhất `Segoe UI, Arial, sans-serif`, hỗ trợ tiếng Việt; trình duyệt dùng font sẵn có trên máy. Font và kích thước cơ sở khai báo một lần trong app/public/styles.css.

## Các màn hình

- Khám phá: thẻ suất chiếu, giờ, giá và số ghế còn trống; thẻ trang trí dùng chính dữ liệu suất chiếu đầu tiên.
- Chọn ghế: sơ đồ lấy từ bảng seats, ghế đã có booking bị khóa; tóm tắt tên, giờ, giá và ghế đang chọn. Script nhỏ chỉ cập nhật nhãn ghế đang chọn, không quyết định quyền hay ghi dữ liệu.
- Vé: mã vé, suất chiếu, người đặt, ghế, giá và trạng thái thanh toán từ query JOIN MySQL.
- Vé của tôi: chỉ query theo user_id của phiên đăng nhập, thống kê tính từ danh sách được phép xem.
- Quản trị: toàn bộ vé và lịch chiếu, thống kê từ cùng dữ liệu; form thêm suất chiếu vẫn kiểm tra vai trò/CSRF ở server.
- Đăng nhập và thông báo: dùng cùng phông chữ, điều hướng và bố cục; tài khoản đang đăng nhập được chuyển tới trang đúng vai trò.

## Nguồn dữ liệu thống nhất

app/ui.js định dạng giá bằng Intl.NumberFormat vi-VN, VND; ngày giờ bằng Intl.DateTimeFormat vi-VN, Asia/Ho_Chi_Minh. MySQL DATETIME được hiểu theo UTC+7 đúng quy ước của dự án. Trang chủ, trang chọn ghế, vé, danh sách và quản trị cùng dùng các helper này. Không ghi cứng thời gian hay giá demo vào template.

Ghế trống = số ghế của DB trừ booking trong từng suất chiếu. Các thống kê không dùng số trang trí. Mỗi lần tải trang đọc lại MySQL và nội dung ứng dụng đặt Cache-Control no-store. Nếu nhiều người cùng chọn một ghế, ràng buộc UNIQUE vẫn chặn đặt trùng; trang chọn ghế không thay thế kiểm tra server. Dữ liệu hiện có (một suất chiếu, hai vé demo) được giữ nguyên.

## Kiểm tra không chụp ảnh

Trong WSL tại thư mục dự án, tạo baseline chỉ đọc:

```bash
docker compose exec -T app node < scripts/ui-data.js > tmp/ui-data.json
```

Trên Windows chạy `python scripts/verify-ui.py`. Script đối chiếu tên, thời gian, giá, ghế trống giữa DB và HTML; kiểm tra các trang khách/quản trị, CSS/font stack và tài nguyên nội bộ. Không sửa dữ liệu nghiệp vụ, không tạo ảnh. Kiểm tra phân quyền tiếp tục dùng verify-auth.py; metrics/dashboard/LogQL dùng verify-stack.py.

Đã xác nhận dữ liệu của một suất chiếu và hai vé đồng nhất trên các màn hình được phép truy cập. Đã thêm CSS responsive cho điện thoại và bảng cuộn ngang; chưa thực hiện đánh giá bằng ảnh chụp màn hình theo yêu cầu không tự chụp ảnh của sinh viên. Sinh viên có thể tự mở trang chủ, đăng nhập và các trang chức năng để xem và chụp.
