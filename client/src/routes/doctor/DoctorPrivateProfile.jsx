import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaDollarSign, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaLock, FaGlobeAmericas, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import { DB_DOCTORS_KEY } from '../../data/initDB';
import './DoctorProfile.css';

export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // If ID exists, we are in Admin Mode
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [doctorData, setDoctorData] = useState(null);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        let myProfile = null;

        if (id) {
            // A. ADMIN MODE
            myProfile = allDoctors.find(d => d.id === Number(id));
        } else {
            // B. DOCTOR MODE
            myProfile = allDoctors.find(d => d.email === currentUserEmail);
        }

        if (myProfile) {
            setDoctorData(myProfile);
        } else {
            if (!id && !myProfile) {
                // navigate('/'); // Uncomment to enforce redirect
            }
        }
    }, [currentUserEmail, id, navigate]);

    const handleBack = () => {
        if (location.state?.returnTab) {
            navigate('/admin/dashboard', { state: { activePage: location.state.returnTab } });
        } else {
            navigate(-1);
        }
    };

    if (!doctorData) return <div className="loading-state">Loading Profile...</div>;

    // Helper for Initials
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "DR";
    };

    return (
        <div className="dashboard-layout">
            {!id && <DoctorSidebar />} 
            
            <main 
                className="dashboard-main fade-in" 
                style={{
                    marginLeft: id ? '0' : '260px', 
                    width: id ? '100%' : 'calc(100% - 260px)'
                }}
            >
                <header className="dashboard-header">
                    <div>
                        <h1>{id ? "Doctor Details (Admin View)" : "My Doctor Profile"}</h1>
                        <p>{id ? "Viewing private doctor information." : "View your official information."}</p>
                    </div>
                    
                    {id && (
                        <button className="back-btn" onClick={handleBack}>
                            <FaArrowLeft /> Back
                        </button>
                    )}
                </header>

                <div className="profile-container">
                    <div className="profile-card">
                        
                        {/* HEADER SECTION */}
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder doctor-avatar">
                                    {getInitials(doctorData.name)}
                                </div>
                                <div>
                                    <h2>{doctorData.name}</h2>
                                    <span className="user-role">{doctorData.specialty} Specialist</span>
                                </div>
                            </div>
                            <div className={`status-badge-large ${doctorData.status === 'Active' ? 'active' : 'inactive'}`}>
                                {doctorData.status === 'Active' ? <FaCheckCircle/> : <FaTimesCircle/>}
                                {doctorData.status || "Active"}
                            </div>
                        </div>

                        <div className="profile-body">
                            
                            {/* --- PUBLIC INFO --- */}
                            <div className="section-header-row">
                                <h4 className="section-title"><FaGlobeAmericas className="icon"/> Public Information</h4>
                                <span className="section-subtitle">Visible to patients</span>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaUserMd className="icon"/> Full Name</label>
                                    <div className="read-only-field">{doctorData.name}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaStethoscope className="icon"/> Specialty</label>
                                    <div className="read-only-field">{doctorData.specialty}</div>
                                </div>
                            </div>

                            <div className="form-grid three-col">
                                <div className="input-group">
                                    <label><FaDollarSign className="icon"/> Consultation Fees</label>
                                    <div className="read-only-field">{doctorData.fees} EGP</div>
                                </div>
                                <div className="input-group">
                                    <label>Gender</label>
                                    <div className="read-only-field capitalize">{doctorData.gender || "-"}</div>
                                </div>
                                <div className="input-group">
                                    <label>Experience</label>
                                    <div className="read-only-field">Senior Level</div>
                                </div>
                            </div>

                            <div className="input-group full-width">
                                <label><FaInfoCircle className="icon"/> Bio / About</label>
                                <div className="read-only-field bio-box">
                                    {doctorData.bio || "No biography provided."}
                                </div>
                            </div>

                            <div className="divider"></div>

                            {/* --- PRIVATE INFO --- */}
                            <div className="section-header-row">
                                <h4 className="section-title private"><FaLock className="icon"/> Private Information</h4>
                                <span className="section-subtitle">Visible only to you and admins</span>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaEnvelope className="icon"/> Email (Login)</label>
                                    <div className="read-only-field locked">{doctorData.email}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaPhone className="icon"/> Phone Number</label>
                                    <div className="read-only-field">{doctorData.phone || "-"}</div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaMapMarkerAlt className="icon"/> Address</label>
                                    <div className="read-only-field">{doctorData.address || "-"}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaBirthdayCake className="icon"/> Birth Date</label>
                                    <div className="read-only-field">{doctorData.birth_date || "-"}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}