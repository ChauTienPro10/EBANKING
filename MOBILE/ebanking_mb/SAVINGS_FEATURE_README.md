# Tính năng Tài khoản Tiết kiệm

## Tổng quan
Hệ thống tài khoản tiết kiệm hoàn chỉnh cho phép người dùng:
- Mở tài khoản tiết kiệm với các kỳ hạn khác nhau dựa trên InterestRate từ backend
- Chuyển tiền giữa tài khoản giao dịch và tài khoản tiết kiệm
- Tạo yêu cầu nạp/rút tiền mặt
- Xem trạng thái xử lý các yêu cầu

## Backend Integration

### Custom Fetch Utility
Hệ thống sử dụng custom fetch utility (`src/utils/fetch.ts`) với các tính năng:
- **Auto Authentication**: Tự động lấy JWT token từ Redux store
- **Error Handling**: Xử lý lỗi 403 và auto logout khi token hết hạn
- **Toast Messages**: Hiển thị thông báo lỗi cho user
- **Logging**: Log requests và responses để debug

### InterestRate Mapping
Frontend đã được cập nhật để tương thích với backend InterestRateController:
- **API Endpoint**: `GET /authService/interest-rates/active`
- **Backend DTO**: `InterestRateDto`
- **Frontend Type**: `SavingsTermType`

#### Mapping Fields:
```typescript
Backend (InterestRateDto) → Frontend (SavingsTermType)
- interestRateId → interestRateId
- termMonths → termMonths  
- annualRate → annualRate
- minAmount → minAmount
- maxAmount → maxAmount (NULL values converted to Number.MAX_SAFE_INTEGER for "no limit")
- status → status
- effectiveFrom → effectiveFrom
- effectiveTo → effectiveTo
- [generated] → name (e.g., "Kỳ hạn 3 tháng")
- [generated] → description (e.g., "Lãi suất 4.5%/năm cho kỳ hạn 3 tháng")
```

#### Special Handling:
- **NULL maxAmount**: When backend returns `null` for `maxAmount`, frontend converts it to `Number.MAX_SAFE_INTEGER` to represent "no limit"
- **UI Display**: Shows "Không giới hạn" instead of a large number when maxAmount is unlimited
- **Validation**: Skips max amount validation when maxAmount represents "no limit"

### SavingsAccount DTO Mapping
Frontend đã được cập nhật để tương thích với backend SavingsAccountDto:
- **API Endpoint**: `GET /authService/savings/account/list/{userId}`
- **Backend DTO**: `SavingsAccountDto`
- **Frontend Type**: `SavingsAccount`

#### Mapping Fields:
```typescript
Backend (SavingsAccountDto) → Frontend (SavingsAccount)
- savingsAccountId → id (converted to string)
- accountNumber → accountNumber
- userId → (not mapped to frontend)
- paymentAccountId → (not mapped to frontend)
- paymentAccountNumber → linkedTransactionAccount
- balance → balance
- currency → currency
- interestRateId → (not mapped to frontend)
- annualRate → interestRate
- termMonths → termMonths
- status → status
- openedDate → openDate
- maturityDate → maturityDate
- closedDate → closedDate (optional)
- totalInterestEarned → totalInterestEarned (optional)
- createdAt → (not mapped to frontend)
- updatedAt → (not mapped to frontend)
- [generated] → accountName (e.g., "Tài khoản tiết kiệm 12 tháng")
```

### Create Savings Account Request
Frontend đã được cập nhật để gửi đúng cấu trúc request theo backend:
```typescript
CreateSavingsAccountRequest {
  userId: number;           // từ Redux state.app.userInfoData.id
  paymentAccountId: number; // từ Redux state.app.accountTransResponse.accountId
  initialAmount: number;    // số tiền gửi ban đầu
  currency: string;         // "VND"
  interestRateId: number;   // từ SavingsTermType được chọn
  termMonths: number;       // từ SavingsTermType được chọn
}
```

### Transfer Request DTO Mapping
Frontend đã được cập nhật để tương thích với backend TransferRequest:
- **API Endpoints**: 
  - `POST /authService/savings/transfer/to-savings`
  - `POST /authService/savings/transfer/from-savings`
- **Backend DTO**: `TransferRequest`
- **Frontend Type**: `SavingsTransfer` (transformed to `TransferRequest`)

#### Mapping Fields:
```typescript
Frontend (SavingsTransfer) → Backend (TransferRequest)
- fromAccount → fromAccountNumber
- toAccount → toAccountNumber
- amount → amount
- note → description (optional)
- type → transferType (mapped):
  - 'TO_SAVINGS' → 'PAYMENT_TO_SAVINGS'
  - 'FROM_SAVINGS' → 'SAVINGS_TO_PAYMENT'
- [added] → userId (from Redux state.app.userInfoData.id)
- [added] → username (from Redux state.app.loginResponse.username)
- [added] → currency ("VND")
```

### Account Balance Refresh
Hệ thống đã được cập nhật để tự động refresh số dư tài khoản thanh toán sau các giao dịch:

#### Khi nào refresh:
- **Tạo tài khoản tiết kiệm mới**: Sau khi tạo thành công, số dư tài khoản thanh toán sẽ được trừ đi số tiền gửi ban đầu
- **Chuyển tiền vào tiết kiệm**: Số dư tài khoản thanh toán giảm
- **Rút tiền từ tiết kiệm**: Số dư tài khoản thanh toán tăng

#### Cách thực hiện:
```typescript
// Sau khi giao dịch thành công
await dispatch(fetchAccountTransInfo(userInfo.id));
```

### CashTransactionRequest DTO Mapping
Frontend đã được cập nhật để tương thích với backend CashTransactionRequest:
- **API Endpoint**: `POST /authService/savings/request/create`
- **Backend DTO**: `CashTransactionRequest`
- **Frontend Type**: `CreateSavingsRequestData` (transformed to `CashTransactionRequest`)

#### Mapping Fields:
```typescript
Frontend (CreateSavingsRequestData) → Backend (CashTransactionRequest)
- savingsAccountId → savingsAccountId (converted to number)
- type → requestType (mapped):
  - 'DEPOSIT' → 'CASH_DEPOSIT'
  - 'WITHDRAW' → 'CASH_WITHDRAWAL'
- amount → amount
- note → description (optional)
- [added] → userId (from Redux state.app.userInfoData.id)
- [added] → username (from Redux state.app.loginResponse.username)
- [added] → currency ("VND")
```

### CashRequestResponse DTO Mapping
Frontend đã được cập nhật để tương thích với backend CashRequestResponseDto:
- **API Endpoints**: 
  - `GET /authService/savings/request/list/{userId}`
  - `GET /authService/savings/request/{requestId}`
- **Backend DTO**: `CashRequestResponseDto`
- **Frontend Type**: `SavingsRequest`

#### Mapping Fields:
```typescript
Backend (CashRequestResponseDto) → Frontend (SavingsRequest)
- requestId → id (converted to string)
- requestNumber → requestNumber
- savingsAccountId → savingsAccountId (converted to string)
- savingsAccountNumber → savingsAccountNumber
- requestType → type (mapped):
  - 'CASH_DEPOSIT' → 'DEPOSIT'
  - 'CASH_WITHDRAWAL' → 'WITHDRAW'
- amount → amount
- requestedAt → requestDate
- status → status
- rejectionReason → reason
- processedAt → processedDate
- processedBy → processedBy
- description → note
```

### Security Features
Hệ thống đã được tăng cường bảo mật với PIN verification hoàn chỉnh:

#### PIN Verification Flow
- **Step 1**: User nhập thông tin giao dịch
- **Step 2**: Hiển thị ConfirmModal để xác nhận thông tin
- **Step 3**: Hiển thị PinInputModal để nhập mã PIN
- **Step 4**: **Backend Validation**: PIN được xác thực với backend qua API `CHECK_PIN`
- **Step 5**: Thực hiện giao dịch chỉ khi PIN đúng

#### PIN Verification API Integration
- **Endpoint**: `POST /authService/pin-code/verify-pincode`
- **Request Body**: `{ username: string, pinCode: string }`
- **Response**: Success (200) nếu PIN đúng, Error nếu PIN sai
- **Service Method**: `SavingsService.verifyPin(username, pin)`

#### Các giao dịch yêu cầu PIN:
- **Tạo tài khoản tiết kiệm**: Xác nhận với PIN trước khi tạo
- **Chuyển tiền vào/từ tiết kiệm**: PIN required cho mọi transfer
- **Tạo yêu cầu nạp/rút tiền mặt**: PIN verification cho cash requests

#### PinInputModal Features:
- **Secure Input**: TextInput với secureTextEntry
- **Backend Validation**: PIN được xác thực với server trước khi thực hiện giao dịch
- **Loading States**: Hiển thị trạng thái "Đang xác thực..." khi validate PIN
- **Error Handling**: Thông báo lỗi rõ ràng khi PIN sai hoặc lỗi kết nối
- **Auto Focus**: Keyboard xuất hiện tự động
- **Security**: PIN được clear sau khi xác thực thành công

#### Error Handling:
- **PIN sai**: "Mã PIN không đúng. Vui lòng kiểm tra lại mã PIN của bạn"
- **Lỗi kết nối**: "Không thể xác thực mã PIN. Vui lòng thử lại"
- **Thiếu thông tin**: "Không tìm thấy thông tin đăng nhập"

#### Usage Example:
```typescript
<PinInputModal
  visible={showPinModal}
  title="Nhập mã PIN"
  message="Vui lòng nhập mã PIN để xác nhận giao dịch"
  onConfirm={() => {
    setShowPinModal(false);
    performTransaction(); // Chỉ được gọi khi PIN đúng
  }}
  onCancel={() => setShowPinModal(false)}
  loading={processing}
/>
```

### UI/UX Improvements
Hệ thống đã được cập nhật để cải thiện trải nghiệm người dùng:

#### Toast Notifications
- **Thay thế Alert**: Tất cả `Alert.alert()` đã được thay thế bằng `Toast` notifications
- **Better UX**: Toast không block UI và tự động biến mất
- **Consistent Design**: Sử dụng `react-native-toast-message` có sẵn trong app

#### ConfirmModal Component
- **Reusable Component**: Tạo `ConfirmModal` component tái sử dụng cho confirmations
- **Modern Design**: UI đẹp hơn với rounded corners, shadows và proper spacing
- **Customizable**: Có thể tùy chỉnh title, message, button text
- **Consistent**: Sử dụng chung design system của app

#### Usage Examples:
```typescript
// Toast for notifications
Toast.show({
  type: 'success',
  text1: 'Thành công',
  text2: 'Tài khoản tiết kiệm đã được tạo thành công',
});

// ConfirmModal for confirmations
<ConfirmModal
  visible={showConfirmModal}
  title="Xác nhận tạo tài khoản"
  message="Bạn có chắc chắn muốn tạo tài khoản tiết kiệm?"
  onConfirm={performAction}
  onCancel={() => setShowConfirmModal(false)}
/>
```

## Cấu trúc Files

### Types
- `src/types/SavingsTypes.ts` - Định nghĩa các types cho savings

### Services
- `src/services/SavingsService.ts` - Service xử lý API calls, sử dụng custom fetch utility
- `src/utils/savingsUtils.ts` - Utility functions cho transform data, validation, formatting
- `src/utils/fetch.ts` - Custom fetch utility với auto authentication và error handling

### Components
- `src/components/savings/SavingsCard.tsx` - Card hiển thị thông tin tài khoản tiết kiệm
- `src/components/savings/RequestCard.tsx` - Card hiển thị thông tin yêu cầu

### Screens
- `src/page/savings/SavingsHomeScreen.tsx` - Màn hình chính, danh sách tài khoản
- `src/page/savings/CreateSavingsAccountScreen.tsx` - Màn hình mở tài khoản mới
- `src/page/savings/SavingsAccountDetailScreen.tsx` - Màn hình chi tiết tài khoản
- `src/page/savings/SavingsTransferScreen.tsx` - Màn hình chuyển tiền
- `src/page/savings/CreateSavingsRequestScreen.tsx` - Màn hình tạo yêu cầu nạp/rút
- `src/page/savings/SavingsRequestListScreen.tsx` - Màn hình danh sách yêu cầu
- `src/page/savings/SavingsRequestDetailScreen.tsx` - Màn hình chi tiết yêu cầu

### Navigation
- Đã cập nhật `src/navigation/types.ts` với các route mới
- Đã cập nhật `src/navigation/MainStack.tsx` với các screen mới

### API Endpoints (cần implement ở backend)
```typescript
// Lấy danh sách lãi suất tiết kiệm đang hoạt động
GET /authService/interest-rates/active

// Tạo tài khoản tiết kiệm mới
POST /authService/savings/account/create

// Lấy danh sách tài khoản tiết kiệm
GET /authService/savings/account/list/{userId}

// Lấy chi tiết tài khoản
GET /authService/savings-accounts/account/{accountNumber}

// Chuyển tiền vào tài khoản tiết kiệm
POST /authService/savings/transfer/to-savings

// Chuyển tiền từ tài khoản tiết kiệm
POST /authService/savings/transfer/from-savings

// Tạo yêu cầu nạp/rút tiền mặt
POST /authService/savings/request/create

// Lấy danh sách yêu cầu
GET /authService/savings/request/list/{userId}

// Lấy chi tiết yêu cầu
GET /authService/savings/request/{requestId}

// Hủy yêu cầu
PUT /authService/savings/request/{requestId}/cancel
```

## Cách sử dụng

### 1. Truy cập tính năng
- Từ màn hình Home, nhấn vào nút "Tiết kiệm" trong Quick Actions
- Hoặc navigate trực tiếp: `navigation.navigate('SavingsHome')`

### 2. Mở tài khoản tiết kiệm
1. Từ SavingsHome, nhấn "Mở tài khoản mới"
2. Nhập tên tài khoản
3. Chọn kỳ hạn gửi tiết kiệm (3, 6, 12, 24 tháng...)
4. Nhập số tiền gửi ban đầu
5. Chọn tự động gia hạn (tùy chọn)
6. Xác nhận tạo tài khoản

### 3. Chuyển tiền
#### Nạp từ tài khoản giao dịch:
1. Vào chi tiết tài khoản tiết kiệm
2. Nhấn "Nạp từ TK giao dịch"
3. Nhập số tiền và ghi chú
4. Xác nhận giao dịch

#### Rút về tài khoản giao dịch:
1. Vào chi tiết tài khoản tiết kiệm
2. Nhấn "Chuyển về TK giao dịch"
3. Nhập số tiền và ghi chú
4. Xác nhận giao dịch

### 4. Tạo yêu cầu nạp/rút tiền mặt
1. Vào chi tiết tài khoản tiết kiệm
2. Nhấn "Yêu cầu nạp tiền mặt" hoặc "Yêu cầu rút tiền mặt"
3. Nhập số tiền và ghi chú
4. Xác nhận tạo yêu cầu
5. Yêu cầu sẽ được xử lý trong 1-2 ngày làm việc

### 5. Xem trạng thái yêu cầu
1. Từ SavingsHome, nhấn "Xem yêu cầu"
2. Lọc theo trạng thái: Tất cả, Chờ duyệt, Đã duyệt, Bị từ chối
3. Nhấn vào yêu cầu để xem chi tiết
4. Có thể hủy yêu cầu đang chờ duyệt

## Tính năng chính

### Tài khoản tiết kiệm
- Hiển thị số dư, lãi suất, kỳ hạn
- Tính toán lãi dự kiến
- Hiển thị ngày đến hạn và số ngày còn lại
- Tự động gia hạn khi đến hạn (nếu được bật)

### Chuyển tiền
- Chuyển tiền nhanh giữa tài khoản giao dịch và tiết kiệm
- Xác nhận trước khi thực hiện
- Hiển thị thông tin chi tiết giao dịch

### Yêu cầu nạp/rút tiền mặt
- Tạo yêu cầu với số tiền và ghi chú
- Theo dõi trạng thái xử lý
- Xem lý do từ chối (nếu có)
- Hủy yêu cầu đang chờ duyệt

## Trạng thái

### Trạng thái tài khoản
- `ACTIVE` - Đang hoạt động
- `MATURED` - Đã đến hạn
- `CLOSED` - Đã đóng

### Trạng thái yêu cầu
- `PENDING` - Đang chờ duyệt
- `APPROVED` - Đã duyệt
- `REJECTED` - Bị từ chối
- `CANCELLED` - Đã hủy

## Validation

### Mở tài khoản
- Tên tài khoản: Bắt buộc, tối đa 50 ký tự
- Kỳ hạn: Bắt buộc phải chọn
- Số tiền: Phải nằm trong khoảng min-max của kỳ hạn

### Chuyển tiền
- Số tiền: Phải > 0
- Rút tiền: Số dư phải đủ

### Yêu cầu nạp/rút
- Số tiền: Tối thiểu 100,000 VND, tối đa 500,000,000 VND
- Ghi chú: Tối đa 500 ký tự

## UI/UX Features
- Pull to refresh trên tất cả danh sách
- Loading states
- Empty states với hướng dẫn
- Error handling với thông báo rõ ràng
- Gradient cards đẹp mắt
- Status badges với màu sắc phân biệt
- Confirmation dialogs trước các hành động quan trọng

## Backend Requirements

Backend cần implement các API endpoints đã liệt kê ở trên với:
- Authentication: Bearer token
- Response format: JSON
- Error handling: HTTP status codes + error messages
- Data validation

### Sample Response Formats

#### Interest Rates (Lãi suất)
```json
[
  {
    "interestRateId": 1,
    "termMonths": 3,
    "minAmount": 1000000,
    "maxAmount": 500000000,
    "annualRate": 4.5,
    "status": "ACTIVE",
    "effectiveFrom": "2024-01-01T00:00:00Z",
    "effectiveTo": "2024-12-31T23:59:59Z"
  }
]
```

#### Savings Account
```json
{
  "id": "acc_123",
  "accountNumber": "9876543210",
  "accountName": "Tiết kiệm mua nhà",
  "balance": 50000000,
  "interestRate": 6.5,
  "termType": {...},
  "termMonths": 12,
  "openDate": "2024-01-01T00:00:00Z",
  "maturityDate": "2025-01-01T00:00:00Z",
  "status": "ACTIVE",
  "autoRenewal": true,
  "linkedTransactionAccount": "1234567890"
}
```

#### Savings Request
```json
{
  "id": "req_456",
  "savingsAccountId": "acc_123",
  "type": "DEPOSIT",
  "amount": 10000000,
  "requestDate": "2024-12-21T10:00:00Z",
  "status": "PENDING",
  "note": "Nạp tiền từ lương tháng 12"
}
```

## Testing Checklist

### ✅ Completed
- [x] Removed unused styles from CreateSavingsAccountScreen (checkbox styles)
- [x] Updated SavingsAccount type to make accountName and autoRenewal optional
- [x] Updated all screens to handle optional accountName with fallback display
- [x] Updated validation functions to remove accountName requirement
- [x] Fixed API constants (removed unused import)
- [x] Added SavingsAccountDto interface for backend mapping
- [x] Created transformSavingsAccountDto utility function
- [x] Updated SavingsService to transform backend DTOs to frontend format
- [x] Enhanced SavingsCard to display totalInterestEarned when available
- [x] Enhanced SavingsAccountDetailScreen with currency and totalInterestEarned fields
- [x] Fixed LinearGradient dependency issues by replacing with regular Views
- [x] Added account balance refresh after creating savings account
- [x] Added account balance refresh after savings transfers
- [x] Updated API endpoint to use accountNumber instead of accountId
- [x] Updated navigation params and all related screens to use accountNumber
- [x] Added TransferRequest DTO interface for backend mapping
- [x] Updated transfer services to map to backend TransferRequest structure
- [x] Added username parameter to transfer requests
- [x] Added CashTransactionRequest DTO interface for cash requests
- [x] Updated cash request service to map to backend CashTransactionRequest structure
- [x] Added CashRequestResponseDto interface and transformation for request responses
- [x] Updated RequestCard component to display backend response data correctly
- [x] Added PIN verification for all savings transactions
- [x] Created PinInputModal component for secure PIN entry
- [x] Replaced all Alert dialogs with Toast notifications and ConfirmModal
- [x] Created reusable ConfirmModal component for confirmations
- [x] **COMPLETED: Added backend PIN verification API integration**
- [x] **COMPLETED: Updated PinInputModal to validate PIN with CHECK_PIN endpoint**
- [x] **COMPLETED: Added proper error handling for incorrect PIN**
- [x] **COMPLETED: Added loading states during PIN verification**
- [x] **COMPLETED: Updated all screens to use new PIN validation flow**
- [x] All TypeScript errors resolved
- [x] All runtime errors resolved

### 🔄 Ready for Testing
- [ ] Mở tài khoản tiết kiệm thành công
- [ ] Validation khi mở tài khoản
- [ ] Hiển thị danh sách tài khoản
- [ ] Xem chi tiết tài khoản
- [ ] Chuyển tiền vào tiết kiệm
- [ ] Rút tiền từ tiết kiệm
- [ ] Tạo yêu cầu nạp tiền mặt
- [ ] Tạo yêu cầu rút tiền mặt
- [ ] Xem danh sách yêu cầu
- [ ] Lọc yêu cầu theo trạng thái
- [ ] Xem chi tiết yêu cầu
- [ ] Hủy yêu cầu đang chờ
- [ ] Pull to refresh
- [ ] Error handling
- [ ] Loading states

## Notes
- Tất cả số tiền được format theo VND
- Ngày tháng được format theo locale vi-VN
- Icon sử dụng DollarSignIcon từ components/icon
- Màu sắc tuân theo Colors constants
- Translation hỗ trợ cả tiếng Việt và tiếng Anh
