import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaArrowLeft, FaPen, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import { getUser, updateUser } from '../../services/users'; // Import User Services
import './PatientProfile.css'; 

export default function PatientProfile() {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { email } = useParams(); // If email exists, it's Admin View
    
    // 1. Get the ID from Local Storage
    // We saved this in Login.jsx just now!
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const currentUserId = storedUser.id;
    
    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        // If no ID found and not in Admin Mode, redirect to login
        if (!currentUserId && !email) { 
            navigate('/login'); 
            return; 
        }

        const fetchProfile = async () => {
            try {
                let profileData = null;

                // A. Normal Patient Flow: Use ID from Session
                if (currentUserId && !email) {
                    const response = await getUser(currentUserId);
                    profileData = response.data;
                }
                
                // B. Admin Flow: We need to find by email (if API doesn't support getByEmail, this part might need adjustment on backend)
                // For now, let's assume Admin functionality is handled separately or reuse the same logic if you have the ID.
                // If you are testing as Patient, Block A will run.

                if (profileData) {
                    setUserData({
                        ...profileData,
                        phone: profileData.phone_number || profileData.phone || "",
                        address: profileData.address || "",
                        birth_date: profileData.birth_date ? profileData.birth_date.split('T')[0] : ""
                    });
                    calculateAge(profileData.birth_date);
                } else {
                    // Fallback to local storage data if API fetch fails (prevents white screen)
                    if (storedUser.email) {
                        setUserData({ ...storedUser, phone: "", address: "" });
                    } else {
                        setNotFound(true);
                    }
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                // Fallback
                if (storedUser.email) {
                     setUserData({ ...storedUser, phone: "", address: "" });
                } else {
                    setNotFound(true);
                }
            }
        };

        fetchProfile();
    }, [currentUserId, email, navigate]);

    const calculateAge = (dob) => {
        if (!dob) return;
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        setAge(Math.abs(ageDate.getUTCFullYear() - 1970));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 11) return;
        }
        setUserData({ ...userData, [name]: value });
        if (name === 'birth_date') calculateAge(value);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const payload = {
                name: userData.name,
                email: userData.email,
                // Only send password if changed/needed
                ...(userData.password ? { password: userData.password } : {}),
                phone_number: userData.phone,
                address: userData.address,
                gender: userData.gender,
                birth_date: userData.birth_date
            };

            await updateUser(userData.id, payload);

            // Update Session Data
            const updatedCache = { ...storedUser, ...userData };
            localStorage.setItem("currentUser", JSON.stringify(updatedCache));
            localStorage.setItem("userName", userData.name); 

            setIsEditing(false);
            setShowSuccessPopup(true);

        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile. " + (error.response?.data?.error || ""));
        }
    };

    const handleBack = () => {
        if (location.state?.returnTab) {
            navigate('/admin/dashboard', { state: { activePage: location.state.returnTab } });
        } else {
            navigate(-1); 
        }
    };

    if (notFound) return <div className="error-state">User not found.</div>;
    if (!userData) return <div className="loading-state">Loading Profile...</div>;

    const isAdminView = !!email;

    return (
        <div className="dashboard-layout">
            {!isAdminView && <PatientSidebar />}
            
            <main 
                className="dashboard-main fade-in" 
                style={{
                    marginLeft: isAdminView ? '0' : '260px', 
                    width: isAdminView ? '100%' : 'calc(100% - 260px)'
                }}
            >
                {/* SUCCESS POPUP */}
                {showSuccessPopup && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <div className="popup-icon-container">
                                <FaCheckCircle className="popup-icon" />
                            </div>
                            <h3 className="popup-title">Success!</h3>
                            <p className="popup-message">Your profile has been updated successfully.</p>
                            <button className="popup-btn" onClick={() => setShowSuccessPopup(false)}>
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                <header className="dashboard-header">
                    <div>
                        <h1>{isAdminView ? "Patient Details" : "My Profile"}</h1>
                        <p>{isAdminView ? "View and manage patient information" : "Manage your personal information"}</p>
                    </div>
                    
                    {isAdminView && (
                        <button className="back-btn" onClick={handleBack}>
                            <FaArrowLeft /> Back to Dashboard
                        </button>
                    )}
                </header>

                <div className="profile-container">
                    <div className="profile-card">
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder">
                                    {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                    <h2>{userData.name}</h2>
                                    <span className="user-role">Patient Account</span>
                                </div>
                            </div>

                            {!isEditing && !isAdminView && (
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                    <FaPen size={12}/> Edit Profile
                                </button>
                            )}
                        </div>

                        <form className="profile-form" onSubmit={handleSave}>
                            
                            <h4 className="section-title">Account Information</h4>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaEnvelope className="icon"/> Email Address</label>
                                    <input name="email" type="email" value={userData.email} onChange={handleChange} disabled={true} className="input-field locked"/>
                                </div>
                                <div className="input-group">
                                    <label><FaLock className="icon"/> Password</label>
                                    <input name="password" type="text" value={userData.password || ''} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : 'locked'}`}/>
                                </div>
                            </div>

                            <h4 className="section-title">Personal Details</h4>
                            <div className="input-group">
                                <label><FaUser className="icon"/> Full Name</label>
                                <input name="name" value={userData.name} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : ''}`}/>
                            </div>

                            <div className="form-grid three-col">
                                <div className="input-group">
                                    <label><FaVenusMars className="icon"/> Gender</label>
                                    <select name="gender" value={userData.gender} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : ''}`}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label><FaBirthdayCake className="icon"/> Birth Date</label>
                                    <input name="birth_date" type="date" value={userData.birth_date} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : ''}`}/>
                                </div>
                                <div className="input-group">
                                    <label>Age</label>
                                    <input value={`${age} Years`} disabled className="input-field locked center-text" />
                                </div>
                            </div>

                            <h4 className="section-title">Contact Information</h4>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaPhone className="icon"/> Phone Number</label>
                                    <input name="phone" value={userData.phone} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : ''}`} placeholder="01xxxxxxxxx"/>
                                </div>
                                <div className="input-group">
                                    <label><FaMapMarkerAlt className="icon"/> Address</label>
                                    <input name="address" value={userData.address} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : ''}`} placeholder="City, Street..."/>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions slide-up">
                                    <button type="button" className="cancel-btn" onClick={() => {setIsEditing(false); window.location.reload();}}>
                                        <FaTimes/> Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        <FaSave/> Save Changes
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}