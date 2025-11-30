import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { DB_DOCTORS_KEY } from '../data/initDB';
import "./Nav.css"; 
import logoImage from '/assets/logo.png'; 

function Nav() { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null); 
    const navigate = useNavigate();
    const [specialties, setSpecialties] = useState([]); 

    useEffect(() => {
        const storedUser = localStorage.getItem("activeUserEmail");
        if (storedUser) 
            setUserRole("patient"); 
        
        const dbDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        const uniqueSpecs = [...new Set(dbDoctors.map(doc => doc.specialty))];
        setSpecialties(uniqueSpecs);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("activeUserEmail");
        setUserRole(null);
        navigate('/');
        closeMenu();
    };

    return(
        <nav className='navbar'>
            <div className='navbar-left'>
                <img src={logoImage} alt="Clinic Logo" className="logo-img" />
            </div>

            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            <div className={`navbar-center ${isMenuOpen ? 'active' : ''}`}>
                <a href='/#home' onClick={closeMenu}>Home</a>

                <div className='dropdown'>
                    <a href='/#departments' className='dropbtn'>
                        Departments <span className="arrow">▼</span>
                    </a>
                    <div className='dropdown-content'>
                        {specialties.length > 0 ? (
                            specialties.map(dept => (
                                <Link to={`/doctors?dept=${dept}`} key={dept} onClick={closeMenu}>
                                    {dept}
                                </Link>
                            ))
                        ) : (
                            <span style={{padding:'12px 20px', display:'block', color:'#999'}}>No Departments</span>
                        )}
                    </div>
                </div>

                <a href='/#about' onClick={closeMenu}>About Us</a>
                <a href='/#contact' onClick={closeMenu}>Contact Us</a>

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
            
            <div className='navbar-right'>
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
    ) 
}

export default Nav;