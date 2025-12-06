import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TimeFilter from './TimeFilter';
import AmountFilter from './AmountFilter';
import StatusFilter from './StatusFilter';
import Colors from '../../../../constants/color';
import ToastService from '../../../../components/ToastService';
import {
  FilterState,
  DEFAULT_FILTER_STATE,
  TimePeriodFilter,
  AmountRangeFilter,
  StatusFilter as StatusFilterType,
} from '../../types/filterTypes';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  showAllMonths: boolean;
  onToggleMonths: () => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  showAllMonths,
  onToggleMonths,
  onApplyFilters,
  initialFilters = DEFAULT_FILTER_STATE,
}) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters);

  // Update temp filters when modal opens with initial filters
  useEffect(() => {
    if (visible) {
      setTempFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  const handleSelectTimePeriod = (period: TimePeriodFilter) => {
    setTempFilters(prev => ({
      ...prev,
      timePeriod: period,
    }));
  };

  const handleSelectAmountRange = (range: AmountRangeFilter) => {
    setTempFilters(prev => ({
      ...prev,
      amountRange: range,
    }));
  };

  const handleSelectStatus = (status: StatusFilterType) => {
    setTempFilters(prev => ({
      ...prev,
      status,
    }));
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTER_STATE);
  };

  const handleApply = () => {
    console.log('=== FILTER APPLIED ===');
    console.log('Filter State:', JSON.stringify(tempFilters, null, 2));
    console.log('BE-Ready Format:', {
      timePeriod: {
        label: tempFilters.timePeriod.label,
        startDate: tempFilters.timePeriod.startDate,
        endDate: tempFilters.timePeriod.endDate,
      },
      amountRange: {
        label: tempFilters.amountRange.label,
        minAmount: tempFilters.amountRange.minAmount,
        maxAmount: tempFilters.amountRange.maxAmount,
      },
      status: {
        label: tempFilters.status.label,
        value: tempFilters.status.value,
      },
    });
    console.log('======================');

    // Show success toast
    ToastService.success(
      'Đã áp dụng bộ lọc',
      'Danh sách giao dịch đã được cập nhật',
    );

    onApplyFilters(tempFilters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc lịch sử giao dịch</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <TimeFilter
                showAllMonths={showAllMonths}
                onToggleMonths={onToggleMonths}
                selectedPeriod={tempFilters.timePeriod}
                onSelectPeriod={handleSelectTimePeriod}
              />
              <AmountFilter
                selectedRange={tempFilters.amountRange}
                onSelectRange={handleSelectAmountRange}
              />
              <StatusFilter
                selectedStatus={tempFilters.status}
                onSelectStatus={handleSelectStatus}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModalContainer: {
    maxHeight: '80%',
    zIndex: 10,
  },
  filterModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.main_bule,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.main_bule,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
