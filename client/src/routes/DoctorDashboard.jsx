import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import { DB_APPOINTMENTS_KEY } from '../data/initDB';
import './PatientDashboard.css';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [stats, setStats] = useState({ pendingToday: 0, totalCompleted: 0 });
    
    const [todayAppts, setTodayAppts] = useState([]);
    const [filteredAppts, setFilteredAppts] = useState([]);
    
    const [doctorName, setDoctorName] = useState("Doctor");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!currentUserEmail) {
            navigate('/login');
            return;
        }
        
        if (currentUserEmail) {
            const rawName = currentUserEmail.split('@')[0];
            const prettyName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            setDoctorName(prettyName);
        }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const nameKey = currentUserEmail.split('@')[0].toLowerCase();

        const myAppts = allAppts.filter(a => 
            (a.doctor && a.doctor.toLowerCase().includes(nameKey)) || 
            (a.doctorName && a.doctorName.toLowerCase().includes(nameKey))
        );

        const today = new Date().toISOString().split('T')[0];

        const todaysList = myAppts.filter(a => a.date === today && a.status === 'Scheduled');
        
        const totalTreatedCount = myAppts.filter(a => a.status === 'Completed').length;

        setStats({
            pendingToday: todaysList.length,
            totalCompleted: totalTreatedCount
        });

        setTodayAppts(todaysList);
        setFilteredAppts(todaysList);

    }, [currentUserEmail, navigate]);

    useEffect(() => {
        const results = todayAppts.filter(appt => 
            (appt.patientName && appt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (appt.reason && appt.reason.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredAppts(results);
    }, [searchTerm, todayAppts]);

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>Welcome, Dr. {doctorName} 🩺</h1>
                    <p>Overview of your daily activity.</p>
                </header>

                <div className="dashboard-widgets">
                    <div className="widget-card highlight-card">
                        <h3>Pending Today</h3>
                        <h1 style={{fontSize:'3rem', color:'#3498DB', margin:'10px 0'}}>
                            {stats.pendingToday}
                        </h1>
                        <p>Patients waiting for you today.</p>
                    </div>

                    <div className="widget-card action-card">
                        <h3>Total Treated</h3>
                        <h1 style={{fontSize:'3rem', color:'#27AE60', margin:'10px 0'}}>
                            {stats.totalCompleted}
                        </h1>
                        <p>Total appointments completed.</p>
                    </div>
                </div>

                <div className="history-section">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h3>Today's Schedule ({new Date().toISOString().split('T')[0]})</h3>
                        
                        <input 
                            type="text" 
                            placeholder="🔍 Search patient or reason..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '8px 15px',
                                borderRadius: '20px',
                                border: '1px solid #ccc',
                                width: '250px'
                            }}
                        />
                    </div>

                    {filteredAppts.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Patient</th>
                                    <th>Reason of Visit</th>
                                    <th>Uploaded Tests</th> 
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppts.map(appt => (
                                    <tr key={appt.id}>
                                        <td style={{fontWeight:'bold', color:'#3498DB'}}>{appt.time}</td>
                                        <td>
                                            <strong>{appt.patientName || "Unknown"}</strong><br/>
                                            <span style={{fontSize:'0.8rem', color:'#777'}}>{appt.patientEmail}</span>
                                        </td>
                                        <td style={{fontStyle:'italic'}}>
                                            "{appt.reason || "General Checkup"}"
                                        </td>
                                        <td>
                                            {appt.uploadedFiles ? (
                                                <a href={appt.uploadedFiles} target="_blank" rel="noreferrer" style={{color:'#3498DB'}}>
                                                    📄 View File
                                                </a>
                                            ) : (
                                                <span style={{color:'#999'}}>- None -</span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-action" 
                                                style={{background:'#3498DB', color:'white'}}
                                                onClick={() => navigate(`/doctor/diagnosis/${appt.id}`)}
                                            >
                                                Start Visit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{textAlign:'center', padding:'40px', color:'#777', background:'white', borderRadius:'15px'}}>
                            <p>No pending appointments found for today matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}