import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import api from '../lib/axios';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); 
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    let newErrors = { ...errors };
    if (newErrors.auth) delete newErrors.auth;

    if (!value.includes('@')) {
        newErrors.email = "Invalid email format";
    } else {
        delete newErrors.email;
    }
    setErrors(newErrors);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.auth) {
        let newErrors = { ...errors };
        delete newErrors.auth;
        setErrors(newErrors);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 && !errors.auth) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/users/login', {
        email,
        password
      });

      const { token, user } = response.data;
      console.log('response data:', response.data);
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('activeUserEmail', user.email);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      if (user.doctor_id) {
        localStorage.setItem('doctorId', user.doctor_id);
      }

      // Navigate based on role and redirect state
      if (location.state?.from && user.role === 'patient') {
        navigate(location.state.from);
        return;
      }

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.error || 'Invalid email or password. Try again';
      setErrors({ auth: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <p>Please enter your credentials to access the portal.</p>
        
        <form onSubmit={handleLogin}>
          
          {errors.auth && <div className="error-banner">{errors.auth}</div>}

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={handleEmailChange}
              className={errors.email ? "input-error" : ""}
              required 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={handlePasswordChange}
                required 
              />
              <button 
                type="button" 
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>New Patient? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}