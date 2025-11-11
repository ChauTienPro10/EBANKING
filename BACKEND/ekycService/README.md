# 📋 MÔ TẢ CHỨC NĂNG BACKEND - HƯỚNG DẪN TÍCH HỢP FE WEBVIEW

## 🎯 Tổng quan

Backend hỗ trợ **2 phương thức eKYC**:
1. **SDK Integration** (Khuyến nghị cho WebView) - FE nhúng FPT AI WebView, BE chỉ nhận kết quả
2. **Direct Upload** (Legacy) - FE upload file, BE xử lý

---

## 📊 LUỒNG HOẠT ĐỘNG SDK INTEGRATION (CHO WEBVIEW)

### Flow tổng quan:
```
FE Mobile App → Tạo Session (1) → BE
                                    ↓
FE ← Nhận sessionId ← BE
    ↓
FE → Init SDK Config (2) → BE
                            ↓
FE ← Nhận SDK Config ← BE (apiKey, callbackUrl, sessionToken)
    ↓
FE Mở WebView FPT AI SDK với config
    ↓ (User thực hiện eKYC trong WebView)
    ↓
FE WebView nhận kết quả từ FPT AI
    ↓
FE → Gửi Callback (3) → BE (OCR data)
                         ↓
FE ← Success ← BE (đã lưu OCR)
    ↓
FE → Gửi Callback (4) → BE (Liveness data)
                         ↓
FE ← Success ← BE (đã lưu Liveness)
    ↓
FE → Gửi Callback (5) → BE (Face Match data)
                         ↓
FE ← Success ← BE (đã lưu, status = COMPLETED)
    ↓
FE → Check Status (6) → BE
                         ↓
FE ← status: "COMPLETED" ← BE
    ↓
FE Navigate to Success Screen
```

---

## 🔌 API ENDPOINTS CHI TIẾT

### 1️⃣ Tạo Session
**Bước đầu tiên - Tạo session eKYC**

```http
POST /api/ekyc/sessions?userId={userId}
```

**Query Params:**
- `userId` (Long, optional, default=1): ID của user

**Request:**
```
POST http://localhost:8081/api/ekyc/sessions?userId=123
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "INITIATED",
    "currentStep": "OCR",
    "expiresAt": "2025-11-09T10:10:00"
  },
  "timestamp": "2025-11-09T10:00:00"
}
```

**Các Status có thể:**
- `INITIATED` - Mới khởi tạo
- `OCR_COMPLETED` - Đã hoàn thành OCR
- `LIVENESS_COMPLETED` - Đã hoàn thành Liveness
- `COMPLETED` - Hoàn thành toàn bộ
- `FAILED` - Thất bại

**Các Step có thể:**
- `OCR` - Bước quét CCCD
- `VERIFICATION` - Kiểm tra thông tin
- `LIVENESS` - Xác thực khuôn mặt
- `FACE_MATCH` - So khớp
- `COMPLETED` - Hoàn thành

**Code FE (React Native):**
```javascript
const createSession = async (userId) => {
  try {
    const response = await fetch(
      `http://your-backend:8081/api/ekyc/sessions?userId=${userId}`,
      { method: 'POST' }
    );
    const result = await response.json();
    
    if (result.success) {
      const sessionId = result.data.sessionId;
      console.log('Session created:', sessionId);
      return sessionId;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};
```

---

### 2️⃣ Khởi tạo SDK Config
**Lấy config để mở WebView FPT AI SDK**

```http
POST /api/ekyc/sdk/init?sessionId={sessionId}&language={language}
```

**Query Params:**
- `sessionId` (String, required): Session ID từ bước 1
- `language` (String, optional, default="vi"): Ngôn ngữ (vi/en)

**Request:**
```
POST http://localhost:8081/api/ekyc/sdk/init?sessionId=550e8400-e29b-41d4-a716-446655440000&language=vi
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "apiKey": "juexeQ3Q2nVoK59t6SCmp1J5ioXe3GTY",
    "baseUrl": "https://api.fpt.ai",
    "callbackUrl": "http://localhost:8081/api/ekyc/sdk/webhook",
    "sessionToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "steps": {
      "ocrEnabled": true,
      "livenessEnabled": true,
      "faceMatchEnabled": true
    }
  }
}
```

**Code FE (React Native):**
```javascript
const initSdk = async (sessionId) => {
  try {
    const response = await fetch(
      `http://your-backend:8081/api/ekyc/sdk/init?sessionId=${sessionId}&language=vi`,
      { method: 'POST' }
    );
    const result = await response.json();
    
    if (result.success) {
      const sdkConfig = result.data;
      console.log('SDK Config:', sdkConfig);
      // Dùng config này để mở WebView
      return sdkConfig;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Init SDK error:', error);
    throw error;
  }
};
```

---

### 3️⃣ Gửi Callback từ Frontend
**Gửi kết quả từ WebView về Backend**

```http
POST /api/ekyc/sdk/callback
Content-Type: application/json
```

**Request Body - OCR Callback:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionId": "fpt-ai-txn-20251109123456",
  "status": "SUCCESS",
  "type": "OCR",
  "data": {
    "front": {
      "id": "001234567890",
      "name": "NGUYEN VAN A",
      "dob": "01/01/1990",
      "sex": "Nam",
      "address": "123 Nguyen Trai, Ha Noi",
      "doe": "01/01/2030"
    },
    "back": {
      "issue_date": "01/01/2020"
    },
    "front_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "back_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "portrait_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  },
  "timestamp": 1699522800000
}
```

**Request Body - Liveness Callback:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionId": "fpt-ai-txn-20251109123457",
  "status": "SUCCESS",
  "type": "LIVENESS",
  "data": {
    "is_live": true,
    "confidence": 0.95,
    "face_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "video": "data:video/mp4;base64,AAAAIGZ0eXBpc29t..."
  },
  "timestamp": 1699522850000
}
```

**Request Body - Face Match Callback:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "transactionId": "fpt-ai-txn-20251109123458",
  "status": "SUCCESS",
  "type": "FACE_MATCH",
  "data": {
    "is_match": true,
    "similarity": 0.92
  },
  "timestamp": 1699522900000
}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "message": "Callback processed successfully",
  "data": "Callback processed successfully",
  "timestamp": "2025-11-09T10:05:00"
}
```

**Code FE (React Native):**
```javascript
const sendCallback = async (sessionId, type, data) => {
  try {
    const callbackData = {
      sessionId: sessionId,
      transactionId: `fpt-ai-txn-${Date.now()}`,
      status: 'SUCCESS',
      type: type, // 'OCR', 'LIVENESS', or 'FACE_MATCH'
      data: data,
      timestamp: Date.now()
    };
    
    const response = await fetch(
      'http://your-backend:8081/api/ekyc/sdk/callback',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackData)
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`${type} callback processed`);
      return true;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(`${type} callback error:`, error);
    throw error;
  }
};
```

---

### 4️⃣ Kiểm tra Status
**Kiểm tra trạng thái hiện tại của session**

```http
GET /api/ekyc/sdk/status/{sessionId}
```

**Path Params:**
- `sessionId` (String, required): Session ID

**Request:**
```
GET http://localhost:8081/api/ekyc/sdk/status/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": "COMPLETED",
  "timestamp": "2025-11-09T10:10:00"
}
```

**Các giá trị status:**
- `"INITIATED"` - Vừa tạo session
- `"OCR_COMPLETED"` - Đã xong OCR
- `"LIVENESS_COMPLETED"` - Đã xong Liveness
- `"COMPLETED"` - Hoàn thành toàn bộ ✅
- `"FAILED"` - Thất bại ❌

**Code FE (React Native):**
```javascript
const checkStatus = async (sessionId) => {
  try {
    const response = await fetch(
      `http://your-backend:8081/api/ekyc/sdk/status/${sessionId}`
    );
    const result = await response.json();
    
    if (result.success) {
      const status = result.data;
      console.log('Current status:', status);
      return status;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Check status error:', error);
    throw error;
  }
};
```

---

### 5️⃣ Lấy thông tin Session
**Lấy chi tiết session (optional)**

```http
GET /api/ekyc/sessions/{sessionId}
```

**Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "COMPLETED",
    "currentStep": "COMPLETED",
    "expiresAt": "2025-11-09T10:10:00"
  }
}
```

---

## 💻 CODE FRONTEND WEBVIEW HOÀN CHỈNH

### React Native Implementation

```javascript
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const BACKEND_URL = 'http://your-backend:8081';

const EkycWebViewScreen = ({ route, navigation }) => {
  const { userId } = route.params; // Nhận userId từ navigation
  
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sdkConfig, setSdkConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState('Đang khởi tạo...');
  
  const webViewRef = useRef(null);

  // Bước 1: Tạo session và init SDK
  React.useEffect(() => {
    initializeEkyc();
  }, []);

  const initializeEkyc = async () => {
    try {
      setCurrentStep('Đang tạo session...');
      
      // 1. Tạo session
      const sessionResponse = await fetch(
        `${BACKEND_URL}/api/ekyc/sessions?userId=${userId}`,
        { method: 'POST' }
      );
      const sessionResult = await sessionResponse.json();
      
      if (!sessionResult.success) {
        throw new Error('Không thể tạo session');
      }
      
      const newSessionId = sessionResult.data.sessionId;
      setSessionId(newSessionId);
      console.log('✅ Session created:', newSessionId);
      
      // 2. Init SDK config
      setCurrentStep('Đang khởi tạo SDK...');
      const configResponse = await fetch(
        `${BACKEND_URL}/api/ekyc/sdk/init?sessionId=${newSessionId}&language=vi`,
        { method: 'POST' }
      );
      const configResult = await configResponse.json();
      
      if (!configResult.success) {
        throw new Error('Không thể khởi tạo SDK');
      }
      
      setSdkConfig(configResult.data);
      console.log('✅ SDK Config ready');
      setLoading(false);
      setCurrentStep('Sẵn sàng');
      
    } catch (error) {
      console.error('❌ Initialization error:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo eKYC. Vui lòng thử lại.');
      navigation.goBack();
    }
  };

  // Xử lý message từ WebView
  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 Message from WebView:', message);
      
      // Message format từ FPT AI SDK:
      // { type: 'OCR'|'LIVENESS'|'FACE_MATCH', status: 'success'|'error', data: {...} }
      
      if (message.status === 'error') {
        Alert.alert('Lỗi', message.message || 'Có lỗi xảy ra trong quá trình eKYC');
        return;
      }
      
      // Gửi callback về backend
      await sendCallbackToBackend(message.type, message.data);
      
      // Nếu hoàn thành Face Match (bước cuối)
      if (message.type === 'FACE_MATCH') {
        await handleCompletion();
      }
      
    } catch (error) {
      console.error('❌ Error handling WebView message:', error);
    }
  };

  // Gửi callback về backend
  const sendCallbackToBackend = async (type, data) => {
    try {
      setCurrentStep(`Đang xử lý ${type}...`);
      
      const callbackData = {
        sessionId: sessionId,
        transactionId: `txn-${Date.now()}`,
        status: 'SUCCESS',
        type: type,
        data: data,
        timestamp: Date.now()
      };
      
      const response = await fetch(
        `${BACKEND_URL}/api/ekyc/sdk/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(callbackData)
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${type} callback processed`);
        setCurrentStep(`Đã hoàn thành ${type}`);
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error(`❌ ${type} callback error:`, error);
      Alert.alert('Lỗi', `Không thể xử lý ${type}`);
    }
  };

  // Xử lý khi hoàn thành
  const handleCompletion = async () => {
    try {
      setCurrentStep('Đang kiểm tra kết quả...');
      
      // Kiểm tra status cuối cùng
      const statusResponse = await fetch(
        `${BACKEND_URL}/api/ekyc/sdk/status/${sessionId}`
      );
      const statusResult = await statusResponse.json();
      
      if (statusResult.success && statusResult.data === 'COMPLETED') {
        console.log('🎉 eKYC COMPLETED!');
        
        // Hiển thị thông báo thành công
        Alert.alert(
          'Thành công',
          'Xác thực eKYC hoàn tất!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to success screen hoặc back
                navigation.navigate('EkycSuccess', { sessionId: sessionId });
              }
            }
          ]
        );
      } else {
        throw new Error('eKYC chưa hoàn thành');
      }
      
    } catch (error) {
      console.error('❌ Completion check error:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận kết quả eKYC');
    }
  };

  // HTML để inject vào WebView
  const getWebViewHTML = () => {
    if (!sdkConfig) return '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.fpt.ai/ekyc-sdk.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
          }
          #ekyc-container { 
            width: 100vw; 
            height: 100vh; 
          }
        </style>
      </head>
      <body>
        <div id="ekyc-container"></div>
        
        <script>
          // Khởi tạo FPT AI eKYC SDK
          const ekyc = new FPTAIEkyc({
            apiKey: '${sdkConfig.apiKey}',
            container: '#ekyc-container',
            language: 'vi',
            sessionId: '${sdkConfig.sessionId}',
            
            // Callbacks
            callbacks: {
              // Callback khi hoàn thành OCR
              onOCRComplete: (data) => {
                console.log('OCR completed:', data);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'OCR',
                  status: 'success',
                  data: data
                }));
              },
              
              // Callback khi hoàn thành Liveness
              onLivenessComplete: (data) => {
                console.log('Liveness completed:', data);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'LIVENESS',
                  status: 'success',
                  data: data
                }));
              },
              
              // Callback khi hoàn thành Face Match
              onFaceMatchComplete: (data) => {
                console.log('Face Match completed:', data);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'FACE_MATCH',
                  status: 'success',
                  data: data
                }));
              },
              
              // Callback khi có lỗi
              onError: (error) => {
                console.error('eKYC error:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ERROR',
                  status: 'error',
                  message: error.message
                }));
              }
            }
          });
          
          // Bắt đầu quy trình eKYC
          ekyc.start();
        </script>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>{currentStep}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{currentStep}</Text>
      </View>
      
      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: getWebViewHTML() }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});

export default EkycWebViewScreen;
```

---

## 🗄️ DỮ LIỆU ĐƯỢC LƯU TRONG DATABASE

### Session (ekyc_sessions)
```
- id (UUID): Session ID
- user_id: ID của user
- session_token: Token bảo mật
- status: INITIATED → OCR_COMPLETED → LIVENESS_COMPLETED → COMPLETED
- current_step: OCR → VERIFICATION → LIVENESS → FACE_MATCH → COMPLETED
- expired_at: Thời gian hết hạn (10 phút)
- created_at, updated_at: Timestamps
```

### Document Info (document_info)
```
Được lưu khi callback OCR:
- id_number: Số CCCD
- full_name: Họ tên
- date_of_birth: Ngày sinh
- gender: Giới tính
- address: Địa chỉ
- issue_date: Ngày cấp
- expiry_date: Ngày hết hạn
- front_image_path: Path ảnh mặt trước (uploads/images/sessionId/front_xxx.jpg)
- back_image_path: Path ảnh mặt sau
- portrait_image_path: Path ảnh chân dung (nếu có)
```

### Biometric Data (biometric_data)
```
Được lưu khi callback Liveness & Face Match:
- video_path: Path video liveness
- face_image_path: Path ảnh khuôn mặt
- is_live: true/false
- liveness_confidence: 0.0 - 1.0
- face_match: true/false (callback Face Match)
- face_match_score: 0.0 - 1.0 (callback Face Match)
```

---

## ⚙️ CẤU HÌNH BACKEND

### application.yaml
```yaml
# Server
server:
  port: 8081

# FPT AI
fpt:
  ai:
    api-key: juexeQ3Q2nVoK59t6SCmp1J5ioXe3GTY
    ocr-url: https://api.fpt.ai/vision/idr/vnm/
    liveness-url: https://api.fpt.ai/dmp/liveness/v3
    face-match-url: https://api.fpt.ai/dmp/checkface/v1

# App Config
app:
  base-url: http://localhost:8081  # Thay đổi khi deploy production
  
  upload:
    base-dir: ./uploads
    max-file-size-mb: 10
  
  session:
    expiry-minutes: 10

# CORS (cho phép FE gọi API)
cors:
  allowed-origins: http://localhost:3000,http://localhost:19006
```

---

## 🔐 BẢO MẬT

### Session Token
- Được generate tự động khi init SDK
- Dùng để authenticate webhook (optional)
- Header: `X-Session-Token: {token}`

### Session Expiry
- Session hết hạn sau 10 phút
- BE tự động reject request với session đã hết hạn

---

## 🐛 XỬ LÝ LỖI

### Lỗi thường gặp:

**1. Session not found**
```json
{
  "success": false,
  "message": "Session not found",
  "timestamp": "2025-11-09T10:00:00"
}
```
→ SessionId không tồn tại hoặc đã bị xóa

**2. Session expired**
```json
{
  "success": false,
  "message": "Session expired",
  "timestamp": "2025-11-09T10:00:00"
}
```
→ Session quá 10 phút, cần tạo session mới

**3. Invalid callback data**
```json
{
  "success": false,
  "message": "Front image data is missing",
  "timestamp": "2025-11-09T10:00:00"
}
```
→ Data từ FPT AI không đầy đủ

---

## 📝 CHECKLIST TÍCH HỢP FE

### Bước 1: Setup Dependencies
- [ ] Install `react-native-webview`
- [ ] Cấu hình permissions (camera, storage)

### Bước 2: Implement Screen
- [ ] Tạo EkycWebViewScreen
- [ ] Handle create session
- [ ] Handle init SDK config
- [ ] Render WebView với HTML inject
- [ ] Handle onMessage từ WebView

### Bước 3: Handle Callbacks
- [ ] Xử lý OCR callback → gửi về BE
- [ ] Xử lý Liveness callback → gửi về BE
- [ ] Xử lý Face Match callback → gửi về BE
- [ ] Check status cuối cùng

### Bước 4: Error Handling
- [ ] Handle network errors
- [ ] Handle session expired
- [ ] Handle FPT AI SDK errors
- [ ] Show loading states

### Bước 5: UI/UX
- [ ] Progress indicator
- [ ] Loading states
- [ ] Success screen
- [ ] Error messages

### Bước 6: Testing
- [ ] Test happy flow (OCR → Liveness → Face Match)
- [ ] Test error cases
- [ ] Test session expiry
- [ ] Test network issues

---

## 🚀 PRODUCTION CHECKLIST

### Backend
- [ ] Update `app.base-url` trong application.yaml
- [ ] Enable HTTPS cho webhook
- [ ] Update CORS allowed-origins
- [ ] Setup monitoring/logging
- [ ] Database backup

### Frontend
- [ ] Update BACKEND_URL to production
- [ ] Test với production backend
- [ ] Handle production FPT AI SDK URL
- [ ] Enable crash reporting

---

## 📞 HỖ TRỢ

- **FPT AI Docs**: https://docs-vision.fpt.ai/ekyc/
- **Test Script**: `python test_sdk_integration.py`
- **Backend Port**: 8081
- **Session Expiry**: 10 minutes

---

**Version**: 1.0.0  
**Last Updated**: November 9, 2025  
**Status**: ✅ Ready for Frontend Integration

