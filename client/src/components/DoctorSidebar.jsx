import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUserMd, FaCalendarCheck, FaClock, FaSignOutAlt, FaStethoscope } from 'react-icons/fa';
import './PatientSidebar.css'; // Re-using the same professional styles

export default function DoctorSidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.removeItem("userCurrent");
        navigate('/');
    };

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <FaStethoscope className="logo-icon" style={{color: '#27AE60'}} /> 
                    {/* Kept the Green accent for Doctor identity */}
                    <h2>Doctor Portal</h2>
                </div>
            </div>

            {/* Menu */}
            <ul className="sidebar-menu custom-scroll">
                <li>
                    <Link to="/doctor/dashboard" className={`menu-item ${isActive('/doctor/dashboard')}`}>
                        <FaChartLine className="sidebar-icon" />
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/profile" className={`menu-item ${isActive('/doctor/profile')}`}>
                        <FaUserMd className="sidebar-icon" />
                        <span>My Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/appointments" className={`menu-item ${isActive('/doctor/appointments')}`}>
                        <FaCalendarCheck className="sidebar-icon" />
                        <span>Appointments</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/schedule" className={`menu-item ${isActive('/doctor/schedule')}`}>
                        <FaClock className="sidebar-icon" />
                        <span>My Schedule</span>
                    </Link>
                </li>
            </ul>

            {/* Footer */}
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout} style={{width: '100%', border: 'none', cursor: 'pointer'}}>
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}