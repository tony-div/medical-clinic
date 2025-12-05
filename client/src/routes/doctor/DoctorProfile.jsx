import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import { DB_DOCTORS_KEY, DB_SCHEDULES_KEY, DB_APPOINTMENTS_KEY } from '../../data/initDB';
import './PublicDoctorProfile.css';

export default function DoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [doctor, setDoctor] = useState(null);
    const [scheduleText, setScheduleText] = useState("Loading...");
    const [waitingTime, setWaitingTime] = useState("15 Mins");
    const [stats, setStats] = useState({ rating: 0, count: 0 });

    const currentUser = localStorage.getItem("activeUserEmail");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    useEffect(() => {
        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        const foundDoc = allDoctors.find(d => d.id === Number(id));
        
        if (!foundDoc) return; 

        const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
        const docSched = allSchedules.find(s => s.doctorId === foundDoc.id);

        let availability = "Not set";
        if (docSched && docSched.days && docSched.days.length > 0) {
            const days = docSched.days.map(d => d.day.substring(0,3)).join(', ');
            const time = `${docSched.days[0].start} - ${docSched.days[0].end}`;
            availability = `${days}: ${time}`;
        }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const today = new Date().toISOString().split('T')[0];
        
        const pendingToday = allAppts.filter(a => 
            (a.doctor === foundDoc.name || a.doctorName === foundDoc.name) && 
            a.date === today && 
            a.status === 'Scheduled'
        ).length;

        const calculatedWait = 10 + (pendingToday * 5); 

        const reviews = foundDoc.reviews || [];
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : "New";

        setDoctor(foundDoc);
        setScheduleText(availability);
        setWaitingTime(`${calculatedWait} Mins`);
        setStats({ rating: avgRating, count: reviews.length });

    }, [id]);

    if (!doctor) return <div className="not-found">Loading Doctor Profile...</div>;

    const handleBooking = () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        
        const existingAppt = allAppts.find(a => 
            a.patientEmail === currentUser && 
            a.status === 'Scheduled' && 
            (a.doctor === doctor.name || a.doctorName === doctor.name)
        );

        if (existingAppt) {
            setShowBlockModal(true);
        } else {
            navigate(`/book/${doctor.id}`);
        }
    };

    const status = doctor.status || 'Active';

    return (
        <div className="page-container">
            <Nav />
            
            <div className="profile-content">
                <div className="profile-header">
                    
                    <div className="profile-card left-card">
                        <div className="profile-main-info">
                            <img src={doctor.image} alt={doctor.name} className="profile-img" />
                            <div className="profile-text">
                                {/* --- NEW: Name + Status --- */}
                                <div style={{display:'flex', alignItems:'center', gap:'15px', flexWrap:'wrap'}}>
                                    <h1>{doctor.name}</h1>
<span 
    style={{
        fontSize:'0.8rem', 
        padding:'0 12px', 
        borderRadius:'15px', 
        fontWeight:'bold',
        backgroundColor: status === 'Active' ? '#D5F5E3' : '#FADBD8',
        color: status === 'Active' ? '#27AE60' : '#C0392B',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '28px' 
    }}
>
    {status}
</span>
                                </div>
                                <p className="profile-specialty">{doctor.specialty} Specialist</p>
                                
                                <div className="profile-rating">
                                    ⭐ {stats.rating} <span className="review-count">({stats.count} reviews)</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="profile-details">
                            <h3>👨‍⚕️ About the Doctor</h3>
                            <p>{doctor.bio}</p>
                            <h3>🎓 Education</h3>
                            <p>{doctor.education}</p>
                        </div>
                    </div>

                    <div className="booking-card right-card">
                        <div className="booking-header">Booking Information</div>
                        <div className="booking-body">
                            <div className="booking-info-row">
                                <span>💰 Fees</span>
                                <strong>{doctor.fees} EGP</strong>
                            </div>
                            <div className="booking-info-row">
                                <span>⏳ Est. Waiting Time</span>
                                <strong>{waitingTime}</strong>
                            </div>
                            <div className="booking-schedule">
                                <p>Available: <br/><strong>{scheduleText}</strong></p>
                            </div>
                            
                            {/* Disable button if inactive */}
                            <button 
                                className="book-btn-large" 
                                onClick={handleBooking}
                                disabled={status === 'Inactive'}
                                style={{
                                    opacity: status === 'Inactive' ? 0.5 : 1, 
                                    cursor: status === 'Inactive' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {status === 'Inactive' ? 'Unavailable' : (currentUser ? "Book Appointment" : "Login to Book")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="reviews-section">
                    <h2>Patient Reviews ({stats.count})</h2>
                    <div className="reviews-list">
                        {doctor.reviews && doctor.reviews.length > 0 ? (
                            doctor.reviews.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.user}</span>
                                        <span className="review-stars">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="review-text">"{review.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <p style={{color:'#777', fontStyle:'italic'}}>No reviews yet. Be the first to rate this doctor!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals remain the same */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Login Required</h3>
                        <p>Please login to book.</p>
                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowLoginModal(false)}>Cancel</button>
                            <Link to="/login" state={{ from: `/book/${doctor.id}` }} className="btn primary">Go to Login</Link>
                        </div>
                    </div>
                </div>
            )}
            {showBlockModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{fontSize:'3rem'}}>⚠️</div>
                        <h3>Already Booked</h3>
                        <p>You already have an active appointment with <strong>{doctor.name}</strong>.</p>
                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowBlockModal(false)}>Close</button>
                            <button className="btn primary" onClick={() => navigate('/patient/appointments')}>View Appointments</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}