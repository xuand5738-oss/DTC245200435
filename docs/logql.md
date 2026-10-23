# Ba truy vấn LogQL cho báo cáo

Trong Grafana → Explore → chọn Loki, đặt khoảng thời gian Last 15 minutes.

1. Xem log Nginx của đúng dự án:

```logql
{project="topic11", job="nginx"}
```

2. Xem các truy cập thành công:

```logql
{project="topic11", job="nginx", status="200"}
```

3. Lọc lỗi trang không tồn tại và đọc cấu trúc JSON:

```logql
{project="topic11", job="nginx"} | json | status = 404
```

Tạo log để minh chứng bằng cách truy cập website và đường dẫn `/trang-khong-ton-tai`. Yêu cầu này chỉ tạo log HTTP, không thêm dữ liệu đặt vé.

Chụp từng query và dòng log kết quả. Dữ liệu log lưu qua volume Loki; vị trí đọc file lưu qua volume Promtail để không mất tiến độ khi khởi động lại.
