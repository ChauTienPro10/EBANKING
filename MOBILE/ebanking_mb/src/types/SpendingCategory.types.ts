// Spending Category Types
export interface SpendingCategory {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CategoryStatistics {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface CreateCategoryRequest {
  name: string;
  code: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

export interface CategoryStatisticsResponse {
  success: boolean;
  statistics: CategoryStatistics[];
  period: 'week' | 'month' | 'year';
  count: number;
}

export interface CategoryResponse {
  success: boolean;
  categories: SpendingCategory[];
  count: number;
}

export interface CategoryCreateResponse {
  success: boolean;
  category: SpendingCategory;
  message: string;
}

export type PeriodType = 'week' | 'month' | 'year';

// Default category colors
export const DEFAULT_CATEGORY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#95E1D3', // Light teal
  '#F38181', // Pink
  '#AA96DA', // Purple
  '#FCBAD3', // Light pink
  '#A8D8EA', // Blue
  '#FFD93D', // Yellow
  '#C7CEEA', // Lavender
  '#6BCF7F', // Green
  '#FF8C42', // Orange
  '#5D5D81', // Dark purple
];

// Default category icons (Ionicon names)
export const DEFAULT_CATEGORY_ICONS = [
  'cart-outline', // Shopping
  'restaurant-outline', // Food
  'game-controller-outline', // Entertainment
  'book-outline', // Education
  'medkit-outline', // Healthcare
  'car-outline', // Transport
  'document-text-outline', // Bills/Documents
  'cafe-outline', // Coffee
  'home-outline', // Home
  'briefcase-outline', // Work
  'airplane-outline', // Travel
  'gift-outline', // Gifts
  'cash-outline', // Money
  'phone-portrait-outline', // Phone
  'barbell-outline', // Fitness
  'pricetag-outline', // Other/Default
];
