import React from 'react';
import { Link } from 'react-router-dom'; 
import '../components/Nav.css'; 
import Nav from '../components/Nav.jsx'; 
import './home.css';

export default function Home() {
  return (
    <div className="App">
      <Nav />
      <section id="home" className="section home-section">
        <div className="content-box">
           <h1>Premium Treatments for a Healthy Lifestyle</h1>
           <p>Seamlessly advance scalable architectures with future-ready growth strategies.</p>
           <Link to="/login" className="book-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
             Book Appointment
           </Link>
        </div>
      </section>

      <section id="departments" className="section departments-section">
        <h2>Our Departments</h2>
        <div className="grid-placeholder">
            <Link to="/doctors?dept=Cardiology" className="card dept-card">Cardiology</Link>
            <Link to="/doctors?dept=Neurology" className="card dept-card">Neurology</Link>
            <Link to="/doctors?dept=Dental" className="card dept-card">Dental</Link>
            <Link to="/doctors?dept=Pediatrics" className="card dept-card">Pediatrics</Link>
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