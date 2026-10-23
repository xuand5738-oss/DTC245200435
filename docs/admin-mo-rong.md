# Quản trị rạp chiếu mở rộng

Mở http://localhost:8280/admin bằng tài khoản website admin hiện có. Phông chữ, màu sắc, tiền VND và ngày giờ Việt Nam dùng chung với giao diện khách hàng. Không đổi mật khẩu hoặc tạo thêm dữ liệu phim/rạp trên website chính trong quá trình mở rộng. Các bộ kiểm thử dùng database tạm và được dọn sau khi chạy.

## Các module đã triển khai

| Nhóm | Chức năng thực tế | Đồng bộ và điều kiện |
|---|---|---|
| Phim | Thêm, sửa, xóa mềm, ẩn/hiện; đạo diễn, diễn viên, thời lượng, ngôn ngữ, thể loại, quốc gia, tóm tắt, trailer YouTube, poster/banner; nhãn P/T13/T16/T18/C; sắp/đang/ngừng chiếu | Trang Phim và trang chi tiết đọc cùng bảng movies. Phim ẩn/ngừng/C không mở bán mới. Nhãn là metadata quản trị, chưa xác minh tuổi hoặc giấy tờ người xem; không thay thế việc kiểm duyệt thực tế. Phim có lịch còn hiệu lực không đổi thời lượng để tránh sai lịch. |
| Rạp và phòng | CRUD cụm rạp/địa chỉ/hotline/ảnh; phòng, số hàng/cột, phút dọn phòng; ma trận từng ô thường/VIP/Sweetbox/lối đi | Sơ đồ khách hàng lấy đúng ghế thuộc phòng; không thể đặt ghế rạp khác hoặc lối đi. Phòng đã có lịch khóa chỉnh cấu trúc. Sweetbox là một đơn vị ghế đôi với phụ thu riêng, một booking; báo cáo lấp đầy tính đơn vị ghế bán. |
| Suất chiếu và giá | Lịch theo phim/phòng, thời lượng và thời gian dọn; sửa lịch có kiểm tra; hủy suất và hoàn giả lập; giá 2D/3D/IMAX, ngày thường/cuối tuần/ngày lễ cấu hình, khung giờ, đối tượng | Chặn giao lịch kể cả thời gian dọn. Lịch đã có vé không đổi phim/phòng/giờ; thay giá chỉ áp dụng vé đặt mới. Quy tắc giá ưu tiên số lớn trước, hòa thì bản mới trước; dùng giá gốc nếu không có quy tắc khớp. Đối tượng do người đặt chọn, chưa xác minh giấy tờ ưu đãi. |
| Giao dịch và soát vé | Tìm chính xác ID/phone/email; tạo và duyệt/từ chối đổi/hủy; hoàn giả lập; QR trên vé đã thanh toán; giao diện riêng cho staff, hỗ trợ camera hoặc máy quét/nhập mã | QR dùng token ngẫu nhiên; kiểm tra rạp, vé đang hiệu lực, đã thanh toán và chưa dùng, khóa transaction để một lượt check-in thành công. Chưa áp dụng cửa sổ thời gian check-in theo giờ chiếu. Camera cần trình duyệt hỗ trợ BarcodeDetector và người dùng chủ động cấp quyền; nhập mã luôn có sẵn. |
| Khuyến mãi và thành viên | Mã %/VND, thời hạn, hóa đơn tối thiểu, giới hạn lượt; hạng/ưu đãi; điểm, quà và đổi quà; combo bắp nước | Voucher được giữ lượt khi tạo vé, trả lại khi hủy; không tự hết hạn vé giữ chỗ. 1 điểm mỗi 10.000 VND thanh toán giả lập; thanh toán lại không cộng hai lần. Hủy vé thu hồi điểm; nếu điểm đã đổi quà, số dư có thể âm và không đổi tiếp khi thiếu điểm. Giá/tên combo lưu snapshot trong vé. |
| Thống kê | Theo ngày/tuần/tháng/năm, phim, rạp, giờ; doanh thu vé, F&B, tổng vé, lấp đầy; CSV UTF-8 có BOM mở bằng Excel | Thời gian lọc/nhóm là thời điểm suất chiếu, đã ghi rõ trên UI; không phải ngày nhận tiền. Chỉ cộng vé hiệu lực đã thanh toán giả lập, loại vé hoàn. Không có giao dịch tiền thật. CSV có bảo vệ công thức từ dữ liệu tên nhập vào. |
| Người dùng và RBAC | Tạo/sửa tài khoản, mật khẩu băm scrypt, khóa/mở khóa, lịch sử vé; admin/manager/staff/support/customer | Manager chỉ xem lịch/doanh thu/nhân viên staff hoặc CSKH thuộc rạp được phân công, không tạo admin/manager. Staff chỉ soát vé rạp được phân công. CSKH xem và xử lý giao dịch theo vai trò hỗ trợ toàn hệ thống. Vai trò/khóa đọc lại mỗi request và cập nhật user vô hiệu hóa phiên. |
| CMS và cấu hình | Banner/slider ngang, bài tin/review/sự kiện, trạng thái bản nháp/xuất bản; cấu hình lựa chọn VNPay/MoMo/ZaloPay/thẻ ở chế độ giả lập | Ảnh do admin tải PNG/JPEG/WebP, tối đa 5 MB, nằm trong volume uploads; không tải ảnh/font ngoài. Trailer chỉ mở liên kết YouTube do admin nhập, không tự nhúng/tải. Nội dung công khai dùng văn bản escape HTML. Kiểm tra cổng chỉ là kiểm tra cấu hình giả lập nội bộ; chưa kết nối merchant/cổng thật. |

## Trình tự nhập dữ liệu mới

1. Tạo cụm rạp.
2. Tạo phòng thuộc rạp, khai báo hàng/cột và thời gian dọn.
3. Mở Sơ đồ ghế, chọn loại cho từng ô rồi lưu. Lối đi không bán, phụ thu VIP/Sweetbox do bạn nhập.
4. Tạo phim, điền metadata và tải ảnh của bạn; đặt trạng thái đang chiếu để mở bán.
5. Vào Suất chiếu, chọn phim/phòng/ngày giờ/giá/định dạng. Hệ thống từ chối lịch trùng.
6. Tùy nhu cầu thêm quy tắc giá, mã giảm giá, hạng thành viên, quà, sản phẩm bắp nước và bài viết/banner. Không bắt buộc tạo dữ liệu giả để làm đầy menu.
7. Tạo nhân viên và phân công rạp. Không chia sẻ mật khẩu admin cho staff.
8. Khách chọn suất/ghế/đối tượng, combo và mã; giá cuối được tính và lưu khi tạo vé, hiển thị trước khi xác nhận thanh toán giả lập.

## Đổi hủy và hoàn giả lập

Khách gửi yêu cầu từ chi tiết vé hoặc CSKH tạo yêu cầu trong Giao dịch. Yêu cầu chờ duyệt không đổi trạng thái vé. Khi duyệt hủy, vé ngừng hiệu lực, ghế được giải phóng, trả lượt voucher và thu hồi điểm; nếu đã thanh toán thì ghi thời điểm hoàn giả lập. Vé đã check-in không hủy/đổi. Đổi suất chỉ được tới ghế còn trống cùng giá vé trước giảm; chênh lệch cần hủy/hoàn rồi đặt lại, không tự xử lý tiền thật. Hủy suất hàng loạt bị từ chối nếu đã có vé check-in.

Xóa dữ liệu quản trị là xóa mềm để giữ lịch sử. Ẩn hoặc xóa phim ngừng mở bán mới nhưng không tự giả định phải hủy các vé đã bán; quản trị viên dùng thao tác hủy suất nếu thực sự cần hủy/hoàn.

Trong Suất chiếu có nút **Xóa khỏi danh sách**, dùng được cả cho dữ liệu demo cũ chưa gắn phim/phòng và suất đã hủy. Nếu còn vé hiệu lực, hệ thống từ chối xóa và yêu cầu hủy/hoàn trước. Quản lý rạp không xóa được suất thuộc rạp khác. Xóa khỏi danh sách cập nhật cờ deleted, không xóa lịch sử vật lý.

## Nâng cấp môi trường cũ

Trong WSL, tại /mnt/d/DTC245200435:

```bash
bash scripts/apply-cinema.sh
```

Script lưu bản sao DB đầu tiên ở tmp/before-cinema-extension.sql, áp dụng migration idempotent 04-cinema.sql, build app, kiểm tra Nginx và reload. Không chạy down -v. Database mới được MySQL chạy 01–04 theo thứ tự; tạo tài khoản web bằng apply-auth.sh như hướng dẫn trước. Volume uploads là vùng ghi ảnh riêng, root filesystem app vẫn chỉ đọc, app vẫn USER node.

Bổ sung migration 05-link-legacy-movies.sql: liên kết các suất chiếu cũ đang hiệu lực với bản ghi phim có cùng tên nguồn. Giờ, giá, ghế và vé giữ nguyên; thời lượng và nhãn độ tuổi chưa có để NULL, không tự đặt 90 phút/P. Suất đã xóa/hủy không được tạo lại thành phim. Chạy lại không sinh phim trùng. Trang chi tiết phim dùng LEFT JOIN để lịch cũ chưa gắn phòng vẫn hiện; cần điền metadata thật và tạo phòng trước khi lên lịch mới. apply-cinema.sh chạy cả 04 và 05; database mới chạy 01–05.

## Kiểm thử đã thực hiện

```bash
bash scripts/test-cinema.sh
```

Script tạo database topic11_test_<chuỗi ngẫu nhiên> và app-test không công bố cổng, tạo fixtures tách biệt để kiểm tra CRUD, lịch/cleanup, các loại ghế, phân quyền rạp, quy tắc giá, voucher hết lượt, combo snapshot, thanh toán idempotent, check-in đồng thời/replay, đổi/hủy, điểm/quà, CMS, tải ảnh và khóa user. Sau đó xóa đúng database/container kiểm thử. Không chạy fixtures vào website chính.

Các kiểm tra cũ verify-auth.py, verify-stack.py, verify-ui.py và verify-hardening.js vẫn được giữ. Không có thao tác tự chụp ảnh; sinh viên chủ động mở các màn hình quản trị để xem/chụp. Phần báo cáo môn học tiếp tục nằm ngoài phạm vi làm tiếp theo lựa chọn trước của sinh viên.
