-- Unknown metadata stays NULL; do not manufacture a duration or age rating.
ALTER TABLE movies MODIFY duration INT NULL DEFAULT NULL,
                   MODIFY age_rating VARCHAR(10) NULL DEFAULT NULL;
SET @ddl=IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='movies' AND column_name='legacy_showtime_id'),
 'SELECT 1','ALTER TABLE movies ADD COLUMN legacy_showtime_id INT UNSIGNED NULL UNIQUE');
PREPARE q FROM @ddl; EXECUTE q; DEALLOCATE PREPARE q;
START TRANSACTION;
INSERT INTO movies(title,status,duration,age_rating,legacy_showtime_id)
 SELECT s.title,'showing',NULL,NULL,s.id FROM showtimes s
 WHERE s.movie_id IS NULL AND s.deleted=0 AND s.cancelled=0
 ON DUPLICATE KEY UPDATE legacy_showtime_id=VALUES(legacy_showtime_id);
UPDATE showtimes s JOIN movies m ON m.legacy_showtime_id=s.id
 SET s.movie_id=m.id
 WHERE s.movie_id IS NULL AND s.deleted=0 AND s.cancelled=0;
COMMIT;
