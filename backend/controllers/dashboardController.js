// backend/controllers/dashboardController.js
const asyncHandler = require('express-async-handler');
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

// @desc    Get Employee Dashboard Stats (Includes Recent History)
// @route   GET /api/dashboard/employee
// @access  Private
const getEmployeeStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split('T')[0];

  // 1. Get today's attendance
  const todayAttendance = await Attendance.findOne({ userId, date: today });

  // 2. Calculate monthly stats
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  // Find all records for this month
  const monthlyRecords = await Attendance.find({
    userId,
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const presentDays = monthlyRecords.filter(r => r.status === 'present').length;
  const absentDays = monthlyRecords.filter(r => r.status === 'absent').length;
  const lateDays = monthlyRecords.filter(r => r.status === 'late').length;
  const halfDays = monthlyRecords.filter(r => r.status === 'half-day').length;

  // 3. Get Recent History (Last 7 Records)
  const recentHistory = await Attendance.find({ userId })
    .sort({ date: -1 }) // Newest first
    .limit(7);

  res.json({
    todayStatus: todayAttendance ? todayAttendance.status : 'not-marked',
    checkInTime: todayAttendance ? todayAttendance.checkInTime : null,
    checkOutTime: todayAttendance ? todayAttendance.checkOutTime : null,
    stats: {
      present: presentDays,
      absent: absentDays,
      late: lateDays,
      halfDay: halfDays
    },
    recentHistory // <--- Now included in the response
  });
});

// @desc    Get Manager Dashboard Stats (Includes Charts Data)
// @route   GET /api/dashboard/manager
// @access  Private (Manager only)
const getManagerStats = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Total Employees
  const totalEmployees = await User.countDocuments({ role: 'employee' });

  // 2. Today's Attendance Counts
  const todayRecords = await Attendance.find({ date: today });
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const halfDayCount = todayRecords.filter(r => r.status === 'half-day').length;
  const activeCount = presentCount + lateCount + halfDayCount;
  const absentCount = totalEmployees - activeCount;

  // 3. Department-wise Attendance
  const departmentStats = await User.aggregate([
    { $match: { role: 'employee' } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  // 4. Weekly Attendance Trend (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateString = sevenDaysAgo.toISOString().split('T')[0];

  const weeklyStats = await Attendance.aggregate([
    { $match: { date: { $gte: dateString } } },
    { 
      $group: { 
        _id: '$date', 
        present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        halfDay: { $sum: { $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] } }
      } 
    },
    { $sort: { _id: 1 } } // Sort by date ascending
  ]);

  res.json({
    totalEmployees,
    todayStats: {
      present: presentCount,
      late: lateCount,
      halfDay: halfDayCount,
      absent: absentCount < 0 ? 0 : absentCount
    },
    departmentStats,
    weeklyStats
  });
});

module.exports = { getEmployeeStats, getManagerStats };