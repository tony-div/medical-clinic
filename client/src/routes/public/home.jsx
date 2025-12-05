import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import Nav from '../../components/Nav.jsx'; 
import { DB_DOCTORS_KEY } from '../../data/initDB.js'; 
import './home.css';

export default function Home() {
  const isLoggedIn = localStorage.getItem("activeUserEmail");
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
      const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
      const uniqueSpecs = [...new Set(allDoctors.map(doc => doc.specialty))];
      setDepartments(uniqueSpecs.slice(0, 4));
  }, []);

  return (
    <div className="App">
      <Nav />
      <section id="home" className="section home-section">
        <div className="content-box">
           <h1>Premium Treatments for a Healthy Lifestyle</h1>
           <p>Seamlessly advance scalable architectures with future-ready growth strategies.</p>
           
           <Link 
             to={isLoggedIn ? "/doctors" : "/login"} 
             className="book-btn" 
             style={{ textDecoration: 'none', display: 'inline-block' }}
           >
             Book Appointment
           </Link>
        </div>
      </section>

      <section id="departments" className="section departments-section">
        <h2>Our Departments</h2>
        <div className="grid-placeholder">
            {departments.length > 0 ? (
                departments.map(dept => (
                    <Link to={`/doctors?dept=${dept}`} className="card dept-card" key={dept}>
                        {dept}
                    </Link>
                ))
            ) : (
                <p>Loading Departments...</p>
            )}
            
            <Link to="/doctors" className="card dept-card" style={{background:'#3498DB', color:'white'}}>
                View All 
            </Link>
        </div>
      </section>

      <section id="about" className="section about-section">
        <h2>About Us</h2>
        <div className="placeholder-box">
            <p>4500+ Happy Patients</p>
            <p>200+ Hospital Rooms</p>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <h2>Contact Us</h2>
        <p>Email: info@clinicno7.com</p>
        <p>Location: Alexandria, Egypt</p>
      </section>

    </div>
  );
}