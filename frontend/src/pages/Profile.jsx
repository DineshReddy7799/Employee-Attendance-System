import { useSelector } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';

function Profile() {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className='form' style={{ maxWidth: '600px', margin: '50px auto' }}>
      <section className='heading'>
        <h1><FaUserCircle /> My Profile</h1>
      </section>

      <div className='profile-grid' style={{ display: 'grid', gap: '20px', textAlign: 'left' }}>
        <div className='form-group'>
          <label style={{ fontWeight: 'bold' }}>Name</label>
          <div className='form-control' style={{ background: '#f4f4f4' }}>{user.name}</div>
        </div>
        <div className='form-group'>
          <label style={{ fontWeight: 'bold' }}>Email</label>
          <div className='form-control' style={{ background: '#f4f4f4' }}>{user.email}</div>
        </div>
        <div className='form-group'>
          <label style={{ fontWeight: 'bold' }}>Employee ID</label>
          <div className='form-control' style={{ background: '#f4f4f4' }}>{user.employeeId}</div>
        </div>
        <div className='form-group'>
          <label style={{ fontWeight: 'bold' }}>Department</label>
          <div className='form-control' style={{ background: '#f4f4f4' }}>{user.department}</div>
        </div>
        <div className='form-group'>
          <label style={{ fontWeight: 'bold' }}>Role</label>
          <div className='form-control' style={{ background: '#f4f4f4', textTransform: 'capitalize' }}>{user.role}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;