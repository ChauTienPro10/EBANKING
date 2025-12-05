import { UserInfoModel } from '../UserInfoModel';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

export const fetchUserInfo = createAsyncThunk<
  UserInfoModel,
  number,
  { rejectValue: string }
>('app/fetchUserInfo', async (userId, thunkAPI) => {
  try {
    const URL = API.GET_USER_INFO_FULL.replace('{userId}', String(userId));
    const data = await fetch.get(URL, {}, true);
    return data;
  } catch (error: any) {
    console.error('fetchUserInfo error:', error);
    return thunkAPI.rejectWithValue(
      error.message || 'Lỗi khi lấy thông tin user',
    );
  }
});
