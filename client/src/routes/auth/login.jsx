import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons removed from import
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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      const { token, user } = res.data;
    
      localStorage.setItem("token", token);
      localStorage.setItem("activeUserEmail", user.email);
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      Toast.fire({
        icon: 'success',
        title: `Welcome back, ${user.name}!`
      });

      setTimeout(() => {
        if (location.state?.from && user.role === "patient") {
          navigate(location.state.from);
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      }, 800);

    } catch (error) {
      setLoading(false);
      Toast.fire({
        icon: 'error',
        title: error?.response?.data?.error || 'Invalid email or password.'
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        
        <button onClick={() => navigate('/')} className="back-home-btn">
            <FaArrowLeft /> Back to Home
        </button>

        <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
                <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}