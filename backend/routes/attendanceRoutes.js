// backend/routes/attendanceRoutes.js
const express = require('express');
const { 
  checkIn, 
  checkOut, 
  getMyAttendance, 
  getTodayAttendance,
  getAllAttendance, 
  exportAttendance,
  getEmployeeAttendanceById, 
  getTodayStatus,
  getMySummary
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee Routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/my-history', protect, getMyAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/my-summary', protect, getMySummary);

// Manager Route
router.get('/all', protect, admin, getAllAttendance); 
router.get('/export', protect, admin, exportAttendance);
router.get('/today-status', protect, admin, getTodayStatus); 
router.get('/employee/:id', protect, admin, getEmployeeAttendanceById);

module.exports = router;