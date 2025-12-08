import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUserMd, FaCalendarCheck, FaClock, FaSignOutAlt, FaStethoscope } from 'react-icons/fa';
import './DoctorSidebar.css'; 

export default function DoctorSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    // Active link checker
    const isActive = (path) => location.pathname === path ? 'active' : '';

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setUserRole(userObj.role); 
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear(); // Wipe session
        setUserRole(null);
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Header / Logo */}
            <div className="sidebar-header">
                <div className="logo-box">
                    <FaStethoscope className="logo-icon" /> 
                    <h2>Doctor Portal</h2>
                </div>
            </div>

            {/* Menu Links */}
            <ul className="sidebar-menu">
                <li>
                    <Link to="/doctor/dashboard" className={`menu-item ${isActive('/doctor/dashboard')}`}>
                        <FaChartLine className="menu-icon" />
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/profile" className={`menu-item ${isActive('/doctor/profile')}`}>
                        <FaUserMd className="menu-icon" />
                        <span>My Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/appointments" className={`menu-item ${isActive('/doctor/appointments')}`}>
                        <FaCalendarCheck className="menu-icon" />
                        <span>Appointments</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/schedule" className={`menu-item ${isActive('/doctor/schedule')}`}>
                        <FaClock className="menu-icon" />
                        <span>My Schedule</span>
                    </Link>
                </li>
            </ul>

            {/* Footer / Logout */}
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="menu-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}