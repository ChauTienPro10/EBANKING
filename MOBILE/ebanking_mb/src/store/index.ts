import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import transactionReducer from './fetchAPI/TransactionHistory';

export const store = configureStore({
  reducer: {
    app: appReducer,
    transactionHistories: transactionReducer, // đây là key slice transaction
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
