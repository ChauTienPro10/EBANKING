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
}

const initialState: AppState = {
  language: 'vi',
  isLoggedIn: false,
  loginResponse: null,
  accountTransResponse: null,
  userInfoData: null,
  pinStatus: false
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
  },
  extraReducers: (builder) => {
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
  setPinStatus
} = appSlice.actions;

export default appSlice.reducer;