// frontend/src/features/attendance/attendanceService.js
import axios from 'axios';

const API_URL = '/api/attendance/';
const DASH_URL = '/api/dashboard/';

// Get User Token
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Helper to set headers
const config = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Check In
const checkIn = async () => {
  const response = await axios.post(API_URL + 'checkin', {}, config());
  return response.data;
};

// Check Out
const checkOut = async () => {
  const response = await axios.post(API_URL + 'checkout', {}, config());
  return response.data;
};

// Get Employee Dashboard Stats
const getEmployeeStats = async () => {
  const response = await axios.get(DASH_URL + 'employee', config());
  return response.data;
};

// Get Manager Dashboard Stats
const getManagerStats = async () => {
  const response = await axios.get(DASH_URL + 'manager', config());
  return response.data;
};

// Get Today's Status (Who is present/absent) - For Manager
const getTodayStatus = async () => {
  const response = await axios.get(API_URL + 'today-status', config());
  return response.data;
};

const attendanceService = {
  checkIn,
  checkOut,
  getEmployeeStats,
  getManagerStats,
  getTodayStatus,
};

export default attendanceService;