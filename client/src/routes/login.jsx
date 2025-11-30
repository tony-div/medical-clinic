import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { DB_PATIENTS_KEY, DB_DOCTORS_KEY } from '../data/initDB'; 
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [errors, setErrors] = useState({}); 
  
  const navigate = useNavigate();
  const location = useLocation(); 

  const admins = [
    { email: 'admin@clinic.com', password: '123', role: 'admin', name: 'System Admin' }
  ];

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

  const handleLogin = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 && !errors.auth) return;

    const dbPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
    const dbDoctors  = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");

    const realPatients = dbPatients.map(p => ({ ...p, role: 'patient' }));
    const realDoctors  = dbDoctors.map(d => ({ ...d, role: 'doctor' })); 

    const allUsers = [...admins, ...realDoctors, ...realPatients];

    const foundUser = allUsers.find(user => user.email === email && user.password === password);

    if (foundUser) {
        localStorage.setItem("activeUserEmail", foundUser.email);
        
        if (location.state?.from && foundUser.role === 'patient') {
            navigate(location.state.from);
            return; 
        }

        if (foundUser.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (foundUser.role === 'doctor') {
            navigate('/doctor/dashboard');
        } else {
            navigate('/patient/dashboard');
        }
    } else {
        setErrors({ ...errors, auth: "Invalid email or password. Try again" });
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
          >
            Login
          </button>
        </form>

        <div className="auth-footer">
          <p>New Patient? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}