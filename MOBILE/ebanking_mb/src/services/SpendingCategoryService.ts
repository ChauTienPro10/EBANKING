import { API } from '../constants/api';
import fetch from '../utils/fetch';
import {
  SpendingCategory,
  CategoryStatistics,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PeriodType,
} from '../types/SpendingCategory.types';

export class SpendingCategoryService {
  /**
   * Get userId from Redux store
   */
  private static async getUserId(): Promise<string> {
    const { store } = await import('../store');
    const state = store.getState();
    const userId = state.app.loginResponse?.id;
    return userId ? userId.toString() : '';
  }

  /**
   * Get all categories for the current user
   * Auto-initializes default categories if user has none
   */
  static async getUserCategories(): Promise<SpendingCategory[]> {
    try {
      const userId = await this.getUserId();
      const url = API.GET_SPENDING_CATEGORIES.replace('{userId}', userId);
      const response = await fetch.get(url, {}, true);

      if (response && response.categories) {
        // If user has no categories, initialize defaults automatically
        if (response.categories.length === 0) {
          console.log('No categories found for user, initializing defaults...');

          try {
            await this.initializeDefaultCategories();
            console.log('Default categories initialized, fetching again...');

            // Fetch again after initialization
            const retryResponse = await fetch.get(url, {}, true);
            return retryResponse?.categories || [];
          } catch (initError) {
            console.error(
              'Failed to initialize default categories:',
              initError,
            );
            // Return empty array if initialization fails
            return [];
          }
        }

        return response.categories;
      }

      // Return empty array if no categories
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(
    request: CreateCategoryRequest,
  ): Promise<SpendingCategory> {
    const userId = await this.getUserId();
    const url = API.CREATE_SPENDING_CATEGORY.replace('{userId}', userId);
    const response = await fetch.post(url, request, true);

    if (response && response.category) {
      return response.category;
    }

    throw new Error(response?.message || 'Failed to create category');
  }

  /**
   * Update an existing category
   */
  static async updateCategory(
    categoryId: string,
    request: UpdateCategoryRequest,
  ): Promise<SpendingCategory> {
    const userId = await this.getUserId();
    const url = API.UPDATE_SPENDING_CATEGORY.replace(
      '{userId}',
      userId,
    ).replace('{categoryId}', categoryId);
    const response = await fetch.put(url, request, true);

    if (response && response.category) {
      return response.category;
    }

    throw new Error(response?.message || 'Failed to update category');
  }

  /**
   * Delete a category (soft delete)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    const userId = await this.getUserId();
    const url = API.DELETE_SPENDING_CATEGORY.replace(
      '{userId}',
      userId,
    ).replace('{categoryId}', categoryId);

    // Using native fetch for DELETE since fetch util doesn't have delete method
    const token = await this.getAuthToken();
    const response = await globalThis.fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.message || 'Failed to delete category');
    }
  }

  /**
   * Initialize default categories for the current user
   */
  static async initializeDefaultCategories(): Promise<void> {
    const userId = await this.getUserId();
    const url = API.INITIALIZE_CATEGORIES.replace('{userId}', userId);
    const response = await fetch.post(url, {}, true);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to initialize categories');
    }
  }

  /**
   * Get category statistics for pie chart
   * Auto-initializes categories if user has none
   */
  static async getCategoryStatistics(
    period: PeriodType = 'month',
  ): Promise<CategoryStatistics[]> {
    try {
      const userId = await this.getUserId();
      const url = API.GET_CATEGORY_STATISTICS.replace('{userId}', userId);
      const response = await fetch.get(url, { period }, true);

      if (response && response.statistics) {
        return response.statistics;
      }

      // If no statistics, might be because user has no categories
      // Try to initialize and fetch again
      const categories = await this.getUserCategories();
      if (categories.length > 0) {
        // Retry statistics fetch
        const retryResponse = await fetch.get(url, { period }, true);
        return retryResponse?.statistics || [];
      }

      // Return empty array if no statistics
      return [];
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Helper method to get auth token from store
   */
  private static async getAuthToken(): Promise<string> {
    const { store } = await import('../store');
    const state = store.getState();
    return state.app.loginResponse?.jwt || '';
  }

  /**
   * Validate category code format
   */
  static validateCategoryCode(code: string): boolean {
    const codeRegex = /^[A-Z_]+$/;
    return codeRegex.test(code);
  }

  /**
   * Validate color format
   */
  static validateColor(color: string): boolean {
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    return colorRegex.test(color);
  }

  /**
   * Generate category code from name
   */
  static generateCategoryCode(name: string): string {
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove Vietnamese accents
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
}
