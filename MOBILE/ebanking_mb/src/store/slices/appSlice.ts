import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountTransResponse } from '../AccountTransResponse';
import { fetchAccountTransInfo } from '../fetchAPI/AccountFetch';
import { UserInfoModel } from '../UserInfoModel';
import { fetchUserInfo } from '../fetchAPI/UserInfoFetch';
import { AnalysisData } from '../AnalysisModel';
import {
  fetchAnalysis30Days,
  fetchAnalysisCurrentMonth,
  fetchAnalysisPreviousMonth,
  fetchAnalysisCurrentWeek,
  fetchAnalysisPreviousWeek,
  fetchAnalysisCustom,
  fetchAnalysisWeeklyStats,
} from '../fetchAPI/AnalysisFetch';

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
  analysis30Days: AnalysisData | null;
  analysisCurrentMonth: AnalysisData | null;
  analysisPreviousMonth: AnalysisData | null;
  analysisCurrentWeek: AnalysisData | null;
  analysisPreviousWeek: AnalysisData | null;
  analysisCustom: AnalysisData | null;
  analysisWeeklyStats: AnalysisData[] | null;
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
  analysis30Days: null,
  analysisCurrentMonth: null,
  analysisPreviousMonth: null,
  analysisCurrentWeek: null,
  analysisPreviousWeek: null,
  analysisCustom: null,
  analysisWeeklyStats: null,
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
    setPinActionTimestamp: (state, action: PayloadAction<number>) => {
      state.modalDismissalSession.lastPinActionTime = action.payload;
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
      state.analysis30Days = null;
      state.analysisCurrentMonth = null;
      state.analysisPreviousMonth = null;
      state.analysisCurrentWeek = null;
      state.analysisPreviousWeek = null;
      state.analysisCustom = null;
      state.analysisWeeklyStats = null;
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
      })
      .addCase(fetchAnalysis30Days.fulfilled, (state, action) => {
        state.analysis30Days = action.payload;
      })
      .addCase(fetchAnalysis30Days.rejected, (state, action) => {
        console.error('[FETCH FAILED] Analysis30Days', action.payload);
      })
      .addCase(fetchAnalysisCurrentMonth.fulfilled, (state, action) => {
        state.analysisCurrentMonth = action.payload;
      })
      .addCase(fetchAnalysisCurrentMonth.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisCurrentMonth', action.payload);
      })
      .addCase(fetchAnalysisPreviousMonth.fulfilled, (state, action) => {
        state.analysisPreviousMonth = action.payload;
      })
      .addCase(fetchAnalysisPreviousMonth.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisPreviousMonth', action.payload);
      })
      .addCase(fetchAnalysisCurrentWeek.fulfilled, (state, action) => {
        state.analysisCurrentWeek = action.payload;
      })
      .addCase(fetchAnalysisCurrentWeek.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisCurrentWeek', action.payload);
      })
      .addCase(fetchAnalysisPreviousWeek.fulfilled, (state, action) => {
        state.analysisPreviousWeek = action.payload;
      })
      .addCase(fetchAnalysisPreviousWeek.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisPreviousWeek', action.payload);
      })
      .addCase(fetchAnalysisCustom.fulfilled, (state, action) => {
        state.analysisCustom = action.payload;
      })
      .addCase(fetchAnalysisCustom.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisCustom', action.payload);
      })
      .addCase(fetchAnalysisWeeklyStats.fulfilled, (state, action) => {
        state.analysisWeeklyStats = action.payload;
      })
      .addCase(fetchAnalysisWeeklyStats.rejected, (state, action) => {
        console.error('[FETCH FAILED] AnalysisWeeklyStats', action.payload);
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
  setPinActionTimestamp,
  resetModalSession,
  setCardStatus,
  setNotificationCount,
  clearNotifications,
  logout,
} = appSlice.actions;

export default appSlice.reducer;
