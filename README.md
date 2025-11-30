Name : C.Dinesh Reddy

College Name : Srinivasa Ramanujan Institute of Technology

Contact Number : 7815857033

Default Login Credentials(Manager):

Username : manager@test.com

Password : 123456

# 🏢 Employee Attendance System (MERN Stack)

A professional, full-stack Employee Attendance Management System built with the MERN stack (MongoDB, Express, React, Node.js). This application features role-based access control (RBAC), smart attendance tracking logic, and advanced reporting for managers.

---

## 🚀 Features

### 👨‍💼 Employee Features
- **Secure Login:** JWT-based authentication.
- **Smart Check-In/Out:**
  - Automatically detects **Late** arrivals (after 10:00 AM).
  - Automatically marks **Half-days** (work duration < 4 hours).
- **Dashboard:** Real-time overview of attendance stats (Present, Absent, Late).
- **History Calendar:** Visual calendar view with color-coded status pills.
- **Monthly Summary:** Detailed breakdown of work hours and attendance.

### 👔 Manager Features
- **Team Overview:** High-level dashboard with Total Employees and Present/Absent counts.
- **Analytics Charts:**
  - Weekly Attendance Trends (Bar Chart).
  - Department Distribution (Pie Chart).
- **Reports:** Filterable data grid (Date Range, Employee ID) with status badges.
- **CSV Export:** One-click download of attendance reports for payroll/HR.
- **Live Status:** See exactly who is absent today.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Redux Toolkit, Recharts (Visualization), React Calendar, CSS Modules (Glassmorphism UI).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Authentication:** JSON Web Tokens (JWT) & BCrypt.

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone <your-repo-link>
cd employee-attendance-system

# 1. Install Root dependencies
npm install

# 2. Install Backend dependencies
cd backend
npm install

# 3. Install Frontend dependencies
cd ../frontend
npm install

NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key_here

# Run from the root folder
npm run dev

# Run this from the root directory
node seeder.js

Role,Email,Password
Manager,manager@test.com,123456

Method,Endpoint,Description
POST,/api/auth/login,Login user
POST,/api/auth/register,Register employee
POST,/api/attendance/checkin,Check In
POST,/api/attendance/checkout,Check Out
GET,/api/attendance/my-history,View History
GET,/api/attendance/export,Download CSV (Manager)

---

### **2. Explanation: How to "Run" or Use this File**

A `README.md` isn't a script that you "run" like code. Instead, it is the **Instruction Manual** that GitHub displays on the front page of your repository.

Here is how you use it and why it is important:

**A. How to Add it to Your Project**
1.  Create the file named `README.md` in your project folder.
2.  Paste the text above into it.
3.  Save it.
4.  Push it to GitHub (`git add .`, `git commit -m "Added README"`, `git push`).
5.  **Result:** When you visit your GitHub link, this text will appear beautifully formatted (with bold text, code blocks, and tables) right below your file list.

**B. How Someone Else Uses It**
If an evaluator or another developer downloads your code, they will:
1.  **Read the "Setup" section:** This tells them exactly what commands to type (`npm install`) to stop the app from crashing immediately.
2.  **Read the "Env Variables" section:** This warns them that they need to create their own `.env` file (since you didn't upload yours) and connect their own MongoDB.
3.  **Read the "Seeding Data" section:** This saves them hours of time. Instead of manually registering users to test your app, they just run `node seeder.js` and use the login details you provided in the table.

**Does this explanation make sense?** You are essentially writing the "User Guide" for your software.
