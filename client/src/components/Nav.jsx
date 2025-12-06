import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import "./Nav.css";
import logoImage from '/assets/logo.png';

// Import your API service:
import { getDoctors } from "../services/doctors.js";

function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [specialties, setSpecialties] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // 1. Identify logged-in user
        const storedUser = localStorage.getItem("activeUserEmail");
        if (storedUser) {
            setUserRole("patient");
        }

        // 2. Load specialties via API
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            const res = await getDoctors(); // API call
            const doctors = res.data.data || res.data; // in case your API wraps it differently

            // Extract unique specialties
            const uniqueSpecs = [
                ...new Set(doctors.map(d => d.specialty_name))
            ];

            setSpecialties(uniqueSpecs);
        } catch (err) {
            console.error("Error loading specialties:", err);
            setSpecialties([]); // fallback
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("activeUserEmail");
        setUserRole(null);
        navigate('/');
        closeMenu();
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logoImage} alt="Clinic Logo" className="logo-img" />
            </div>

            {/* Hamburger */}
            <div className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            {/* Center Menu */}
            <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
                <a href="/#home" onClick={closeMenu}>Home</a>

                {/* Departments dropdown */}
                <div className="dropdown">
                    <a href="/#departments" className="dropbtn">
                        Departments <span className="arrow">▼</span>
                    </a>
                    <div className="dropdown-content">
                        {specialties.length > 0 ? (
                            specialties.map(spec => (
                                // <Link 
                                //     key={spec} 
                                //     to={`/doctors?dept=${spec}`} 
                                //     onClick={closeMenu}
                                // >
                                //     {spec}
                                // </Link>
                                <Link
                                to={`/doctors?dept=${spec}`}
                                onClick={() => {
                                    setTimeout(() => window.location.reload(), 0);
                                }}
                                >
                                    {spec}
                                </Link>

                            ))
                        ) : (
                            <span style={{ padding: '12px 20px', display: 'block', color: '#999' }}>
                                No Departments
                            </span>
                        )}
                    </div>
                </div>

                <a href="/#about" onClick={closeMenu}>About Us</a>
                <a href="/#contact" onClick={closeMenu}>Contact Us</a>

                {/* Mobile Buttons */}
                <div className="mobile-buttons">
                    {userRole ? (
                        <>
                            <Link to="/patient/dashboard" className="btn primary" onClick={closeMenu}>My Portal</Link>
                            <button className="btn" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn" onClick={closeMenu}>Login</Link>
                            <Link to="/doctors" className="btn primary" onClick={closeMenu}>Book Appointment</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Desktop Buttons */}
            <div className="navbar-right">
                {userRole ? (
                    <>
                        <Link to="/patient/dashboard" className="btn primary">My Portal</Link>
                        <button className="btn" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn">Login</Link>
                        <Link to="/doctors" className="btn primary">Book Appointment</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Nav;
