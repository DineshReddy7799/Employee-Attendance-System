// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// A function to check if a valid token is present in the request header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (it comes in the format 'Bearer <token>')
      token = req.headers.authorization.split(' ')[1];

      // Verify token using the secret key from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (it contains the user ID)
      // We exclude the password field for security
      req.user = await User.findById(decoded.id).select('-password');

      // Proceed to the next middleware or controller function
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


// Middleware to check if user is a manager
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a manager');
  }
};

module.exports = { protect, admin };