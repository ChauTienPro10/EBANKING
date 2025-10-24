// src/store/slices/appSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { AccountTransResponse } from '../AccountTransResponse';
import { fetchAccountTransInfo } from '../fetchAPI/AccountFetch';


interface AppState {
  language: string;
  isLoggedIn: boolean;
  loginResponse: LoginResponse | null;
  accountTransResponse: AccountTransResponse | null
}

const initialState: AppState = {
  language: 'vi',
  isLoggedIn: false,
  loginResponse: null,
  accountTransResponse: null
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
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountTransInfo.fulfilled, (state, action) => {
        state.accountTransResponse = action.payload;
      })
      .addCase(fetchAccountTransInfo.rejected, (state, action) => {
        console.error('[FETCH FAILED]', action.payload);
      });
  },
});

export const {
  setLanguage, 
  setLoginStatus,
  setLoginResponse,
  setAccountTransResponse } = appSlice.actions;
export default appSlice.reducer;
