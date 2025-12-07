import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaDollarSign, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaLock, FaGlobeAmericas, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import './DoctorProfile.css';

// ✅ Services: Import BOTH User and Doctors to link data
import { getUser } from '../../services/users';
import { getDoctors } from '../../services/doctors';

export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Only exists if Admin is viewing
    
    // 1. Get Current User ID safely
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const currentUserId = storedUser.id;
    
    // Determine which ID to look up (Url Param OR Logged In User)
    const targetUserId = id || currentUserId;

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!currentUserId) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                // A. Fetch Basic User Info (Name, Email, Phone, Address)
                const userRes = await getUser(targetUserId);
                const userData = userRes.data.user || userRes.data || {};

                // B. Fetch Doctor Specifics (Bio, Fees, Specialty)
                // We fetch all doctors and find the one linked to this User ID
                const doctorsRes = await getDoctors();
                const allDoctors = Array.isArray(doctorsRes.data) 
                    ? doctorsRes.data 
                    : (doctorsRes.data.doctors || doctorsRes.data.data || []);

                const doctorInfo = allDoctors.find(d => 
                    String(d.user_id) === String(targetUserId) || 
                    String(d.id) === String(targetUserId) // Fallback match
                ) || {};

                // C. Merge the data
                setProfileData({
                    ...userData,
                    ...doctorInfo, // Overwrites with specific doctor details if available
                    name: userData.name || doctorInfo.name, // Prefer User Name
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
    }, [targetUserId, currentUserId, navigate]);

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

    if (loading) return <div className="loading-state">Loading Profile...</div>;
    if (error || !profileData) return <div className="error-state">User profile not found.</div>;

    // Check if this is Admin View (has 'id' param) or Personal View
    const isAdminView = !!id;

    return (
        <div className="dashboard-layout">
            {/* Show Sidebar ONLY if it's the Doctor viewing their own profile */}
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
                        
                        {/* HEADER SECTION */}
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
                            
                            {/* --- PUBLIC INFO --- */}
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

                            {/* --- PRIVATE INFO --- */}
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