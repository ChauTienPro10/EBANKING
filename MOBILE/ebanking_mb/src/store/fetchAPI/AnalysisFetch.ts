import { createAsyncThunk } from '@reduxjs/toolkit';
import fetch from '../../utils/fetch';
import { API } from '../../constants/api';
import { AnalysisData } from '../AnalysisModel';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to get Monday of the current week
const getMonday = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0); // normalize time
    return monday;
};

const emptyAnalysisData: AnalysisData = {
    totalAmountInPeriodByUsername: 0,
    transactionLargestInPeriodByUsername: null,
    mostAccountInfoTransferManyTimeInPeriod: null,
    transferHasAmountLargestInPeriod: 0,
    accountHasBeenTransferWithTheMostAmountInPeriod: 0,
    midnightTransactionsCount: 0,
    frequentTransactionsToSameAccountCount: 0,
    transactionCountInPeriodByUsername: 0,
    mostAccountInfoTransferManyTimeInPeriodCount: 0,
    mostAccountInfoTransferManyTimeInPeriodTotalAmount: 0
};

export const fetchAnalysis30Days = createAsyncThunk<
    AnalysisData,
    string,
    { rejectValue: string }
>('analysis/fetch30Days', async (username, thunkAPI) => {
    try {
        const URL = API.ANALYSIS_GET_30DAYS;
        // Assuming it needs auth (true) and no params
        const data = await fetch.post(URL, { userId: username }, true);
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

export const fetchAnalysisWeeklyStats = createAsyncThunk<
    AnalysisData[], // Return array of 7 days
    string, // username
    { rejectValue: string }
>('analysis/fetchWeeklyStats', async (username, thunkAPI) => {
    try {
        const today = new Date();
        const todayStr = formatDate(today);
        const monday = getMonday(today);

        const promises = [];

        // Loop from Monday (0) to Sunday (6)
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const currentDayStr = formatDate(currentDay);

            // If day is past or today
            if (currentDayStr <= todayStr) {
                const URL = API.ANALYSIS_GET_CUSTOM.replace('{username}', username);

                const endOfDay = new Date(currentDay);
                endOfDay.setHours(23, 59, 59, 999);

                // Fetch specifically for this day (params are timestamps)
                promises.push(
                    fetch.get(URL, { fromDate: currentDay.getTime(), toDate: endOfDay.getTime() }, true)
                        .then((data) => ({ ...data, date: currentDayStr }))
                        .catch((err) => {
                            console.error(`Error fetching for ${currentDayStr}:`, err);
                            return emptyAnalysisData;
                        })
                );
            } else {
                // Future days: empty data
                promises.push(Promise.resolve({ ...emptyAnalysisData }));
            }
        }

        const results = await Promise.all(promises);
        return results;

    } catch (error: any) {
        return thunkAPI.rejectWithValue(
            error.message || 'Lỗi khi lấy thống kê các ngày trong tuần',
        );
    }
});
