-- ===================================================================
-- Script chèn 100 mã donate cho người dùng 'solshuneo@gmail.com'.
-- (Từ shuneo000000 đến shuneo000099)
-- Phiên bản này sử dụng một câu lệnh INSERT ... SELECT hiệu suất cao.
-- ===================================================================

-- 1. Tìm và lưu ID của người dùng vào một biến session.
SET @sender_id = (SELECT id FROM `user` WHERE `email` = 'solshuneo@gmail.com' LIMIT 1);

-- 2. Chèn 100 dòng vào bảng donation trong MỘT câu lệnh duy nhất.
--    Chỉ thực hiện nếu đã tìm thấy @sender_id.
INSERT INTO `donation` (`sender_id`, `code`, `amount`, `message`, `transfered`)
SELECT
    @sender_id, -- ID của người dùng đã tìm thấy
    -- Tạo code từ shuneo000000 đến shuneo000099
    CONCAT('shuneo', LPAD( (tens.n * 10 + units.n), 6, '0')),
    0,    -- amount
    '',   -- message
    0     -- transfered
FROM
    -- Thủ thuật tạo ra 100 con số (từ 0 đến 99)
    -- bằng cách CROSS JOIN một bảng số ảo (0-9) với chính nó.
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS units
    CROSS JOIN
    (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
WHERE
    @sender_id IS NOT NULL; -- Đảm bảo chỉ chạy nếu tìm thấy user
