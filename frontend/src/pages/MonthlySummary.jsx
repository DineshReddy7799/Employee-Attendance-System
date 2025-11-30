import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

function MonthlySummary() {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.get('/api/attendance/my-summary', config);
        setSummary(res.data);
      } catch (error) {
        toast.error('Could not fetch summary');
      }
    };

    fetchSummary();
  }, [user]);

  if (!summary) return <h3>Loading Summary...</h3>;

  return (
    <div className='container'>
      <section className='heading'>
        <h1><FaCalendarAlt /> Monthly Summary</h1>
        <p>Your performance for this month</p>
      </section>

      <div className='stats-grid'>
        <div className='stat-card'>
          <h3 style={{ color: 'var(--success-color)' }}>{summary.present}</h3>
          <p><FaCheck /> Present</p>
        </div>
        <div className='stat-card'>
          <h3 style={{ color: 'var(--danger-color)' }}>{summary.absent}</h3>
          <p><FaTimes /> Absent</p>
        </div>
        <div className='stat-card'>
          <h3 style={{ color: '#eab308' }}>{summary.late}</h3>
          <p><FaClock /> Late</p>
        </div>
        <div className='stat-card'>
          <h3 style={{ color: 'var(--primary-color)' }}>{summary.totalHours}</h3>
          <p>Total Hours</p>
        </div>
      </div>
    </div>
  );
}

export default MonthlySummary;