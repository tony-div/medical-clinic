import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaCalendarAlt, FaFileMedical, FaSignOutAlt, FaHeartbeat } from 'react-icons/fa'; 
import './PatientSidebar.css';

export default function PatientSidebar() {
    const location = useLocation();
    
    // Helper to check if the path is active
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        // Optional: Redirect to login immediately if your route protection doesn't catch it
        // window.location.href = '/login'; 
    };

    return (
        <aside className="sidebar">
            {/* Fixed Header */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <FaHeartbeat className="logo-icon" />
                    <h2>My Portal</h2>
                </div>
            </div>

            {/* Scrollable Menu Area */}
            <ul className="sidebar-menu custom-scroll">
                <li>
                    <Link to="/patient/dashboard" className={`menu-item ${isActive('/patient/dashboard')}`}>
                        <FaHome className="sidebar-icon" /> 
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/patient/profile" className={`menu-item ${isActive('/patient/profile')}`}>
                        <FaUser className="sidebar-icon" /> 
                        <span>My Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to="/patient/appointments" className={`menu-item ${isActive('/patient/appointments')}`}>
                        <FaCalendarAlt className="sidebar-icon" /> 
                        <span>My Appointments</span>
                    </Link>
                </li>
                <li>
                    <Link to="/patient/records" className={`menu-item ${isActive('/patient/records')}`}>
                        <FaFileMedical className="sidebar-icon" /> 
                        <span>Medical Records</span>
                    </Link>
                </li>
            </ul>

            {/* Fixed Footer */}
            <div className="sidebar-footer">
                <Link to="/login" className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="sidebar-icon" /> 
                    <span>Logout</span>
                </Link>
            </div>
        </aside>
    );
}