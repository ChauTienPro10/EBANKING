import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { TimePeriod } from '../utils/statisticsUtils';
import Colors from '../../../constants/color';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PeriodDropdownProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  weekLabel: string;
  monthLabel: string;
  yearLabel: string;
}

const PeriodDropdown: React.FC<PeriodDropdownProps> = ({
  selectedPeriod,
  onPeriodChange,
  weekLabel,
  monthLabel,
  yearLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const buttonRef = useRef<View>(null);

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'week', label: weekLabel },
    { value: 'month', label: monthLabel },
    { value: 'year', label: yearLabel },
  ];

  const selectedLabel =
    periods.find(p => p.value === selectedPeriod)?.label || monthLabel;

  const handleOpen = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setButtonLayout({ x: pageX, y: pageY, width, height });
      setIsOpen(true);
    });
  };

  const handleSelect = (period: TimePeriod) => {
    onPeriodChange(period);
    setIsOpen(false);
  };

  const screenWidth = Dimensions.get('window').width;
  const menuWidth = screenWidth * 0.5; // Half screen width
  const menuLeft = buttonLayout.x + buttonLayout.width - menuWidth; // Align right edge with button
  const menuTop = buttonLayout.y - 12; // 8px below button

  return (
    <View ref={buttonRef}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownButtonText}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.white} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.dropdownMenu,
              {
                width: menuWidth,
                left: menuLeft,
                top: menuTop,
              },
            ]}
          >
            {periods.map(period => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.menuItem,
                  selectedPeriod === period.value && styles.menuItemActive,
                ]}
                onPress={() => handleSelect(period.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    selectedPeriod === period.value &&
                      styles.menuItemTextActive,
                  ]}
                >
                  {period.label}
                </Text>
                {selectedPeriod === period.value && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Colors.main_bule}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemActive: {
    backgroundColor: Colors.backgroundLight,
  },
  menuItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: Colors.main_bule,
    fontWeight: '600',
  },
});

export default PeriodDropdown;
