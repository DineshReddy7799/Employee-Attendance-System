// backend/controllers/attendanceController.js
const asyncHandler = require('express-async-handler');
const { Parser } = require('json2csv');
const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

// --- CONSTANTS FOR BUSINESS LOGIC ---
const WORK_START_HOUR = 16; // 10:00 AM
const WORK_START_MINUTE = 0; 
const HALF_DAY_THRESHOLD = 4; // Hours

// @desc    Clock In (Start Day) - with LATE Detection
// @route   POST /api/attendance/checkin
// @access  Private (Logged in users only)
const checkIn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // 1. Check if they already checked in today
  const existingAttendance = await Attendance.findOne({
    userId,
    date: today,
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error('You have already checked in today');
  }

  // 2. Determine Status (Late vs Present)
  let status = 'present';
  
  // Create a "Target Time" for today (e.g., Today at 10:00 AM)
  const workStartTime = new Date();
  workStartTime.setHours(WORK_START_HOUR, WORK_START_MINUTE, 0, 0);

  if (now > workStartTime) {
    status = 'late';
  }

  // 3. Create new record
  const attendance = await Attendance.create({
    userId,
    date: today,
    checkInTime: now,
    status: status, // Saves 'late' or 'present'
  });

  res.status(201).json(attendance);
});

// @desc    Clock Out (End Day) - with HALF-DAY Detection
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split('T')[0];

  // 1. Find today's record for this user
  const attendance = await Attendance.findOne({ userId, date: today });

  if (!attendance) {
    res.status(400);
    throw new Error('You have not checked in today');
  }

  if (attendance.checkOutTime) {
    res.status(400);
    throw new Error('You have already checked out today');
  }

  // 2. Update the record
  attendance.checkOutTime = new Date();

  // 3. Calculate total hours worked
  const diff = attendance.checkOutTime - attendance.checkInTime; 
  const hours = diff / (1000 * 60 * 60);
  
  attendance.totalHours = hours.toFixed(2); // Keep 2 decimal places

  // Debug Log for verification
  console.log(`User worked for: ${hours} hours`);

  // 4. Determine Half-Day Logic
  // If they worked less than 4 hours, mark as half-day
  if (hours < HALF_DAY_THRESHOLD) {
    attendance.status = 'half-day';
  }

  await attendance.save();

  res.status(200).json(attendance);
});

// @desc    Get logged-in user's attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendance = asyncHandler(async (req, res) => {
  // Find all attendance records for this user, sort by newest date first
  const history = await Attendance.find({ userId: req.user._id }).sort({ date: -1 });
  
  res.status(200).json(history);
});

// @desc    Get today's attendance status for the user
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split('T')[0];

  const attendance = await Attendance.findOne({ userId, date: today });

  if (attendance) {
    res.status(200).json(attendance);
  } else {
    // It's okay if there is no record yet (user hasn't checked in)
    res.status(200).json({ status: 'not-checked-in' }); 
  }
});

// @desc    Get all employees' attendance (Manager Only) - FILTERED BY ROLE
// @route   GET /api/attendance/all
// @access  Private (Manager only)
const getAllAttendance = asyncHandler(async (req, res) => {
  const { from, to, employeeId } = req.query;

  let query = {};

  // 1. Filter by Date Range
  if (from && to) {
    query.date = { $gte: from, $lte: to };
  }

  // 2. Filter by Specific Employee ID (if provided)
  if (employeeId && employeeId !== 'all') {
    query.userId = employeeId;
  } else {
    // 3. If "All" is selected, EXCLUDE Managers
    // Find all users who have the role 'employee'
    const employees = await User.find({ role: 'employee' }).select('_id');
    
    // Extract their IDs into an array
    const employeeIds = employees.map(emp => emp._id);

    // Tell the attendance query: "Only look for users in this list"
    query.userId = { $in: employeeIds };
  }

  const attendance = await Attendance.find(query)
    .populate('userId', 'name email employeeId department')
    .sort({ date: -1 });

  res.status(200).json(attendance);
});

// @desc    Export attendance records to CSV
// @route   GET /api/attendance/export
// @access  Private (Manager Only)
const exportAttendance = asyncHandler(async (req, res) => {
  // 1. Get only Employees (exclude managers)
  const employees = await User.find({ role: 'employee' }).select('_id');
  const employeeIds = employees.map(emp => emp._id);

  // 2. Find attendance only for those employees
  const attendance = await Attendance.find({ userId: { $in: employeeIds } })
    .populate('userId', 'name email employeeId department')
    .sort({ date: -1 });

  if (attendance.length === 0) {
    res.status(404);
    throw new Error('No attendance records found to export');
  }

  // 3. Generate CSV
  const fields = ['Employee ID', 'Name', 'Email', 'Department', 'Date', 'Status', 'Check In', 'Check Out', 'Work Hours'];

  const data = attendance
    .filter(record => record.userId != null) // <--- SAFETY CHECK: Remove orphaned records
    .map((record) => {
    // Format time cleanly for Excel
    const formatTime = (date) => {
      if (!date) return '-';
      return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
      });
    };

    return {
      'Employee ID': record.userId?.employeeId || 'N/A',
      'Name': record.userId?.name || 'Unknown',
      'Email': record.userId?.email || 'Unknown',
      'Department': record.userId?.department || 'Unknown',
      'Date': record.date,
      'Status': record.status,
      'Check In': formatTime(record.checkInTime),
      'Check Out': formatTime(record.checkOutTime),
      'Work Hours': record.totalHours || 0
    };
  });

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(data);

  res.header('Content-Type', 'text/csv');
  res.attachment('attendance_report.csv');
  res.send(csv);
});

// @desc    Get a specific employee's attendance (Manager Only)
// @route   GET /api/attendance/employee/:id
// @access  Private (Manager)
const getEmployeeAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ userId: req.params.id })
    .sort({ date: -1 });
  res.status(200).json(attendance);
});

// @desc    Get who is present, absent, late today (Manager Only)
// @route   GET /api/attendance/today-status
// @access  Private (Manager)
const getTodayStatus = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get all employees
  const allEmployees = await User.find({ role: 'employee' }).select('_id name email employeeId department');

  // 2. Get all attendance records for today
  const todayAttendance = await Attendance.find({ date: today }).populate('userId', 'name email employeeId');

  // 3. Separate into lists
  const presentList = todayAttendance
    // <--- SAFETY CHECK ADDED HERE: (record.userId != null)
    .filter(record => 
      (record.status === 'present' || record.status === 'late' || record.status === 'half-day') && 
      record.userId != null
    )
    .map(record => ({
      ...record._doc,
      name: record.userId.name, 
      employeeId: record.userId.employeeId
    }));

  // Find who is absent
  const presentUserIds = todayAttendance
    .filter(record => record.userId != null) // <--- SAFETY CHECK ADDED HERE TOO
    .map(record => record.userId._id.toString());
  
  const absentList = allEmployees
    .filter(emp => !presentUserIds.includes(emp._id.toString()))
    .map(emp => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      employeeId: emp.employeeId,
      status: 'absent'
    }));

  res.status(200).json({
    present: presentList,
    absent: absentList
  });
});

// @desc    Get monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private
const getMySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // 1. Get current YYYY-MM string (e.g., "2023-11")
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Ensures "01", "02", etc.
  const currentMonthPrefix = `${year}-${month}`;

  // 2. Find all records where the date starts with "YYYY-MM"
  const attendance = await Attendance.find({
    userId,
    date: { $regex: `^${currentMonthPrefix}` } 
  });

  console.log(`Found ${attendance.length} records for ${currentMonthPrefix}`);

  // 3. Calculate Stats
  const summary = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    halfDay: attendance.filter(a => a.status === 'half-day').length,
    totalHours: attendance.reduce((acc, curr) => {
      return acc + parseFloat(curr.totalHours || 0);
    }, 0).toFixed(2)
  };

  res.status(200).json(summary);
});

// @desc    Get Team Attendance Summary (Manager Only)
// @route   GET /api/attendance/summary
// @access  Private (Manager)
const getTeamSummary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get Total Employees
  const totalEmployees = await User.countDocuments({ role: 'employee' });

  // 2. Get Today's Records
  const todayAttendance = await Attendance.find({ date: today });

  const presentCount = todayAttendance.filter(r => r.status === 'present').length;
  const lateCount = todayAttendance.filter(r => r.status === 'late').length;
  const halfDayCount = todayAttendance.filter(r => r.status === 'half-day').length;
  
  // Calculate Absent
  const activeCount = presentCount + lateCount + halfDayCount;
  const absentCount = totalEmployees - activeCount;

  res.status(200).json({
    totalEmployees,
    present: presentCount,
    late: lateCount,
    halfDay: halfDayCount,
    absent: absentCount < 0 ? 0 : absentCount
  });
});

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  exportAttendance,
  getEmployeeAttendanceById,
  getTodayStatus,
  getMySummary,
  getTeamSummary 
};