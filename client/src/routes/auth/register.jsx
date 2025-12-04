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
    const maxDate = new Date().toISOString().split('T')[0];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Passwords do not match',
                text: 'Please ensure both passwords are the same.',
                confirmButtonColor: '#3498DB'
            });
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
                {/* BACK BUTTON */}
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
                        <input name="phone" type="tel" placeholder="01xxxxxxxxx" onChange={handleChange} required />
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
                        <input name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="auth-btn">Register</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}