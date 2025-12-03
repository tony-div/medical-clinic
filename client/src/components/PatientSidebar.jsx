import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PatientSidebar.css';

export default function PatientSidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.removeItem("activeUserEmail");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>My Portal</h2>
            </div>

            <ul className="sidebar-menu">
                <li>
                    <Link to="/patient/dashboard" className={isActive('/patient/dashboard')}>
                        📊 Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/patient/profile" className={isActive('/patient/profile')}>
                        👤 My Profile
                    </Link>
                </li>
                <li>
                    <Link to="/patient/appointments" className={isActive('/patient/appointments')}>
                        📅 My Appointments
                    </Link>
                </li>
                <li>
                    <Link to="/patient/records" className={isActive('/patient/records')}>
                        📂 Medical Records
                    </Link>
                </li>
            </ul>

            <div className="sidebar-footer">
                <Link to="/login" className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                </Link>
            </div>
        </aside>
    );
}