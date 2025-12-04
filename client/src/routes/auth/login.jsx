import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DB_PATIENTS_KEY, DB_DOCTORS_KEY, DB_ADMINS_KEY } from '../../data/initDB'; 
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogin = (e) => {
    e.preventDefault();

    const dbPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
    const dbDoctors  = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
    const dbAdmins   = JSON.parse(localStorage.getItem(DB_ADMINS_KEY) || "[]");

    const realPatients = dbPatients.map(p => ({ ...p, role: 'patient' }));
    const realDoctors  = dbDoctors.map(d => ({ ...d, role: 'doctor' })); 
    const realAdmins   = dbAdmins.map(a => ({ ...a, role: 'admin' }));

    const allUsers = [...realAdmins, ...realDoctors, ...realPatients];

    const foundUser = allUsers.find(user => user.email === email && user.password === password);

    if (foundUser) {
        localStorage.setItem("activeUserEmail", foundUser.email);
        
        Swal.fire({
            icon: 'success',
            title: 'Welcome back!',
            text: `Logged in as ${foundUser.name}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            if (location.state?.from && foundUser.role === 'patient') {
                navigate(location.state.from);
                return; 
            }
            if (foundUser.role === 'admin') navigate('/admin/dashboard');
            else if (foundUser.role === 'doctor') navigate('/doctor/dashboard');
            else navigate('/patient/dashboard');
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid email or password. Please try again.',
            confirmButtonColor: '#d33'
        });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button onClick={() => navigate('/')} style={{border:'none', background:'none', cursor:'pointer', float:'left', fontSize:'1.2rem'}}>←</button>
        <h2>Login</h2>
        <p>Please enter your credentials to access the portal.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <div className="auth-footer">
          <p>New Patient? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}