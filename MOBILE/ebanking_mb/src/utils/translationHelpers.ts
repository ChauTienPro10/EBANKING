import i18n from 'i18next';

/**
 * Helper functions to translate dynamic text from database
 * These functions detect patterns in Vietnamese text and translate them to English
 */

/**
 * Translate data package names
 * Example: "Gói 4G 1GB/ngày" -> "4G 1GB/day Package"
 */
export const translatePackageName = (vietnameseName: string): string => {
  if (!vietnameseName) return '';

  // If current language is Vietnamese, return as is
  if (i18n.language === 'vi') return vietnameseName;

  // Pattern: "Gói 4G XGB/ngày" -> "4G XGB/day Package"
  let translated = vietnameseName.replace(
    /Gói 4G (.+?)\/ngày/g,
    '4G $1/day Package',
  );

  // Pattern: "Gói 4G XGB/tuần" -> "4G XGB/week Package"
  translated = translated.replace(/Gói 4G (.+?)\/tuần/g, '4G $1/week Package');

  // Pattern: "Gói 4G XGB/tháng" -> "4G XGB/month Package"
  translated = translated.replace(
    /Gói 4G (.+?)\/tháng/g,
    '4G $1/month Package',
  );

  // If no pattern matched, try generic replacement
  if (translated === vietnameseName) {
    translated = vietnameseName
      .replace(/Gói 4G/g, '4G Package')
      .replace(/Gói/g, 'Package');
  }

  return translated;
};

/**
 * Translate data package descriptions
 * Example: "Gói data 4G 1GB sử dụng trong 1 ngày" -> "4G data package 1GB valid for 1 day"
 */
export const translatePackageDescription = (vietnameseDesc: string): string => {
  if (!vietnameseDesc) return '';

  // If current language is Vietnamese, return as is
  if (i18n.language === 'vi') return vietnameseDesc;

  let translated = vietnameseDesc;

  // Replace common patterns
  translated = translated
    .replace(/Gói data 4G/g, '4G data package')
    .replace(/sử dụng trong/g, 'valid for')
    .replace(/(\d+) ngày/g, '$1 day(s)')
    .replace(/(\d+) tuần/g, '$1 week(s)')
    .replace(/(\d+) tháng/g, '$1 month(s)');

  return translated;
};

/**
 * Translate validity period
 * Example: "1 ngày" -> "1 day", "3 ngày" -> "3 days"
 */
export const translateValidity = (vietnameseValidity: string): string => {
  if (!vietnameseValidity) return '';

  // If current language is Vietnamese, return as is
  if (i18n.language === 'vi') return vietnameseValidity;

  let translated = vietnameseValidity;

  // Handle singular/plural
  translated = translated
    .replace(/^1 ngày$/g, '1 day')
    .replace(/(\d+) ngày/g, '$1 days')
    .replace(/^1 tuần$/g, '1 week')
    .replace(/(\d+) tuần/g, '$1 weeks')
    .replace(/^1 tháng$/g, '1 month')
    .replace(/(\d+) tháng/g, '$1 months');

  return translated;
};

/**
 * Generic function to translate any dynamic text with common patterns
 */
export const translateDynamicText = (text: string): string => {
  if (!text) return '';

  // If current language is Vietnamese, return as is
  if (i18n.language === 'vi') return text;

  // Apply all translation patterns
  let translated = text;

  // Common replacements
  const replacements: Record<string, string> = {
    'Gói data 4G': '4G data package',
    'Gói 4G': '4G package',
    Gói: 'Package',
    'sử dụng trong': 'valid for',
    'tốc độ cao': 'high speed',
    'không giới hạn': 'unlimited',
    'băng thông': 'bandwidth',
    ngày: 'day(s)',
    tuần: 'week(s)',
    tháng: 'month(s)',
    // Spending management
    'Quản lý chi tiêu': 'Spending Management',
    'Quản lý danh mục': 'Category Management',
    'Tạo danh mục mới': 'Create New Category',
    'Chỉnh sửa danh mục': 'Edit Category',
    'Xóa danh mục': 'Delete Category',
    'Tên danh mục': 'Category Name',
    'Mã danh mục': 'Category Code',
    'Biểu tượng': 'Icon',
    'Màu sắc': 'Color',
    'Chọn danh mục': 'Select Category',
    'Chưa có danh mục nào': 'No categories yet',
    'Tạo danh mục đầu tiên': 'Create your first category',
    'Phân tích chi tiêu': 'Spending Analysis',
    'Tổng chi tiêu': 'Total Spending',
    'Danh mục chi nhiều nhất': 'Top Spending Category',
    Tuần: 'Week',
    Tháng: 'Month',
    Năm: 'Year',
    'Chưa có dữ liệu chi tiêu': 'No spending data',
    'Bạn có chắc muốn xóa danh mục này?':
      'Are you sure you want to delete this category?',
    'Không thể xóa danh mục mặc định': 'Cannot delete default categories',
    'Đã tạo danh mục thành công': 'Category created successfully',
    'Đã cập nhật danh mục': 'Category updated successfully',
    'Đã xóa danh mục': 'Category deleted successfully',
  };

  Object.entries(replacements).forEach(([vi, en]) => {
    translated = translated.replace(new RegExp(vi, 'g'), en);
  });

  return translated;
};
