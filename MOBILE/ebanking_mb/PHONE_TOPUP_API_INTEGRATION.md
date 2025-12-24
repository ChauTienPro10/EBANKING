# Tích hợp API Nạp Tiền Điện Thoại

## Tổng quan
Đã hoàn thành tích hợp API thực tế cho tính năng nạp tiền điện thoại, thay thế mock data bằng các endpoint API thực tế theo tài liệu `PHONE_TOPUP_API_CLIENT.md`.

## Các thay đổi chính

### 1. Cập nhật MobilePrepaidService.ts
**Thay đổi Interface:**
- `MobileOperator`: Cập nhật từ mock format sang API format
  - `providerId`, `providerCode`, `providerName`, `logoUrl`
  - `minAmount`, `maxAmount`, `feePercentage`, `fixedFee`
  - `denominations[]` thay thế cho packages
- `PrepaidTransaction`: Cập nhật theo API response format
  - `topUpId`, `transactionId`, `status`, `providerTransactionId`
  - `requiresFaceAuth`, `faceAuthSessionId`, `faceAuthVerified`
- `PrepaidRequest`: Cập nhật theo API request format
  - `userId`, `username`, `accountNumber`, `telecomProvider`

**Thêm Methods:**
- `validatePhoneNumber()`: Validate số điện thoại Việt Nam
- `formatPhoneNumber()`: Format số điện thoại
- `validateAmount()`: Kiểm tra số tiền hợp lệ
- `calculateFee()`: Tính phí giao dịch
- `calculateTotalAmount()`: Tính tổng tiền
- `verifyFaceAuth()`: Xác thực Face Auth

**API Integration:**
- `getMobileOperators()`: Gọi `GET /phone-topup/providers`
- `topUpMobile()`: Gọi `POST /phone-topup`
- `verifyFaceAuth()`: Gọi `POST /phone-topup/verify-face-auth/{sessionId}`
- `getTopUpHistory()`: Gọi `GET /phone-topup/history/{userId}`
- `getTransactionDetail()`: Gọi `GET /phone-topup/transaction/{transactionId}`

### 2. Cập nhật API Constants
**Thêm endpoints mới trong `src/constants/api.ts`:**
```typescript
GET_PHONE_TOPUP_PROVIDERS: `${AUTH_SERVICE}/phone-topup/providers`
PHONE_TOPUP: `${AUTH_SERVICE}/phone-topup`
PHONE_TOPUP_VERIFY_FACE_AUTH: `${AUTH_SERVICE}/phone-topup/verify-face-auth/{faceAuthSessionId}`
GET_PHONE_TOPUP_HISTORY: `${AUTH_SERVICE}/phone-topup/history/{userId}`
GET_PHONE_TOPUP_TRANSACTION: `${AUTH_SERVICE}/phone-topup/transaction/{transactionId}`
```

### 3. Cập nhật UI Components

**MobilePrepaidScreen.tsx:**
- Thay thế package selection bằng denomination selection
- Thêm custom amount input
- Hiển thị fee information real-time
- Auto-detect operator từ phone number
- Validation theo API requirements

**MobilePrepaidConfirmScreen.tsx:**
- Cập nhật theo API request format
- Hiển thị fee và total amount
- Integration với Redux store cho user info
- Error handling cho API responses

**MobilePrepaidResultScreen.tsx:**
- Support multiple transaction status: PENDING, COMPLETED, FAILED
- Hiển thị Face Auth requirements
- Provider transaction ID
- Enhanced error messaging

### 4. Navigation Types
**Cập nhật `RootStackParamList`:**
```typescript
MobilePrepaidConfirm: {
  phoneNumber: string;
  operator: any;
  amount: number;
  fee: number;
  totalAmount: number;
};
MobilePrepaidResult: {
  transaction: any;
  operator: any;
  amount: number;
};
```

### 5. eKYC Integration
**Tạo `useMobilePrepaid` Hook:**
- eKYC validation cho giao dịch > 200K VND
- Face authentication integration
- Error handling và loading states
- Toast notifications

**Tính năng:**
- Kiểm tra eKYC trước khi thực hiện giao dịch
- Navigate đến EKYC screen nếu chưa xác thực
- Face auth cho giao dịch có giá trị cao
- Consistent UX với transfer và savings

### 6. Localization
**Cập nhật `locales/vi.json`:**
- Thêm `select_amount`, `amount_required`
- Validation messages cho API integration
- Error messages cho các trường hợp API

## Luồng xử lý API

### 1. Lấy danh sách nhà mạng
```typescript
const operators = await MobilePrepaidService.getMobileOperators();
// GET /authService/phone-topup/providers
```

### 2. Auto-detect nhà mạng
```typescript
const operator = await MobilePrepaidService.detectOperator(phoneNumber);
// Logic mapping prefix với provider code
```

### 3. Thực hiện nạp tiền
```typescript
const request = {
  userId: userInfo.id,
  username: loginResponse.username,
  accountNumber: accountTransResponse.accountNumber,
  phoneNumber,
  telecomProvider: operator.providerCode,
  amount,
  pin,
};
const transaction = await MobilePrepaidService.topUpMobile(request);
// POST /authService/phone-topup
```

### 4. Xử lý Face Auth (nếu cần)
```typescript
if (transaction.requiresFaceAuth) {
  const verifiedTransaction = await MobilePrepaidService.verifyFaceAuth(
    transaction.faceAuthSessionId
  );
  // POST /authService/phone-topup/verify-face-auth/{sessionId}
}
```

## Validation Rules

### Phone Number
- Format: Số điện thoại Việt Nam (10-11 chữ số)
- Regex: `^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$`

### Amount
- Minimum/Maximum: Theo từng nhà mạng từ API
- Type: Number (integer)
- eKYC required: > 200,000 VND

### Required Fields
- `userId`, `username`, `accountNumber`: Từ Redux store
- `phoneNumber`: User input, validated
- `telecomProvider`: Auto-detected hoặc user chọn
- `amount`: User chọn từ denominations hoặc custom
- `pin`: User input

## Error Handling

### API Errors
- **400**: Dữ liệu không hợp lệ → Hiển thị validation message
- **401**: Token hết hạn → Redirect to login
- **403**: Account locked → Hiển thị lock message
- **404**: Không tìm thấy → Generic error message
- **500**: Server error → Retry suggestion

### Business Logic Errors
- Phone number invalid → Validation message
- Amount out of range → Min/max amount message
- Insufficient balance → Balance error message
- Provider unavailable → Try again later message

## Security Features

### eKYC Integration
- Validation cho giao dịch > 200K VND
- Navigate đến EKYC screen nếu chưa xác thực
- Consistent với transfer và savings features

### Face Authentication
- Required cho giao dịch có giá trị cao
- Session-based verification
- Automatic retry mechanism

### PIN Verification
- Required cho tất cả giao dịch
- Server-side validation
- Error handling cho wrong PIN

## Testing Checklist

### API Integration
- [ ] Lấy danh sách nhà mạng thành công
- [ ] Auto-detect nhà mạng hoạt động đúng
- [ ] Nạp tiền thành công với các denomination
- [ ] Nạp tiền với custom amount
- [ ] Face auth flow hoạt động
- [ ] Error handling cho các HTTP status codes

### UI/UX
- [ ] Loading states hiển thị đúng
- [ ] Fee calculation real-time
- [ ] Validation messages rõ ràng
- [ ] Navigation flow smooth
- [ ] Toast notifications hoạt động

### eKYC Integration
- [ ] eKYC validation cho giao dịch > 200K
- [ ] Modal eKYC hiển thị đúng
- [ ] Navigation đến EKYC screen
- [ ] Consistent với các features khác

## Performance Optimizations

### API Calls
- Cache operators list trong session
- Debounce auto-detect operator
- Lazy load transaction history
- Optimize image loading cho operator logos

### UI Performance
- Memoize expensive calculations
- Optimize re-renders với React.memo
- Lazy load modals
- Efficient FlatList rendering

## Future Enhancements

### API Features
1. **Transaction History**: Implement history screen với pagination
2. **Saved Numbers**: Lưu số điện thoại thường dùng
3. **Scheduled Top-up**: Nạp tiền định kỳ
4. **Bulk Top-up**: Nạp nhiều số cùng lúc

### UX Improvements
1. **Quick Actions**: Shortcuts cho số và amount thường dùng
2. **Smart Suggestions**: AI-powered amount suggestions
3. **Offline Support**: Cache data cho offline usage
4. **Push Notifications**: Thông báo transaction status

### Analytics
1. **Usage Tracking**: Track user behavior patterns
2. **Error Analytics**: Monitor API error rates
3. **Performance Metrics**: API response times
4. **Conversion Funnel**: Track completion rates

## Deployment Notes

### Environment Variables
- API endpoints configuration
- Feature flags cho eKYC thresholds
- Error tracking configuration

### Monitoring
- API response time monitoring
- Error rate alerts
- Transaction success rate tracking
- User experience metrics

### Rollback Plan
- Feature flag để disable API integration
- Fallback to mock data nếu cần
- Database rollback procedures
- User communication plan