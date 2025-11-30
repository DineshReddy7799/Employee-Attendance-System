// frontend/src/features/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from './attendanceService';

const initialState = {
  stats: null,        // Holds dashboard numbers
  todayStatus: null,  // Holds list of present/absent (Manager only)
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Check In
export const checkIn = createAsyncThunk('attendance/checkIn', async (_, thunkAPI) => {
  try {
    return await attendanceService.checkIn();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Check Out
export const checkOut = createAsyncThunk('attendance/checkOut', async (_, thunkAPI) => {
  try {
    return await attendanceService.checkOut();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get Employee Stats
export const getEmployeeStats = createAsyncThunk('attendance/getEmployeeStats', async (_, thunkAPI) => {
  try {
    return await attendanceService.getEmployeeStats();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get Manager Stats
export const getManagerStats = createAsyncThunk('attendance/getManagerStats', async (_, thunkAPI) => {
  try {
    return await attendanceService.getManagerStats();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Get Today Status (Manager)
export const getTodayStatus = createAsyncThunk('attendance/getTodayStatus', async (_, thunkAPI) => {
  try {
    return await attendanceService.getTodayStatus();
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Check In
      .addCase(checkIn.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Checked In Successfully!';
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Check Out
      .addCase(checkOut.fulfilled, (state) => {
        state.isSuccess = true;
        state.message = 'Checked Out Successfully!';
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Employee Stats
      .addCase(getEmployeeStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEmployeeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      // Manager Stats
      .addCase(getManagerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getManagerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      // Today Status List
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload;
      });
  },
});

export const { reset } = attendanceSlice.actions;
export default attendanceSlice.reducer;