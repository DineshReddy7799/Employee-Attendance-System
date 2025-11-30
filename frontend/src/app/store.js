import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';

export const store = configureStore({
  reducer: {
    // We will add auth and attendance reducers here later
    auth: authReducer,
    attendance: attendanceReducer,
  },
});