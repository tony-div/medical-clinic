import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Kept for edge case redirects, but main success uses custom popup
import { FaArrowLeft, FaUserInjured, FaStethoscope, FaPrescriptionBottleAlt, FaNotesMedical, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY } from '../../data/initDB';
import './DoctorProfile.css'; // Reusing global styles

export default function Diagnosis() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appt, setAppt] = useState(null);
    const [formData, setFormData] = useState({ diagnosis: "", prescription: "", treatmentPlan: "" });
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const current = allAppts.find(a => a.id === Number(appointmentId));
        if (current) {
            setAppt(current);
            // Pre-fill if completed
            if(current.status === 'Completed') {
                setFormData({
                    diagnosis: current.diagnosis || "",
                    prescription: current.prescription || "",
                    treatmentPlan: current.treatmentPlan || ""
                });
            }
        } else {
            navigate('/doctor/appointments');
        }
    }, [appointmentId, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const updatedAppts = allAppts.map(a => {
            if (a.id === Number(appointmentId)) {
                return { ...a, status: "Completed", ...formData };
            }
            return a;
        });

        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(updatedAppts));
        
        // Show Custom Popup
        setShowSuccessPopup(true);
    };

    if (!appt) return <div className="loading-state">Loading...</div>;
    
    const isReadOnly = appt.status === 'Completed' || appt.status === 'Cancelled';

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>{isReadOnly ? "Appointment Details" : "Diagnosis & Treatment"}</h1>
                        <p>
                            Patient: <strong>{appt.patientName}</strong> | Status: 
                            <span className={`status-badge-large ${appt.status.toLowerCase()}`} style={{marginLeft:'10px'}}>
                                {appt.status}
                            </span>
                        </p>
                    </div>
                    
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </button>
                </header>

                <div className="profile-container">
                    
                    {/* LEFT CARD: PATIENT INFO (Summary) */}
                    <div className="profile-card" style={{height:'fit-content'}}>
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder" style={{background: '#3498DB'}}>
                                    <FaUserInjured style={{color:'white'}} />
                                </div>
                                <div>
                                    <h2>{appt.patientName}</h2>
                                    <span className="user-role">Patient</span>
                                </div>
                            </div>
                        </div>

                        <div className="booking-body" style={{padding:'0', marginTop:'20px'}}>
                            <div className="booking-info-row">
                                <strong>Reason for Visit</strong>
                                <span>{appt.reason}</span>
                            </div>
                            <div className="booking-info-row">
                                <strong>Date & Time</strong>
                                <span>{appt.date} at {appt.time}</span>
                            </div>
                            
                            <div className="file-section" style={{marginTop:'25px'}}>
                                <strong>Attached Documents:</strong>
                                {appt.uploadedFiles ? (
                                    <a href={appt.uploadedFiles} target="_blank" rel="noreferrer" className="file-download-btn" style={{marginTop:'10px'}}>
                                        <FaFileAlt /> View Patient File
                                    </a>
                                ) : (
                                    <span style={{display:'block', color:'#999', marginTop:'5px'}}>No files attached.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD: DIAGNOSIS FORM */}
                    <div className="reviews-section" style={{marginTop:'0'}}>
                        <h2><FaStethoscope /> Medical Report</h2>
                        
                        <form className="profile-form" onSubmit={handleSubmit}>
                            
                            <div className="input-group full-width" style={{marginBottom:'25px'}}>
                                <label><FaStethoscope className="icon"/> Diagnosis / Condition</label>
                                <input 
                                    type="text" 
                                    className={`read-only-field ${!isReadOnly ? 'bio-box' : ''}`}
                                    value={formData.diagnosis} 
                                    disabled={isReadOnly} 
                                    onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
                                    required 
                                    placeholder="Enter primary diagnosis..."
                                    style={{border: isReadOnly ? 'none' : '1px solid #e2e8f0', background: isReadOnly ? '#f8fafc' : 'white'}}
                                />
                            </div>

                            <div className="input-group full-width" style={{marginBottom:'25px'}}>
                                <label><FaPrescriptionBottleAlt className="icon"/> Prescription (Rx)</label>
                                <textarea 
                                    rows="4" 
                                    className={`read-only-field ${!isReadOnly ? 'bio-box' : ''}`}
                                    value={formData.prescription} 
                                    disabled={isReadOnly} 
                                    onChange={e => setFormData({...formData, prescription: e.target.value})} 
                                    required
                                    placeholder="List medications and dosage..."
                                    style={{fontFamily:'monospace', border: isReadOnly ? 'none' : '1px solid #e2e8f0', background: isReadOnly ? '#f0fdf4' : 'white', color: isReadOnly ? '#166534' : 'inherit'}}
                                ></textarea>
                            </div>

                            <div className="input-group full-width" style={{marginBottom:'30px'}}>
                                <label><FaNotesMedical className="icon"/> Treatment Plan & Notes</label>
                                <textarea 
                                    rows="5" 
                                    className={`read-only-field ${!isReadOnly ? 'bio-box' : ''}`}
                                    value={formData.treatmentPlan} 
                                    disabled={isReadOnly} 
                                    onChange={e => setFormData({...formData, treatmentPlan: e.target.value})}
                                    placeholder="Additional notes for patient..."
                                    style={{border: isReadOnly ? 'none' : '1px solid #e2e8f0', background: isReadOnly ? '#f8fafc' : 'white'}}
                                ></textarea>
                            </div>

                            {!isReadOnly && (
                               <button type="submit" className="btn-primary-action">
        <FaCheckCircle className="btn-icon-large"/> Complete Visit
    </button>
                            )}
                        </form>
                    </div>

                </div>

                {/* SUCCESS POPUP */}
                {showSuccessPopup && (
                    <div className="modal-overlay fade-in">
                        <div className="modal-content slide-up" style={{textAlign:'center', padding:'40px'}}>
                            <FaCheckCircle style={{fontSize:'4rem', color:'#22c55e', marginBottom:'20px'}} />
                            <h2 style={{margin:'0 0 10px 0', color:'#1e293b'}}>Diagnosis Saved!</h2>
                            <p style={{color:'#64748b', marginBottom:'30px'}}>The appointment has been marked as completed.</p>
                            <button 
                                className="book-btn-large" 
                                style={{background:'#0ea5e9'}}
                                onClick={() => navigate('/doctor/appointments')}
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}