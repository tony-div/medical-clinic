import "./Nav.css"; 
import logoImage from '../logo.png'; 

function Nav() { 
    return(
        <nav className='navbar'>
            <div className='navbar-left'>
                <img src={logoImage} alt="Clinic Logo" className="logo-img" />
            </div>

            <div className='navbar-center'>
                <a href='#home'>Home</a>

                <div className='dropdown'>
                    <a href='#departments' className='dropbtn'>
                        Departments <span className="arrow">▼</span>
                    </a>
                    
                    <div className='dropdown-content'>
                        <a href='#!'>Cardiology</a>
                        <a href='#!'>Neurology</a>
                        <a href='#!'>Pediatrics</a>
                        <a href='#!'>Dental</a>
                    </div>
                </div>

                <a href='#about'>About Us</a>
                <a href='#contact'>Contact Us</a>
            </div>
            <div className='navbar-right'>
                <button className="btn">Register</button>
                <button className="btn primary">Book Appointment</button>
            </div>
        </nav>
    ) 
}

export default Nav;