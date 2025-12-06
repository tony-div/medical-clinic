import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';

import { 
    getDoctorById, 
    getDoctorScheduleByDocId 
} from '../../services/doctors.js';

import { 
    getReviewsByDoctorId, 
    getRating 
} from '../../services/reviews.js';

import { 
    getAppointmentsByUserId 
} from '../../services/appointment.js';

import './PublicDoctorProfile.css';

export default function DoctorProfile() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [reviewsList, setReviewsList] = useState([]); 
    const [scheduleText, setScheduleText] = useState("Loading...");
    const [waitingTime, setWaitingTime] = useState("15 Mins");
    const [stats, setStats] = useState({ rating: "New", count: 0 });

    const currentUser = localStorage.getItem("activeUserEmail");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRes = await getDoctorById(id);
                const doctorData = docRes.data.doctor?.[0] || docRes.data.data?.[0] || null;

                if (!doctorData) return;
                console.log("Doctor Data from API:", doctorData);
                setDoctor(doctorData);

                const schedRes = await getDoctorScheduleByDocId(id);
                const schedules = schedRes.data.schedule || [];

                let availability = "Not set";

                if (schedules.length > 0) {
                    const days = schedules.map(d => d.day).join(", ");
                    const time = `${schedules[0].starts_at} - ${schedules[0].ends_at}`;
                    availability = `${days}: ${time}`;
                }
                setScheduleText(availability);

                const apptRes = await getAppointmentsByUserId(id);
                const appts = apptRes.data.appointments || [];
                const today = new Date().toISOString().split("T")[0];
                const pendingToday = appts.filter(a => 
                    a.status === "scheduled" && a.date === today
                ).length;
                const calculatedWait = 10 + pendingToday * 5;
                setWaitingTime(`${calculatedWait} Mins`);

                const revRes = await getReviewsByDoctorId(id);
                const reviews = revRes.data.data || [];
                setReviewsList(reviews);
                let avgRating = "New";
                let reviewsCount = 0;

                if (doctorData.rating_id) {
                    const ratingRes = await getRating(doctorData.rating_id);
                    const rating = ratingRes.data.rating;

                    if (rating) {
                        avgRating = rating.avg_rating.toFixed(1);
                        reviewsCount = rating.reviews_count;
                    }
                }

                setStats({ rating: avgRating, count: reviewsCount });

            } catch (err) {
                console.error("Error loading doctor profile:", err);
            }
        };

        fetchData();
    }, [id]);

    if (!doctor) {
        return <div className="not-found">Loading Doctor Profile...</div>;
    }

    const handleBooking = () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        navigate(`/book/${doctor.id}`);
    };

    const status = doctor.status === "inactive" ? "Inactive" : "Active";

    return (
        <div className="page-container">
            <Nav />

            <div className="profile-content">
                <div className="profile-header">

                    {/* LEFT CARD */}
                    <div className="profile-card left-card">
                        <div className="profile-main-info">
                            <img 
                                src={doctor.profile_pic_path || "/default-doctor.png"} 
                                alt={doctor.name}
                                className="profile-img" 
                            />

                            <div className="profile-text">
                                <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                                    <h1>{doctor.name}</h1>

                                    <span 
                                        style={{
                                            fontSize:'0.8rem',
                                            padding:'0 12px',
                                            borderRadius:'15px',
                                            fontWeight:'bold',
                                            backgroundColor: status === 'Active' ? '#D5F5E3' : '#FADBD8',
                                            color: status === 'Active' ? '#27AE60' : '#C0392B',
                                            display:'inline-flex',
                                            alignItems:'center',
                                            justifyContent:'center',
                                            height:'28px'
                                        }}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <p className="profile-specialty">
                                    {doctor.specialty_name || doctor.specialty || "Specialist"}
                                </p>

                                <div className="profile-rating">
                                    ⭐ {stats.rating} 
                                    <span className="review-count">({stats.count} reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-details">
                            <h3>👨‍⚕️ About the Doctor</h3>
                            <p>{doctor.about_doctor || "No description provided."}</p>

                            <h3>🎓 Education</h3>
                            <p>{doctor.education_and_experience || "No education details."}</p>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className="booking-card right-card">
                        <div className="booking-header">Booking Information</div>

                        <div className="booking-body">
                            <div className="booking-info-row">
                                <span>💰 Fees</span>
                                <strong>{doctor.consultation_fees} EGP</strong>
                            </div>

                            <div className="booking-info-row">
                                <span>⏳ Est. Waiting Time</span>
                                <strong>{waitingTime}</strong>
                            </div>

                            <div className="booking-schedule">
                                <p>Available:<br/><strong>{scheduleText}</strong></p>
                            </div>

                            <button 
                                className="book-btn-large"
                                onClick={handleBooking}
                                disabled={status === 'Inactive'}
                                style={{
                                    opacity: status === 'Inactive' ? 0.5 : 1,
                                    cursor: status === 'Inactive' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {status === 'Inactive'
                                    ? "Unavailable"
                                    : (currentUser ? "Book Appointment" : "Login to Book")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* REVIEWS */}
                <div className="reviews-section">
                    <h2>Patient Reviews ({stats.count})</h2>

                    <div className="reviews-list">
                        {reviewsList.length > 0 ? (
                            reviewsList.map((review, index) => (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.user}</span>
                                        <span className="review-stars">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="review-text">"{review.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <p style={{ color:'#777', fontStyle:'italic' }}>
                                No reviews yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Login Required</h3>
                        <p>Please login to book.</p>

                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowLoginModal(false)}>
                                Cancel
                            </button>
                            <Link
                                to="/login"
                                state={{ from: `/book/${doctor.id}` }}
                                className="btn primary"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
