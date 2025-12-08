import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaAmbulance, FaHeartbeat, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaArrowRight, FaStethoscope } from 'react-icons/fa'; 
import Nav from '../../components/Nav.jsx'; 
import { DB_DOCTORS_KEY } from '../../data/initDB.js'; 
import './home.css';

export default function Home() {
  // Safe check for login status
  const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const isLoggedIn = !!storedUser;
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
      // Fetching from LocalStorage (or API if you switch later)
      const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
      const uniqueSpecs = [...new Set(allDoctors.map(doc => doc.specialty))];
      // If empty, show some defaults so the page isn't blank
      const displayDepts = uniqueSpecs.length > 0 ? uniqueSpecs : ["Cardiology", "Neurology", "Dermatology", "Pediatrics"];
      setDepartments(displayDepts.slice(0, 4)); 
  }, []);

  return (
    <div className="home-wrapper">
      <Nav />

      {/* --- HERO SECTION --- */}
      <section id="home" className="hero-section">
        <div className="hero-content fade-in-up">
           <span className="hero-badge"><FaStethoscope /> WELCOME TO CLINIC NO.7</span>
           <h1>Your Health Is Our <br/> <span className="highlight-text">Top Priority</span></h1>
           <p>
             Experience world-class healthcare with just a click. Book appointments with top specialists, 
             manage your medical records, and take control of your well-being today.
           </p>
           
           <div className="hero-buttons">
             <Link to={isLoggedIn ? "/book/new" : "/login"} className="btn-primary-gradient">
               Book Appointment
             </Link>
             <a href="#about" className="btn-secondary-outline">
               Learn More
             </a>
           </div>
        </div>
        
        <div className="hero-image-container fade-in-right">
             {/* Ensure this image exists in public/assets or use a URL */}
             <img src="/assets/home.png" alt="Medical Team" className="hero-img" onError={(e) => e.target.src='https://img.freepik.com/free-photo/team-young-specialist-doctors-standing-corridor-hospital_1303-21199.jpg'}/>
        </div>
      </section>

      {/* --- FLOATING FEATURES --- */}
      <div className="features-container">
        <div className="feature-card">
            <div className="icon-circle blue"><FaUserMd /></div>
            <div>
                <h3>Qualified Doctors</h3>
                <p>Top specialists in every field.</p>
            </div>
        </div>
        <div className="feature-card">
            <div className="icon-circle green"><FaAmbulance /></div>
            <div>
                <h3>Emergency Care</h3>
                <p>24/7 support for critical needs.</p>
            </div>
        </div>
        <div className="feature-card">
            <div className="icon-circle purple"><FaHeartbeat /></div>
            <div>
                <h3>Modern Tech</h3>
                <p>Advanced diagnostic equipment.</p>
            </div>
        </div>
      </div>

      {/* --- DEPARTMENTS SECTION --- */}
      <section id="departments" className="section departments-section">
        <div className="section-header">
            <h2>Our Departments</h2>
            <div className="header-line"></div>
            <p>We offer a wide range of specialized medical services tailored to your needs.</p>
        </div>
        
        <div className="departments-grid">
            {departments.map((dept, index) => (
                <Link to={`/doctors?dept=${dept}`} className="dept-card" key={index}>
                    <div className="dept-icon-box">{dept.charAt(0)}</div>
                    <h3>{dept}</h3>
                    <span className="link-text">Explore <FaArrowRight /></span>
                </Link>
            ))}
            
            <Link to="/doctors" className="dept-card view-all-card">
                <h3>View All Services</h3>
                <span className="link-text">See Full List <FaArrowRight /></span>
            </Link>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="section about-section">
        <div className="about-container">
            <div className="about-image">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Hospital Interior" />
                <div className="experience-badge">
                    <span className="years">15+</span>
                    <span className="text">Years of Experience</span>
                </div>
            </div>
            <div className="about-text">
                <span className="sub-heading">WHO WE ARE</span>
                <h2>Setting the Standards in Medical Care</h2>
                <p>
                    Clinic No.7 is a premier medical facility dedicated to providing excellence in patient care. 
                    Founded with the mission to make healthcare accessible and efficient, we bridge the gap between 
                    patients and doctors through technology and compassion.
                </p>
                
                <div className="stats-grid">
                    <div className="stat-item">
                        <h3>4.5k+</h3>
                        <p>Happy Patients</p>
                    </div>
                    <div className="stat-item">
                        <h3>200+</h3>
                        <p>Hospital Rooms</p>
                    </div>
                    <div className="stat-item">
                        <h3>50+</h3>
                        <p>Expert Doctors</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer id="contact" className="footer-section">
        <div className="footer-content">
            <div className="footer-col branding">
                <h2>Clinic No.7</h2>
                <p>Providing advanced medical care with a personal touch. Your health journey starts here.</p>
            </div>
            
            <div className="footer-col links">
                <h3>Quick Links</h3>
                <a href="#home">Home</a>
                <a href="#departments">Departments</a>
                <a href="#about">About Us</a>
                <Link to="/doctors">Find a Doctor</Link>
            </div>

            <div className="footer-col contact-info">
                <h3>Contact Us</h3>
                <div className="contact-row"><FaMapMarkerAlt className="f-icon"/> <span>Alexandria, Egypt</span></div>
                <div className="contact-row"><FaPhoneAlt className="f-icon"/> <span>+20 123 456 7890</span></div>
                <div className="contact-row"><FaEnvelope className="f-icon"/> <span>info@clinicno7.com</span></div>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; 2025 Clinic No.7. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}