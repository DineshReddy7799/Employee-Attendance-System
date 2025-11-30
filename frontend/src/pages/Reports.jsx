// frontend/src/pages/Reports.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaSearch, FaFileAlt } from 'react-icons/fa';

function Reports() {
  const { user } = useSelector((state) => state.auth);
  
  // 1. Get Today's Date string (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({
    from: today, // <--- Default to Today
    to: today,   // <--- Default to Today
    employeeId: ''
  });
  
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Define Fetch Logic (Wrapped in useCallback to prevent infinite loops)
  const fetchReports = useCallback(async (currentFilters) => {
    setIsLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        params: currentFilters // Sends ?from=...&to=...
      };
      const res = await axios.get('/api/attendance/all', config);
      setData(res.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, [user.token]);

  // 3. Auto-Load on Page Mount
  useEffect(() => {
    fetchReports(filters); 
    // eslint-disable-next-line
  }, []); // Empty dependency array = Runs once when page opens

  const onChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const onGenerate = (e) => {
    e.preventDefault();
    fetchReports(filters);
  };

  return (
    <div className='container'>
      <section className='heading'>
        <h1><FaFileAlt /> Attendance Reports</h1>
        <p>View and filter team attendance records</p>
      </section>
      
      {/* Filter Form */}
      <div className='form' style={{ maxWidth: '100%', padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={onGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          
          <div className='form-group' style={{ marginBottom: 0 }}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>From Date</label>
            <input 
              type="date" 
              name="from" 
              value={filters.from} 
              onChange={onChange} 
              className='form-control' 
              required 
            />
          </div>

          <div className='form-group' style={{ marginBottom: 0 }}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>To Date</label>
            <input 
              type="date" 
              name="to" 
              value={filters.to} 
              onChange={onChange} 
              className='form-control' 
              required 
            />
          </div>

          <div className='form-group' style={{ marginBottom: 0 }}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Employee ID (Optional)</label>
            <input 
              type="text" 
              name="employeeId" 
              placeholder="e.g. EMP001" 
              value={filters.employeeId} 
              onChange={onChange} 
              className='form-control' 
            />
          </div>

          <button type="submit" className='btn' style={{ height: '48px' }}>
            <FaSearch /> Generate Report
          </button>
        </form>
      </div>

      {/* Results Table */}
      {isLoading ? (
        <h3 style={{textAlign: 'center', color: 'var(--text-light)'}}>Loading Records...</h3>
      ) : data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr key={record._id}>
                <td>{record.date}</td>
                <td>
                  <div style={{fontWeight: '600'}}>{record.userId?.name || 'Unknown'}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>{record.userId?.email}</div>
                </td>
                <td>
                  <span className={`status-badge ${record.status}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-light)', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)'}}>
          <h3>No records found</h3>
          <p>Try adjusting the date range or filters.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;