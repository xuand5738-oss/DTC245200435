# Kết quả kiểm tra các tiêu chí kỹ thuật

Ngày kiểm tra: 24/10/2026. Hệ thống chạy trong Ubuntu WSL 2, Compose project topic11.

| Tiêu chí | Bằng chứng đã kiểm tra |
|---|---|
| GitHub | Source, Compose, Nginx, monitoring, logging, README và các mốc commit đã push |
| Ứng dụng và DB | Vé demo A1 đã thanh toán giả lập, chống đặt trùng trả 409; kết nối MySQL và đăng nhập phpMyAdmin đã kiểm chứng |
| Nginx | nginx -t thành công, website/health qua proxy, bốn security headers |
| Giám sát | 4 targets UP; nginx_up=1; mysql_up=1; metrics container; Grafana 8 panel |
| Log | 3 LogQL có kết quả: log tổng, HTTP 200, HTTP 404 |
| Hardening | App UID 1000; read-only, bỏ capabilities/no-new-privileges; DB chỉ SELECT/INSERT/UPDATE, CREATE bị từ chối; mạng backend internal; không công bố app/DB; bí mật ngoài Git |

Lệnh xác minh: scripts/verify-stack.py, scripts/verify-hardening.js, docker compose exec nginx nginx -t và docker compose ps. Lần rà soát cuối không thêm dữ liệu nghiệp vụ.

Sinh viên đã loại phần hoàn thiện báo cáo khỏi phạm vi và chọn giữ tài khoản xuand5738-oss, tự xác nhận với giảng viên. Chưa có xác nhận miễn các yêu cầu đó từ giảng viên. Không tự chụp ảnh. Kết quả này không thay thế ảnh sinh viên, demo/vấn đáp hoặc điểm do giảng viên quyết định.
