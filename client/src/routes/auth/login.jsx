import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { login } from "../../services/auth.js";
import './login.css';

// Configure Toast
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await login(email, password);
      const { token, user } = res.data;
    
      // 1. SAVE SESSION DATA
      localStorage.setItem("token", token);
      // localStorage.setItem("activeUserEmail", user.email);
      localStorage.setItem("userRole", user.role);
      //localStorage.setItem("user", JSON.stringify(user));
      // 2. CRITICAL FIX: Save the full User Object (with ID)
      // This allows PatientProfile to know WHO is logged in (ID, Name, etc.)
      localStorage.setItem("currentUser", JSON.stringify(user));
      Swal.fire({
        icon: 'success',
        title: 'Welcome back!',
        text: `Logged in as ${user.name}`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        if (location.state?.from && user.role === "patient") {
          navigate(location.state.from);
          return;
        }
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      });
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: error?.response?.data?.error || 'Invalid email or password.'
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