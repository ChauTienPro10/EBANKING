import { useState, useEffect } from 'react';
import { SpendingCategoryService } from '../../../services/SpendingCategoryService';
import { SpendingCategory } from '../../../types/SpendingCategory.types';

export const useSpendingCategories = () => {
  const [categories, setCategories] = useState<SpendingCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SpendingCategoryService.getUserCategories();
      setCategories(data);

      if (data.length === 0) {
        setError('No categories available');
      }
    } catch (err) {
      console.warn('Spending categories fetch failed:', err);
      setError(null); // Don't show error to user, return empty array
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
