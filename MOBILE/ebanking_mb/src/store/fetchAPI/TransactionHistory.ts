import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';

export interface TransferResponse {
  transactionId: number;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  currency: string;
  transactionType: string;
  description: string;
  status: string;
  transactionAt: string;
  balance?: number; // Số dư ví sau giao dịch
}

interface TransactionState {
  data: TransferResponse[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  loadingMore: boolean;
}

const initialState: TransactionState = {
  data: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  loadingMore: false,
};

export const fetchTransactionHistory = createAsyncThunk<
  TransferResponse[],
  { username: string; sender: string; page: number; limit: number },
  { rejectValue: string }
>(
  'transaction/fetchHistory',
  async ({ username, sender, page, limit }, thunkAPI) => {
    try {
      const URL = `${API.GET_TRANSFER_HISTORY}?username=${username}&sender=${sender}&page=${page}&limit=${limit}`;
      const data = await fetch.get(URL, {}, true);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || 'Lỗi lấy lịch sử giao dịch',
      );
    }
  },
);

export const loadMoreTransactions = createAsyncThunk<
  TransferResponse[],
  { username: string; sender: string; page: number; limit: number },
  { rejectValue: string }
>(
  'transaction/loadMore',
  async ({ username, sender, page, limit }, thunkAPI) => {
    try {
      const URL = `${API.GET_TRANSFER_HISTORY}?username=${username}&sender=${sender}&page=${page}&limit=${limit}`;
      const data = await fetch.get(URL, {}, true);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.message || 'Lỗi tải thêm giao dịch',
      );
    }
  },
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTransactionHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionHistory.fulfilled,
        (state, action: PayloadAction<TransferResponse[]>) => {
          state.loading = false;
          state.data = action.payload;
          state.currentPage = 1;
          state.hasMore = action.payload.length >= 20; // Assuming limit is 20
        },
      )
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Lỗi';
      })
      .addCase(loadMoreTransactions.pending, state => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(
        loadMoreTransactions.fulfilled,
        (state, action: PayloadAction<TransferResponse[]>) => {
          state.loadingMore = false;
          state.data = [...state.data, ...action.payload];
          state.currentPage += 1;
          state.hasMore = action.payload.length >= 20; // If less than limit, no more data
        },
      )
      .addCase(loadMoreTransactions.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload || 'Lỗi';
      });
  },
});

export default transactionSlice.reducer;
