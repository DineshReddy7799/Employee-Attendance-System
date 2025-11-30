// frontend/src/components/EmployeeDashboard.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaClock, FaSignOutAlt, FaHistory } from 'react-icons/fa'; // Added FaHistory
import { 
  checkIn, 
  checkOut, 
  getEmployeeStats, 
  reset 
} from '../features/attendance/attendanceSlice';

function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get user name for greeting
  const { stats, isError, isSuccess, message, isLoading } = useSelector(
    (state) => state.attendance
  );

  useEffect(() => {
    dispatch(getEmployeeStats());
    return () => { dispatch(reset()); };
  }, [dispatch]);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess && message) {
      toast.success(message);
      dispatch(getEmployeeStats());
    }
  }, [isError, isSuccess, message, dispatch]);

  const onCheckIn = () => dispatch(checkIn());
  const onCheckOut = () => dispatch(checkOut());

  if (isLoading || !stats) {
    return <h3>Loading Dashboard...</h3>;
  }

  const showCheckIn = stats.todayStatus === 'not-marked';
  const showCheckOut = stats.todayStatus !== 'not-marked' && !stats.checkOutTime;
  const isFinished = stats.checkOutTime;

  return (
    <div className='dashboard'>
      <section className='heading'>
        <h1>Hello, {user && user.name.split(' ')[0]}! 👋</h1>
        <p>Here is your daily activity overview.</p>
      </section>

      {/* Action Area */}
      <div className='action-area'>
        {showCheckIn && (
          <button className='btn btn-block' onClick={onCheckIn}>
            <FaClock /> Check In Now
          </button>
        )}
        {showCheckOut && (
          <button className='btn btn-block btn-danger' onClick={onCheckOut}>
             <FaSignOutAlt /> Check Out
          </button>
        )}
        {isFinished && (
          <div className='alert-success'>
             You have completed your work day! ✅
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className='stats-grid'>
        <div className='stat-card'>
          <h3>{stats.stats.present}</h3>
          <p>Days Present</p>
        </div>
        <div className='stat-card'>
          <h3>{stats.stats.absent}</h3>
          <p>Days Absent</p>
        </div>
        <div className='stat-card'>
          <h3>{stats.stats.late}</h3>
          <p>Late Arrivals</p>
        </div>
        <div className='stat-card'>
          <h3>{stats.stats.halfDay}</h3>
          <p>Half Days</p>
        </div>
      </div>

      {/* --- NEW SECTION: RECENT ATTENDANCE --- */}
      <h3 style={{ marginTop: '40px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FaHistory /> Recent Activity (Last 7 Days)
      </h3>
      
      {stats.recentHistory && stats.recentHistory.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentHistory.map((record) => (
              <tr key={record._id}>
                <td>{record.date}</td>
                <td>
                  <span className={`status-badge ${record.status}`}>
                    {record.status}
                  </span>
                </td>
                <td>{new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No recent activity found.</p>
      )}

    </div>
  );
}

export default EmployeeDashboard;