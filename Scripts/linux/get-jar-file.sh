#!/bin/bash

# Thư mục đích
OUTPUT_DIR="../docker-build-services"

# Tạo thư mục đích nếu chưa tồn tại
if [ ! -d "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
fi

# Xóa các file .jar cũ
echo "Cleaning up $OUTPUT_DIR..."
rm -f "$OUTPUT_DIR"/*.jar

# Hàm copy file
copy_jar() {
    local jar_name=$1
    echo "Copying $jar_name.jar..."
    docker cp jenkins:/var/jenkins_home/workspace/EBANKING/output_jar_file/$jar_name.jar "$OUTPUT_DIR/$jar_name.jar"
}

# Copy từng file jar
copy_jar "authService"
copy_jar "userService"
copy_jar "emailService"
copy_jar "transactionService"
copy_jar "firebaseService"
# copy_jar "AIService"  # Nếu cần, mở comment dòng này

# Kiểm tra kết quả
if [ $? -ne 0 ]; then
    echo "Failed to copy one or more files from Docker container."
    exit 1
else
    echo "All files copied successfully."
fi
