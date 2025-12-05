import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileMedical, FaCalendarAlt, FaUserMd, FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import { DB_APPOINTMENTS_KEY } from '../../data/initDB';
import './MedicalRecords.css';

export default function MedicalRecords() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    const [records, setRecords] = useState([]);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const allAppts = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        
        // Filter: Must be current user AND have a file uploaded
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
            
            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>Medical Records</h1>
                        <p>Access your test results, prescriptions, and uploaded documents.</p>
                    </div>
                </header>

                {/* RECORDS TABLE CARD */}
                <div className="table-card">
                    <table className="records-table">
                        <thead>
                            <tr>
                                <th>Date Uploaded</th>
                                <th>Related Appointment</th>
                                <th>Document Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? (
                                records.map(record => (
                                    <tr key={record.id} className="table-row">
                                        {/* DATE COLUMN */}
                                        <td>
                                            <div className="date-cell">
                                                <div className="icon-box date">
                                                    <FaCalendarAlt />
                                                </div>
                                                <span className="text-strong">{record.date}</span>
                                            </div>
                                        </td>

                                        {/* DOCTOR COLUMN */}
                                        <td>
                                            <div className="doc-info">
                                                <div className="doc-avatar">
                                                    <FaUserMd />
                                                </div>
                                                <div>
                                                    <span className="doc-name">{record.doctorName}</span>
                                                    <span className="doc-spec">{record.specialty}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* FILE TYPE COLUMN (Simulated based on context) */}
                                        <td>
                                            <div className="file-tag">
                                                <FaFileAlt /> Medical Document
                                            </div>
                                        </td>

                                        {/* ACTION COLUMN */}
                                        <td>
                                            <a 
                                                href={record.uploadedFiles} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="btn-view-file"
                                            >
                                                <FaExternalLinkAlt /> Open File
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        <div className="empty-content">
                                            <FaFileMedical className="empty-icon"/>
                                            <h3>No Records Found</h3>
                                            <p>Files uploaded during your appointments will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}