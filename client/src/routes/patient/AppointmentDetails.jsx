import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PatientSidebar from '../../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY, DB_DOCTORS_KEY } from '../../data/initDB';
import './AppointmentDetails.css';

export default function AppointmentDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [appointment, setAppointment] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const found = allAppts.find(a => a.id === Number(id));
        
        if (found) {
            setAppointment(found);
        } else {
            Swal.fire('Error', 'Appointment not found', 'error').then(() => navigate('/patient/appointments'));
        }
    }, [id, currentUserEmail, navigate]);

    const submitReview = () => {
        if (!reviewText.trim()) return Swal.fire('Oops', 'Please write a comment.', 'warning');

        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        const docIndex = allDoctors.findIndex(d => d.name === appointment.doctorName || d.name === appointment.doctor);
        
        if (docIndex !== -1) {
            const currentDoctor = allDoctors[docIndex];
            const alreadyReviewed = currentDoctor.reviews?.find(r => r.user === appointment.patientName);
            
            if (alreadyReviewed) {
                Swal.fire('Already Reviewed', 'You have already reviewed this doctor.', 'info');
                setShowReviewModal(false);
                return;
            }

            const newReview = { id: Date.now(), user: appointment.patientName, rating: rating, comment: reviewText };

            if (!currentDoctor.reviews) currentDoctor.reviews = [];
            currentDoctor.reviews.push(newReview);

            const totalStars = currentDoctor.reviews.reduce((acc, r) => acc + r.rating, 0);
            currentDoctor.rating = (totalStars / currentDoctor.reviews.length).toFixed(1);

            localStorage.setItem(DB_DOCTORS_KEY, JSON.stringify(allDoctors));
            
            Swal.fire({ icon: 'success', title: 'Review Submitted!', text: 'Thank you for your feedback.', timer: 2000, showConfirmButton: false });
            setShowReviewModal(false);
        } else {
            Swal.fire('Error', 'Could not find doctor profile to update.', 'error');
        }
    };

    if (!appointment) return <div>Loading...</div>;

    if (appointment.status === 'Cancelled') {
        return (
            <div className="dashboard-layout">
                <PatientSidebar />
                <main className="dashboard-main">
                    <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                    <div className="details-container" style={{textAlign:'center', marginTop:'50px'}}>
                        <h1 style={{color:'#C0392B'}}>🚫 Appointment Cancelled</h1>
                        <p>This appointment was cancelled. Details are unavailable.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main">
                <div className="details-container">
                    {/* --- BACK BUTTON --- */}
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>

                    <header className="details-header">
                        <h1>Medical Report</h1>
                        <span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                    </header>

                    <div className="details-grid">
                        <div className="info-card">
                            <h3>👨‍⚕️ Doctor Info</h3>
                            <div className="doc-profile">
                                <img src={appointment.image} alt="Doc" className="doc-img-small" />
                                <div>
                                    <h4>{appointment.doctorName || appointment.doctor}</h4>
                                    <p>{appointment.specialty}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="visit-info">
                                <p><strong>Date:</strong> {appointment.date}</p>
                                <p><strong>Time:</strong> {appointment.time}</p>
                                <p><strong>Reason:</strong> "{appointment.reason}"</p>
                                
                                <div style={{marginTop:'15px'}}>
                                    <strong>📂 Your Uploaded Tests:</strong>
                                    {appointment.uploadedFiles ? (
                                        <div style={{marginTop:'5px'}}>
                                            <a href={appointment.uploadedFiles} target="_blank" rel="noreferrer" className="file-link">📄 View Attached File</a>
                                        </div>
                                    ) : (
                                        <p style={{color:'#999', fontSize:'0.9rem'}}>No files uploaded.</p>
                                    )}
                                </div>
                            </div>

                            {appointment.status === 'Completed' && (
                                <button className="btn-action review" style={{width:'100%', marginTop:'20px', padding:'12px'}} onClick={() => setShowReviewModal(true)}>
                                    ★ Rate & Review Doctor
                                </button>
                            )}
                        </div>

                        {appointment.status === "Completed" ? (
                            <div className="report-card">
                                <h3>📋 Diagnosis</h3>
                                <p className="diagnosis-text">{appointment.diagnosis || "No diagnosis recorded."}</p>
                                <h3>💊 Prescription</h3>
                                <div className="rx-box">{appointment.prescription || "No prescription given."}</div>
                                <h3>📝 Treatment Plan</h3>
                                <p>{appointment.treatmentPlan || "No additional notes."}</p>
                            </div>
                        ) : (
                            <div className="report-card empty">
                                <h3>⏳ Visit Pending</h3>
                                <p>The doctor has not entered a diagnosis yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* REVIEW MODAL */}
            {showReviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content review-modal">
                        <h3>Rate {appointment.doctorName}</h3>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= rating ? "star filled" : "star"} onClick={() => setRating(star)}>★</span>
                            ))}
                        </div>
                        <textarea rows="3" placeholder="Write a review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                        <div className="modal-buttons">
                            <button className="btn secondary" onClick={() => setShowReviewModal(false)}>Close</button>
                            <button className="btn primary" onClick={submitReview}>Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}