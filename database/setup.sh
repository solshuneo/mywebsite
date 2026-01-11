#!/bin/bash

# Lấy đường dẫn tuyệt đối của thư mục chứa script
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SETUP_DIR="$BASE_DIR/setup"

# Thông tin kết nối MySQL
DB_USER="shuneo"
DB_PASS="password"
DB_NAME="mywebsite_db"

# Kiểm tra nếu thư mục setup không tồn tại
if [ ! -d "$SETUP_DIR" ]; then
    echo "Thư mục setup không tồn tại."
    exit 1
fi

# Đảm bảo database tồn tại
mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null

# Lấy danh sách file trong setup, sắp xếp theo thứ tự số (run_1, run_2...)
# Dùng -v để sort theo phiên bản/số tự nhiên
files=$(ls "$SETUP_DIR" 2>/dev/null | grep -E '^run_[0-9]+\.(sh|sql)$' | sort -V)

if [ -z "$files" ]; then
    echo "Không có file nào để chạy trong thư mục setup."
    exit 0
fi

for filename in $files; do
    file_path="$SETUP_DIR/$filename"
    extension="${filename##*.}"

    echo "--- Đang chạy lại: $filename ---"

    if [[ "$extension" == "sh" ]]; then
        # Cấp quyền thực thi và chạy shell script
        chmod +x "$file_path"
        if ! sudo bash "$file_path" > /dev/null 2>&1; then
            echo "Lỗi khi thực thi $filename"
            exit 1
        fi
    elif [[ "$extension" == "sql" ]]; then
        # Chạy file SQL vào database
        if ! mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$file_path" > /dev/null 2>&1; then
            echo "Lỗi khi thực thi $filename"
            exit 1
        fi
    fi
done

# Chỉ in thành công ở cuối cùng
echo "thành công"
