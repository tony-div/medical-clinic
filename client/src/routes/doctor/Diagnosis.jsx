import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { FaArrowLeft, FaUserInjured, FaStethoscope, FaPrescriptionBottleAlt, FaNotesMedical, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import './DoctorProfile.css'; 
import './Diagnosis.css'; 
import { getAppointmentById } from '../../services/appointment';
import { createDiagnosis, getDiagnosisByAppointmentId } from '../../services/diagnosis';
import { getUser } from '../../services/users';
import { getMedicalTestByAppointmentId } from '../../services/medical-tests';

export default function Diagnosis() {
    const { appointmentId } = useParams(); 
    const navigate = useNavigate();
    
    const [appt, setAppt] = useState(null);
    const [formData, setFormData] = useState({ description: "", prescription: "", treatment_plan: "" });
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Appointment
                const apptRes = await getAppointmentById(appointmentId); 
                const current = apptRes.data?.appointment || apptRes.data;

                if (!current) throw new Error("Appointment not found");

                // 2. Get Patient Details
                let patientData = { name: "Unknown", email: "", phone: "" };
                if (current.user_id) {
                    try {
                        const userRes = await getUser(current.user_id);
                        const u = userRes.data.user || userRes.data;
                        patientData = { ...u, phone: u.phone_number };
                    } catch (e) { console.error("Patient fetch failed", e); }
                }

                let fileUrl = null;
                try {
                    const testRes = await getMedicalTestByAppointmentId(appointmentId);
                    const tests = testRes.data.medicalTest;
                    
                    if (Array.isArray(tests) && tests.length > 0) {
                        fileUrl = tests[0].file_path;
                        // Prepend API URL if it's a relative path
                        if (fileUrl && !fileUrl.startsWith('http')) {
                            fileUrl = `${API_BASE_URL}${fileUrl}`;
                        }
                    }
                } catch (e) { /* No test attached, ignore error */ }

                // Combine all data
                setAppt({ 
                    ...current, 
                    ...patientData,
                    attachedFile: fileUrl // Store it here
                });

                // 4. Pre-fill Diagnosis if Completed
                if (current.status === 'Complete' || current.status === 'complete' || current.status === 'Completed') {
                    try {
                        const diagRes = await getDiagnosisByAppointmentId(appointmentId);
                        const diag = diagRes.data?.diagnosis || diagRes.data;
                        if (diag) {
                            setFormData({
                                description: diag.description || "",
                                prescription: diag.prescription || "",
                                treatment_plan: diag.treatment_plan || ""
                            });
                        }
                    } catch (e) { /* No diagnosis found yet */ }
                }

                setLoading(false);

            } catch (error) {
                console.error("Load Error:", error);
                Swal.fire("Error", "Could not load visit details.", "error")
                    .then(() => navigate('/doctor/dashboard'));
            }
        };

        fetchData();
    }, [appointmentId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.description.trim()) {
            Swal.fire("Required", "Please enter a diagnosis description.", "warning");
            return;
        }

        try {
            await createDiagnosis(appointmentId, {
                description: formData.description,
                prescription: formData.prescription,
                treatment_plan: formData.treatment_plan
            });

            // Show Custom Popup
            setShowSuccessPopup(true);

        } catch (error) {
            console.error("Save Error:", error);
            Swal.fire("Error", error.response?.data?.error || "Failed to save diagnosis.", "error");
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    
    // Normalize status for check
    const status = (appt.status || "").toLowerCase();
    const isReadOnly = status === 'completed' || status === 'complete' || status === 'cancelled';

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>{isReadOnly ? "Appointment Details" : "Diagnosis & Treatment"}</h1>
                        <p>
                            Patient: <strong>{appt.name}</strong> | Status: 
                            <span className={`status-badge-large ${status}`} style={{marginLeft:'10px', textTransform:'capitalize'}}>
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
                                    <h2>{appt.name}</h2>
                                    <span className="user-role">Patient</span>
                                    <div style={{fontSize:'0.85rem', color:'#666', marginTop:'4px'}}>{appt.email}</div>
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
                                <span>{new Date(appt.date).toLocaleDateString('en-CA')} at {appt.starts_at || appt.time}</span>
                            </div>
                            
                            <div className="file-section" style={{marginTop:'25px'}}>
                                <strong>Attached Documents:</strong>
                                {appt.attachedFile ? (
                                    <a href={appt.attachedFile} target="_blank" rel="noreferrer" className="file-download-btn" style={{marginTop:'10px'}}>
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
                                    value={formData.description} 
                                    disabled={isReadOnly} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
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
                                    
                                    placeholder="List medications and dosage..."
                                    style={{fontFamily:'monospace', border: isReadOnly ? 'none' : '1px solid #e2e8f0', background: isReadOnly ? '#f0fdf4' : 'white', color: isReadOnly ? '#166534' : 'inherit'}}
                                ></textarea>
                            </div>

                            <div className="input-group full-width" style={{marginBottom:'30px'}}>
                                <label><FaNotesMedical className="icon"/> Treatment Plan & Notes</label>
                                <textarea 
                                    rows="5" 
                                    className={`read-only-field ${!isReadOnly ? 'bio-box' : ''}`}
                                    value={formData.treatment_plan} 
                                    disabled={isReadOnly} 
                                    onChange={e => setFormData({...formData, treatment_plan: e.target.value})}
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