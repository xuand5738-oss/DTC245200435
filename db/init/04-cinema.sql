CREATE TABLE IF NOT EXISTS movies (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL,
 director VARCHAR(200) NOT NULL DEFAULT '', actors TEXT, duration INT NOT NULL DEFAULT 90,
 language VARCHAR(100) NOT NULL DEFAULT '', genre VARCHAR(100) NOT NULL DEFAULT '', country VARCHAR(100) NOT NULL DEFAULT '',
 synopsis TEXT, trailer VARCHAR(500) NOT NULL DEFAULT '', poster VARCHAR(500) NOT NULL DEFAULT '', banner VARCHAR(500) NOT NULL DEFAULT '',
 age_rating VARCHAR(10) NOT NULL DEFAULT 'P', status VARCHAR(20) NOT NULL DEFAULT 'coming', hidden TINYINT NOT NULL DEFAULT 0, deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS cinemas (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(200) NOT NULL,address VARCHAR(500) NOT NULL DEFAULT '',hotline VARCHAR(30) NOT NULL DEFAULT '',image VARCHAR(500) NOT NULL DEFAULT '',deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS halls (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,cinema_id INT UNSIGNED NOT NULL,name VARCHAR(100) NOT NULL,row_count INT NOT NULL DEFAULT 4,col_count INT NOT NULL DEFAULT 8,cleanup_minutes INT NOT NULL DEFAULT 15,deleted TINYINT NOT NULL DEFAULT 0,
 FOREIGN KEY(cinema_id) REFERENCES cinemas(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS price_rules (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,format VARCHAR(10) NOT NULL DEFAULT 'any',day_type VARCHAR(20) NOT NULL DEFAULT 'any',holiday_date DATE NULL,start_hour INT NOT NULL DEFAULT 0,end_hour INT NOT NULL DEFAULT 24,audience VARCHAR(20) NOT NULL DEFAULT 'any',amount DECIMAL(12,0) NOT NULL,priority INT NOT NULL DEFAULT 0,active TINYINT NOT NULL DEFAULT 1,deleted TINYINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS vouchers (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,code VARCHAR(40) NOT NULL UNIQUE,kind VARCHAR(10) NOT NULL DEFAULT 'fixed',amount DECIMAL(12,0) NOT NULL,min_total DECIMAL(12,0) NOT NULL DEFAULT 0,quantity INT NOT NULL DEFAULT 1,used_count INT NOT NULL DEFAULT 0,starts_at DATETIME NOT NULL,ends_at DATETIME NOT NULL,active TINYINT NOT NULL DEFAULT 1,deleted TINYINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(200) NOT NULL,category VARCHAR(100) NOT NULL DEFAULT '',description TEXT,price DECIMAL(12,0) NOT NULL,image VARCHAR(500) NOT NULL DEFAULT '',active TINYINT NOT NULL DEFAULT 1,deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS membership_tiers (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100) NOT NULL,min_points INT NOT NULL DEFAULT 0,discount_percent INT NOT NULL DEFAULT 0,deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS rewards (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,name VARCHAR(200) NOT NULL,points_required INT NOT NULL,quantity INT NOT NULL DEFAULT 1,deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS redemptions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id INT UNSIGNED NOT NULL,reward_id INT UNSIGNED NOT NULL,points_spent INT NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS content_posts (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200) NOT NULL,kind VARCHAR(20) NOT NULL DEFAULT 'news',body TEXT,image VARCHAR(500) NOT NULL DEFAULT '',link VARCHAR(500) NOT NULL DEFAULT '',published TINYINT NOT NULL DEFAULT 0,sort_order INT NOT NULL DEFAULT 0,deleted TINYINT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS booking_requests (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,booking_id INT UNSIGNED NOT NULL,kind VARCHAR(20) NOT NULL,reason VARCHAR(1000) NOT NULL,target_showtime_id INT UNSIGNED NULL,target_seat_id INT UNSIGNED NULL,status VARCHAR(20) NOT NULL DEFAULT 'pending',handled_by INT UNSIGNED NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(booking_id) REFERENCES bookings(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS audit_events (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id INT UNSIGNED NULL,action VARCHAR(80) NOT NULL,entity_id INT UNSIGNED NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_settings (setting_key VARCHAR(100) PRIMARY KEY,setting_value TEXT);
DELIMITER //
DROP PROCEDURE IF EXISTS add_cinema_column//
CREATE PROCEDURE add_cinema_column(IN t VARCHAR(64),IN c VARCHAR(64),IN definition TEXT)
BEGIN
 IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=t AND column_name=c) THEN
  SET @ddl=CONCAT('ALTER TABLE `',t,'` ADD COLUMN `',c,'` ',definition); PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
 END IF;
END//
DELIMITER ;
CALL add_cinema_column('users','cinema_id','INT UNSIGNED NULL');
CALL add_cinema_column('users','is_locked','TINYINT NOT NULL DEFAULT 0');
CALL add_cinema_column('users','phone','VARCHAR(30) NOT NULL DEFAULT ""');
CALL add_cinema_column('users','email','VARCHAR(200) NOT NULL DEFAULT ""');
CALL add_cinema_column('users','points','INT NOT NULL DEFAULT 0');
CALL add_cinema_column('users','lifetime_points','INT NOT NULL DEFAULT 0');
ALTER TABLE users MODIFY role ENUM('admin','manager','staff','support','customer') NOT NULL DEFAULT 'customer';
CALL add_cinema_column('showtimes','movie_id','INT UNSIGNED NULL');
CALL add_cinema_column('showtimes','hall_id','INT UNSIGNED NULL');
CALL add_cinema_column('showtimes','format','VARCHAR(10) NOT NULL DEFAULT "2D"');
CALL add_cinema_column('showtimes','ends_at','DATETIME NULL');
CALL add_cinema_column('showtimes','cancelled','TINYINT NOT NULL DEFAULT 0');
CALL add_cinema_column('showtimes','deleted','TINYINT NOT NULL DEFAULT 0');
CALL add_cinema_column('seats','hall_id','INT UNSIGNED NULL');
CALL add_cinema_column('seats','row_no','INT NOT NULL DEFAULT 1');
CALL add_cinema_column('seats','col_no','INT NOT NULL DEFAULT 1');
CALL add_cinema_column('seats','seat_type','VARCHAR(20) NOT NULL DEFAULT "regular"');
CALL add_cinema_column('seats','surcharge','DECIMAL(12,0) NOT NULL DEFAULT 0');
CALL add_cinema_column('seats','active','TINYINT NOT NULL DEFAULT 1');
CALL add_cinema_column('bookings','booking_status','VARCHAR(20) NOT NULL DEFAULT "active"');
CALL add_cinema_column('bookings','ticket_price','DECIMAL(12,0) NULL');
CALL add_cinema_column('bookings','discount_amount','DECIMAL(12,0) NOT NULL DEFAULT 0');
CALL add_cinema_column('bookings','fnb_total','DECIMAL(12,0) NOT NULL DEFAULT 0');
CALL add_cinema_column('bookings','fnb_json','JSON NULL');
CALL add_cinema_column('bookings','voucher_id','INT UNSIGNED NULL');
CALL add_cinema_column('bookings','audience','VARCHAR(20) NOT NULL DEFAULT "adult"');
CALL add_cinema_column('bookings','phone','VARCHAR(30) NOT NULL DEFAULT ""');
CALL add_cinema_column('bookings','email','VARCHAR(200) NOT NULL DEFAULT ""');
CALL add_cinema_column('bookings','paid_at','DATETIME NULL');
CALL add_cinema_column('bookings','payment_method','VARCHAR(20) NOT NULL DEFAULT "manual"');
CALL add_cinema_column('bookings','refunded_at','DATETIME NULL');
CALL add_cinema_column('bookings','checkin_token','CHAR(48) NULL UNIQUE');
CALL add_cinema_column('bookings','checked_in_at','DATETIME NULL');
CALL add_cinema_column('bookings','points_awarded','INT NOT NULL DEFAULT 0');
CALL add_cinema_column('bookings','active_seat_key','INT UNSIGNED GENERATED ALWAYS AS (IF(booking_status="cancelled",NULL,seat_id)) STORED');
UPDATE bookings b JOIN showtimes s ON s.id=b.showtime_id SET b.ticket_price=s.price WHERE b.ticket_price IS NULL;
UPDATE bookings SET checkin_token=LOWER(HEX(RANDOM_BYTES(24))) WHERE checkin_token IS NULL;
SET @ddl=IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='bookings' AND index_name='active_booking_seat'),'SELECT 1','ALTER TABLE bookings ADD UNIQUE KEY active_booking_seat(showtime_id,active_seat_key)');
PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
SET @ddl=IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='bookings' AND index_name='one_booking_per_seat'),'ALTER TABLE bookings DROP INDEX one_booking_per_seat','SELECT 1');
PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
SET @ddl=IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='seats' AND index_name='hall_seat_label'),'SELECT 1','ALTER TABLE seats ADD UNIQUE KEY hall_seat_label(hall_id,label)');
PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
SET @ddl=IF(EXISTS(SELECT 1 FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='seats' AND index_name='label'),'ALTER TABLE seats DROP INDEX label','SELECT 1');
PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
DROP PROCEDURE add_cinema_column;
