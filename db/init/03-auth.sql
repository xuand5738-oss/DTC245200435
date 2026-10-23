CREATE TABLE IF NOT EXISTS users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 username VARCHAR(50) NOT NULL UNIQUE,
 display_name VARCHAR(100) NOT NULL,
 password_hash VARCHAR(200) NOT NULL,
 role ENUM('admin','customer') NOT NULL DEFAULT 'customer'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY,
 user_id INT UNSIGNED NOT NULL,
 expires_at DATETIME NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET @has_column=(SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='bookings' AND column_name='user_id');
SET @sql=IF(@has_column=0,'ALTER TABLE bookings ADD COLUMN user_id INT UNSIGNED NULL, ADD CONSTRAINT bookings_user_fk FOREIGN KEY (user_id) REFERENCES users(id)','SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
