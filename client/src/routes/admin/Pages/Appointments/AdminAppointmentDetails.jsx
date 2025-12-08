import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminAppointmentDetails.css';

// API Services
import { getAppointmentById } from '../../../../services/appointment';
import { getDiagnosisByAppointmentId } from '../../../../services/diagnosis';
import { getDoctorByDocId } from '../../../../services/doctors';
import { getUser } from '../../../../services/users';

export default function AdminAppointmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch the appointment by ID
                const apptRes = await getAppointmentById(id);
                const apptData = apptRes.data.appointment || apptRes.data;

                if (!apptData) {
                    setError("Appointment not found");
                    return;
                }

                // 2. Fetch doctor info
                let doctorName = 'Unknown Doctor';
                if (apptData.doctor_id) {
                    try {
                        const docRes = await getDoctorByDocId(apptData.doctor_id);
                        doctorName = docRes.data?.data?.[0]?.name || docRes.data?.name || 'Unknown Doctor';
                    } catch (e) {
                        console.warn("Could not fetch doctor info:", e);
                    }
                }

                // 3. Fetch patient info
                let patientName = 'Unknown Patient';
                let patientEmail = '';
                if (apptData.user_id) {
                    try {
                        const userRes = await getUser(apptData.user_id);
                        patientName = userRes.data?.user?.name || userRes.data?.name || 'Unknown Patient';
                        patientEmail = userRes.data?.user?.email || userRes.data?.email || '';
                    } catch (e) {
                        console.warn("Could not fetch patient info:", e);
                    }
                }

                // 4. Fetch diagnosis/prescription
                try {
                    const diagRes = await getDiagnosisByAppointmentId(id);
                    const diagData = diagRes.data?.diagnosis || diagRes.data;
                    setDiagnosis(diagData);
                } catch (e) {
                    console.warn("No diagnosis found for this appointment:", e);
                    setDiagnosis(null);
                }

                // 5. Normalize status
                const normalizeStatus = (s) => {
                    if (!s) return 'Scheduled';
                    const lower = s.toLowerCase();
                    if (lower === 'complete' || lower === 'completed') return 'Completed';
                    if (lower === 'cancel' || lower === 'cancelled') return 'Cancelled';
                    return 'Scheduled';
                };

                // 6. Enrich appointment object
                const enrichedAppt = {
                    ...apptData,
                    doctorName,
                    patientName,
                    patientEmail,
                    time: apptData.starts_at ? apptData.starts_at.substring(0, 5) : '00:00',
                    status: normalizeStatus(apptData.status),
                    reason: apptData.reason || apptData.notes || 'No reason provided'
                };

                setAppointment(enrichedAppt);

            } catch (err) {
                console.error("Failed to load appointment details:", err);
                setError("Failed to load appointment details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Loading state
    if (loading) {
        return (
            <div className="admin-appt-page">
                <div className="admin-appt-loading">
                    <div className="spinner"></div>
                    <p>Loading appointment details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !appointment) {
        return (
            <div className="admin-appt-page">
                <div className="admin-appt-error">
                    <p className="error-text">{error || "Appointment not found"}</p>
                    <button onClick={() => navigate(-1)} className="back-btn">
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-completed';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-scheduled';
        }
    };

    return (
        <div className="admin-appt-page">
            <div className="admin-appt-container">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back to Admin Panel
                </button>

                {/* Main Card */}
                <div className="admin-appt-card">
                    {/* Header */}
                    <header className="admin-appt-header">
                        <h1>Medical Report</h1>
                        <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                            {appointment.status}
                        </span>
                    </header>

                    {/* Two Column Grid */}
                    <div className="admin-appt-grid">
                        {/* LEFT: Patient & Appointment Info */}
                        <div className="admin-info-section">
                            <h3 className="section-title info-title">
                                <span className="section-icon">📋</span>
                                Patient & Appointment Info
                            </h3>

                            <div className="info-items">
                                <div className="info-item">
                                    <label>Patient</label>
                                    <p>
                                        {appointment.patientName}
                                        <span className="email-text">({appointment.patientEmail})</span>
                                    </p>
                                </div>

                                <div className="info-item">
                                    <label>Doctor</label>
                                    <p>{appointment.doctorName}</p>
                                </div>

                                <div className="info-item">
                                    <label>Date & Time</label>
                                    <p>
                                        {new Date(appointment.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        <span className="time-text"> at {appointment.time}</span>
                                    </p>
                                </div>

                                <div className="info-item">
                                    <label>Reason for Visit</label>
                                    <p className="reason-text">"{appointment.reason}"</p>
                                </div>

                                {appointment.uploadedFiles && (
                                    <div className="info-item attachment">
                                        <label>Attached File</label>
                                        <a href={appointment.uploadedFiles} target="_blank" rel="noreferrer" className="file-link">
                                            📄 Open Attached File
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Diagnosis & Treatment */}
                        <div className="admin-diagnosis-section">
                            <h3 className="section-title diagnosis-title">
                                <span className="section-icon">🩺</span>
                                Doctor's Diagnosis
                            </h3>

                            <div className="diagnosis-items">
                                <div className="diagnosis-item">
                                    <label>Diagnosis</label>
                                    <p>{diagnosis?.diagnosis || appointment.diagnosis || "No diagnosis recorded."}</p>
                                </div>

                                <div className="diagnosis-item prescription">
                                    <label>💊 Prescription</label>
                                    <p>{diagnosis?.prescription || appointment.prescription || "No prescription given."}</p>
                                </div>

                                <div className="diagnosis-item">
                                    <label>Treatment Plan</label>
                                    <p>{diagnosis?.treatment_plan || diagnosis?.treatmentPlan || appointment.treatmentPlan || "No additional notes."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}