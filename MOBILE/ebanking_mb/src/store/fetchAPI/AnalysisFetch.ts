import { createAsyncThunk } from '@reduxjs/toolkit';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import { AnalysisData } from '../AnalysisModel';

// Helpers to handle common error logic could be added here, but following existing pattern.

export const fetchAnalysis30Days = createAsyncThunk<
    AnalysisData,
    void,
    { rejectValue: string }
>('analysis/fetch30Days', async (_, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_30DAYS;
        // Assuming it needs auth (true) and no params
        const data = await fetch.get(URL, {}, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê 30 ngày',
        );
    }
});

export const fetchAnalysisCurrentMonth = createAsyncThunk<
    AnalysisData,
    string, // username
    { rejectValue: string }
>('analysis/fetchCurrentMonth', async (username, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_CURRENT_MONTH.replace('{username}', username);
        const data = await fetch.get(URL, {}, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê tháng hiện tại',
        );
    }
});

export const fetchAnalysisPreviousMonth = createAsyncThunk<
    AnalysisData,
    string, // username
    { rejectValue: string }
>('analysis/fetchPreviousMonth', async (username, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_PREVIOUS_MONTH.replace('{username}', username);
        const data = await fetch.get(URL, {}, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê tháng trước',
        );
    }
});

export const fetchAnalysisCurrentWeek = createAsyncThunk<
    AnalysisData,
    string, // username
    { rejectValue: string }
>('analysis/fetchCurrentWeek', async (username, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_CURRENT_WEEK.replace('{username}', username);
        const data = await fetch.get(URL, {}, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê tuần hiện tại',
        );
    }
});

export const fetchAnalysisPreviousWeek = createAsyncThunk<
    AnalysisData,
    string, // username
    { rejectValue: string }
>('analysis/fetchPreviousWeek', async (username, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_PREVIOUS_WEEK.replace('{username}', username);
        const data = await fetch.get(URL, {}, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê tuần trước',
        );
    }
});

export const fetchAnalysisCustom = createAsyncThunk<
    AnalysisData,
    { username: string;[key: string]: any }, // username + other params
    { rejectValue: string }
>('analysis/fetchCustom', async ({ username, ...params }, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_CUSTOM.replace('{username}', username);
        // Pass remaining params as query params
        const data = await fetch.get(URL, params, true);
        return data;
    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê tùy chỉnh',
        );
    }
});
