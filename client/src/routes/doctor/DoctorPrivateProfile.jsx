import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
        // Security check
        if (!currentUserEmail) { navigate('/login'); return; }

        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        
        let myProfile = null;

        if (id) {
            // A. ADMIN MODE: Find by ID passed in URL
            myProfile = allDoctors.find(d => d.id === Number(id));
        } else {
            // B. DOCTOR MODE: Find by Session Email
            myProfile = allDoctors.find(d => d.email === currentUserEmail);
        }

        if (myProfile) {
            setDoctorData(myProfile);
        } else {
            // Only alert if we really can't find anything (prevents flash on reload)
            if (!id && !myProfile) {
                alert("Access Denied.");
                navigate('/');
            }
        }
    }, [currentUserEmail, id, navigate]);

const handleBack = () => {
        // If we have a specific return tab stored in state (e.g. 'appointments')
        if (location.state?.returnTab) {
            navigate('/admin/dashboard', { state: { activePage: location.state.returnTab } });
        } else {
            // Default behavior (History back)
            navigate(-1);
        }
    };

    if (!doctorData) return <div>Loading...</div>;

    return (
        <div className="dashboard-layout">
            {!id && <DoctorSidebar />} 
            
            <main className="dashboard-main" style={{marginLeft: id ? '0' : '260px', width: id ? '100%' : 'calc(100% - 260px)'}}>
                <header className="dashboard-header">
                    <h1>{id ? "Doctor Details (Admin View)" : "My Doctor Profile"}</h1>
                    <p>{id ? "Viewing private doctor information." : "View your official information."}</p>
                    
                    {/* --- UPDATED BACK BUTTON --- */}
                    {id && (
                        <button 
                            className="back-btn" 
                            onClick={handleBack} 
                            style={{marginTop:'10px'}}
                        >
                            ← Back
                        </button>
                    )}
                </header>

                <div className="booking-card" style={{maxWidth:'800px', margin:'0 auto'}}>
                    <div className="booking-header">
                        <span>Doctor Details (Read-Only)</span>
                    </div>

                    <form className="booking-body">
                        {/* --- PUBLIC INFO --- */}
                        <h4 style={{color:'#3498DB', marginBottom:'15px'}}>🌎 Public Information</h4>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Name</label>
                                <input value={doctorData.name} disabled className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Specialty</label>
                                <input value={doctorData.specialty} disabled className="date-input"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Fees (EGP)</label>
                                <input value={doctorData.fees} disabled className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Gender</label>
                                <input value={doctorData.gender || "-"} disabled className="date-input" style={{textTransform:'capitalize'}}/>
                            </div>
                        </div>

                        <div className="form-section" style={{marginBottom:'20px'}}>
                            <label>Status</label>
                            <span 
                                style={{
                                    display:'inline-flex', 
                                    alignItems:'center', 
                                    justifyContent:'center', 
                                    height:'24px', 
                                    padding:'0 15px', 
                                    borderRadius:'20px', 
                                    fontWeight:'bold',
                                    backgroundColor: doctorData.status === 'Active' ? '#D5F5E3' : '#FADBD8',
                                    color: doctorData.status === 'Active' ? '#27AE60' : '#C0392B',
                                    lineHeight: 1
                                }}
                            >
                                {doctorData.status || "Active"}
                            </span>
                        </div>

                        <div className="form-group">
                            <label>Bio / About</label>
                            <textarea 
                                rows="4" 
                                value={doctorData.bio} 
                                disabled 
                                className="date-input" 
                                style={{resize:'none', lineHeight:'1.5', background:'#f9f9f9', color:'#555'}}
                            ></textarea>
                        </div>

                        {/* --- PRIVATE INFO --- */}
                        <h4 style={{color:'#E74C3C', marginTop:'30px', marginBottom:'15px'}}>🔒 Private Information</h4>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Email (Login)</label>
                                <input value={doctorData.email} disabled className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Phone Number</label>
                                <input value={doctorData.phone || "-"} disabled className="date-input"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Address</label>
                                <input value={doctorData.address || "-"} disabled className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Birth Date</label>
                                <input value={doctorData.birth_date || "-"} disabled className="date-input"/>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}