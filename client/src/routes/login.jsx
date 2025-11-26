import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [errors, setErrors] = useState({}); 
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    let newErrors = { ...errors };

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    
    if (!emailRegex.test(value)) {
        newErrors.email = "Email must have '@' and end with '.com'";
    } else {
        delete newErrors.email;
    }
    
    setErrors(newErrors);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (Object.keys(errors).length > 0) return;

    if (!email.endsWith('.com')) {
      setErrors({...errors, email: "Invalid email format"});
      return;
    }
    
    if (email.includes('.admin')) {
      alert("Logged in as Admin");
      navigate('/admin/dashboard');
    } else if (email.includes('.doctor')) {
      alert("Logged in as Doctor");
      navigate('/doctor/dashboard');
    } else {
      alert("Logged in as Patient");
      navigate('/patient/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <p>Please enter your credentials to access the portal.</p>
        
        <form onSubmit={handleLogin}>
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
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={Object.keys(errors).length > 0}
            style={{ opacity: Object.keys(errors).length > 0 ? 0.5 : 1 }}
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