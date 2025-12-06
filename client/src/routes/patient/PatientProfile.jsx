import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaArrowLeft, FaPen, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import api from '../../services/api'; // 1. Import API
import './PatientProfile.css'; 

export default function PatientProfile() {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { email } = useParams(); 
    
    const sessionEmail = localStorage.getItem("activeUserEmail");
    const targetEmail = email || sessionEmail;
    
    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // 2. Load Data from API
    useEffect(() => {
        if (!targetEmail) { 
            navigate('/login'); 
            return; 
        }

        const fetchUser = async () => {
            try {
                // Fetch all users (or specific profile endpoint if available)
                const { data: allUsers } = await api.get('/users');
                const foundUser = allUsers.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());

                if (foundUser) {
                    setUserData({
                        ...foundUser,
                        // Map Backend 'phone_number' to Frontend 'phone'
                        phone: foundUser.phone_number || foundUser.phone || "",
                        address: foundUser.address || ""
                    });
                    calculateAge(foundUser.birth_date);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                setNotFound(true);
            }
        };

        fetchUser();
    }, [targetEmail, navigate]);

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
            // 3. Prepare payload (Map 'phone' back to 'phone_number')
            const payload = {
                ...userData,
                phone_number: userData.phone
            };

            // 4. Send Update to API
            await api.patch(`/users/${userData.id}`, payload);

            // Update session if email changed
            if (userData.email !== targetEmail && !email) {
                localStorage.setItem("activeUserEmail", userData.email);
            }

            setIsEditing(false);
            setShowSuccessPopup(true);

        } catch (error) {
            alert("Failed to update profile: " + (error.response?.data?.error || error.message));
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
                        {/* ... (Header Row remains the same) ... */}
                        <div className="card-header-row">
                            <div className="user-intro">
                                <div className="avatar-placeholder">
                                    {userData.name.charAt(0).toUpperCase()}
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
                            {/* ... (All form inputs remain exactly the same) ... */}
                            <h4 className="section-title">Account Information</h4>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaEnvelope className="icon"/> Email Address</label>
                                    <input name="email" type="email" value={userData.email} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : 'locked'}`}/>
                                </div>
                                <div className="input-group">
                                    <label><FaLock className="icon"/> Password</label>
                                    <input name="password" type="text" value={userData.password} onChange={handleChange} disabled={!isEditing || isAdminView} className={`input-field ${isEditing ? 'editable' : 'locked'}`}/>
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

                {/* 4. NEW: Custom Success Popup */}
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

            </main>
        </div>
    );
}