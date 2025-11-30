// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/userModel');
const connectDB = require('./backend/config/db');

// Load env vars
dotenv.config({ path: './backend/.env' });

// Connect to DB
connectDB();

const importData = async () => {
  try {
    // 1. Wipe existing data
    await User.deleteMany();

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt); // Default password

    // 3. Create Sample Users
    const users = [
      {
        name: 'Manager User',
        email: 'manager@test.com',
        password: hashedPassword,
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Management'
      },
      {
        name: 'John Doe',
        email: 'john@test.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP001',
        department: 'IT'
      },
      {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP002',
        department: 'HR'
      },
      {
        name: 'Mike Ross',
        email: 'mike@test.com',
        password: hashedPassword,
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Sales'
      }
    ];

    // 4. Insert into DB
    await User.insertMany(users);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // Add logic to destroy data if needed (optional)
  process.exit();
} else {
  importData();
}