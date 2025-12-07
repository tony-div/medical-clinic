import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaDollarSign, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaLock, FaGlobeAmericas, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import './DoctorProfile.css';
import { getUser, updateUser } from '../../services/users';
import Swal from "sweetalert2";


export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    const [doctor, setDoctorData] = useState(null);
    const [age, setAge] = useState(0);
    const [notFound, setNotFound] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const canEdit = currentUser.role === "admin";
    useEffect(() => {
    console.log("THIS FILE IS MOUNTED");
}, []);

    useEffect(() => {
        if (!currentUserId) { navigate('/login'); return; }

        const fetchData = async () => {
            try{
                const res = await getUser(id ? id : currentUser.id);
                console.log("doctor id ", currentUser.id);
                console.log("id sent ", id);
                const doc = res.data.doctor?.[0] || res.data.data?.[0] || null;
                if (doc) {
                    setDoctorData({
                        ...doc,
                        phone_number: doc.phone_number,
                        address: doc.address || "Not Visible, Contact an admin",
                        birth_date: doc.birth_date ? doc.birth_date.split('T')[0] : ""
                    });
                    console.log("bd before: ",doc.birth_date);
                    const cleanedBirth = doc.birth_date ? doc.birth_date.split("T")[0] : "";
                    console.log("bd after :", cleanedBirth);
                    calculateAge(cleanedBirth);
                } else {
                    setNotFound(true);
                }
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
    const handleSave = async (e) => {
            e.preventDefault();
            
            if (doctor.phone_number && (doctor.phone_number.length !== 11 || !doctor.phone_number.startsWith("01"))) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Phone Number',
                    text: 'Phone number must be exactly 11 digits and start with 01 (e.g., 01xxxxxxxxx).'
                });
                return;
            }
    
            try {
                const payload = {
                    name: doctor.name,
                    email: doctor.email,
                    phone_number: doctor.phone_number,
                    address: doctor.address,
                    gender: doctor.gender === "" ? null : doctor.gender,
                    birth_date: doctor.birth_date === "" ? null : doctor.birth_date
                };
    
                if (doctor.password && doctor.password.trim() !== "") {
                    payload.password = doctor.password;
                }
    
                await updateUser(id, payload);
    
                const updatedCache = { ...currentUser, ...doctor };
                localStorage.setItem("currentUser", JSON.stringify(updatedCache));
                localStorage.setItem("userName", doctor.name); 
    
                setShowSuccessPopup(true);
    
            } catch (error) {
                const errorMsg = error.response?.data?.error || "Failed to update profile.";
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: errorMsg,
                    confirmButtonColor: '#d33'
                });
            }
        };
    
    if (notFound) return <div className="error-state">User not found.</div>;
    if (!doctor) return <div className="loading-state">Loading Profile...</div>;

    return (
        <div className="dashboard-layout">
            {!id && <DoctorSidebar />}

            <main
                className="dashboard-main fade-in"
                style={{
                    marginLeft: id ? "0" : "260px",
                    width: id ? "100%" : "calc(100% - 260px)",
                }}
            >
                <header className="dashboard-header">
                    <div>
                        <h1>{isAdminView ? "Doctor Details" : "My Doctor Profile"}</h1>
                        <p>{isAdminView ? "Viewing doctor information (Admin)." : "View your official information."}</p>
                    </div>

                    {/* EDIT BUTTON — ADMINS ONLY */}
                    {canEdit && !editMode && (
                        <button className="edit-btn" onClick={() => setEditMode(true)}>
                            Edit Profile
                        </button>
                    )}

                    {/* SAVE / CANCEL BUTTONS */}
                    {canEdit && editMode && (
                        <div className="edit-actions">
                            <button className="save-btn" onClick={handleSave}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    )}
                </header>
                <div style={{ color: "red", fontWeight: "bold" }}>DEBUG: PROFILE PAGE 1</div>

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

                            <div className={`status-badge-large ${doctor.status === "Active" ? "active" : "inactive"}`}>
                                {doctor.status === "Active" ? <FaCheckCircle /> : <FaTimesCircle />}
                                {doctor.status || "Active"}
                            </div>
                        </div>

                        <div className="profile-body">
                            {/* PUBLIC INFO */}
                            <div className="section-header-row">
                                <h4 className="section-title"><FaGlobeAmericas className="icon" /> Public Information</h4>
                                <span className="section-subtitle">Visible to patients</span>
                            </div>

                            {/* FULL NAME + SPECIALTY */}
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaUserMd className="icon" /> Full Name</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.name}</div>
                                    ) : (
                                        <input
                                            value={doctor.name}
                                            onChange={(e) => setDoctorData({ ...doctor, name: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="input-group">
                                    <label><FaStethoscope className="icon" /> Specialty</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.specialty}</div>
                                    ) : (
                                        <input
                                            value={doctor.specialty}
                                            onChange={(e) => setDoctorData({ ...doctor, specialty: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* FEES + GENDER + EXPERIENCE */}
                            <div className="form-grid three-col">
                                <div className="input-group">
                                    <label><FaDollarSign className="icon" /> Consultation Fees</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.fees} EGP</div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={doctor.fees}
                                            onChange={(e) => setDoctorData({ ...doctor, fees: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Gender</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field capitalize">{doctor.gender || "-"}</div>
                                    ) : (
                                        <select
                                            value={doctor.gender}
                                            onChange={(e) => setDoctorData({ ...doctor, gender: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Experience</label>
                                    <div className="read-only-field">Senior Level</div>
                                </div>
                            </div>

                            {/* BIO */}
                            <div className="input-group full-width">
                                <label><FaInfoCircle className="icon" /> Bio / About</label>

                                {!canEdit || !editMode ? (
                                    <div className="read-only-field bio-box">{doctor.bio || "No biography provided."}</div>
                                ) : (
                                    <textarea
                                        value={doctor.bio}
                                        onChange={(e) => setDoctorData({ ...doctor, bio: e.target.value })}
                                        rows={4}
                                    />
                                )}
                            </div>

                            <div className="divider"></div>

                            {/* PRIVATE INFO */}
                            <div className="section-header-row">
                                <h4 className="section-title private"><FaLock className="icon" /> Private Information</h4>
                                <span className="section-subtitle">Visible only to you and admins</span>
                            </div>

                            {/* EMAIL + PHONE */}
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaEnvelope className="icon" /> Email (Login)</label>
                                    <div className="read-only-field locked">{doctor.email}</div>
                                </div>

                                <div className="input-group">
                                    <label><FaPhone className="icon" /> Phone Number</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.phone_number || "-"}</div>
                                    ) : (
                                        <input
                                            value={doctor.phone_number}
                                            onChange={(e) => setDoctorData({ ...doctor, phone_number: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* ADDRESS + BIRTHDATE */}
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaMapMarkerAlt className="icon" /> Address</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.address || "-"}</div>
                                    ) : (
                                        <input
                                            value={doctor.address}
                                            onChange={(e) => setDoctorData({ ...doctor, address: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="input-group">
                                    <label><FaBirthdayCake className="icon" /> Birth Date</label>

                                    {!canEdit || !editMode ? (
                                        <div className="read-only-field">{doctor.birth_date || "-"}</div>
                                    ) : (
                                        <input
                                            type="date"
                                            value={doctor.birth_date}
                                            onChange={(e) => setDoctorData({ ...doctor, birth_date: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}