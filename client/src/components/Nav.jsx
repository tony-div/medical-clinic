import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa'; 

import "./Nav.css";
import logoImage from '/assets/logo.png'; 

// API Service
import { getDoctors } from "../services/doctors.js";

function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [specialties, setSpecialties] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // 1. Identify logged-in user
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setUserRole(userObj.role); 
        }

        // 2. Load specialties
        loadSpecialties();
    }, []);

    const loadSpecialties = async () => {
        try {
            const res = await getDoctors(); 
            const doctors = res.data.data || res.data; 
            const uniqueSpecs = [...new Set(doctors.map(d => d.specialty_name || d.specialty))];
            setSpecialties(uniqueSpecs.slice(0, 6)); 
        } catch (err) {
            setSpecialties([]); 
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.clear(); // Wipe everything
        setUserRole(null);
        navigate('/login');
        closeMenu();
    };

    const getPortalLink = () => {
        if (userRole === 'doctor') return '/doctor/dashboard';
        if (userRole === 'admin') return '/admin/dashboard';
        return '/patient/dashboard';
    };

    return (
        <nav className="navbar">
            {/* LEFT: LOGO */}
            <div className="navbar-left">
                <Link to="/">
                    <img src={logoImage} alt="Clinic Logo" className="logo-img" onError={(e) => e.target.style.display='none'}/>
                    
                </Link>
            </div>

            {/* MOBILE TOGGLE */}
            <div className="hamburger" onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* CENTER: LINKS */}
            <div className={`navbar-center ${isMenuOpen ? "active" : ""}`}>
                <a href="/#home" onClick={closeMenu}>Home</a>

                {/* Departments Dropdown */}
                <div className="dropdown">
                    <a href="/#departments" className="dropbtn" onClick={closeMenu}>
                       Departments <i className="arrow down"></i>
                    </a>
                    <div className="dropdown-content">
                        {specialties.length > 0 ? (
                            specialties.map((spec, i) => (
                                <Link key={i} to={`/doctors?dept=${spec}`} onClick={closeMenu}>
                                    {spec}
                                </Link>
                            ))
                        ) : (
                            <span>No Departments</span>
                        )}
                        <Link to="/doctors" className="view-all" onClick={closeMenu}>View All</Link>
                    </div>
                </div>

                <a href="/#about" onClick={closeMenu}>About Us</a>
                <a href="/#contact" onClick={closeMenu}>Contact</a>

                {/* Mobile Buttons (Only show in hamburger) */}
                <div className="mobile-buttons">
                    {userRole ? (
                        <>
                            <Link to={getPortalLink()} className="btn primary" onClick={closeMenu}>My Portal</Link>
                            <button className="btn logout" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn" onClick={closeMenu}>Login</Link>
                            <Link to="/doctors" className="btn primary" onClick={closeMenu}>Book Now</Link>
                        </>
                    )}
                </div>
            </div>

            {/* RIGHT: BUTTONS (Desktop) */}
            <div className="navbar-right">
                {userRole ? (
                    <>
                        <Link to={getPortalLink()} className="btn primary">My Portal</Link>
                        <button className="btn logout" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn login">Login</Link>
                        <Link to="/doctors" className="btn primary">Book Appointment</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Nav;