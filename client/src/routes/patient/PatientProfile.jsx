import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; // 1. Added useLocation
import PatientSidebar from '../../components/PatientSidebar';
import { DB_PATIENTS_KEY } from '../../data/initDB';
import '../doctor/DoctorProfile.css'; 

export default function PatientProfile() {
    const navigate = useNavigate();
    const location = useLocation(); // 2. Init Location Hook to read 'state'
    const { email } = useParams(); // If email exists, we are in Admin View
    
    // Determine target email: URL param (Admin) OR Session (Patient)
    const sessionEmail = localStorage.getItem("activeUserEmail");
    const targetEmail = email || sessionEmail;
    
    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // Security check: If accessing as patient (no URL param), must be logged in
        if (!targetEmail) { 
            navigate('/login'); 
            return; 
        }

        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        
        // Find user (Case insensitive check)
        const foundUser = allPatients.find(p => p.email.toLowerCase() === targetEmail.toLowerCase());

        if (foundUser) {
            setUserData({
                ...foundUser,
                // Ensure fields exist to prevent controlled/uncontrolled errors
                phone: foundUser.phone || "",
                address: foundUser.address || ""
            });
            calculateAge(foundUser.birth_date);
        } else {
            setNotFound(true);
        }
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
        setUserData({ ...userData, [name]: value });
        if (name === 'birth_date') calculateAge(value);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        
        // Validation: Check duplicate email if changed
        if (userData.email !== targetEmail) {
            const emailExists = allPatients.find(p => p.email === userData.email && p.id !== userData.id);
            if (emailExists) {
                alert("This email is already in use by another patient.");
                return;
            }
        }

        // Update DB
        const updatedPatients = allPatients.map(p => p.id === userData.id ? userData : p);
        localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(updatedPatients));

        // Update Session if the user changed their OWN email
        if (userData.email !== targetEmail && !email) {
            localStorage.setItem("activeUserEmail", userData.email);
        }

        setIsEditing(false);
        alert("Profile Updated Successfully!");
    };

    // --- 3. SMART BACK FUNCTION ---
    const handleBack = () => {
        // Check if we came from Admin Appointments (or Users) with a return tab note
        if (location.state?.returnTab) {
            // Go to Admin Dashboard and force open the specific tab
            navigate('/admin/dashboard', { state: { activePage: location.state.returnTab } });
        } else {
            // Default browser back behavior
            navigate(-1); 
        }
    };

    // --- RENDER STATES ---
    if (notFound) return <div style={{textAlign:'center', marginTop:'50px', color:'#777'}}>User not found in database.</div>;
    if (!userData) return <div>Loading...</div>;

    const isAdminView = !!email;

    return (
        <div className="dashboard-layout">
            {/* Hide Sidebar if Admin View */}
            {!isAdminView && <PatientSidebar />}
            
            <main className="dashboard-main" style={{marginLeft: isAdminView ? '0' : '250px', width: isAdminView ? '100%' : 'calc(100% - 250px)'}}>
                <header className="dashboard-header">
                    <h1>{isAdminView ? "Patient Details (Admin View)" : "My Profile"}</h1>
                    
                    {/* Admin Back Button */}
                    {isAdminView && (
                        <button 
                            className="back-btn" 
                            onClick={handleBack} 
                            style={{marginTop:'10px'}}
                        >
                            ← Back
                        </button>
                    )}
                </header>

                <div className="booking-card" style={{maxWidth:'700px', margin:'0 auto'}}>
                    <div className="booking-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span>Personal Details</span>
                        {/* Only show Edit button if NOT admin view (Admins edit via Users table) */}
                        {!isEditing && !isAdminView && (
                            <button className="btn-action" style={{background:'white', color:'#3498DB'}} onClick={() => setIsEditing(true)}>
                                ✏️ Edit
                            </button>
                        )}
                    </div>

                    <form className="booking-body" onSubmit={handleSave}>
                        
                        {/* Account Info (Read Only style mostly) */}
                        <div style={{background:'#F4F6F7', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
                            <div className="form-section">
                                <label>Email Address</label>
                                <input type="email" value={userData.email} disabled className="date-input"/>
                            </div>
                            <div className="form-section">
                                <label>Password</label>
                                <input type="text" value={userData.password} disabled className="date-input"/>
                            </div>
                        </div>

                        <div className="form-section">
                            <label>Full Name</label>
                            <input 
                                name="name" 
                                value={userData.name} 
                                onChange={handleChange} 
                                disabled={!isEditing || isAdminView} 
                                className="date-input" 
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Gender</label>
                                <select 
                                    name="gender" 
                                    value={userData.gender} 
                                    onChange={handleChange} 
                                    disabled={!isEditing || isAdminView} 
                                    className="date-input"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>Birth Date</label>
                                <input 
                                    name="birth_date" 
                                    type="date" 
                                    value={userData.birth_date} 
                                    onChange={handleChange} 
                                    disabled={!isEditing || isAdminView} 
                                    className="date-input" 
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <label>Age</label>
                            <input value={`${age} Years Old`} disabled className="date-input" style={{background:'#e9ecef'}} />
                        </div>

                        <h4 style={{color:'#27AE60', marginTop:'20px'}}>📞 Contact Details</h4>
                        <div className="form-section">
                            <label>Phone Number</label>
                            <input 
                                name="phone" 
                                type="text" 
                                value={userData.phone} 
                                onChange={handleChange} 
                                disabled={!isEditing || isAdminView} 
                                className="date-input" 
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                        <div className="form-section">
                            <label>Address</label>
                            <textarea 
                                name="address" 
                                rows="2" 
                                value={userData.address} 
                                onChange={handleChange} 
                                disabled={!isEditing || isAdminView} 
                                className="date-input" 
                                placeholder="123 Street Name, City"
                            ></textarea>
                        </div>

                        {isEditing && (
                            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                                <button type="button" className="btn secondary" onClick={() => {setIsEditing(false); window.location.reload();}}>Cancel</button>
                                <button type="submit" className="confirm-btn" style={{marginTop:0}}>Save Changes</button>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}