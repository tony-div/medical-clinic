import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    FaArrowLeft, FaUserMd, FaClock, FaCalendarAlt, 
    FaStethoscope, FaPrescriptionBottleAlt, FaNotesMedical, 
    FaFileAlt, FaStar, FaBan, FaCheckCircle, FaFileMedical, FaExternalLinkAlt, FaTimes 
} from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './AppointmentDetails.css';

// Import Services
import { getAppointmentById } from '../../services/appointment';
import { getDoctorById } from '../../services/doctors';
import { getDiagnosisByAppointmentId } from '../../services/diagnosis';
import { createReview } from '../../services/reviews';

export default function AppointmentDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    // Auth Check
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    const [appointment, setAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [loading, setLoading] = useState(true);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); 
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");

    useEffect(() => {
        if (!storedUser.id) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                // 1. Get Appointment Details
                const apptRes = await getAppointmentById(id);
                const apptData = apptRes.data?.appointment || apptRes.data;

                if (!apptData) throw new Error("Appointment not found");

                // 2. Get Doctor Details
                let doctorInfo = { name: "Unknown Doctor", specialty: "General" };
                if (apptData.doctor_id) {
                    try {
                        const docRes = await getDoctorById(apptData.doctor_id);
                        const docData = Array.isArray(docRes.data) 
                            ? docRes.data[0] 
                            : (docRes.data?.data?.[0] || docRes.data?.[0]);
                        
                        if (docData) {
                            doctorInfo = { name: docData.name, specialty: docData.specialty };
                        }
                    } catch (err) {
                        console.warn("Could not fetch doctor details");
                    }
                }

                // 3. Get Diagnosis (Only if completed)
                let diagnosisData = null;
                if (apptData.status === 'Complete' || apptData.status === 'complete') {
                    try {
                        const diagRes = await getDiagnosisByAppointmentId(id);
                        diagnosisData = diagRes.data?.diagnosis || diagRes.data;
                    } catch (err) {
                        console.log("No diagnosis found.");
                    }
                }

                // 4. Handle File URL (Medical Test)
                // We check the fields the same way your MedicalRecords page does
                let fileUrl = apptData.uploadedFiles || apptData.file_path || apptData.medical_test_path || "";
                if (fileUrl && !fileUrl.startsWith('http')) {
                    fileUrl = `${API_BASE_URL}${fileUrl}`;
                }

                setAppointment({
                    ...apptData,
                    doctorName: doctorInfo.name,
                    specialty: doctorInfo.specialty,
                    formattedDate: new Date(apptData.date).toLocaleDateString(),
                    formattedTime: apptData.starts_at || apptData.time,
                    testFile: fileUrl // Store the file URL here
                });
                setDiagnosis(diagnosisData);
                setLoading(false);

            } catch (error) {
                console.error("Error loading details:", error);
                Swal.fire("Error", "Could not load appointment details.", "error");
                navigate('/patient/appointments');
            }
        };

        fetchData();
    }, [id, navigate]);

    const submitReview = async () => {
        if (!reviewText.trim()) return Swal.fire('Oops', 'Please write a comment.', 'warning');

        try {
            await createReview({
                doctor_id: appointment.doctor_id,
                rating: rating,
                comment: reviewText
            });

            setShowReviewModal(false);
            setShowSuccessPopup(true);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Failed to submit review.";
            Swal.fire('Error', msg, 'error');
        }
    };

    if (loading) return <div className="loading-state">Loading details...</div>;
    if (!appointment) return null;

    if (appointment.status === 'Cancelled' || appointment.status === 'cancelled') {
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
                        <p>This appointment with <strong>{appointment.doctorName}</strong> was cancelled on {appointment.formattedDate}.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                <header className="details-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </button>
                    <h1>Appointment Details</h1>
                </header>

                <div className="details-grid">
                    {/* Left Column: Info */}
                    <div className="info-card">
                        <div className="doctor-header-row">
                            <div className="doc-avatar-large">
                                <FaUserMd />
                            </div>
                            <div>
                                <h2>{appointment.doctorName}</h2>
                                <p className="specialty-text">{appointment.specialty}</p>
                            </div>
                        </div>
                        
                        <div className="info-divider"></div>

                        <div className="appt-meta-grid">
                            <div className="meta-item">
                                <FaCalendarAlt className="meta-icon"/>
                                <div>
                                    <label>Date</label>
                                    <p>{appointment.formattedDate}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaClock className="meta-icon"/>
                                <div>
                                    <label>Time</label>
                                    <p>{appointment.formattedTime}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaFileAlt className="meta-icon"/>
                                <div>
                                    <label>Reason</label>
                                    <p>{appointment.reason || "General Checkup"}</p>
                                </div>
                            </div>
                            <div className="meta-item">
                                <FaCheckCircle className={`meta-icon status-${(appointment.status || "").toLowerCase()}`}/>
                                <div>
                                    <label>Status</label>
                                    <span className={`status-badge ${(appointment.status || "").toLowerCase()}`}>
                                        {appointment.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {(appointment.status === 'Complete' || appointment.status === 'complete') && (
                            <button className="review-btn-large" onClick={() => setShowReviewModal(true)}>
                                <FaStar /> Rate & Review Doctor
                            </button>
                        )}
                    </div>

                    {/* Right Column: Stacked Cards */}
                    <div className="right-column-stack">
                        
                        {/* 1. Medical Test Card (NEW) */}
                        <div className="medical-card">
                            <h3><FaFileMedical /> Medical Test / Attachments</h3>
                            {appointment.testFile ? (
                                <div className="attachment-box">
                                    <p>A medical test or document is attached to this appointment.</p>
                                    <a 
                                        href={appointment.testFile} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="view-file-btn"
                                    >
                                        <FaExternalLinkAlt /> View Document
                                    </a>
                                </div>
                            ) : (
                                <div className="no-records-small">
                                    <p>No documents uploaded.</p>
                                </div>
                            )}
                        </div>

                        {/* 2. Diagnosis Card */}
                        <div className="medical-card">
                            <h3><FaNotesMedical /> Medical Diagnosis</h3>
                            
                            {diagnosis ? (
                                <div className="diagnosis-content">
                                    <div className="diagnosis-item">
                                        <label><FaStethoscope /> Condition</label>
                                        <p>{diagnosis.description}</p>
                                    </div>
                                    {diagnosis.treatment_plan && (
                                        <div className="diagnosis-item">
                                            <label><FaNotesMedical /> Plan</label>
                                            <p>{diagnosis.treatment_plan}</p>
                                        </div>
                                    )}
                                    {diagnosis.prescription && (
                                        <div className="diagnosis-item">
                                            <label><FaPrescriptionBottleAlt /> Prescription</label>
                                            <p>{diagnosis.prescription}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="no-records-small">
                                    <p>No diagnosis recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Review Modal & Success Popup (Same as before) */}
                {showReviewModal && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <button className="close-popup" onClick={() => setShowReviewModal(false)}><FaTimes /></button>
                            <h2>Rate Your Experience</h2>
                            <textarea placeholder="Write your review here..." value={reviewText} onChange={(e) => setReviewText(e.target.value)}></textarea>
                            <button className="popup-btn primary" onClick={submitReview}>Submit Review</button>
                        </div>
                    </div>
                )}

                {showSuccessPopup && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up success-mode">
                             <div className="popup-icon-container"><FaCheckCircle className="popup-icon success" /></div>
                            <h3 className="popup-title">Review Submitted!</h3>
                            <button className="popup-btn primary" onClick={() => setShowSuccessPopup(false)}>Close</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}