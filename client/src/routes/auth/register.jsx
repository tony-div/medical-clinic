import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { DB_PATIENTS_KEY } from '../../data/initDB'; 
import './register.css';

export default function Register() {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        gender: 'male', birth_date: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    // NEW: State for live error messages
    const [errors, setErrors] = useState({ phone: '', passwordMatch: '' });

    const maxDate = new Date().toISOString().split('T')[0];

    const handleChange = (e) => {
        const { name, value } = e.target;

        // --- 1. LIVE PHONE VALIDATION ---
        if (name === 'phone') {
            // Check if value is numeric only
            if (!/^\d*$/.test(value)) return; // Prevent typing non-digits
            
            // Check length (Limit to 11)
            if (value.length > 11) return; // Stop typing after 11

            // Set Error if length is wrong (e.g. user leaves it at 10 digits)
            // We check length > 0 so empty field doesn't show error immediately
            if (value.length > 0 && value.length !== 11) {
                setErrors(prev => ({ ...prev, phone: 'Phone must be exactly 11 digits' }));
            } else {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }

        // --- 2. LIVE PASSWORD MATCH CHECK ---
        if (name === 'confirmPassword' || name === 'password') {
            // We need the latest values to compare
            const otherPass = name === 'password' ? formData.confirmPassword : formData.password;
            const currentPass = value;
            
            // Check if they match (only if confirm field isn't empty)
            if (name === 'confirmPassword' && value !== formData.password) {
                 setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match' }));
            } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
                 setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match' }));
            } else {
                 setErrors(prev => ({ ...prev, passwordMatch: '' }));
            }
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        // Final Validation Check before submitting
        if (formData.phone.length !== 11) {
            Swal.fire('Error', 'Phone number must be exactly 11 digits.', 'error');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            return;
        }

        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const existingUser = allPatients.find(p => p.email === formData.email);
        
        if (existingUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Email already used',
                text: 'A user with this email already exists. Please login instead.',
                confirmButtonColor: '#3498DB'
            });
            return;
        }

        const newUser = {
            id: Date.now(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password, 
            gender: formData.gender,
            birth_date: formData.birth_date,
            bloodType: "Unknown", 
            recentHistory: []
        };

        allPatients.push(newUser);
        localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(allPatients));

        Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: 'You can now login to your portal.',
            confirmButtonColor: '#27AE60'
        }).then(() => {
            navigate('/login');
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-box register-box">
                <button onClick={() => navigate('/')} style={{border:'none', background:'none', cursor:'pointer', float:'left', fontSize:'1.2rem', color:'#7F8C8D'}}>
                    ← Back
                </button>

                <h2>Create Account</h2>
                <p>Join us to book appointments and view your history.</p>
                
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input name="email" type="email" placeholder="name@domain.com" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                            name="phone" 
                            type="tel" 
                            placeholder="01xxxxxxxxx" 
                            value={formData.phone} // Controlled input needed for masking
                            onChange={handleChange} 
                            required 
                            className={errors.phone ? 'input-error' : ''}
                        />
                        {/* Live Error Text */}
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
                            <input name="birth_date" type="date" max={maxDate} onChange={handleChange} required />
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
                            required 
                            className={errors.passwordMatch ? 'input-error' : ''}
                        />
                        {/* Live Error Text */}
                        {errors.passwordMatch && <span className="error-text">{errors.passwordMatch}</span>}
                    </div>

                    <button 
                        type="submit" 
                        className="auth-btn"
                        // Disable if there are active errors
                        disabled={!!errors.phone || !!errors.passwordMatch}
                        style={{opacity: (errors.phone || errors.passwordMatch) ? 0.5 : 1}}
                    >
                        Register
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}