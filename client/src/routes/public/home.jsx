import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Import icons for visual appeal
import { FaUserMd, FaAmbulance, FaHeartbeat, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa'; 
import Nav from '../../components/Nav.jsx'; 
import { DB_DOCTORS_KEY } from '../../data/initDB.js'; 
import './home.css';

export default function Home() {
  const isLoggedIn = localStorage.getItem("currentUser");
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
      const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
      const uniqueSpecs = [...new Set(allDoctors.map(doc => doc.specialty))];
      setDepartments(uniqueSpecs.slice(0, 4)); // Limit to 4 for display
  }, []);

  return (
    <div className="home-wrapper">
      <Nav />

      {/* --- HERO SECTION --- */}
      <section id="home" className="hero-section">
        <div className="hero-content">
           <span className="hero-subtitle">WELCOME TO CLINIC NO.7</span>
           <h1>Your Health Is Our <br/> Top Priority</h1>
           <p>
             Experience world-class healthcare with just a click. Book appointments with top specialists, 
             manage your medical records, and take control of your well-being today.
           </p>
           
           <div className="hero-buttons">
             <Link to={isLoggedIn ? "/doctors" : "/login"} className="btn-primary">
               Book Appointment
             </Link>
             <a href="#about" className="btn-secondary">
               Learn More
             </a>
           </div>
        </div>
        <div className="hero-image-container">
             <img src="/assets/home.png" alt="Medical Team" className="hero-img"/>
        </div>
      </section>
      <div className="features-bar">
        <div className="feature-item">
            <div className="icon-box"><FaUserMd /></div>
            <div>
                <h3>Qualified Doctors</h3>
                <p>Top specialists in every field.</p>
            </div>
        </div>
        <div className="feature-item">
            <div className="icon-box"><FaAmbulance /></div>
            <div>
                <h3>Emergency Care</h3>
                <p>24/7 support for critical needs.</p>
            </div>
        </div>
        <div className="feature-item">
            <div className="icon-box"><FaHeartbeat /></div>
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
            <p>We offer a wide range of specialized medical services.</p>
        </div>
        
        <div className="departments-grid">
            {departments.length > 0 ? (
                departments.map(dept => (
                    <Link to={`/doctors?dept=${dept}`} className="dept-card" key={dept}>
                        <div className="dept-icon">{dept.charAt(0)}</div>
                        <h3>{dept}</h3>
                        <span className="link-text">Explore <FaArrowRight style={{fontSize:'12px', marginLeft:'5px'}}/></span>
                    </Link>
                ))
            ) : (
                <p>Loading Departments...</p>
            )}
            
            <Link to="/doctors" className="dept-card view-all">
                <h3>View All Services</h3>
                <span className="link-text">See Full List <FaArrowRight style={{fontSize:'12px', marginLeft:'5px'}}/></span>
            </Link>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="section about-section">
        <div className="about-container">
            <div className="about-image">
                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Hospital Interior" />
            </div>
            <div className="about-text">
                <h2>Who We Are</h2>
                <p>
                    Clinic No.7 is a premier medical facility dedicated to providing excellence in patient care. 
                    Founded with the mission to make healthcare accessible and efficient, we bridge the gap between 
                    patients and doctors through technology and compassion.
                </p>
                
                <div className="stats-grid">
                    <div className="stat-box">
                        <h3>4.5k+</h3>
                        <p>Happy Patients</p>
                    </div>
                    <div className="stat-box">
                        <h3>200+</h3>
                        <p>Hospital Rooms</p>
                    </div>
                    <div className="stat-box">
                        <h3>50+</h3>
                        <p>Expert Doctors</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <section id="contact" className="footer-section">
        <div className="footer-content">
            <div className="footer-col branding">
                <h2>Clinic No.7</h2>
                <p>Providing advanced medical care with a personal touch. Your health journey starts here.</p>
            </div>
            
            <div className="footer-col">
                <h3>Quick Links</h3>
                <a href="#home">Home</a>
                <a href="#departments">Departments</a>
                <a href="#about">About Us</a>
                <Link to="/doctors">Find a Doctor</Link>
            </div>

            <div className="footer-col contact-info">
                <h3>Contact Us</h3>
                <p><FaMapMarkerAlt className="f-icon"/> Alexandria, Egypt</p>
                <p><FaPhoneAlt className="f-icon"/> +20 123 456 7890</p>
                <p><FaEnvelope className="f-icon"/> info@clinicno7.com</p>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; 2025 Clinic No.7. All Rights Reserved.</p>
        </div>
      </section>

    </div>
  );
}