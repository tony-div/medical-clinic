import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaUserMd, FaClock, FaCalendarAlt, FaStethoscope, FaPrescriptionBottleAlt, FaNotesMedical, FaFileAlt, FaStar, FaTimes, FaCheckCircle, FaBan } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY, DB_DOCTORS_KEY } from '../../data/initDB';
import './AppointmentDetails.css';

export default function AppointmentDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [appointment, setAppointment] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // New Success Popup State
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const found = allAppts.find(a => a.id === Number(id));
        
        if (found) {
            setAppointment(found);
        } else {
            // Using Navigate directly instead of alert for better UX
            navigate('/patient/appointments');
        }
    }, [id, currentUserEmail, navigate]);

    const submitReview = () => {
        if (!reviewText.trim()) return Swal.fire('Oops', 'Please write a comment.', 'warning');

        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        // Robust check for doctor name match
        const docIndex = allDoctors.findIndex(d => 
            (d.name && appointment.doctorName && d.name.toLowerCase() === appointment.doctorName.toLowerCase()) || 
            (d.name && appointment.doctor && d.name.toLowerCase() === appointment.doctor.toLowerCase())
        );
        
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
            
            // Show Custom Success Popup
            setShowReviewModal(false);
            setShowSuccessPopup(true);
        } else {
            Swal.fire('Error', 'Could not find doctor profile to update.', 'error');
        }
    };

    if (!appointment) return <div className="loading-state">Loading details...</div>;

    if (appointment.status === 'Cancelled') {
        return (
            <div className="dashboard-layout">
                <PatientSidebar />
                <main className="dashboard-main fade-in">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </button>
                    <div className="cancelled-state">
                        <FaBan className="cancelled-icon" />
                        <h1>Appointment Cancelled</h1>
                        <p>This appointment was cancelled on {appointment.date}.</p>
                        <button className="primary-btn" onClick={() => navigate('/doctors')} style={{marginTop: '20px'}}>
                            Book New Appointment
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>Medical Report</h1>
                        <p>View diagnosis details and treatment plans.</p>
                    </div>
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back to List
                    </button>
                </header>

                <div className="details-grid">
                    {/* LEFT COLUMN: INFO CARD */}
                    <div className="info-card">
                        <div className="card-header">
                            <h3><FaUserMd className="icon-blue"/> Doctor Info</h3>
                        </div>
                        
                        <div className="doc-profile-large">
                            <div className="img-wrapper-large">
                                <img src={appointment.image || "https://via.placeholder.com/150"} alt="Doc" />
                            </div>
                            <div>
                                <h4>{appointment.doctorName || appointment.doctor}</h4>
                                <span className="doc-specialty">{appointment.specialty}</span>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div className="visit-details">
                            <div className="detail-row">
                                <FaCalendarAlt className="icon-gray"/> 
                                <span><strong>Date:</strong> {appointment.date}</span>
                            </div>
                            <div className="detail-row">
                                <FaClock className="icon-gray"/> 
                                <span><strong>Time:</strong> {appointment.time}</span>
                            </div>
                            <div className="detail-row">
                                <FaNotesMedical className="icon-gray"/> 
                                <span><strong>Reason:</strong> {appointment.reason}</span>
                            </div>
                        </div>

                        <div className="file-section">
                            <strong>Your Uploaded Files:</strong>
                            {appointment.uploadedFiles ? (
                                <a href={appointment.uploadedFiles} target="_blank" rel="noreferrer" className="file-download-btn">
                                    <FaFileAlt /> View Attachment
                                </a>
                            ) : (
                                <span className="no-file">No files uploaded.</span>
                            )}
                        </div>

                        {appointment.status === 'Completed' && (
                            <button className="review-btn" onClick={() => setShowReviewModal(true)}>
                                <FaStar /> Rate & Review Doctor
                            </button>
                        )}
                    </div>

                    {/* RIGHT COLUMN: REPORT CARD */}
                    <div className="report-card-container">
                        <div className="status-banner">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                                {appointment.status}
                            </span>
                        </div>

                        {appointment.status === "Completed" ? (
                            <div className="medical-content">
                                <div className="report-section">
                                    <h3><FaStethoscope className="icon-purple"/> Diagnosis</h3>
                                    <p className="diagnosis-text">{appointment.diagnosis || "No diagnosis recorded."}</p>
                                </div>
                                
                                <div className="report-section">
                                    <h3><FaPrescriptionBottleAlt className="icon-green"/> Prescription</h3>
                                    <div className="rx-box">
                                        {appointment.prescription || "No prescription given."}
                                    </div>
                                </div>

                                <div className="report-section">
                                    <h3><FaNotesMedical className="icon-orange"/> Treatment Plan</h3>
                                    <p className="plan-text">{appointment.treatmentPlan || "No additional notes."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pending-state">
                                <div className="pending-icon-box">
                                    <FaClock />
                                </div>
                                <h3>Visit Pending</h3>
                                <p>The doctor has not entered a diagnosis yet. Check back after your visit.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* REVIEW MODAL POPUP */}
                {showReviewModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <h3 className="popup-title">Rate Your Experience</h3>
                            <p className="popup-message">How was your visit with {appointment.doctorName}?</p>
                            
                            <div className="star-rating-container">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar 
                                        key={star} 
                                        className={star <= rating ? "star-icon filled" : "star-icon"} 
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>

                            <textarea 
                                className="review-textarea"
                                rows="3" 
                                placeholder="Write your review here..." 
                                value={reviewText} 
                                onChange={(e) => setReviewText(e.target.value)} 
                            />

                            <div className="popup-actions">
                                <button className="popup-btn secondary" onClick={() => setShowReviewModal(false)}>
                                    Cancel
                                </button>
                                <button className="popup-btn primary" onClick={submitReview}>
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS POPUP */}
                {showSuccessPopup && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <div className="popup-icon-container">
                                <FaCheckCircle className="popup-icon success" />
                            </div>
                            <h3 className="popup-title">Review Submitted!</h3>
                            <p className="popup-message">Thank you for your feedback.</p>
                            <button className="popup-btn primary" onClick={() => setShowSuccessPopup(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}