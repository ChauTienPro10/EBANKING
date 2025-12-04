# Tổng hợp các file Admin Dashboard - Frontend eBanking

## 🎯 Các trang Admin (Pages)

### 1. **DashboardPage.tsx** (`src/sections/pages/DashboardPage.tsx`)

- **Mô tả**: Trang tổng quan hiển thị các metrics và biểu đồ thống kê
- **Tính năng**:
  - Hiển thị số lượng customers, accounts, transactions hôm nay
  - Cảnh báo giao dịch đáng ngờ (Suspicious Transactions)
  - Thống kê khoản vay (Approved/Pending/Rejected Loans)
  - Biểu đồ giao dịch 7 ngày gần nhất (Line Chart)
  - Biểu đồ phân bổ loại tài khoản (Pie Chart)
  - Bảng giao dịch gần đây
- **Phân quyền**: Admin, Manager, Staff

### 2. **StaffPage.tsx** (`src/sections/pages/StaffPage.tsx`)

- **Mô tả**: Quản lý nhân viên với đầy đủ CRUD operations
- **Tính năng**:
  - Danh sách nhân viên với phân trang
  - Tìm kiếm và lọc theo role (Admin/Manager/Staff) và status
  - Thêm/Sửa/Xóa nhân viên
  - Export dữ liệu ra CSV
  - Quản lý thông tin: name, email, phone, role, department, status
- **Phân quyền**: Admin, Manager

### 3. **AuditPage.tsx** (`src/sections/pages/AuditPage.tsx`)

- **Mô tả**: Trang nhật ký hoạt động và bảo mật
- **Tính năng**:
  - Hiển thị nhật ký hoạt động của nhân viên
  - Thông tin: thời gian, nhân viên, IP, thiết bị, hành động
- **Phân quyền**: Admin only

### 4. **SettingsPage.tsx** (`src/sections/pages/SettingsPage.tsx`)

- **Mô tả**: Cài đặt hệ thống với nhiều tab
- **Tính năng**:
  - **Tab General**: Tên ứng dụng, chế độ bảo trì
  - **Tab Security**: 2FA, session timeout, max login attempts, password policy, audit log retention
  - **Tab Banking Limits**: Giới hạn chuyển khoản, rút tiền (theo giao dịch và theo ngày)
  - **Tab Notifications**: Email, SMS, Push notifications
  - **Permission Matrix**: Bảng phân quyền chi tiết cho từng module
- **Phân quyền**: Admin only

### 5. **LogsPage.tsx** (`src/sections/pages/LogsPage.tsx`)

- **Mô tả**: Xem và quản lý system logs
- **Phân quyền**: Admin only

### 6. **AccountsPage.tsx** (`src/sections/pages/AccountsPage.tsx`)

- **Mô tả**: Quản lý tài khoản ngân hàng
- **Phân quyền**: Admin, Manager

### 7. **ReportsPage.tsx** (`src/sections/pages/ReportsPage.tsx`)

- **Mô tả**: Báo cáo và thống kê
- **Phân quyền**: Admin, Manager

### 8. **TransactionsPage.tsx** (`src/sections/pages/TransactionsPage.tsx`)

- **Mô tả**: Quản lý giao dịch
- **Phân quyền**: Admin, Manager, Staff

### 9. **CustomersPage.tsx** (`src/sections/pages/CustomersPage.tsx`)

- **Mô tả**: Quản lý khách hàng
- **Phân quyền**: Admin, Manager, Staff

### 10. **LoansPage.tsx** (`src/sections/pages/LoansPage.tsx`)

- **Mô tả**: Quản lý khoản vay
- **Phân quyền**: Admin, Manager, Staff

### 11. **TicketsPage.tsx** (`src/sections/pages/TicketsPage.tsx`)

- **Mô tả**: Quản lý support tickets
- **Phân quyền**: Admin, Manager, Staff

### 12. **LoginPage.tsx** (`src/sections/pages/LoginPage.tsx`)

- **Mô tả**: Trang đăng nhập với OTP verification

---

## 🏗️ Layout & Navigation

### **DashboardLayout.tsx** (`src/sections/layouts/DashboardLayout.tsx`)

- **Mô tả**: Layout chính cho admin dashboard
- **Tính năng**:
  - Sidebar navigation với phân quyền động
  - Header với theme switcher (dark/light mode)
  - Language switcher (VI/EN)
  - Role selector (Admin/Manager/Staff)
  - Avatar và logout button
- **Navigation Items**:
  - Dashboard (All roles)
  - Transactions (All roles)
  - Customers (All roles)
  - Accounts (Admin, Manager)
  - Reports (Admin, Manager)
  - Audit & Security (Admin only)
  - Staff (Admin, Manager)
  - Loans (All roles)
  - Support Tickets (All roles)
  - System Logs (Admin only)
  - Settings (Admin only)

---

## 🧩 Components

### **UI Components** (`src/components/ui/`)

- `avatar.tsx` - Avatar component
- `badge.tsx` - Badge component
- `button.tsx` - Button component
- `card.tsx` - Card component
- `dialog.tsx` - Dialog/Modal component
- `input.tsx` - Input component
- `label.tsx` - Label component
- `select.tsx` - Select dropdown
- `skeleton.tsx` - Loading skeleton
- `switch.tsx` - Toggle switch
- `table.tsx` - Table components
- `tabs.tsx` - Tabs component
- `toast.tsx` - Toast notification

### **Custom Components** (`src/components/`)

- **dialog/**
  - `CRUDModal.tsx` - Modal cho Create/Update operations
  - `DeleteConfirm.tsx` - Modal xác nhận xóa
- **export/**
  - `ExportButton.tsx` - Button export CSV
- **search/**
  - `SearchInput.tsx` - Input tìm kiếm
- **status/**
  - `StatusBadge.tsx` - Badge hiển thị trạng thái
- **table/**
  - `DataTable.tsx` - Bảng dữ liệu với CRUD actions
  - `Pagination.tsx` - Phân trang
- `RealtimeTransactionFeed.tsx` - Feed giao dịch realtime

---

## 🗄️ State Management (Zustand Stores)

### **Stores** (`src/stores/`)

- `useAccountStore.ts` - Quản lý state cho Accounts
- `useCustomerStore.ts` - Quản lý state cho Customers
- `useLoanStore.ts` - Quản lý state cho Loans
- `useLogStore.ts` - Quản lý state cho System Logs
- `useSettingsStore.ts` - Quản lý state cho Settings
- `useStaffStore.ts` - Quản lý state cho Staff
- `useTicketStore.ts` - Quản lý state cho Support Tickets
- `useTransactionStore.ts` - Quản lý state cho Transactions

---

## 🔌 Services (Mock Data)

### **Services** (`src/services/mock/`)

- `accountService.ts` - API mock cho Accounts
- `customerService.ts` - API mock cho Customers
- `loanService.ts` - API mock cho Loans
- `logService.ts` - API mock cho System Logs
- `settingsService.ts` - API mock cho Settings
- `staffService.ts` - API mock cho Staff
- `ticketService.ts` - API mock cho Support Tickets
- `transactionService.ts` - API mock cho Transactions

---

## 📊 Data Files

### **Mock Data** (`src/data/`)

- `accounts.json` - Dữ liệu tài khoản
- `loans.json` - Dữ liệu khoản vay
- `logs.json` - Dữ liệu system logs
- `tickets.json` - Dữ liệu support tickets
- `transactions.json` - Dữ liệu giao dịch
- `users.json` - Dữ liệu người dùng
- `mockRealtimeTransactions.ts` - Dữ liệu giao dịch realtime

---

## 🌐 Internationalization (i18n)

### **i18n** (`src/i18n/`)

- `index.ts` - Cấu hình i18next
- `locales/en.json` - Bản dịch tiếng Anh
- `locales/vi.json` - Bản dịch tiếng Việt

**Các module được hỗ trợ đa ngôn ngữ**:

- App navigation
- Authentication
- Dashboard metrics
- Transactions
- Customers
- Staff
- Settings
- Và các module khác

---

## 🛣️ Routing

### **router.tsx** (`src/router.tsx`)

- Cấu hình routing với React Router v7
- Routes:
  - `/` - Login page
  - `/app` - Dashboard (protected)
  - `/app/transactions` - Transactions page
  - `/app/staff` - Staff management
  - `/app/customers` - Customers page
  - `/app/accounts` - Accounts page
  - `/app/reports` - Reports page
  - `/app/audit` - Audit & Security page
  - `/app/loans` - Loans page
  - `/app/tickets` - Support Tickets page
  - `/app/logs` - System Logs page
  - `/app/settings` - Settings page
  - `*` - 404 Not Found page

---

## 🔐 Phân quyền (Role-Based Access Control)

### **Roles**

1. **Admin** - Toàn quyền truy cập tất cả modules
2. **Manager** - Truy cập hầu hết modules, trừ System Logs, Settings, Audit
3. **Staff** - Truy cập các module cơ bản: Dashboard, Transactions, Customers, Loans, Tickets

### **Permission Matrix** (từ SettingsPage)

| Module           | Admin | Manager | Staff |
| ---------------- | ----- | ------- | ----- |
| Dashboard        | ✓     | ✓       | ✓     |
| Transactions     | ✓     | ✓       | ✓     |
| Customers        | ✓     | ✓       | ✓     |
| Accounts         | ✓     | ✓       | ✗     |
| Reports          | ✓     | ✓       | ✗     |
| Loans            | ✓     | ✓       | ✓     |
| Support Tickets  | ✓     | ✓       | ✓     |
| Staff Management | ✓     | ✓       | ✗     |
| System Logs      | ✓     | ✗       | ✗     |
| Settings         | ✓     | ✗       | ✗     |
| Audit & Security | ✓     | ✗       | ✗     |

---

## 📦 Dependencies chính

### **Core**

- `react` ^19.1.0
- `react-dom` ^19.1.0
- `react-router-dom` ^7.9.5
- `typescript` ~5.8.3

### **UI & Styling**

- `tailwindcss` ^4.1.16
- `lucide-react` ^0.552.0 (Icons)
- `framer-motion` ^11.11.17 (Animations)
- `recharts` ^2.15.0 (Charts)

### **State Management**

- `zustand` ^5.0.8

### **Internationalization**

- `i18next` ^24.0.2
- `react-i18next` ^15.7.4

### **Forms & Validation**

- `react-hook-form` ^7.54.2
- `zod` ^3.24.1

### **Build Tool**

- `vite` ^7.0.4

---

## 🎨 Tính năng nổi bật

1. **Responsive Design** - Hỗ trợ mobile, tablet, desktop
2. **Dark/Light Mode** - Chuyển đổi theme
3. **Multi-language** - Hỗ trợ tiếng Việt và tiếng Anh
4. **Role-based Navigation** - Sidebar tự động ẩn/hiện theo quyền
5. **Real-time Updates** - Realtime transaction feed
6. **Data Export** - Export CSV cho các bảng dữ liệu
7. **Advanced Filtering** - Tìm kiếm và lọc dữ liệu
8. **Pagination** - Phân trang cho danh sách dài
9. **CRUD Operations** - Đầy đủ Create, Read, Update, Delete
10. **Toast Notifications** - Thông báo cho các actions

---

## 📁 Cấu trúc thư mục

```
ebanking-fe/
├── src/
│   ├── components/          # Reusable components
│   │   ├── dialog/         # Modal components
│   │   ├── export/         # Export functionality
│   │   ├── search/         # Search components
│   │   ├── status/         # Status badges
│   │   ├── table/          # Table components
│   │   └── ui/             # UI primitives
│   ├── data/               # Mock data files
│   ├── i18n/               # Internationalization
│   │   └── locales/        # Translation files
│   ├── lib/                # Utilities
│   ├── sections/           # Page sections
│   │   ├── layouts/        # Layout components
│   │   └── pages/          # Page components
│   ├── services/           # API services
│   │   └── mock/           # Mock services
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── router.tsx          # Route configuration
├── public/                 # Static assets
├── package.json            # Dependencies
└── vite.config.ts          # Vite configuration
```

---

## 🚀 Cách sử dụng

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 📝 Ghi chú

- Tất cả các service hiện tại đang sử dụng mock data
- Cần tích hợp với backend API thực tế
- Authentication flow cần được implement đầy đủ
- Cần thêm error handling và loading states tốt hơn
- Cần thêm unit tests và integration tests

---

**Ngày tạo**: 2025-01-27  
**Phiên bản**: 1.0.0  
**Tác giả**: eBanking Development Team
