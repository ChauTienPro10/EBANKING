import { AccountTransResponse } from "../AccountTransResponse";
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import fetch from "../../utils/fetch";
import { API } from "../../constants/api";

export const fetchAccountTransInfo = createAsyncThunk<
  AccountTransResponse,
  number,
  { rejectValue: string }
>(
  'app/fetchAccountTransInfo',
  async (userId, thunkAPI) => {
    try {
      const URL = API.GET_ACCOUNT_TRANS_INFO + userId
      const data = await fetch.get(URL, {}, true); 
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Lỗi khi lấy thông tin tài khoản');
    }
  }
);