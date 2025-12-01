import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../../../constants/color';
import ProgressHeader from '../shared/ProgressHeader';

interface PermissionViewProps {
  onRequestPermission: () => void;
}

const PermissionView: React.FC<PermissionViewProps> = ({
  onRequestPermission,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ProgressHeader currentStep={1} />
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Cần quyền truy cập Camera để sử dụng tính năng eKYC
        </Text>
        <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
          <Text style={styles.buttonText}>Cấp quyền Camera</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    padding: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.main_bule,
    borderRadius: 8,
    margin: 16,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PermissionView;
