-- Xóa các procedure cũ nếu tồn tại
DROP PROCEDURE IF EXISTS CreateUser;
DROP PROCEDURE IF EXISTS ReadUser;
DROP PROCEDURE IF EXISTS UpdateUser;
DROP PROCEDURE IF EXISTS DeleteUser;
DROP PROCEDURE IF EXISTS ReadAllUsers;

DELIMITER //

-- 1. CREATE: Tạo user mới
CREATE PROCEDURE CreateUser(
    IN p_name VARCHAR(255),
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_role ENUM('user', 'admin', 'staff', 'super staff')
)
BEGIN
    INSERT INTO users (name, username, password, email, phone, role)
    VALUES (p_name, p_username, p_password, p_email, p_phone, p_role);

    -- Trả về ID vừa tạo
    SELECT LAST_INSERT_ID() AS new_user_id;
END //

-- 2. READ: Lấy thông tin chi tiết 1 user theo ID
CREATE PROCEDURE ReadUser(IN p_id INT)
BEGIN
    SELECT id, name, username, email, phone, role, created_at
    FROM users
    WHERE id = p_id;
END //

-- 3. UPDATE: Cập nhật thông tin user theo ID
CREATE PROCEDURE UpdateUser(
    IN p_id INT,
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_role ENUM('user', 'admin', 'staff', 'super staff')
)
BEGIN
    UPDATE users
    SET name = p_name,
        email = p_email,
        phone = p_phone,
        role = p_role
    WHERE id = p_id;

    -- Trả về số dòng bị ảnh hưởng
    SELECT ROW_COUNT() AS updated_rows;
END //

-- 4. DELETE: Xóa user theo ID
CREATE PROCEDURE DeleteUser(IN p_id INT)
BEGIN
    DELETE FROM users WHERE id = p_id;

    -- Trả về số dòng bị ảnh hưởng
    SELECT ROW_COUNT() AS deleted_rows;
END //

-- 5. READ ALL: Lấy toàn bộ danh sách
CREATE PROCEDURE ReadAllUsers()
BEGIN
    SELECT id, name, username, email, phone, role, created_at
    FROM users
    ORDER BY id DESC;
END //

DELIMITER ;
