import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './PatientSidebar.css'; 

export default function DoctorSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        localStorage.removeItem("activeUserEmail");
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 style={{color:'#27AE60'}}>Doctor Portal</h2>
            </div>

            <ul className="sidebar-menu">
                <li>
                    <Link to="/doctor/dashboard" className={isActive('/doctor/dashboard')}>
                        📊 Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/profile" className={isActive('/doctor/profile')}>
                        👤 My Profile
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/appointments" className={isActive('/doctor/appointments')}>
                        🩺 Appointments
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/schedule" className={isActive('/doctor/schedule')}>
                        📅 My Schedule
                    </Link>
                </li>
            </ul>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout} style={{width:'100%', background:'transparent', cursor:'pointer'}}>
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
}