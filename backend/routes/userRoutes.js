// backend/routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for new users
router.post('/register', registerUser); // POST /api/auth/register 
router.post('/login', loginUser);       // POST /api/auth/login 

// Private route to get user data (protected by middleware)
router.get('/me', protect, getMe);     // GET /api/auth/me 

module.exports = router;