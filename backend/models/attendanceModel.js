// backend/models/attendanceModel.js
const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to the User model [cite: 45]
      required: true,
    },
    date: { type: String, required: true }, // Storing as ISO string YYYY-MM-DD for easier filtering [cite: 46]
    checkInTime: { type: Date, required: true }, // [cite: 47]
    checkOutTime: { type: Date }, // [cite: 48]
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'], // [cite: 49]
      default: 'present',
    },
    totalHours: { type: Number, default: 0 }, // [cite: 50]
  },
  {
    timestamps: true, // [cite: 51]
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;