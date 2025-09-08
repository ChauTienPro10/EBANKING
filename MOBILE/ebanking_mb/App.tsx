import React from 'react';
import {
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector } from 'react-redux';
import Colors from './src/constants/color';

import { store, RootState } from './src/store';
import { DataProvider } from './src/context/DataContext';
import { createDataService } from './src/services/APIService';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainStack from './src/navigation/MainStack';
import './i18n';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const isLoggedIn = useSelector((state: RootState) => state.app.isLoggedIn);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <NavigationContainer>
        {isLoggedIn ? <MainStack /> : <AuthNavigator />}
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const dataService = createDataService();

  return (
    <Provider store={store}>
      <DataProvider dataService={dataService}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </DataProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.main_bule, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
