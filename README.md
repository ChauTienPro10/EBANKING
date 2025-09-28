## ⚙️ Cài đặt môi trường (Windows)

### Yêu cầu:
- Đã cài sẵn [Docker Desktop](https://www.docker.com/products/docker-desktop) cho Windows.
- Đã bật **WSL2 Backend** trong Docker Desktop (nếu dùng Windows 10/11).
- Quyền `Administrator` để chạy script.

### Các bước cài đặt:

1. Mở **Command Prompt (CMD)** hoặc **PowerShell** với quyền Administrator.
2. Di chuyển đến thư mục gốc của dự án:
   ```bash
   cd path\to\project
3. Chạy lệnh (window cmd)
.\install-env.cmd

### Môi trương phát triển khuyến khích 
1. BE: IntelliJ : https://www.jetbrains.com/idea/download/other.html 
Sử dụng bản community

2. Docker desktop:
- cai wsl : wsl --install (Chạy trong power shell)
- Cài docker desktop như bình thường


3. Quy trinh xu ly anh
3.1. Đọc ảnh bằng OpenCV
3.2. Chuyển ảnh sang grayscale
3.3. Làm nét hoặc threshold để tăng độ tương phản
3.4. Lưu ảnh tạm ra đĩa (Tess4J cần ảnh file)
3.5. Dùng Tesseract OCR để trích text
3.6. Dùng regex hoặc tìm dòng để tách: Họ tên, CCCD, Ngày sinh, Giới tính, Địa chỉ