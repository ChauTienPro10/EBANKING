# Tính năng Nạp tiền điện thoại

## Tổng quan
Tính năng nạp tiền điện thoại cho phép người dùng nạp tiền nhanh chóng cho các thuê bao di động của các nhà mạng tại Việt Nam.

## Các tính năng chính

### 1. Nhận diện nhà mạng tự động
- Tự động nhận diện nhà mạng dựa trên đầu số điện thoại
- Hỗ trợ các nhà mạng: Viettel, VinaPhone, MobiFone, Vietnamobile

### 2. Đa dạng gói nạp
- **Gói thoại**: Nạp tiền truyền thống với khuyến mãi
- **Gói data**: Gói cước data 3G/4G
- **Gói combo**: Kết hợp data + phút gọi

### 3. Giao diện thân thiện
- Thiết kế hiện đại, dễ sử dụng
- Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
- Lưu số điện thoại gần đây

### 4. Bảo mật cao
- Xác thực bằng mã PIN 4 số
- Yêu cầu eKYC trước khi giao dịch
- Mã hóa thông tin giao dịch

## Cấu trúc file

### Services
- `src/services/MobilePrepaidService.ts`: Service xử lý API nạp tiền điện thoại

### Screens
- `src/page/mobile-prepaid/MobilePrepaidScreen.tsx`: Màn hình chính nạp tiền
- `src/page/mobile-prepaid/MobilePrepaidConfirmScreen.tsx`: Màn hình xác nhận giao dịch
- `src/page/mobile-prepaid/MobilePrepaidResultScreen.tsx`: Màn hình kết quả giao dịch

### Components
- `src/components/PinModal.tsx`: Modal nhập mã PIN

### Navigation
- Đã cập nhật `src/navigation/types.ts` và `src/navigation/MainStack.tsx`

### Localization
- Đã thêm text tiếng Việt và tiếng Anh vào `locales/vi.json` và `locales/en.json`

## Cách sử dụng

### 1. Truy cập tính năng
- Từ trang chủ, nhấn vào "Nạp tiền điện thoại" trong phần Quick Actions
- Hoặc từ menu chính

### 2. Nhập thông tin
1. Nhập số điện thoại cần nạp tiền
2. Hệ thống sẽ tự động nhận diện nhà mạng
3. Chọn gói nạp phù hợp
4. Kiểm tra thông tin và nhấn "Xác nhận nạp tiền"

### 3. Xác nhận giao dịch
1. Kiểm tra lại thông tin giao dịch
2. Nhập mã PIN 4 số để xác nhận
3. Chờ hệ thống xử lý

### 4. Nhận kết quả
- Thành công: Hiển thị thông tin giao dịch và mã giao dịch
- Thất bại: Hiển thị lỗi và hướng dẫn khắc phục

## Yêu cầu hệ thống

### Điều kiện tiên quyết
1. **eKYC**: Người dùng phải hoàn thành xác thực eKYC
2. **PIN**: Phải thiết lập mã PIN 4 số
3. **Tài khoản**: Phải có tài khoản ngân hàng với số dư đủ

### Hạn mức giao dịch
- Tối thiểu: 10.000 VND
- Tối đa: 500.000 VND/giao dịch
- Miễn phí giao dịch

## API Mock Data

### Nhà mạng hỗ trợ
```typescript
const operators = [
  {
    id: 'viettel',
    name: 'Viettel',
    prefixes: ['086', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039']
  },
  {
    id: 'vinaphone', 
    name: 'VinaPhone',
    prefixes: ['088', '091', '094', '083', '084', '085', '081', '082']
  },
  // ...
];
```

### Gói nạp mẫu
```typescript
const packages = [
  {
    id: 'vtt_50k',
    operatorId: 'viettel',
    amount: 50000,
    bonus: 7000,
    description: 'Nạp tiền 50.000đ + 7.000đ KM',
    validity: '30 ngày',
    type: 'call'
  },
  // ...
];
```

## Tính năng mở rộng

### Có thể phát triển thêm
1. **Lịch sử giao dịch**: Xem lại các giao dịch nạp tiền đã thực hiện
2. **Nạp tiền định kỳ**: Thiết lập nạp tiền tự động hàng tháng
3. **Chia sẻ gói cước**: Chia sẻ data/phút gọi cho người thân
4. **Thông báo khuyến mãi**: Nhận thông báo về các gói ưu đãi mới
5. **Tích hợp API thật**: Kết nối với API của các nhà mạng

### Cải tiến UI/UX
1. **Giao diện dark mode**: Hỗ trợ chế độ tối
2. **Biểu đồ thống kê**: Thống kê chi tiêu nạp tiền theo tháng
3. **Widget nhanh**: Widget nạp tiền nhanh trên màn hình chính
4. **Voice command**: Nạp tiền bằng giọng nói

## Lưu ý kỹ thuật

### Performance
- Sử dụng lazy loading cho danh sách gói cước
- Cache thông tin nhà mạng để giảm thời gian tải
- Optimize hình ảnh logo nhà mạng

### Security
- Validate input ở cả client và server
- Encrypt thông tin giao dịch
- Log tất cả giao dịch để audit

### Testing
- Unit test cho MobilePrepaidService
- Integration test cho flow nạp tiền
- E2E test cho các scenario chính

## Troubleshooting

### Lỗi thường gặp
1. **Không nhận diện được nhà mạng**: Kiểm tra đầu số điện thoại
2. **Giao dịch thất bại**: Kiểm tra số dư tài khoản và kết nối mạng
3. **Không hiển thị gói cước**: Refresh lại màn hình hoặc chọn lại nhà mạng

### Debug
- Kiểm tra console log trong development mode
- Sử dụng React Native Debugger để trace API calls
- Kiểm tra network requests trong Chrome DevTools

## Kết luận

Tính năng nạp tiền điện thoại đã được tích hợp hoàn chỉnh vào ứng dụng eBanking với đầy đủ các tính năng cơ bản và giao diện thân thiện. Tính năng này giúp người dùng nạp tiền nhanh chóng, an toàn và tiện lợi ngay trong ứng dụng ngân hàng.