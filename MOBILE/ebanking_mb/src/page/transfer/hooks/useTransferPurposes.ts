import { useState, useEffect } from 'react';
import { TransferPurpose } from '../types/transfer.types';
import { TransferPurposeService } from '../../../services/TransferPurposeService';

export const useTransferPurposes = () => {
  const [purposes, setPurposes] = useState<TransferPurpose[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurposes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransferPurposeService.getTransferPurposes();
      setPurposes(data);
      // Không set error nếu có fallback data
      if (data.length === 0) {
        setError('No purposes available');
      }
    } catch (err) {
      // Service đã handle fallback, nên chỉ log warning
      console.warn('Transfer purposes fetch completed with fallback data');
      setError(null); // Không hiển thị error cho user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurposes();
  }, []);

  return {
    purposes,
    loading,
    error,
    refetch: fetchPurposes,
  };
};