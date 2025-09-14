// src/store/slices/appSlice.js
import { createSlice } from '@reduxjs/toolkit';


interface AppState {
  language: string;
  isLoggedIn: boolean;
  loginResponse: LoginResponse | null;
}

const initialState: AppState = {
  language: 'vi',
  isLoggedIn: false,
  loginResponse: null,
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
  },
});

export const { setLanguage, setLoginStatus, setLoginResponse } = appSlice.actions;
export default appSlice.reducer;
