CREATE TABLE showtimes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(200) NOT NULL,
 starts_at DATETIME NOT NULL,
 price DECIMAL(12,0) NOT NULL CHECK (price >= 0)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE seats (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 label VARCHAR(20) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE bookings (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 showtime_id INT UNSIGNED NOT NULL,
 seat_id INT UNSIGNED NOT NULL,
 customer_name VARCHAR(100) NOT NULL,
 payment_status ENUM('pending','simulated_paid') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY one_booking_per_seat (showtime_id, seat_id),
 FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
 FOREIGN KEY (seat_id) REFERENCES seats(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
