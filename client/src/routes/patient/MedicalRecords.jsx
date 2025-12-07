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

    // ✅ NEW HELPER: Removes timestamps (e.g., "16345...-my_file.pdf" -> "my_file.pdf")
    const cleanFileName = (name) => {
        if (!name) return "Medical Document";
        // Remove path (e.g., "/uploads/")
        const fileName = name.split(/[/\\]/).pop();
        // Remove starting numbers followed by - or _
        return fileName.replace(/^\d+[-_]/, '');
    };

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }

        const fetchData = async () => {
            try {
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

                const appointmentsWithTests = await Promise.all(apiAppts.map(async (appt) => {
                    try {
                        const testRes = await getMedicalTestByAppointmentId(appt.id);
                        const tests = testRes.data.medicalTest;
                        
                        if (Array.isArray(tests) && tests.length > 0) {
                            return {
                                ...appt,
                                file_path: tests[0].file_path,
                                test_description: tests[0].description,
                                real_test_date: tests[0].test_date || tests[0].uploaded_at 
                            };
                        }
                    } catch (err) { }
                    return appt;
                }));

                const myRecords = appointmentsWithTests
                    .filter(a => {
                        const path = a.file_path || a.medical_test_path;
                        return path && path !== "N/A" && path.trim() !== "";
                    }) 
                    .map(appt => {
                        const doc = apiDocs.find(d => d.id === appt.doctor_id || d.id === appt.doctorId);
                        
                        let fileUrl = appt.file_path || appt.medical_test_path || "";
                        if (fileUrl && !fileUrl.startsWith('http')) {
                            fileUrl = `${API_BASE_URL}${fileUrl}`;
                        }

                        // ✅ FIX: Use the cleaning logic
                        // 1. Try Description first
                        // 2. If Description is missing (old records), use Filename
                        // 3. Always run it through cleanFileName to remove the timestamp numbers
                        let rawName = appt.test_description || fileUrl;
                        let displayName = cleanFileName(rawName);

                        const rawDate = appt.real_test_date || appt.date;
                        const formattedDate = rawDate 
                            ? new Date(rawDate).toLocaleDateString('en-CA')
                            : "N/A";

                        return {
                            id: appt.id,
                            date: formattedDate, 
                            type: displayName, // <--- Using the clean name
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
                                            <div className="file-tag" title={record.type}>
                                                <FaFileAlt /> 
                                                {record.type.length > 25 ? record.type.substring(0, 22) + '...' : record.type}
                                            </div>
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