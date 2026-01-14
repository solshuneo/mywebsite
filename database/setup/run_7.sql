-- ===================================================================
-- Script chèn 10,000 mã donate cho người dùng 'solshuneo@gmail.com'.
-- (Từ shuneo000000 đến shuneo009999)
-- Phiên bản này sử dụng một câu lệnh INSERT ... SELECT hiệu suất cao.
-- ===================================================================

-- 1. Tìm và lưu ID của người dùng vào một biến session.
SET @sender_id = (SELECT id FROM `user` WHERE `email` = 'solshuneo@gmail.com' LIMIT 1);

-- 2. Chèn 10,000 dòng vào bảng donation trong MỘT câu lệnh duy nhất.
--    Chỉ thực hiện nếu đã tìm thấy @sender_id.
INSERT INTO `donation` (`sender_id`, `code`, `amount`, `message`, `transfered`)
SELECT
    @sender_id, -- ID của người dùng đã tìm thấy
    -- Tạo code từ shuneo000000 đến shuneo009999
    CONCAT('shuneo', LPAD(
        (thousands.n * 1000 + hundreds.n * 100 + tens.n * 10 + units.n),
        6, '0'
    )),
    0,    -- amount
    '',   -- message
    0     -- transfered
FROM
    -- Thủ thuật tạo ra 10,000 con số (từ 0 đến 9999)
    -- bằng cách CROSS JOIN một bảng số ảo (0-9) với chính nó 4 lần.
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS units
    CROSS JOIN
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    CROSS JOIN
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS hundreds
    CROSS JOIN
    (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS thousands
WHERE
    @sender_id IS NOT NULL; -- Đảm bảo chỉ chạy nếu tìm thấy user
