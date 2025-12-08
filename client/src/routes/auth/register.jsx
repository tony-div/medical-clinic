import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'; // Only Eye icons kept
import { createPatient } from '../../services/users';
import './register.css';

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        gender: 'male', birth_date: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ phone: '', passwordMatch: '' });
    const [loading, setLoading] = useState(false);

    const maxDate = new Date().toISOString().split('T')[0];

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Phone Validation
        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 11) return;
            if (value.length > 0 && value.length !== 11) {
                setErrors(prev => ({ ...prev, phone: 'Phone must be exactly 11 digits' }));
            } else {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }

        // Password Match Validation
        if (name === 'confirmPassword' || name === 'password') {
            const otherPass = name === 'password' ? formData.confirmPassword : formData.password;
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.phone.length !== 11) {
            Swal.fire('Error', 'Phone number must be exactly 11 digits.', 'error');
            setLoading(false);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Passwords do not match.', 'error');
            setLoading(false);
            return;
        }

        try {
            const newUser = {
                name: formData.name,
                email: formData.email,
                phone_number: formData.phone,
                password: formData.password,
                gender: formData.gender,
                birth_date: formData.birth_date,
                address: ""
            };
            await createPatient(newUser);

            Swal.fire({
                icon: "success",
                title: "Account Created!",
                text: "You can now login to your portal.",
                confirmButtonColor: "#0ea5e9"
            }).then(() => navigate("/login"));

        } catch (err) {
            setLoading(false);
            const message = err.response?.data?.error || "Registration failed.";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: message,
                confirmButtonColor: "#ef4444",
            });
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card slide-up">
                
                <button onClick={() => navigate('/')} className="back-home-btn">
                    <FaArrowLeft /> Back to Home
                </button>

                <div className="auth-header">
                    <h2>Create Account</h2>
                    <p>Join us to manage your health journey.</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input name="email" type="email" placeholder="name@example.com" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            placeholder="01xxxxxxxxx"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className={errors.phone ? 'input-error' : ''}
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
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
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
                        {errors.passwordMatch && <span className="error-text">{errors.passwordMatch}</span>}
                    </div>

                    <button
                        type="submit"
                        className="auth-btn primary"
                        disabled={loading || !!errors.phone || !!errors.passwordMatch}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}