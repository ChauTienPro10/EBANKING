# 🎥 PHÂN TÍCH LIVENESS VIDEO - TỐI ỨU CHO ĐỒ ÁN

**Ngày:** 31/10/2025  
**Chủ đề:** So sánh các phương án xử lý video Liveness cho eKYC

---

## 🎯 CÂU HỎI GỐC

> "Quay khuôn mặt sau bước xác nhận thông tin thì có thể dùng React Native quay, convert sang base64, đẩy cho server xử lí đúng không? Có cách nào tối ưu hơn cho việc làm đồ án không?"

---

## ✅ PHƯƠNG ÁN 1: REACT NATIVE → BASE64 → SERVER (Đang dùng)

### 📱 Workflow:

```
React Native App
    ↓
[1] User quay video (expo-camera / react-native-camera)
    ↓
[2] Lưu video tạm: file:///data/user/.../video.mp4
    ↓
[3] Đọc file và convert sang Base64
    expo-file-system.readAsStringAsync(uri, {encoding: 'base64'})
    ↓
[4] Gửi Base64 string lên Server qua API
    POST /api/ekyc/liveness
    Body: { sessionId, videoBase64: "UklGRiQAAAB..." }
    ↓
Server (Spring Boot)
    ↓
[5] Nhận Base64, decode thành bytes
    ↓
[6] Lưu file vào: uploads/videos/{sessionId}/liveness.mp4
    ↓
[7] Convert lại thành Base64 để gửi FPT.AI
    ↓
[8] Gọi FPT.AI Liveness API
    ↓
[9] Trả response về Frontend
```

### ✅ Ưu điểm:
1. ✅ **Đơn giản** - Dễ implement
2. ✅ **Thống nhất** - Cùng flow với ảnh CCCD
3. ✅ **Không cần server media** - Chỉ cần Spring Boot
4. ✅ **Dễ debug** - Có thể xem file trên server
5. ✅ **Phù hợp đồ án** - Code ít, logic rõ ràng

### ❌ Nhược điểm:
1. ❌ **Payload lớn** - Base64 tăng size ~33% (1MB video → 1.3MB base64)
2. ❌ **Memory intensive** - App phải load toàn bộ video vào RAM
3. ❌ **Chậm** - Encoding/Decoding mất thời gian
4. ❌ **Giới hạn size** - API có thể limit request body (VD: 10MB)
5. ❌ **Battery drain** - Tốn pin khi encode/decode

### 📊 Performance:

| Video Size | Base64 Size | Encode Time | Upload Time (4G) | Total Time |
|-----------|-------------|-------------|------------------|------------|
| 1 MB      | 1.3 MB      | ~0.5s       | ~2s              | ~2.5s      |
| 5 MB      | 6.5 MB      | ~2s         | ~10s             | ~12s       |
| 10 MB     | 13 MB       | ~4s         | ~20s             | ~24s       |

### 💡 Code Example (React Native):

```javascript
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';

const recordLivenessVideo = async (sessionId) => {
  // 1. Record video
  const video = await cameraRef.recordAsync({
    maxDuration: 5,
    quality: Camera.Constants.VideoQuality['720p'],
  });
  
  // 2. Convert to Base64
  console.log('Converting to base64...');
  const videoBase64 = await FileSystem.readAsStringAsync(
    video.uri,
    { encoding: FileSystem.EncodingType.Base64 }
  );
  
  // 3. Send to server
  console.log('Uploading...');
  const response = await fetch('http://api.com/api/ekyc/liveness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      videoBase64: videoBase64
    })
  });
  
  return response.json();
};
```

### 🎯 Đánh giá cho ĐỒ ÁN:
- **Phù hợp:** ✅✅✅✅✅ (5/5)
- **Lý do:** Đơn giản, dễ code, dễ chấm điểm, đủ tính năng

---

## 🚀 PHƯƠNG ÁN 2: MULTIPART/FORM-DATA UPLOAD (Tối ưu hơn)

### 📱 Workflow:

```
React Native App
    ↓
[1] User quay video
    ↓
[2] Upload trực tiếp file (không encode base64)
    FormData + multipart/form-data
    ↓
Server (Spring Boot)
    ↓
[3] Nhận MultipartFile (Spring tự parse)
    @RequestParam MultipartFile video
    ↓
[4] Lưu file trực tiếp
    ↓
[5] Convert sang Base64 để gọi FPT.AI
    ↓
[6] Gọi FPT.AI
    ↓
[7] Trả response
```

### ✅ Ưu điểm:
1. ✅ **Nhanh hơn** - Không cần encode/decode ở client
2. ✅ **Ít tốn RAM** - Stream upload, không load toàn bộ vào memory
3. ✅ **Payload nhỏ hơn** - Gửi file gốc, không có overhead của base64
4. ✅ **Chuẩn HTTP** - Đúng convention của web
5. ✅ **Hỗ trợ progress** - Có thể show upload progress

### ❌ Nhược điểm:
1. ❌ **Phức tạp hơn** - Cần config Spring Boot nhận multipart
2. ❌ **Khác flow với OCR** - OCR dùng base64, Liveness dùng file
3. ❌ **Debug khó hơn** - Không thấy data trực tiếp trong request body

### 📊 Performance:

| Video Size | Upload Size | Encode Time | Upload Time (4G) | Total Time |
|-----------|-------------|-------------|------------------|------------|
| 1 MB      | 1 MB        | 0s          | ~1.5s            | ~1.5s      |
| 5 MB      | 5 MB        | 0s          | ~7.5s            | ~7.5s      |
| 10 MB     | 10 MB       | 0s          | ~15s             | ~15s       |

**Cải thiện:** ~40% nhanh hơn!

### 💡 Code Example:

**Frontend (React Native):**
```javascript
const recordLivenessVideo = async (sessionId) => {
  // 1. Record video
  const video = await cameraRef.recordAsync({
    maxDuration: 5,
    quality: Camera.Constants.VideoQuality['720p'],
  });
  
  // 2. Create FormData (NO BASE64 ENCODING!)
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('video', {
    uri: video.uri,
    type: 'video/mp4',
    name: 'liveness.mp4'
  });
  
  // 3. Upload
  const response = await fetch('http://api.com/api/ekyc/liveness', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData
  });
  
  return response.json();
};
```

**Backend (Spring Boot):**
```java
@PostMapping("/liveness")
public ResponseEntity<ApiResponse<LivenessResponse>> checkLiveness(
        @RequestParam String sessionId,
        @RequestParam MultipartFile video) {
    
    log.info("Processing liveness for session: {}", sessionId);
    
    // Convert MultipartFile to bytes
    byte[] videoBytes = video.getBytes();
    
    // Save to filesystem
    String videoPath = mediaStorageService.saveVideoFile(videoBytes, sessionId);
    
    // Convert to base64 for FPT.AI
    String videoBase64 = Base64.getEncoder().encodeToString(videoBytes);
    
    // Call FPT.AI
    LivenessResponse result = ekycService.processLiveness(sessionId, videoBase64);
    
    return ResponseEntity.ok(ApiResponse.success(result));
}
```

### 🎯 Đánh giá cho ĐỒ ÁN:
- **Phù hợp:** ✅✅✅✅⚪ (4/5)
- **Lý do:** Tốt hơn về mặt kỹ thuật nhưng phức tạp hơn, mất thời gian code

---

## ☁️ PHƯƠNG ÁN 3: UPLOAD TO CLOUD STORAGE (Production-ready)

### 📱 Workflow:

```
React Native App
    ↓
[1] User quay video
    ↓
[2] Upload trực tiếp lên Cloud Storage (AWS S3, Firebase Storage)
    ↓
[3] Nhận URL của video
    ↓
[4] Gửi URL (chỉ URL!) cho server
    POST /api/ekyc/liveness
    Body: { sessionId, videoUrl: "https://s3.../video.mp4" }
    ↓
Server (Spring Boot)
    ↓
[5] Download video từ URL
    ↓
[6] Convert sang Base64
    ↓
[7] Gọi FPT.AI
    ↓
[8] Trả response
```

### ✅ Ưu điểm:
1. ✅ **Cực nhanh** - Upload trực tiếp lên CDN
2. ✅ **Scalable** - Server không phải handle video upload
3. ✅ **Reliable** - Cloud storage có retry, resumable upload
4. ✅ **Bandwidth saving** - Không đi qua server backend
5. ✅ **Professional** - Đúng chuẩn production

### ❌ Nhược điểm:
1. ❌ **Chi phí** - Phải trả tiền AWS S3 / Firebase
2. ❌ **Phức tạp** - Cần setup cloud storage, credentials
3. ❌ **Overkill cho đồ án** - Quá phức tạp cho project học
4. ❌ **Dependency** - Phụ thuộc vào service bên thứ 3

### 🎯 Đánh giá cho ĐỒ ÁN:
- **Phù hợp:** ✅✅⚪⚪⚪ (2/5)
- **Lý do:** Quá phức tạp, không cần thiết cho đồ án, khó demo offline

---

## 🎬 PHƯƠNG ÁN 4: STREAM PROCESSING (Advanced)

### 📱 Workflow:

```
React Native App
    ↓
[1] User quay video (streaming mode)
    ↓
[2] Stream chunks theo real-time (WebSocket / HTTP chunked)
    Chunk 1 → Server
    Chunk 2 → Server
    ...
    ↓
Server (Spring Boot)
    ↓
[3] Nhận và ghép chunks
    ↓
[4] Process
```

### ✅ Ưu điểm:
1. ✅ **Real-time** - Xử lý ngay khi đang quay
2. ✅ **Memory efficient** - Không cần load toàn bộ video

### ❌ Nhược điểm:
1. ❌ **Cực kỳ phức tạp** - Cần WebSocket, chunking logic
2. ❌ **Không phù hợp FPT.AI** - FPT.AI cần toàn bộ video
3. ❌ **Overkill**

### 🎯 Đánh giá cho ĐỒ ÁN:
- **Phù hợp:** ⚪⚪⚪⚪⚪ (0/5)
- **Lý do:** Quá phức tạp, không cần thiết

---

## 📊 SO SÁNH TỔNG QUAN

| Tiêu chí | Base64 (P1) | Multipart (P2) | Cloud Storage (P3) | Streaming (P4) |
|----------|-------------|----------------|-------------------|----------------|
| **Độ phức tạp code** | ⭐ Dễ | ⭐⭐ Trung bình | ⭐⭐⭐⭐ Khó | ⭐⭐⭐⭐⭐ Rất khó |
| **Performance** | ⭐⭐⭐ Chậm | ⭐⭐⭐⭐ Nhanh | ⭐⭐⭐⭐⭐ Rất nhanh | ⭐⭐⭐⭐ Nhanh |
| **Memory usage** | ⭐⭐ Nhiều | ⭐⭐⭐⭐ Ít | ⭐⭐⭐⭐⭐ Rất ít | ⭐⭐⭐⭐ Ít |
| **Phù hợp đồ án** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| **Chi phí** | Miễn phí | Miễn phí | Có phí | Miễn phí |
| **Thời gian code** | 1-2 giờ | 3-4 giờ | 1-2 ngày | 3-5 ngày |
| **Điểm cộng khi demo** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 KHUYẾN NGHỊ CHO ĐỒ ÁN

### ✅ **CHỌN PHƯƠNG ÁN 1: BASE64** 

**Lý do:**

1. ✅ **Đơn giản nhất** - Sinh viên dễ hiểu, dễ code
2. ✅ **Đủ tốt** - Performance chấp nhận được cho demo (video 3-5s)
3. ✅ **Thống nhất** - Cùng flow với OCR (đã dùng base64)
4. ✅ **Dễ demo** - Chỉ cần chạy Spring Boot local
5. ✅ **Dễ debug** - Console.log thấy được data
6. ✅ **Không dependency** - Không cần AWS, Firebase...

### 🎨 Cách tối ưu Phương án 1 (Base64):

#### 1️⃣ Giảm kích thước video

```javascript
// Giảm resolution và frame rate
const video = await cameraRef.recordAsync({
  maxDuration: 5,           // Chỉ 5 giây
  quality: '480p',          // Thay vì 720p → giảm 50% size
  frameRate: 15,            // Thay vì 30fps → giảm 50% size
  videoBitrate: 1000000,    // 1 Mbps
});

// Result: Video ~1-2MB thay vì 5-10MB
```

#### 2️⃣ Compress video trước khi upload

```javascript
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import VideoCompress from 'react-native-video-compress';

const compressVideo = async (videoUri) => {
  const result = await VideoCompress.compress(
    videoUri,
    {
      compressionMethod: 'auto',
    },
    (progress) => {
      console.log('Compression Progress: ', progress);
    }
  );
  
  return result.path;
};
```

#### 3️⃣ Show progress để UX tốt hơn

```javascript
const uploadWithProgress = async (sessionId, videoBase64) => {
  // Chia nhỏ base64 string thành chunks để track progress
  const chunkSize = 100000; // 100KB per chunk
  const chunks = [];
  
  for (let i = 0; i < videoBase64.length; i += chunkSize) {
    chunks.push(videoBase64.substr(i, chunkSize));
  }
  
  // Send all at once nhưng show fake progress
  setTimeout(() => setProgress(30), 500);
  setTimeout(() => setProgress(60), 1000);
  
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sessionId, videoBase64 })
  });
  
  setProgress(100);
  return response;
};
```

#### 4️⃣ Background processing (Optional)

```javascript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// Upload video ở background nếu user thoát app
TaskManager.defineTask('upload-video', async () => {
  // Upload logic here
});
```

#### 5️⃣ Tăng timeout

```javascript
// Backend: application.yaml
spring:
  servlet:
    multipart:
      max-file-size: 20MB
      max-request-size: 20MB
  mvc:
    async:
      request-timeout: 60000  # 60 seconds

// Frontend: fetch config
fetch(API_URL, {
  method: 'POST',
  body: JSON.stringify(data),
  timeout: 60000  // 60 seconds
})
```

---

## 🔥 PHƯƠNG ÁN TỐI ƯU NHẤT CHO ĐỒ ÁN

### 💡 **Hybrid Approach: Base64 + Optimization**

```javascript
// Frontend: Record, Compress, Upload
const completeEKYC_Liveness = async (sessionId) => {
  try {
    // 1. Record video with optimized settings
    console.log('🎥 Recording liveness video...');
    const video = await cameraRef.recordAsync({
      maxDuration: 5,
      quality: '480p',      // Tối ưu: 480p thay vì 720p
      frameRate: 15,        // Tối ưu: 15fps thay vì 30fps
    });
    
    console.log('Original size:', video.fileSize);
    
    // 2. Compress video (Optional - nếu vẫn lớn)
    let finalUri = video.uri;
    if (video.fileSize > 2000000) { // > 2MB
      console.log('📦 Compressing video...');
      const compressed = await VideoCompress.compress(video.uri);
      finalUri = compressed.path;
      console.log('Compressed size:', compressed.size);
    }
    
    // 3. Convert to Base64
    console.log('🔄 Converting to base64...');
    const videoBase64 = await FileSystem.readAsStringAsync(
      finalUri,
      { encoding: FileSystem.EncodingType.Base64 }
    );
    
    // 4. Upload to server
    console.log('☁️  Uploading to server...');
    const response = await fetch(API_URL + '/api/ekyc/liveness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        videoBase64: videoBase64
      }),
      timeout: 60000
    });
    
    const result = await response.json();
    console.log('✅ Liveness check complete:', result);
    
    return result.data;
    
  } catch (error) {
    console.error('❌ Liveness error:', error);
    throw error;
  }
};
```

---

## 🎓 KẾT LUẬN CHO ĐỒ ÁN

### ✅ Trả lời câu hỏi:

**Q:** "Quay video → Convert Base64 → Đẩy server đúng không?"  
**A:** ✅ **ĐÚNG!** Đây là cách TỐT NHẤT cho đồ án!

**Q:** "Có cách nào tối ưu hơn không?"  
**A:** 
- ✅ **Có** - Multipart upload (Phương án 2) hoặc Cloud Storage (Phương án 3)
- ⚠️ **NHƯNG** - Không cần thiết cho đồ án, phức tạp hơn mà lợi ích không nhiều
- ✅ **KHUYẾN NGHỊ** - Giữ Base64 + tối ưu video quality/compression

### 📋 Checklist cho đồ án:

#### Must Have (Bắt buộc):
- ✅ Record video 5 giây
- ✅ Convert sang Base64
- ✅ Upload lên server
- ✅ Server gọi FPT.AI
- ✅ Trả kết quả về Frontend

#### Nice to Have (Cộng điểm):
- ✅ Compress video trước khi upload
- ✅ Show progress bar khi upload
- ✅ Validation: file size, duration, format
- ✅ Error handling: retry khi fail
- ✅ UI/UX: hướng dẫn động tác, preview video

#### Advanced (Điểm cao):
- ⭐ Real-time face detection
- ⭐ Auto-start/stop recording when face detected
- ⭐ Quality check trước khi upload (blur detection, lighting check)

---

## 📚 TÀI LIỆU THAM KHẢO

### React Native Camera:
- expo-camera: https://docs.expo.dev/versions/latest/sdk/camera/
- react-native-vision-camera: https://github.com/mrousavy/react-native-vision-camera

### Video Compression:
- react-native-video-compress: https://github.com/shahen94/react-native-video-compress
- expo-av: https://docs.expo.dev/versions/latest/sdk/av/

### File System:
- expo-file-system: https://docs.expo.dev/versions/latest/sdk/filesystem/

---

## 🎯 SUMMARY

| Câu hỏi | Đáp án |
|---------|--------|
| React Native quay video → Base64 → Server? | ✅ ĐÚNG - Đây là cách TỐT cho đồ án |
| Có cách tối ưu hơn không? | ✅ CÓ (Multipart/Cloud) nhưng KHÔNG CẦN cho đồ án |
| Khuyến nghị? | ✅ Dùng Base64 + Tối ưu video quality & compression |
| Performance? | ⭐⭐⭐ Đủ tốt cho video 5s (1-2MB) |
| Độ phức tạp? | ⭐ Đơn giản - Sinh viên code được trong 1-2 giờ |
| Điểm demo? | ⭐⭐⭐⭐⭐ Đầy đủ tính năng, hoạt động tốt |

**TÓM LẠI:** Base64 là lựa chọn HOÀN HẢO cho đồ án eKYC! 🎉

