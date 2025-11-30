import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientSidebar from '../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY } from '../data/initDB';
import './PatientDashboard.css';

export default function MedicalRecords() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        const myRecords = allAppts.filter(a => 
            a.patientEmail === currentUserEmail && 
            a.uploadedFiles 
        );

        myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(myRecords);
    }, [currentUserEmail, navigate]);

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>Medical Records</h1>
                    <p>Access tests and documents you uploaded.</p>
                </header>

                <div className="records-container" style={{background:'white', padding:'30px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
                    {records.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Related Appointment</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td>{record.date}</td>
                                        <td>
                                            {record.doctorName} <br/>
                                            <span style={{fontSize:'0.8rem', color:'#777'}}>{record.specialty}</span>
                                        </td>
                                        <td>
                                            <a 
                                                href={record.uploadedFiles} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="btn-action"
                                                style={{background:'#3498DB', color:'white', textDecoration:'none', display:'inline-block'}}
                                            >
                                                📂 Open File
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{textAlign:'center', padding:'40px', color:'#777'}}>
                            <p>No medical records found.</p>
                            <p style={{fontSize:'0.9rem'}}>Files you upload during booking will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}