// backend/routes/dashboardRoutes.js
const express = require('express');
const { getEmployeeStats, getManagerStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Employee Dashboard
router.get('/employee', protect, getEmployeeStats);

// Manager Dashboard
router.get('/manager', protect, admin, getManagerStats);

module.exports = router;