import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../components/PatientSidebar';
import { DB_PATIENTS_KEY } from '../data/initDB';
import './DoctorProfile.css'; 

export default function PatientProfile() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [userData, setUserData] = useState(null);
    const [age, setAge] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        const foundUser = allPatients.find(p => p.email === currentUserEmail);

        if (foundUser) {
            setUserData(foundUser);
            calculateAge(foundUser.birth_date);
        }
    }, [currentUserEmail, navigate]);

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
        
        if (name === 'birth_date') {
            calculateAge(value);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
        
        const updatedPatients = allPatients.map(p => 
            p.email === currentUserEmail ? userData : p
        );

        localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(updatedPatients));
        setIsEditing(false);
        alert("Profile Updated Successfully!");
    };

    if (!userData) return <div>Loading...</div>;

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>My Profile</h1>
                    <p>Manage your personal information.</p>
                </header>

                <div className="booking-card" style={{maxWidth:'700px', margin:'0 auto'}}>
                    <div className="booking-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span>Personal Details</span>
                        {!isEditing && (
                            <button className="btn-action" style={{background:'white', color:'#3498DB'}} onClick={() => setIsEditing(true)}>
                                ✏️ Edit
                            </button>
                        )}
                    </div>

                    <form className="booking-body" onSubmit={handleSave}>
                        <div style={{background:'#F4F6F7', padding:'15px', borderRadius:'10px', marginBottom:'20px'}}>
                            <div className="form-section">
                                <label>Email Address (Locked)</label>
                                <input type="email" value={userData.email} disabled className="date-input" style={{background:'#e9ecef'}} />
                            </div>
                            <div className="form-section">
                                <label>Password (Locked)</label>
                                <input type="password" value={userData.password} disabled className="date-input" style={{background:'#e9ecef'}} />
                            </div>
                        </div>
                        <div className="form-section">
                            <label>Full Name</label>
                            <input 
                                name="name" 
                                type="text" 
                                value={userData.name} 
                                onChange={handleChange} 
                                disabled={!isEditing} 
                                className="date-input" 
                            />
                        </div>

                        <div className="form-section">
                            <label>Gender</label>
                            <select 
                                name="gender" 
                                value={userData.gender} 
                                onChange={handleChange} 
                                disabled={!isEditing} 
                                className="date-input"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="form-section">
                            <label>Date of Birth</label>
                            <input 
                                name="birth_date" 
                                type="date" 
                                value={userData.birth_date} 
                                onChange={handleChange} 
                                disabled={!isEditing} 
                                className="date-input" 
                            />
                        </div>

                        <div className="form-section">
                            <label>Calculated Age</label>
                            <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#2C3E50'}}>
                                {age} Years Old
                            </div>
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