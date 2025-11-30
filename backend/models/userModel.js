// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // [cite: 36]
    email: { type: String, required: true, unique: true }, // [cite: 37]
    password: { type: String, required: true }, // [cite: 38]
    role: {
      type: String,
      enum: ['employee', 'manager'], // [cite: 39]
      default: 'employee',
    },
    employeeId: { type: String, required: true, unique: true }, // [cite: 40]
    department: { type: String, required: true }, // [cite: 41]
  },
  {
    timestamps: true, // Automatically adds createdAt [cite: 42]
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper to check password matches
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;