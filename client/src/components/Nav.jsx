import { Link } from 'react-router-dom'; 
import { useState } from 'react';
import "./Nav.css"; 
import logoImage from '/assets/logo.png'; 

function Nav() { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => setIsMenuOpen(false);

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
               <a href="/#home" onClick={closeMenu}>Home</a>

                <div className='dropdown'>
                    <a href='/#departments' className='dropbtn'>
                        Departments <span className="arrow">▼</span>
                    </a>
                    
                    <div className='dropdown-content'>
                        <Link to="/doctors?dept=Cardiology" onClick={closeMenu}>Cardiology</Link>
                        <Link to="/doctors?dept=Neurology" onClick={closeMenu}>Neurology</Link>
                        <Link to="/doctors?dept=Pediatrics" onClick={closeMenu}>Pediatrics</Link>
                        <Link to="/doctors?dept=Dental" onClick={closeMenu}>Dental</Link>
                    </div>
                </div>

                <a href='#about' onClick={closeMenu}>About Us</a>
                <a href='#contact' onClick={closeMenu}>Contact Us</a>

                <div className="mobile-buttons">
                    <Link to="/login" className="btn" onClick={closeMenu}>Login</Link>
                    <Link to="/login" className="btn primary" onClick={closeMenu}>Book Appointment</Link>
                </div>
            </div>
            
            <div className='navbar-right'>
                <Link to="/login" className="btn">Login</Link>
                <Link to="/login" className="btn primary">Book Appointment</Link>
            </div>
        </nav>
    ) 
}

export default Nav;