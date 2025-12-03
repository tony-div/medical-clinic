import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import { DB_DOCTORS_KEY } from '../data/initDB';
import './DoctorProfile.css'; 

export default function DoctorPrivateProfile() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [doctorData, setDoctorData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        
        const myProfile = allDoctors.find(d => d.email === currentUserEmail);

        if (myProfile) {
            setDoctorData(myProfile);
        } else {
            alert("Access Denied: You are not logged in as a doctor.");
            navigate('/');
        }
    }, [currentUserEmail, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctorData({ ...doctorData, [name]: value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        
        const updatedDoctors = allDoctors.map(d => 
            d.id === doctorData.id ? doctorData : d
        );

        localStorage.setItem(DB_DOCTORS_KEY, JSON.stringify(updatedDoctors));
        setIsEditing(false);
        alert("Profile Updated! Changes are live.");
    };

    if (!doctorData) return <div>Loading...</div>;

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>My Doctor Profile</h1>
                    <p>Manage your public and private information.</p>
                </header>

                <div className="booking-card" style={{maxWidth:'800px', margin:'0 auto'}}>
                    <div className="booking-header" style={{display:'flex', justifyContent:'space-between'}}>
                        <span>Doctor Details</span>
                        {!isEditing && <button className="btn-action" style={{background:'white', color:'#3498DB'}} onClick={() => setIsEditing(true)}>✏️ Edit</button>}
                    </div>

                    <form className="booking-body" onSubmit={handleSave}>
                        
                        <h4 style={{color:'#3498DB', marginBottom:'15px'}}>🌎 Public Information (Visible to Patients)</h4>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Name</label>
                                <input name="name" value={doctorData.name} onChange={handleChange} disabled={!isEditing} className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Specialty</label>
                                <input name="specialty" value={doctorData.specialty} onChange={handleChange} disabled={!isEditing} className="date-input"/>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Fees (EGP)</label>
                                <input name="fees" type="number" value={doctorData.fees} onChange={handleChange} disabled={!isEditing} className="date-input"/>
                            </div>
                            <div className="form-group half">
                                <label>Waiting Time</label>
                                <input name="waitingTime" value={doctorData.waitingTime} onChange={handleChange} disabled={!isEditing} className="date-input"/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Bio / About</label>
                            <textarea name="bio" rows="3" value={doctorData.bio} onChange={handleChange} disabled={!isEditing} className="date-input"></textarea>
                        </div>

                        
                        <h4 style={{color:'#E74C3C', marginTop:'30px', marginBottom:'15px'}}>🔒 Private Information (Admin Only)</h4>
                        
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Email (Login)</label>
                                <input name="email" value={doctorData.email} disabled className="date-input" style={{background:'#f0f0f0'}}/>
                            </div>
                            <div className="form-group half">
                                <label>Phone Number</label>
                                <input name="phone" value={doctorData.phone || ""} onChange={handleChange} disabled={!isEditing} className="date-input"/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <input name="address" value={doctorData.address || ""} onChange={handleChange} disabled={!isEditing} className="date-input"/>
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