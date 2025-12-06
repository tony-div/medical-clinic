import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Nav from "../../components/Nav.jsx";
import {
    getDoctorById,
    getDoctorScheduleByDocId,
} from "../../services/doctors.js"; 
import {
    getUser
} from "../../services/users.js";
import {
    getReviewsByDoctorId
} from "../../services/reviews.js";
import {
    getAppointmentsByUserId
} from "../../services/appointment.js";
import {
    getMe
} from "../../services/auth.js"
import "./PublicDoctorProfile.css";

export default function DoctorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [scheduleText, setScheduleText] = useState("Loading...");
    const [waitingTime, setWaitingTime] = useState("Loading...");
    const [stats, setStats] = useState({ rating: "New", count: 0 });

    const [currentUser, setCurrentUser] = useState(null);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    // ----------------------------------------------------------
    // 1) Load user if logged in
    // ----------------------------------------------------------
    useEffect(() => {
        getMe()
            .then(res => setCurrentUser(res.data.user))
            .catch(() => setCurrentUser(null));
    }, []);

    // ----------------------------------------------------------
    // 2) Load doctor data
    // ----------------------------------------------------------
    useEffect(() => {
        async function loadDoctor() {
            try {
                const res = await getDoctorById(id);

                // Backend shape: { message, doctor }
                const doc = res.data.doctor ?? res.data.data ?? null;

                if (!doc) {
                    setDoctor(null);
                    return;
                }

                setDoctor({
                    id: doc.id,
                    name: doc.name,
                    specialty: doc.specialty,
                    education: doc.education ?? "Not provided",
                    bio: doc.bio ?? "No bio available.",
                    fees: doc.consultation_fees ?? 0,
                    image: doc.profile_pic_path,
                    status: doc.status ?? "Active",
                    rating_id: doc.rating_id
                });

                setStats({
                    rating: doc.avg_rating ?? "New",
                    count: doc.reviews_count ?? 0,
                });

            } catch (e) {
                console.error("Error loading doctor:", e);
            }
        }

        loadDoctor();
    }, [id]);

    // ----------------------------------------------------------
    // 3) Load schedule text
    // ----------------------------------------------------------
    useEffect(() => {
        async function loadSchedule() {
            try {
                const res = await getDoctorScheduleByDocId(id);

                // Backend shape: { message, schedule: [] }
                const schedule = res.data.schedule ?? [];

                if (schedule.length === 0) {
                    setScheduleText("No available schedule");
                    return;
                }

                // Format example:
                // Mon, Wed, Thu : 09:00 - 15:00
                const days = schedule.map(s => s.day).join(", ");
                const first = schedule[0];

                setScheduleText(`${days}: ${first.starts_at?.slice(0,5)} - ${first.ends_at?.slice(0,5)}`);
            } catch (e) {
                console.error("Error loading schedule:", e);
                setScheduleText("Unavailable");
            }
        }

        loadSchedule();
    }, [id]);

    // ----------------------------------------------------------
    // 4) Load reviews count + avg
    // ----------------------------------------------------------
    useEffect(() => {
        async function loadReviews() {
            try {
                const res = await getReviewsByDoctorId(id);

                // Backend response: { message, data: [ { user, rating, comment, date } ] }
                const reviews = res.data.data ?? [];

                const total = reviews.reduce((sum, r) => sum + r.rating, 0);
                const avg = reviews.length > 0 ? (total / reviews.length).toFixed(1) : "New";

                setStats({
                    rating: avg,
                    count: reviews.length
                });
            } catch (e) {
                console.error("Error loading reviews:", e);
            }
        }

        loadReviews();
    }, [id]);

    // ----------------------------------------------------------
    // 5) Compute estimated waiting time
    // ----------------------------------------------------------
    useEffect(() => {
        async function loadWaiting() {
            try {
                const res = await getAppointmentsByUserId(id);

                // backend shape: { appointments: [...] } or { data: ... }
                const apps = res.data.data ?? res.data.appointments ?? [];

                const today = new Date().toISOString().split("T")[0];

                const pendingToday = apps.filter(a =>
                    a.date === today && a.status === "Scheduled"
                ).length;

                const wait = 10 + pendingToday * 5;
                setWaitingTime(`${wait} Mins`);
            } catch (e) {
                console.error("Failed waiting time:", e);
                setWaitingTime("15 Mins");
            }
        }

        loadWaiting();
    }, [id]);

    // ----------------------------------------------------------
    // Booking logic
    // ----------------------------------------------------------
    const handleBooking = () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        navigate(`/book/${doctor.id}`);
    };

    // ----------------------------------------------------------
    // Render
    // ----------------------------------------------------------
    if (!doctor) return <div className="not-found">Loading Doctor Profile...</div>;

    const status = doctor.status;

    return (
        <div className="page-container">
            <Nav />

            <div className="profile-content">
                <div className="profile-header">

                    {/* LEFT CARD */}
                    <div className="profile-card left-card">
                        <div className="profile-main-info">
                            <img
                                src={doctor.image}
                                alt={doctor.name}
                                className="profile-img"
                            />

                            <div className="profile-text">
                                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                                    <h1>{doctor.name}</h1>

                                    <span
                                        style={{
                                            fontSize: "0.8rem",
                                            padding: "0 12px",
                                            borderRadius: "15px",
                                            fontWeight: "bold",
                                            backgroundColor: status === "Active" ? "#D5F5E3" : "#FADBD8",
                                            color: status === "Active" ? "#27AE60" : "#C0392B",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "28px"
                                        }}
                                    >
                                        {status}
                                    </span>
                                </div>

                                <p className="profile-specialty">{doctor.specialty} Specialist</p>

                                <div className="profile-rating">
                                    ⭐ {stats.rating}{" "}
                                    <span className="review-count">({stats.count} reviews)</span>
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
                                <p>
                                    Available:
                                    <br />
                                    <strong>{scheduleText}</strong>
                                </p>
                            </div>

                            <button
                                className="book-btn-large"
                                onClick={handleBooking}
                                disabled={status === "Inactive"}
                                style={{
                                    opacity: status === "Inactive" ? 0.5 : 1,
                                    cursor: status === "Inactive" ? "not-allowed" : "pointer",
                                }}
                            >
                                {status === "Inactive"
                                    ? "Unavailable"
                                    : currentUser
                                        ? "Book Appointment"
                                        : "Login to Book"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <Reviews doctorId={id} count={stats.count} />
            </div>

            {/* LOGIN MODAL */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Login Required</h3>
                        <p>Please login to book an appointment.</p>

                        <div className="modal-buttons">
                            <button
                                className="btn secondary"
                                onClick={() => setShowLoginModal(false)}
                            >
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


// -----------------------------------------------------------
// Reviews Section Component
// -----------------------------------------------------------
function Reviews({ doctorId, count }) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        getReviewsByDoctorId(doctorId)
            .then(res => setReviews(res.data.data ?? []))
            .catch(() => setReviews([]));
    }, [doctorId]);

    return (
        <div className="reviews-section">
            <h2>Patient Reviews ({count})</h2>

            <div className="reviews-list">
                {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                        <div key={i} className="review-card">
                            <div className="review-header">
                                <span className="reviewer-name">{review.user}</span>
                                <span className="review-stars">
                                    {"⭐".repeat(review.rating)}
                                </span>
                            </div>
                            <p className="review-text">"{review.comment}"</p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                        No reviews yet. Be the first to rate this doctor!
                    </p>
                )}
            </div>
        </div>
    );
}
