import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountTransResponse } from '../AccountTransResponse';
import { fetchAccountTransInfo } from '../fetchAPI/AccountFetch';
import { UserInfoModel } from '../UserInfoModel';
import { fetchUserInfo } from '../fetchAPI/UserInfoFetch';

interface AppState {
  language: string;
  isLoggedIn: boolean;
  loginResponse: LoginResponse | null;
  accountTransResponse: AccountTransResponse | null;
  userInfoData: UserInfoModel | null;
  pinStatus: boolean | null;
  modalDismissalSession: {
    onboardingDismissed: boolean;
    pinReminderDismissed: boolean;
    lastPinAction: 'create' | 'delete' | null;
    lastPinActionTime: number | null;
  };
  cardStatus: 'active' | 'locked';
  notificationCount: number;
}

const initialState: AppState = {
  language: 'vi',
  isLoggedIn: false,
  loginResponse: null,
  accountTransResponse: null,
  userInfoData: null,
  pinStatus: false,
  modalDismissalSession: {
    onboardingDismissed: false,
    pinReminderDismissed: false,
    lastPinAction: null,
    lastPinActionTime: null,
  },
  cardStatus: 'active',
  notificationCount: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setLoginStatus: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setLoginResponse: (state, action) => {
      state.loginResponse = action.payload;
    },
    setAccountTransResponse: (state, action) => {
      state.accountTransResponse = action.payload;
    },
    setUserInfoData: (state, action) => {
      state.userInfoData = action.payload;
    },
    setPinStatus: (state, action: PayloadAction<boolean>) => {
      state.pinStatus = action.payload;
    },
    setOnboardingDismissed: (state, action: PayloadAction<boolean>) => {
      state.modalDismissalSession.onboardingDismissed = action.payload;
    },
    setPinReminderDismissed: (state, action: PayloadAction<boolean>) => {
      state.modalDismissalSession.pinReminderDismissed = action.payload;
    },
    setPinAction: (
      state,
      action: PayloadAction<'create' | 'delete' | null>,
    ) => {
      state.modalDismissalSession.lastPinAction = action.payload;
      state.modalDismissalSession.lastPinActionTime = action.payload
        ? Date.now()
        : null;

      // Reset dismissal flags when PIN action occurs
      if (action.payload) {
        state.modalDismissalSession.onboardingDismissed = false;
        state.modalDismissalSession.pinReminderDismissed = false;
      }
    },
    resetModalSession: state => {
      state.modalDismissalSession = {
        onboardingDismissed: false,
        pinReminderDismissed: false,
        lastPinAction: null,
        lastPinActionTime: null,
      };
    },
    setCardStatus: (state, action: PayloadAction<'active' | 'locked'>) => {
      state.cardStatus = action.payload;
    },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload;
    },
    clearNotifications: state => {
      state.notificationCount = 0;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.loginResponse = null;
      state.accountTransResponse = null;
      state.userInfoData = null;
      state.pinStatus = false;
      state.cardStatus = 'active';
      state.notificationCount = 0;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAccountTransInfo.fulfilled, (state, action) => {
        state.accountTransResponse = action.payload;
      })
      .addCase(fetchAccountTransInfo.rejected, (state, action) => {
        console.error('[FETCH FAILED]', action.payload);
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userInfoData = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        console.error('[FETCH FAILED]', action.payload);
      });
  },
});

export const {
  setLanguage,
  setLoginStatus,
  setLoginResponse,
  setAccountTransResponse,
  setUserInfoData,
  setPinStatus,
  setOnboardingDismissed,
  setPinReminderDismissed,
  setPinAction,
  resetModalSession,
  setCardStatus,
  setNotificationCount,
  clearNotifications,
  logout,
} = appSlice.actions;

export default appSlice.reducer;
