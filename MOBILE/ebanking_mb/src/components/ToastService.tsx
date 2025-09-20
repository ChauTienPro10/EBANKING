// src/services/ToastService.ts
import Toast from 'react-native-toast-message';

const ToastService = {
  success: (title: string, message: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Thành công',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  error: (title: string, message: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Lỗi',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },

  info: (title: string, message: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Thông báo',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },

  hide: () => {
    Toast.hide();
  }
};

export default ToastService;
