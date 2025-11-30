// frontend/src/pages/AttendanceHistory.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import 'react-calendar/dist/Calendar.css'; // Default styles
import { FaClock, FaCalendarDay, FaInfoCircle } from 'react-icons/fa';

function AttendanceHistory() {
  const { user } = useSelector((state) => state.auth);
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('/api/attendance/my-history', config);
        setHistory(res.data);
      } catch (error) {
        toast.error('Could not fetch history');
      }
    };
    fetchHistory();
  }, [user]);

  // Handle Date Click
  const onDateChange = (date) => {
    setSelectedDate(date);
    // Find record for this specific date (YYYY-MM-DD)
    // Note: Adjust for timezone offset to match string comparison
    const dateStr = date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
    const record = history.find((r) => r.date === dateStr);
    setSelectedRecord(record || null);
  };

  // Add Colors to Calendar Tiles
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toLocaleDateString('en-CA');
      const record = history.find((r) => r.date === dateStr);

      if (record) {
        switch (record.status) {
          case 'present': return 'cal-present';   // Green
          case 'late': return 'cal-late';         // Yellow
          case 'half-day': return 'cal-half-day'; // Orange
          case 'absent': return 'cal-absent';     // Red
          default: return '';
        }
      }
      
      // Logic for "Absent" (Red):
      // If date is in the past, not a weekend, and has no record -> Absent
      const today = new Date();
      if (date < today && !record && date.getDay() !== 0 && date.getDay() !== 6) {
        return 'cal-absent'; 
      }
    }
  };

  return (
    <div className='container'>
      <section className='heading'>
        <h1>My Attendance Calendar</h1>
        <p>Click on a date to view details</p>
      </section>

      <div className="history-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT: CALENDAR */}
        <div className="calendar-container card-shadow">
          <Calendar 
            onChange={onDateChange} 
            value={selectedDate}
            tileClassName={tileClassName}
          />
          
          {/* Legend */}
          <div className="legend">
            <span className="dot present"></span> Present
            <span className="dot late"></span> Late
            <span className="dot half-day"></span> Half Day
            <span className="dot absent"></span> Absent
          </div>
        </div>

        {/* RIGHT: DETAILS CARD */}
        <div className="details-card card-shadow">
          <h3><FaCalendarDay /> {selectedDate.toDateString()}</h3>
          
          {selectedRecord ? (
            <div className="record-info">
              <div className={`status-badge large ${selectedRecord.status}`}>
                {selectedRecord.status}
              </div>
              
              <div className="time-row">
                <div>
                  <strong>Check In</strong>
                  <p><FaClock /> {new Date(selectedRecord.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div>
                  <strong>Check Out</strong>
                  <p><FaClock /> {selectedRecord.checkOutTime ? new Date(selectedRecord.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
                </div>
              </div>

              <div className="hours-row">
                <strong>Total Hours:</strong> {selectedRecord.totalHours || 0} hrs
              </div>
            </div>
          ) : (
            <div className="no-record">
              <FaInfoCircle size={30} style={{ marginBottom: '10px', color: '#ccc' }} />
              <p>No attendance record found for this date.</p>
              {(selectedDate.getDay() === 0 || selectedDate.getDay() === 6) ? (
                 <p style={{color: '#64748b', fontSize: '0.9rem'}}>It's a Weekend!</p>
              ) : (
                 selectedDate < new Date() && <p style={{color: '#ef4444', fontWeight: 'bold'}}>Marked as Absent</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceHistory;