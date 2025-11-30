// frontend/src/components/Header.jsx
import { FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import {  FaChartPie } from 'react-icons/fa';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user from Redux state
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className='header'>
      <div className='logo'>
        <Link to='/'>Employee Attendance System</Link>
      </div>
      <ul>
        {user ? (
          <>
            <li>
              <Link to='/profile'>Profile</Link>
            </li>
            <li><Link to='/'>
                  <FaChartPie /> Dashboard
                </Link></li>
            
            {/* Employee Links */}
            {user.role === 'employee' && (
              <>
                <li>
                  <Link to='/history'>History</Link>
                </li>
                <li>
                  <Link to='/summary'>Summary</Link> {/* <--- Added Link */}
                </li>
              </>
            )}

            {/* Manager Links */}
            {user.role === 'manager' && (
              <li>
                <Link to='/reports'>Reports</Link>
              </li>
            )}

            <li>
              <button className='btn' onClick={onLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login'>
                <FaSignInAlt /> Login
              </Link>
            </li>
            <li>
              <Link to='/register'>
                <FaUser /> Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;