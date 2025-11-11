# eKYC - HƯỚNG DẪN SỬ DỤNG# 🚀 eKYC Integration - Quick Start

## 📋 YÊU CẦU## ✅ Đã hoàn thành

### 1. Backend phải chạy trướcTích hợp FPT AI eKYC SDK vào eBanking app thông qua WebView.

````powershell

cd d:\EBANKING\BACKEND\ekycService### Files được tạo/cập nhật:

./mvnw spring-boot:run

```1. **Components:**



Backend sẽ chạy ở port **8081**   - `src/components/EKYCWebView.tsx` - Component WebView chính

   - `src/components/index.ts` - Export EKYCWebView

### 2. Kiểm tra Backend

```powershell2. **Screens:**

curl http://localhost:8081/actuator/health

```   - `src/page/EKYCScreen.tsx` - Screen xác thực eKYC



Hoặc test tạo session:3. **Navigation:**

```powershell

curl -X POST http://localhost:8081/api/ekyc/sessions?userId=1   - `src/navigation/types.ts` - Thêm route `EKYC`

```   - `src/navigation/MainStack.tsx` - Đăng ký EKYCScreen



## 🚀 CHẠY APP4. **Localization:**



### 1. Start Metro   - `locales/vi.json` - Thêm translations tiếng Việt

```bash   - `locales/en.json` - Thêm translations tiếng Anh

cd d:\EBANKING\MOBILE\ebanking_mb

npm start5. **Configuration:**

```   - `.env` - API keys configuration

   - `env.d.ts` - TypeScript definitions

### 2. Run Android   - `android/app/src/main/AndroidManifest.xml` - Camera permissions

```bash   - `ios/ebanking_mb/Info.plist` - Camera permissions

npm run android

```## 📋 Cấu hình



### 3. Xem logs### 1. Lấy API Keys từ FPT AI

```bash

npx react-native log-android#### 🔑 Cách đăng ký và lấy API Keys:

````

**Bước 1: Liên hệ FPT AI**

## 📱 FLOW HOẠT ĐỘNG- 📧 Email: **ekyc@fpt.com.vn** hoặc **support@fpt.ai**

- ☎️ Hotline: **1900 6089**

1. App khởi động → Tạo session với backend- 🌐 Website: https://ekyc-sdk.fpt.ai/

2. Backend trả về sessionId

3. WebView hiển thị 3 bước:**Bước 2: Cung cấp thông tin**

   - **Bước 1**: Quét CMND/CCCD (OCR)- Tên công ty/tổ chức

   - **Bước 2**: Xác thực khuôn mặt (Liveness)- Mã số thuế

   - **Bước 3**: So khớp khuôn mặt (Face Match)- Mục đích sử dụng (eBanking app)

4. Mỗi bước hoàn thành → Gửi callback về backend- Ước tính số lượng transaction/tháng

5. Sau bước 3 → Kiểm tra status → Hoàn thành

**Bước 3: Ký hợp đồng và nhận credentials**

## ✅ LOGS CẦN THẤYFPT AI sẽ cung cấp:

- ✅ `API_KEY` - Public key

```- ✅ `API_SECRET` - Secret key

🚀 Starting eKYC with backend: http://10.0.2.2:8081- ✅ Tài liệu API chi tiết

✅ Session created: xxx-xxx-xxx- ✅ Support channel

📨 WebView message: OCR

✅ OCR sent to backend**Lưu ý:** Đây là dịch vụ B2B (doanh nghiệp), cần hợp đồng chính thức. Hỏi về **Sandbox/Test credentials** để development.

📨 WebView message: LIVENESS

✅ LIVENESS sent to backend### 2. Thêm API Keys vào `.env`

📨 WebView message: FACE_MATCH

✅ FACE_MATCH sent to backend```env

````FPT_EKYC_API_KEY=your_actual_api_key_here

FPT_EKYC_API_SECRET=your_actual_api_secret_here

## 🐛 NẾU CÓ LỖI```



### Lỗi: "Backend error: 500"### 3. (Optional) Sử dụng Mock Service để test UI

→ Backend chưa chạy hoặc crash

→ Kiểm tra backend logsTrong lúc chờ API keys chính thức, sử dụng `MockEKYCService` để test UI:



### Lỗi: "Không thể kết nối Backend"```typescript

→ Check `.env` file có đúng URL không:import { mockEKYCVerification, isUsingMockEKYC } from '../services/MockEKYCService';

```env

EKYC_BACKEND_URL=http://10.0.2.2:8081// Check nếu đang dùng mock

```if (isUsingMockEKYC(apiKey)) {

→ Rebuild app sau khi sửa: `npm run android`  console.log('Using mock eKYC service for testing');

  const mockData = await mockEKYCVerification();

### WebView trắng  handleSuccess(mockData);

→ Mở Chrome DevTools: `chrome://inspect`}

→ Xem console logs trong WebView```



## 📝 FILES QUAN TRỌNGFile: `src/services/MockEKYCService.ts` đã được tạo sẵn.



- **Component**: `src/components/EKYCWebViewBackend.tsx`### 4. Rebuild App

- **Screen**: `src/page/EKYCScreen.tsx`

- **Config**: `.env` (chứa EKYC_BACKEND_URL)```bash

- **Navigation**: `src/navigation/MainStack.tsx`# Android

npm run android

## 🎯 QUICK START

# iOS (macOS only)

```bashcd ios && pod install && cd ..

# 1. Start Backendnpm run ios

cd d:\EBANKING\BACKEND\ekycService && ./mvnw spring-boot:run```



# 2. Start Metro  ## 💻 Sử dụng

cd d:\EBANKING\MOBILE\ebanking_mb && npm start

### Option 1: Navigate đến Screen (Đơn giản nhất)

# 3. Run app

npm run android```typescript

```import { useNavigation } from '@react-navigation/native';

import { StackNavigationProp } from '@react-navigation/stack';

Done! ✅import { RootStackParamList } from '../navigation/types';


type NavProp = StackNavigationProp<RootStackParamList>;

const MyScreen = () => {
  const navigation = useNavigation<NavProp>();

  return (
    <CustomButton
      title="Xác thực eKYC"
      onPress={() => navigation.navigate('EKYC')}
    />
  );
};
````

### Option 2: Sử dụng Component trực tiếp

```typescript
import { EKYCWebView } from '../components';
import { Modal } from 'react-native';
import { FPT_EKYC_API_KEY, FPT_EKYC_API_SECRET } from '@env';

const [showEKYC, setShowEKYC] = useState(false);

<Modal visible={showEKYC} presentationStyle="fullScreen">
  <EKYCWebView
    onClose={() => setShowEKYC(false)}
    onSuccess={data => {
      console.log('eKYC Data:', data);
      // Lưu data vào backend/Redux
    }}
    onError={error => {
      console.error('Error:', error);
    }}
    apiKey={FPT_EKYC_API_KEY}
    apiSecret={FPT_EKYC_API_SECRET}
  />
</Modal>;
```

## 📊 Data trả về

Khi xác thực thành công, `onSuccess` callback nhận object:

```typescript
{
  id: string,                  // Số CMND/CCCD
  name: string,                // Họ tên
  dob: string,                 // Ngày sinh
  gender: string,              // Giới tính
  address: string,             // Địa chỉ
  idCardFrontImage: string,    // Ảnh mặt trước (base64)
  idCardBackImage: string,     // Ảnh mặt sau (base64)
  faceImage: string,           // Ảnh selfie (base64)
  faceMatchScore: number,      // Điểm khớp mặt (0-100)
  isLiveness: boolean,         // Xác thực người thật
  sessionId: string,
  timestamp: string,
}
```

## 🎨 Tuỳ chỉnh

Component đã được tích hợp với:

- ✅ i18n (react-i18next) - Hỗ trợ đa ngôn ngữ
- ✅ ToastService - Thông báo theo style của app
- ✅ Colors - Màu sắc theo theme của app
- ✅ Navigation - Tích hợp với React Navigation
- ✅ TypeScript - Type safety đầy đủ

### Thay đổi màu sắc SDK

Sửa trong `src/components/EKYCWebView.tsx`:

```javascript
theme: {
  primaryColor: '#09a0a5ff',      // Màu chính
  backgroundColor: '#FFFFFF',      // Màu nền
  secondaryColor: '#49f08eff',    // Màu phụ
}
```

## 🔒 Security

- ⚠️ **KHÔNG** commit API keys lên Git
- ✅ Sử dụng environment variables (`.env`)
- ✅ Encrypt dữ liệu eKYC trước khi lưu
- ✅ Xóa data nhạy cảm sau khi xử lý

## 📱 Testing

- **Yêu cầu**: Test trên thiết bị thật (không phải emulator)
- **Camera**: Cần grant camera permissions
- **Internet**: Cần kết nối để tải SDK
- **CMND/CCCD**: Test với giấy tờ thật để kiểm tra độ chính xác

## 🆘 Troubleshooting

### WebView không tải?

- Check kết nối internet
- Xem console logs
- Verify SDK URL

### Camera không hoạt động?

- Check permissions đã grant
- Test trên thiết bị thật
- Review AndroidManifest.xml và Info.plist

### Không nhận callback?

- Check API keys đã config
- Xem console.log messages
- Verify `javaScriptEnabled={true}`

## 📚 Tài liệu

- **Full Documentation**: `EKYC_INTEGRATION.md`
- **FPT AI Docs**: https://ekyc-sdk.fpt.ai/docs
- **Component Source**: `src/components/EKYCWebView.tsx`
- **Screen Source**: `src/page/EKYCScreen.tsx`

## ✨ Features

- [x] WebView integration
- [x] i18n support (vi/en)
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Navigation integration
- [x] TypeScript support
- [x] Camera permissions
- [x] Environment variables
- [x] Theme customization

---

**🎉 Hoàn thành! Bạn giờ có thể sử dụng eKYC trong ứng dụng eBanking.**
