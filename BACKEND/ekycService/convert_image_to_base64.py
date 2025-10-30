"""
Script chuyển đổi ảnh CCCD sang Base64 để test API OCR
Sử dụng: python convert_image_to_base64.py <đường_dẫn_ảnh>
"""

import base64
import sys
import os
from pathlib import Path


def image_to_base64(image_path):
    """Chuyển đổi ảnh sang base64"""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return encoded_string
    except FileNotFoundError:
        print(f"❌ Lỗi: Không tìm thấy file '{image_path}'")
        return None
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return None


def get_file_size(base64_string):
    """Tính kích thước file base64 (MB)"""
    size_bytes = len(base64_string.encode('utf-8'))
    size_mb = size_bytes / (1024 * 1024)
    return size_mb


def main():
    print("=" * 60)
    print("🔄 CHUYỂN ĐỔI ẢNH CCCD SANG BASE64")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\n❌ Thiếu tham số!")
        print("📖 Sử dụng: python convert_image_to_base64.py <đường_dẫn_ảnh>")
        print("\n📝 Ví dụ:")
        print("   python convert_image_to_base64.py cccd_mat_truoc.jpg")
        print("   python convert_image_to_base64.py D:\\Images\\cccd_mat_sau.jpg")
        sys.exit(1)

    image_path = sys.argv[1]

    # Kiểm tra file tồn tại
    if not os.path.exists(image_path):
        print(f"\n❌ File không tồn tại: {image_path}")
        sys.exit(1)

    # Kiểm tra định dạng file
    file_ext = Path(image_path).suffix.lower()
    if file_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp']:
        print(f"\n⚠️  Cảnh báo: File extension '{file_ext}' có thể không được hỗ trợ")
        print("✅ Định dạng khuyến nghị: .jpg, .jpeg, .png")

    print(f"\n📂 File input: {image_path}")

    # Chuyển đổi
    print("🔄 Đang chuyển đổi...")
    base64_string = image_to_base64(image_path)

    if base64_string is None:
        sys.exit(1)

    # Thống kê
    file_size = get_file_size(base64_string)

    # Lưu vào file
    output_file = image_path + ".base64.txt"
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(base64_string)

        print("\n" + "=" * 60)
        print("✅ CHUYỂN ĐỔI THÀNH CÔNG!")
        print("=" * 60)
        print(f"📁 File base64: {output_file}")
        print(f"📏 Độ dài: {len(base64_string):,} ký tự")
        print(f"💾 Kích thước: {file_size:.2f} MB")

        if file_size > 5:
            print("\n⚠️  CẢNH BÁO: File quá lớn (> 5MB)")
            print("   Khuyến nghị: Nén/resize ảnh trước khi gửi API")

        print("\n📋 HƯỚNG DẪN SỬ DỤNG:")
        print("1. Mở file:", output_file)
        print("2. Copy toàn bộ nội dung")
        print("3. Paste vào Postman tại field 'frontImageBase64' hoặc 'backImageBase64'")
        print("\n💡 Hoặc đọc trực tiếp bằng Python:")
        print(f"   with open('{output_file}', 'r') as f:")
        print(f"       base64_string = f.read()")

    except Exception as e:
        print(f"\n❌ Lỗi khi lưu file: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()

