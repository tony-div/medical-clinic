import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.css';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    birth_date: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const maxDate = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === 'phone') {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue.length > 11) return;
        
        setFormData({ ...formData, [name]: numericValue });

        if (numericValue.length !== 11) {
            newErrors.phone = "Phone must be exactly 11 digits";
        } else {
            delete newErrors.phone;
        }
    } 
    else if (name === 'email') {
        setFormData({ ...formData, [name]: value });
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
        
        if (!emailRegex.test(value)) {
            newErrors.email = "Email must have '@' and end with '.com'";
        } else {
            delete newErrors.email;
        }
    }
    else if (name === 'confirmPassword') {
        setFormData({ ...formData, [name]: value });
        if (value !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
        } else {
            delete newErrors.confirmPassword;
        }
    }
    else {
        setFormData({ ...formData, [name]: value });
    }

    setErrors(newErrors);
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
    if (!emailRegex.test(formData.email)) {
        alert("Invalid Email. It must contain '@' and end with '.com'");
        return;
    }

    if (formData.phone.length !== 11) {
        alert("Phone number must be exactly 11 digits.");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    console.log("Registering Patient:", formData);
    setShowSuccessModal(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <h2>Create Account</h2>
        <p>Join us to book appointments and view your history.</p>
        
        <form onSubmit={handleRegister}>
          
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
                name="email" 
                type="email" 
                placeholder="name@domain.com" 
                onChange={handleChange} 
                className={errors.email ? "input-error" : ""}
                required 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              name="phone" 
              type="tel" 
              placeholder="01xxxxxxxxx" 
              value={formData.phone} 
              onChange={handleChange}
              className={errors.phone ? "input-error" : ""}
              required 
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Gender</label>
              <select name="gender" onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group half">
              <label>Date of Birth</label>
              <input 
                name="birth_date" 
                type="date" 
                max={maxDate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                onChange={handleChange} 
                required 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              onChange={handleChange} 
              className={errors.confirmPassword ? "input-error" : ""}
              required 
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            disabled={Object.keys(errors).length > 0}
            style={{ opacity: Object.keys(errors).length > 0 ? 0.5 : 1 }}
          >
            Register
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="success-icon">🎉</div>
                <h3>Account Created!</h3>
                <p>Your patient account has been registered successfully.</p>
                <Link to="/login" className="auth-btn modal-btn">
                    Go to Login
                </Link>
            </div>
        </div>
      )}

    </div>
  );
}