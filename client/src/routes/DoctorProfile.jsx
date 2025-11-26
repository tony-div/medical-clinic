import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { doctorsData } from './doctors';
import './DoctorProfile.css';

export default function DoctorProfile() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const doctor = doctorsData.find(doc => doc.id === Number(id));

    if (!doctor) {
        return <div className="not-found">Doctor not found.</div>;
    }

    const handleBooking = () => {
        const isLoggedIn = false; 

        if (!isLoggedIn) {
            navigate('/login');
        } else {
            alert("Going to Booking Page...");
        }
    };

    return (
        <div className="page-container">
            <Nav />
            
            <div className="profile-content">
                <div className="profile-header">
                    <div className="profile-card left-card">
                        <div className="profile-main-info">
                            <img src={doctor.image} alt={doctor.name} className="profile-img" />
                            <div className="profile-text">
                                <h1>{doctor.name}</h1>
                                <p className="profile-specialty">{doctor.specialty} Specialist</p>
                                <div className="profile-rating">
                                    ⭐ {doctor.rating} <span className="review-count">({doctor.reviews.length} reviews)</span>
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
                                <span>⏳ Waiting Time</span>
                                <strong>{doctor.waitingTime}</strong>
                            </div>
                            
                            <div className="booking-schedule">
                                <p>Available: {doctor.schedule}</p>
                            </div>

                            <button className="book-btn-large" onClick={handleBooking}>
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="reviews-section">
                    <h2>Patient Reviews</h2>
                    <div className="reviews-list">
                        {doctor.reviews.length > 0 ? (
                            doctor.reviews.map(review => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.user}</span>
                                        <span className="review-stars">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="review-text">"{review.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <p>No reviews yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}