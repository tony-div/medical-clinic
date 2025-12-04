import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminApp from '../../AdminPage'; // Reuse the Admin Layout Wrapper
// We can reuse the UI of AppointmentDetails but we need to fetch data independently 
// or simpler: Just reconstruct the UI here for the Admin context.
import { useState, useEffect } from 'react';
import { DB_APPOINTMENTS_KEY } from '../../../../data/initDB';
import '../../../patient/AppointmentDetails.css'; // Reuse CSS

export default function AdminAppointmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);

    useEffect(() => {
        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const found = allAppts.find(a => a.id === Number(id));
        if (found) {
            setAppointment(found);
        } else {
            alert("Appointment not found");
            navigate('/admin/dashboard');
        }
    }, [id, navigate]);

    if (!appointment) return <div>Loading...</div>;
    return (
        <div style={{ padding: '40px', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <button 
                    onClick={() => navigate(-1)} // Go back to where they came from
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    ← Back to Admin Panel
                </button>

                <header className="details-header" style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, color: '#2C3E50' }}>Medical Report</h1>
                    <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                    </span>
                </header>

                <div className="details-grid">
                    {/* LEFT: INFO */}
                    <div className="info-card">
                        <h3 style={{ color: '#3498DB' }}>Patient & Appointment Info</h3>
                        <p><strong>Patient:</strong> {appointment.patientName} <span style={{ color: '#777', fontSize: '0.9rem' }}>({appointment.patientEmail})</span></p>
                        <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                        <p><strong>Date:</strong> {appointment.date} at {appointment.time}</p>
                        <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />
                        <p><strong>Reason:</strong> "{appointment.reason}"</p>
                        
                        <div style={{ marginTop: '15px' }}>
                            <strong>Uploaded Tests:</strong>
                            {appointment.uploadedFiles ? (
                                <div style={{ marginTop: '5px' }}>
                                    <a href={appointment.uploadedFiles} target="_blank" rel="noreferrer" style={{ color: '#3498DB', textDecoration: 'none' }}>
                                        📄 Open Attached File
                                    </a>
                                </div>
                            ) : (
                                <span style={{ color: '#999', marginLeft: '5px' }}>None</span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: DIAGNOSIS */}
                    <div className="report-card">
                        <h3 style={{ color: '#27AE60' }}>Doctor's Diagnosis</h3>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>
                            {appointment.diagnosis || "No diagnosis recorded."}
                        </p>

                        <h4 style={{ margin: '10px 0 5px', color: '#555' }}>Prescription</h4>
                        <div className="rx-box">
                            {appointment.prescription || "No prescription given."}
                        </div>

                        <h4 style={{ margin: '15px 0 5px', color: '#555' }}>Treatment Plan</h4>
                        <p style={{ color: '#555' }}>{appointment.treatmentPlan || "No additional notes."}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}