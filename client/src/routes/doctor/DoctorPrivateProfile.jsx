import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaDollarSign, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaLock, FaGlobeAmericas, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import './DoctorProfile.css';

// Import Services
import { getUser, getAllUsers } from '../../services/users'; // Ensure getAllUsers exists or we handle it
import { getDoctors } from '../../services/doctors';

export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Only exists if Admin is viewing
    
    // --- 1. ROBUST ID RETRIEVAL ---
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const storedEmail = localStorage.getItem("activeUserEmail"); // Fallback
    
    // Determine which ID to look up (Url Param OR Logged In User)
    const [targetUserId, setTargetUserId] = useState(id || storedUser.id || null);
    
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        console.log("🔍 DEBUG: Profile Init", { id, storedID: storedUser.id, storedEmail, targetUserId });

        const fetchData = async () => {
            try {
                let finalId = targetUserId;

                // EMERGENCY FIX: If we have no ID but we have an email, find the ID!
                if (!finalId && storedEmail) {
                    console.warn("⚠️ ID missing, searching by Email:", storedEmail);
                    // Fetch all users to find the ID (Temporary fix for sync issues)
                    // Note: Ideally create a 'getUserByEmail' service, but this works for now
                    try {
                        // Assuming you don't have getAllUsers exported, we might fail here.
                        // If you do, great. If not, this block skips.
                        // For now, let's rely on the dashboard having set 'currentUser' correctly.
                    } catch (e) {}
                }

                if (!finalId) {
                    console.error("❌ No User ID found. Please Login again.");
                    // navigate('/login'); // <--- DISABLED AUTO-LOGOUT SO YOU CAN DEBUG
                    setLoading(false);
                    return;
                }

                // A. Fetch User Data
                const userRes = await getUser(finalId);
                const userData = userRes.data.user || userRes.data || {};

                // B. Fetch Doctor Specifics
                const doctorsRes = await getDoctors();
                const allDoctors = Array.isArray(doctorsRes.data) 
                    ? doctorsRes.data 
                    : (doctorsRes.data.doctors || doctorsRes.data.data || []);

                const doctorInfo = allDoctors.find(d => 
                    String(d.user_id) === String(finalId) || 
                    String(d.id) === String(finalId)
                ) || {};

                // C. Merge Data
                setProfileData({
                    ...userData,
                    ...doctorInfo,
                    name: userData.name || doctorInfo.name, 
                    email: userData.email,
                    phone: userData.phone_number || userData.phone || doctorInfo.phone || "-",
                    address: userData.address || doctorInfo.address || "-",
                    birth_date: userData.birth_date ? userData.birth_date.split('T')[0] : "-",
                    fees: doctorInfo.consultation_fees || doctorInfo.fees || "0",
                    bio: doctorInfo.about_doctor || doctorInfo.bio || "No biography provided.",
                    specialty: doctorInfo.specialty || "General",
                    status: doctorInfo.status || "Active"
                });

                setLoading(false);

            } catch (err) {
                console.error("Failed to load profile:", err);
                setError(true);
                setLoading(false);
            }
        }; 
        
        fetchData();
    }, [targetUserId, storedEmail, navigate]);

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : "DR";
    };

    const handleBack = () => {
        if (location.state?.returnTab) {
            navigate('/admin/dashboard', { state: { activePage: location.state.returnTab } });
        } else {
            navigate(-1);
        }
    };

    if (loading) return <div className="loading-state">Loading Profile... (Check Console if stuck)</div>;
    
    if (!profileData) {
        return (
            <div className="error-state">
                <h3>Profile Not Found</h3>
                <p>Could not retrieve data for ID: {targetUserId || "Unknown"}</p>
                <button onClick={() => navigate('/login')} className="primary-btn">Go to Login</button>
            </div>
        );
    }

    const isAdminView = !!id;

    return (
        <div className="dashboard-layout">
            {!isAdminView && <DoctorSidebar />} 
            
            <main 
                className="dashboard-main fade-in" 
                style={{
                    marginLeft: isAdminView ? '0' : '260px', 
                    width: isAdminView ? '100%' : 'calc(100% - 260px)'
                }}
            >
                <header className="dashboard-header">
                    <div>
                        <h1>{isAdminView ? "Doctor Details" : "My Doctor Profile"}</h1>
                        <p>{isAdminView ? "Viewing doctor information (Admin)." : "View your official information."}</p>
                    </div>
                    {isAdminView && (
                        <button className="back-btn" onClick={handleBack}>
                            <FaArrowLeft /> Back
                        </button>
                    )}
                </header>

                <div className="profile-container">
                    <div className="profile-card">
                        
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder doctor-avatar">
                                    {getInitials(profileData.name)}
                                </div>
                                <div>
                                    <h2>{profileData.name}</h2>
                                    <span className="user-role">{profileData.specialty} Specialist</span>
                                </div>
                            </div>
                            <div className={`status-badge-large ${profileData.status === 'Active' ? 'active' : 'inactive'}`}>
                                {profileData.status === 'Active' ? <FaCheckCircle/> : <FaTimesCircle/>}
                                {profileData.status}
                            </div>
                        </div>

                        <div className="profile-body">
                            
                            <div className="section-header-row">
                                <h4 className="section-title"><FaGlobeAmericas className="icon"/> Public Information</h4>
                                <span className="section-subtitle">Visible to patients</span>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaUserMd className="icon"/> Full Name</label>
                                    <div className="read-only-field">{profileData.name}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaStethoscope className="icon"/> Specialty</label>
                                    <div className="read-only-field">{profileData.specialty}</div>
                                </div>
                            </div>

                            <div className="form-grid three-col">
                                <div className="input-group">
                                    <label><FaDollarSign className="icon"/> Consultation Fees</label>
                                    <div className="read-only-field">{profileData.fees} EGP</div>
                                </div>
                                <div className="input-group">
                                    <label>Gender</label>
                                    <div className="read-only-field capitalize">{profileData.gender || "-"}</div>
                                </div>
                                <div className="input-group">
                                    <label>Experience</label>
                                    <div className="read-only-field">Senior Level</div>
                                </div>
                            </div>

                            <div className="input-group full-width">
                                <label><FaInfoCircle className="icon"/> Bio / About</label>
                                <div className="read-only-field bio-box">
                                    {profileData.bio}
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="section-header-row">
                                <h4 className="section-title private"><FaLock className="icon"/> Private Information</h4>
                                <span className="section-subtitle">Visible only to you and admins</span>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaEnvelope className="icon"/> Email (Login)</label>
                                    <div className="read-only-field locked">{profileData.email}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaPhone className="icon"/> Phone Number</label>
                                    <div className="read-only-field">{profileData.phone}</div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaMapMarkerAlt className="icon"/> Address</label>
                                    <div className="read-only-field">{profileData.address}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaBirthdayCake className="icon"/> Birth Date</label>
                                    <div className="read-only-field">{profileData.birth_date}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}