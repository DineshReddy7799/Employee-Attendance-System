// frontend/src/components/ManagerDashboard.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes, 
  FaFileDownload
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import { 
  getManagerStats, 
  getTodayStatus, 
  reset 
} from '../features/attendance/attendanceSlice';

function ManagerDashboard() {
  const dispatch = useDispatch();

  const { stats, todayStatus, isError, message, isLoading } = useSelector(
    (state) => state.attendance
  );

  useEffect(() => {
    dispatch(getManagerStats());
    dispatch(getTodayStatus());
    return () => { dispatch(reset()); };
  }, [dispatch]);

  useEffect(() => {
    if (isError) toast.error(message);
  }, [isError, message]);

  const onExport = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` }, responseType: 'blob' };
      const response = await axios.get('/api/attendance/export', config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (isLoading || !stats || !todayStatus) return <h3>Loading Dashboard...</h3>;

  // Colors for Pie Chart (Departments)
  const PIE_COLORS = ['#22c55e', '#eab308', '#f97316', '#3b82f6'];

  return (
    <div className='dashboard'>
      <section className='heading'>
        <h1>Manager Dashboard</h1>
        <p>Overview of Team Attendance</p>
      </section>

      {/* --- CHARTS SECTION (TOP) --- */}
      <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        
        {/* Weekly Trend Chart */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-dark)'}}>Weekly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              
              {/* UPDATED COLORS HERE */}
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[4, 4, 0, 0]} /> {/* Green */}
              <Bar dataKey="late" fill="#eab308" name="Late" radius={[4, 4, 0, 0]} />       {/* Yellow */}
              <Bar dataKey="halfDay" fill="#f97316" name="Half Day" radius={[4, 4, 0, 0]} /> {/* Orange */}
              
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution Chart */}
        <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-dark)'}}>By Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.departmentStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {stats.departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- STATS CARDS (MIDDLE) --- */}
      <div className='stats-grid'>
        <div className='stat-card' style={{ borderTop: '4px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--primary-color)' }}>{stats.totalEmployees}</h3>
          <p style={{ color: 'var(--text-medium)' }}><FaUsers style={{ color: 'var(--primary-color)' }} /> Total Employees</p>
        </div>
        <div className='stat-card' style={{ borderTop: '4px solid var(--success-color)' }}>
          <h3 style={{ color: 'var(--success-color)' }}>{stats.todayStats.present}</h3>
          <p style={{ color: 'var(--text-medium)' }}><FaUserCheck style={{ color: 'var(--success-color)' }} /> Present Today</p>
        </div>
        <div className='stat-card' style={{ borderTop: '4px solid var(--danger-color)' }}>
          <h3 style={{ color: 'var(--danger-color)' }}>{stats.todayStats.absent}</h3>
          <p style={{ color: 'var(--text-medium)' }}><FaUserTimes style={{ color: 'var(--danger-color)' }} /> Absent Today</p>
        </div>
        <div className='stat-card' style={{ borderTop: '4px solid #eab308' }}>
          <h3 style={{ color: '#eab308' }}>{stats.todayStats.late}</h3>
          <p style={{ color: 'var(--text-medium)' }}><FaUsers style={{ color: '#eab308' }} /> Late Arrivals</p>
        </div>
      </div>

      {/* --- ACTION AREA (CSV BUTTON) --- */}
      <div className='action-area' style={{ display: 'flex', justifyContent: 'center' }}>
        <button className='btn' onClick={onExport} style={{ background: '#166534', minWidth: '250px' }}>
          <FaFileDownload /> Download CSV Report
        </button>
      </div>

      {/* --- ABSENT LIST TABLE (BOTTOM) --- */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700' }}>Absent Today</h3>
      {todayStatus.absent.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {todayStatus.absent.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.employeeId}</td>
                <td style={{fontWeight: '600'}}>{emp.name}</td>
                <td>{emp.email}</td>
                <td><span className="status-badge absent">Absent</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert-success">
          🎉 Everyone is present today!
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;