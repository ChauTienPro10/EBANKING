# MULTIPART FILE API TESTING GUIDE

## Overview
Backend đã được cập nhật để nhận file trực tiếp (MultipartFile) thay vì base64 string.  
Điều này giúp:
- ✅ Giảm kích thước payload khi gửi từ FE
- ✅ Server đảm nhiệm việc convert sang base64 trước khi gọi FPT AI API
- ✅ Tối ưu băng thông và hiệu suất

## API Changes

### 1. OCR Endpoint
**Old Format (Base64):**
```json
POST /api/ekyc/ocr
Content-Type: application/json
{
  "sessionId": "uuid",
  "frontImageBase64": "iVBORw0KGgo...",
  "backImageBase64": "iVBORw0KGgo..."
}
```

**New Format (MultipartFile):**
```
POST /api/ekyc/ocr
Content-Type: multipart/form-data

Form Data:
- sessionId: uuid (text)
- frontImage: file (image/jpeg, image/jpg, image/png)
- backImage: file (image/jpeg, image/jpg, image/png)
```

### 2. Liveness Endpoint
**Old Format (Base64):**
```json
POST /api/ekyc/liveness
Content-Type: application/json
{
  "sessionId": "uuid",
  "videoBase64": "AAAAHGZ0eXBpc29..."
}
```

**New Format (MultipartFile):**
```
POST /api/ekyc/liveness
Content-Type: multipart/form-data

Form Data:
- sessionId: uuid (text)
- video: file (video/mp4, video/mpeg, video/webm)
```

## File Validation

### Image Files
- **Max Size:** 10MB
- **Allowed Formats:** JPEG, JPG, PNG
- **Content-Type:** image/jpeg, image/jpg, image/png

### Video Files
- **Max Size:** 50MB
- **Allowed Formats:** MP4, MPEG, WEBM
- **Content-Type:** video/mp4, video/mpeg, video/webm

## Testing with Python

### Test OCR with Images
```python
import requests

# Create session
response = requests.post('http://localhost:8080/api/ekyc/sessions?userId=1')
session_id = response.json()['data']['sessionId']
print(f"Session ID: {session_id}")

# Upload images for OCR
files = {
    'frontImage': open('cccd_mat_truoc.jpg', 'rb'),
    'backImage': open('cccd_mat_sau.jpg', 'rb')
}
data = {
    'sessionId': session_id
}

response = requests.post(
    'http://localhost:8080/api/ekyc/ocr',
    files=files,
    data=data
)

print("OCR Result:")
print(response.json())
```

### Test Liveness with Video
```python
import requests

# Assuming you have a session from OCR step
session_id = "your-session-id-here"

# Upload video for liveness
files = {
    'video': open('liveness_video.mp4', 'rb')
}
data = {
    'sessionId': session_id
}

response = requests.post(
    'http://localhost:8080/api/ekyc/liveness',
    files=files,
    data=data
)

print("Liveness Result:")
print(response.json())
```

## Testing with Postman

### 1. Create Session
```
POST http://localhost:8080/api/ekyc/sessions?userId=1
```

### 2. Test OCR
```
POST http://localhost:8080/api/ekyc/ocr
```
**Body:** 
- Select: form-data
- Add fields:
  - `sessionId` (text): paste your session ID
  - `frontImage` (file): choose cccd_mat_truoc.jpg
  - `backImage` (file): choose cccd_mat_sau.jpg

### 3. Test Liveness
```
POST http://localhost:8080/api/ekyc/liveness
```
**Body:**
- Select: form-data
- Add fields:
  - `sessionId` (text): paste your session ID
  - `video` (file): choose liveness_video.mp4

### 4. Test Face Match
```
POST http://localhost:8080/api/ekyc/face-match?sessionId=your-session-id
```

## Testing with cURL

### OCR Test
```bash
SESSION_ID=$(curl -s -X POST "http://localhost:8080/api/ekyc/sessions?userId=1" | jq -r '.data.sessionId')

curl -X POST "http://localhost:8080/api/ekyc/ocr" \
  -F "sessionId=$SESSION_ID" \
  -F "frontImage=@cccd_mat_truoc.jpg" \
  -F "backImage=@cccd_mat_sau.jpg"
```

### Liveness Test
```bash
curl -X POST "http://localhost:8080/api/ekyc/liveness" \
  -F "sessionId=$SESSION_ID" \
  -F "video=@liveness_video.mp4"
```

## Benefits for Frontend Integration

### Before (Base64 approach)
```javascript
// FE phải convert file sang base64
const reader = new FileReader();
reader.readAsDataURL(file);
reader.onload = () => {
  const base64 = reader.result.split(',')[1];
  // Payload rất lớn vì base64 tăng kích thước ~33%
  fetch('/api/ekyc/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      frontImageBase64: base64Front,  // Very large!
      backImageBase64: base64Back     // Very large!
    })
  });
};
```

### After (MultipartFile approach)
```javascript
// FE chỉ cần gửi file trực tiếp
const formData = new FormData();
formData.append('sessionId', sessionId);
formData.append('frontImage', frontImageFile);  // Original file size
formData.append('backImage', backImageFile);    // Original file size

fetch('/api/ekyc/ocr', {
  method: 'POST',
  body: formData  // No need to set Content-Type, browser handles it
});
```

**Size Comparison:**
- 1MB image → 1MB multipart (100%)
- 1MB image → 1.33MB base64 (133%)

**Benefits:**
✅ 33% smaller payload  
✅ Faster upload  
✅ Less memory usage on client  
✅ Simpler code  

## Error Handling

### File Too Large
```json
{
  "success": false,
  "message": "Image file size exceeds maximum allowed size (10MB)",
  "errorCode": null,
  "data": null
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "Invalid image format. Only JPEG, JPG, and PNG are supported",
  "errorCode": null,
  "data": null
}
```

### Missing File
```json
{
  "success": false,
  "message": "Image file is required",
  "errorCode": null,
  "data": null
}
```

## Notes

1. **Không cần Python converter nữa:** Các file `convert_image_to_base64.py` và `convert_video_to_base64.py` chỉ còn để tham khảo
2. **Server xử lý conversion:** Backend tự động convert file sang base64 trước khi gọi FPT AI
3. **Frontend Integration:** FE chỉ cần dùng FormData và gửi file trực tiếp
4. **Backward Compatible:** Nếu cần, có thể giữ cả 2 endpoints (base64 và multipart)

