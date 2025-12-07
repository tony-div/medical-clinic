import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileMedical, FaCalendarAlt, FaUserMd, FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './MedicalRecords.css';
import { getAppointments } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';
import { getMedicalTestByAppointmentId } from '../../services/medical-tests';

export default function MedicalRecords() {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = storedUser.id;
    const [records, setRecords] = useState([]);
    
    const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
                // 1. Fetch Appointments & Doctors
                const [apptRes, docRes] = await Promise.all([
                    getAppointments(),
                    getDoctors()
                ]);

                const apiAppts = Array.isArray(apptRes.data) 
                    ? apptRes.data 
                    : (apptRes.data.appointments || apptRes.data.data || []);
                
                const apiDocs = Array.isArray(docRes.data) 
                    ? docRes.data 
                    : (docRes.data.doctors || docRes.data.data || []);

                // We use Promise.all to fetch them all in parallel
                const appointmentsWithTests = await Promise.all(apiAppts.map(async (appt) => {
                    try {
                        const testRes = await getMedicalTestByAppointmentId(appt.id);
                        const tests = testRes.data.medicalTest;
                        
                        // If a test is found, attach it to the appointment object
                        if (Array.isArray(tests) && tests.length > 0) {
                            return {
                                ...appt,
                                file_path: tests[0].file_path,
                                test_description: tests[0].description
                            };
                        }
                    } catch (err) {
                        // If 404 (No test found), just return the appointment as is
                    }
                    return appt;
                }));

                // 3. Filter & Map (Now 'file_path' exists!)
                const myRecords = appointmentsWithTests
                    .filter(a => {
    const path = a.uploadedFiles || a.file_path || a.medical_test_path;
    // Only allow if path exists AND is not "N/A" AND is not empty
    return path && path !== "N/A" && path.trim() !== "";
})
                    .map(appt => {
                        const doc = apiDocs.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                        
                        let fileUrl = appt.file_path || appt.medical_test_path || "";
                        if (fileUrl && !fileUrl.startsWith('http')) {
                            fileUrl = `${API_BASE_URL}${fileUrl}`;
                        }

                        return {
                            id: appt.id,
                            date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : "N/A",
                            type: appt.test_description || "Medical Document",
                            uploadedFiles: fileUrl,
                            doctorName: doc ? doc.name : "Unknown Doctor",
                            specialty: doc ? doc.specialty : "General"
                        };
                    });

                myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
                setRecords(myRecords);

            } catch (error) {
                console.error("Error loading medical records:", error);
            }
        };

        fetchData();
    }, [userId, navigate]);

    return (
        <div className="dashboard-layout">
            <PatientSidebar />
            <main className="dashboard-main fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1>Medical Records</h1>
                        <p>Access your test results, prescriptions, and uploaded documents.</p>
                    </div>
                </header>

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
                                        <td>
                                            <div className="date-cell">
                                                <div className="icon-box date"><FaCalendarAlt /></div>
                                                <span className="text-strong">{record.date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-info">
                                                <div className="doc-avatar"><FaUserMd /></div>
                                                <div>
                                                    <span className="doc-name">{record.doctorName}</span>
                                                    <span className="doc-spec">{record.specialty}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="file-tag"><FaFileAlt /> {record.type}</div>
                                        </td>
                                        <td>
                                            <a href={record.uploadedFiles} target="_blank" rel="noreferrer" className="btn-view-file">
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