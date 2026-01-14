#!/bin/bash

# Lấy đường dẫn tuyệt đối của thư mục chứa script
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
EXECUTE_DIR="$BASE_DIR/execute"
SAVE_DIR="$BASE_DIR/setup"

# Thông tin kết nối MySQL
DB_USER="shuneo"
DB_PASS="password"
DB_NAME="chatbox"

# Tạo thư mục nếu chưa có
mkdir -p "$SAVE_DIR"
mkdir -p "$EXECUTE_DIR"


# Xác định STT tiếp theo dựa trên các file đã có trong thư mục setup
# Tìm số lớn nhất từ các file run_X.ext
last_stt=$(ls "$SAVE_DIR" 2>/dev/null | grep -oP '^run_\K\d+' | sort -rn | head -n 1)
if [ -z "$last_stt" ]; then
    stt=0
else
    stt=$last_stt
fi

# Lấy danh sách file .sh và .sql trong thư mục execute, sắp xếp theo tên
# Sử dụng find và sort để đảm bảo thứ tự
files=$(find "$EXECUTE_DIR" -maxdepth 1 -type f \( -name "*.sh" -o -name "*.sql" \) | sort)

for file_path in $files; do
    filename=$(basename "$file_path")
    extension="${filename##*.}"

    success=false

    if [[ "$extension" == "sh" ]]; then
        # Cấp quyền thực thi và chạy shell script
        chmod +x "$file_path"
        if sudo bash "$file_path" > /dev/null 2>&1; then
            success=true
        else
            echo "Lỗi khi thực thi $filename"
        fi
    elif [[ "$extension" == "sql" ]]; then
        # Chạy file SQL vào database đã định nghĩa
        if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$file_path" ; then
            success=true
        else
            echo "Lỗi khi thực thi $filename"
        fi
    fi

    # Nếu thực thi thành công thì tăng STT và di chuyển file
    if [ "$success" = true ]; then
        stt=$((stt + 1))
        new_filename="run_$stt.$extension"
        cp "$file_path" "$SAVE_DIR/$new_filename"
        rm "$file_path"
    fi
done

# Chỉ in thành công ở cuối cùng
echo "thành công"
