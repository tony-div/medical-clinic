import './home.css';
import Nav from '../components/Nav';
export default function Home() {
  return (
    <div className="App">
      <Nav />
      <section id="home" className="section home-section">
        <div className="content-box">
           <h1>Premium Treatments for a Healthy Lifestyle</h1>
           <p>Seamlessly advance scalable architectures with future-ready growth strategies.</p>
           <button className="book-btn">Book Appointment</button>
        </div>
      </section>

      <section id="departments" className="section departments-section">
        <h2>Our Departments</h2>
        <div className="grid-placeholder">
            <div className="card">Cardiology</div>
            <div className="card">Neurology</div>
            <div className="card">Dental</div>
            <div className="card">Pediatrics</div>
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