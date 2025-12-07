import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUserMd, FaStethoscope, FaDollarSign, FaInfoCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaLock, FaGlobeAmericas, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar'; 
import './DoctorProfile.css';
import { getUser } from '../../services/users';

export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { currentUser } = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const [doctor, setDoctorData] = useState(null);
    const [age, setAge] = useState(0);
    const [notFound, setNotFound] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    useEffect(() => {
        console.log("currentUser:"+currentUser);
        if (!currentUser) { navigate('/login'); return; }
        const fetchData = async () => {
            try{
                const res = await getUser(id ? id : currentUser.id);
                console.log("doctor id ", currentUser.id);
                console.log("id sent ", id);
                const doc = res.data.doctor?.[0] || res.data.data?.[0] || null;
                if (doc) {
                    setDoctorData({
                        ...doc,
                        phone: doc.phone,
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
                console.error("Failed to load user", err);
                setNotFound(true);
            }
        }; fetchData();

    }, [id, currentUser, navigate]);
    const calculateAge = (dob) => {
        if (!dob) return;
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        setAge(Math.abs(ageDate.getUTCFullYear() - 1970));
    };
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
    // const handleSave = async (e) => {
    //         e.preventDefault();
            
    //         if (!doctor.phone || doctor.phone.length !== 11 || !doctor.phone.startsWith('01')) {
    //             Swal.fire({
    //                 icon: 'warning',
    //                 title: 'Invalid Phone Number',
    //                 text: 'Phone number must be exactly 11 digits and start with 01 (e.g., 01xxxxxxxxx).'
    //             });
    //             return; 
    //         }
    
    //         try {
    //             const payload = {
    //                 name: doctor.name,
    //                 email: doctor.email,
    //                 phone_number: doctor.phone,
    //                 address: doctor.address,
    //                 gender: doctor.gender === "" ? null : doctor.gender,
    //                 birth_date: doctor.birth_date === "" ? null : doctor.birth_date
    //             };
    
    //             if (doctor.password && doctor.password.trim() !== "") {
    //                 payload.password = doctor.password;
    //             }
    
    //             await updateUser(currentUser.id, payload);
    
    //             const updatedCache = { ...currentUser, ...doctor };
    //             localStorage.setItem("currentUser", JSON.stringify(updatedCache));
    //             localStorage.setItem("userName", doctor.name); 
    
    //             setShowSuccessPopup(true);
    
    //         } catch (error) {
    //             const errorMsg = error.response?.data?.error || "Failed to update profile.";
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Update Failed',
    //                 text: errorMsg,
    //                 confirmButtonColor: '#d33'
    //             });
    //         }
    //     };
    
    if (notFound) return <div className="error-state">User not found.</div>;
    if (!doctor) return <div className="loading-state">Loading Profile...</div>;
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
                {/* {showSuccessPopup && (
                    <div className="popup-overlay fade-in">
                        <div className="popup-container slide-up">
                            <div className="popup-icon-container">
                                <FaCheckCircle className="popup-icon success" />
                            </div>
                            <h3 className="popup-title">Success!</h3>
                            <p className="popup-message">Your profile has been updated successfully.</p>
                            <button className="popup-btn" onClick={() => setShowSuccessPopup(false)}>
                                Continue
                            </button>
                        </div>
                    </div>
                )} */}
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
                                    {getInitials(doctor.name)}
                                </div>
                                <div>
                                    <h2>{doctor.name}</h2>
                                    <span className="user-role">{doctor.specialty} Specialist</span>
                                </div>
                            </div>
                            <div className={`status-badge-large ${doctor.status === 'Active' ? 'active' : 'inactive'}`}>
                                {doctor.status === 'Active' ? <FaCheckCircle/> : <FaTimesCircle/>}
                                {doctor.status || "Active"}
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
                                    <div className="read-only-field">{doctor.name}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaStethoscope className="icon"/> Specialty</label>
                                    <div className="read-only-field">{doctor.specialty}</div>
                                </div>
                            </div>

                            <div className="form-grid three-col">
                                <div className="input-group">
                                    <label><FaDollarSign className="icon"/> Consultation Fees</label>
                                    <div className="read-only-field">{doctor.fees} EGP</div>
                                </div>
                                <div className="input-group">
                                    <label>Gender</label>
                                    <div className="read-only-field capitalize">{doctor.gender || "-"}</div>
                                </div>
                                <div className="input-group">
                                    <label>Experience</label>
                                    <div className="read-only-field">Senior Level</div>
                                </div>
                            </div>

                            <div className="input-group full-width">
                                <label><FaInfoCircle className="icon"/> Bio / About</label>
                                <div className="read-only-field bio-box">
                                    {doctor.bio || "No biography provided."}
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
                                    <div className="read-only-field locked">{doctor.email}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaPhone className="icon"/> Phone Number</label>
                                    <div className="read-only-field">{doctor.phone || "-"}</div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FaMapMarkerAlt className="icon"/> Address</label>
                                    <div className="read-only-field">{doctor.address || "-"}</div>
                                </div>
                                <div className="input-group">
                                    <label><FaBirthdayCake className="icon"/> Birth Date</label>
                                    <div className="read-only-field">{doctor.birth_date || "-"}</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}