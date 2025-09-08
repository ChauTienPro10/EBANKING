import { DataService, User, Account, QuickAction, Service, MenuItem, SupportOption, SearchResult, Notification } from '../types/data';

export class MockDataService implements DataService {
    private mockUser: User = {
        id: '1',
        name: 'Nguyên Anh',
        email: 'nguyen.anh@example.com',
    };

    private mockAccounts: Account[] = [
        {
            id: '1',
            accountNumber: '1234567890123456',
            accountName: 'Tài khoản thanh toán chính',
            availableBalance: 50000000,
            ledgerBalance: 50000000,
            pendingBalance: 0,
            currency: 'VND',
            cardType: 'primary',
        },
        {
            id: '2',
            accountNumber: '9876543210987654',
            accountName: 'Tài khoản tiết kiệm',
            availableBalance: 100000000,
            ledgerBalance: 100000000,
            pendingBalance: 5000000,
            currency: 'VND',
            cardType: 'savings',
        },
    ];

    private mockQuickActions: QuickAction[] = [
        { id: 'transfer', title: 'Chuyển tiền', icon: 'swap-horizontal', color: '#4CAF50', route: 'transfer' },
        { id: 'withdraw', title: 'Rút tiền', icon: 'cash', color: '#FF9800', route: 'withdraw' },
        { id: 'pay_bill', title: 'Thanh toán hóa đơn', icon: 'receipt', color: '#2196F3', route: 'pay_bill' },
        { id: 'mobile_prepaid', title: 'Nạp điện thoại', icon: 'phone-portrait', color: '#9C27B0', route: 'mobile_prepaid' },
        { id: 'save_online', title: 'Tiết kiệm online', icon: 'trending-up', color: '#FF5722', route: 'save_online' },
        { id: 'loan', title: 'Vay vốn', icon: 'card', color: '#607D8B', route: 'loan' },
    ];

    private mockServices: Service[] = [
        { id: 'shopping', title: 'Mua sắm', icon: 'shopping-bag', color: '#E91E63', route: 'shopping' },
        { id: 'entertainment', title: 'Giải trí', icon: 'game-controller', color: '#3F51B5', route: 'entertainment' },
        { id: 'investment', title: 'Đầu tư', icon: 'trending-up', color: '#4CAF50', route: 'investment' },
        { id: 'insurance', title: 'Bảo hiểm', icon: 'shield', color: '#FF9800', route: 'insurance' },
    ];

    private mockMenuItems: MenuItem[] = [
        { id: 'account_and_card', label: 'Tài khoản & Thẻ', icon: 'card', route: 'account_and_card', category: 'banking' },
        { id: 'transaction_history', label: 'Lịch sử giao dịch', icon: 'time', route: 'transaction_history', category: 'banking' },
        { id: 'beneficiaries', label: 'Người thụ hưởng', icon: 'people', route: 'beneficiaries', category: 'banking' },
        { id: 'loan_management', label: 'Vay vốn', icon: 'card', route: 'loan_management', category: 'banking' },
        { id: 'savings_products', label: 'Sản phẩm tiết kiệm', icon: 'trending-up', route: 'savings_products', category: 'banking' },
        { id: 'investment_products', label: 'Sản phẩm đầu tư', icon: 'bar-chart', route: 'investment_products', category: 'investment' },
        { id: 'insurance_products', label: 'Sản phẩm bảo hiểm', icon: 'shield', route: 'insurance_products', category: 'insurance' },
        { id: 'settings', label: 'Cài đặt', icon: 'settings', route: 'settings', category: 'system' },
        { id: 'help', label: 'Trợ giúp', icon: 'help-circle', route: 'help', category: 'system' },
    ];

    private mockSupportOptions: SupportOption[] = [
        {
            id: 'chat',
            title: 'Chat trực tuyến',
            description: 'Hỗ trợ 24/7 qua chat',
            icon: 'chatbubble',
            color: '#4CAF50',
        },
        {
            id: 'phone',
            title: 'Gọi điện thoại',
            description: 'Hotline: 1900 1234',
            icon: 'call',
            color: '#2196F3',
        },
        {
            id: 'email',
            title: 'Gửi email',
            description: 'support@ebanking.com',
            icon: 'mail',
            color: '#FF9800',
        },
        {
            id: 'faq',
            title: 'Câu hỏi thường gặp',
            description: 'Tìm câu trả lời nhanh',
            icon: 'help-circle',
            color: '#9C27B0',
        },
    ];

    private mockNotifications: Notification[] = [
        {
            id: '1',
            title: 'Giao dịch thành công',
            message: 'Bạn đã chuyển 1,000,000 VND thành công',
            timestamp: new Date(),
            read: false,
        },
        {
            id: '2',
            title: 'Thông báo bảo trì',
            message: 'Hệ thống sẽ bảo trì từ 2:00-4:00 ngày 15/12',
            timestamp: new Date(Date.now() - 3600000),
            read: true,
        },
    ];

    async getUser(): Promise<User> {
        return { ...this.mockUser };
    }

    async getAccounts(): Promise<Account[]> {
        return [...this.mockAccounts];
    }

    async getQuickActions(): Promise<QuickAction[]> {
        return [...this.mockQuickActions];
    }

    async getServices(): Promise<Service[]> {
        return [...this.mockServices];
    }

    async getMenuItems(): Promise<MenuItem[]> {
        return [...this.mockMenuItems];
    }

    async getSupportOptions(): Promise<SupportOption[]> {
        return [...this.mockSupportOptions];
    }

    async search(query: string): Promise<SearchResult[]> {
        const allResults = [
            { id: '1', title: 'Chuyển tiền', category: 'Giao dịch', description: 'Chuyển tiền trong và ngoài ngân hàng' },
            { id: '2', title: 'Rút tiền', category: 'Giao dịch', description: 'Rút tiền tại ATM hoặc chi nhánh' },
            { id: '3', title: 'Thanh toán hóa đơn', category: 'Tiện ích', description: 'Thanh toán điện, nước, internet' },
            { id: '4', title: 'Nạp điện thoại', category: 'Tiện ích', description: 'Nạp tiền điện thoại trả trước' },
        ];

        return allResults.filter(result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.category.toLowerCase().includes(query.toLowerCase())
        );
    }

    async getNotifications(): Promise<Notification[]> {
        return [...this.mockNotifications];
    }

    async authenticate(pin: string): Promise<boolean> {
        return pin === '1234';
    }

    async logout(): Promise<void> {
        // Clear any cached data if needed
    }
}