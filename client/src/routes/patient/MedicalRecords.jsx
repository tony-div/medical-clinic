import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileMedical, FaCalendarAlt, FaUserMd, FaExternalLinkAlt, FaFileAlt, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import PatientSidebar from '../../components/PatientSidebar';
import './MedicalRecords.css';
import { getAppointments } from '../../services/appointment';
import { getDoctors } from '../../services/doctors';
import { getMedicalTestByAppointmentId } from '../../services/medical-tests';

export default function MedicalRecords() {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = storedUser.id;
    
    // --- STATE ---
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    
    const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

    // Helper: Clean Timestamps from Filenames
    const cleanFileName = (name) => {
        if (!name) return "Medical Document";
        const fileName = name.split(/[/\\]/).pop();
        return fileName.replace(/^\d+[-_]/, '');
    };

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

                // 2. Hydrate with Medical Tests
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

                // 3. Map & Format
                const myRecords = appointmentsWithTests
                    .filter(a => {
                        const path = a.file_path || a.medical_test_path;
                        return path && path !== "N/A" && path.trim() !== "";
                    }) 
                    .map(appt => {
                        // Safe ID Check
                        const doc = apiDocs.find(d => 
                            String(d.id) === String(appt.doctor_id) || 
                            String(d.id) === String(appt.doctorId)
                        );
                        
                        let fileUrl = appt.file_path || appt.medical_test_path || "";
                        if (fileUrl && !fileUrl.startsWith('http')) {
                            fileUrl = `${API_BASE_URL}${fileUrl}`;
                        }

                        // Display Name Logic
                        let rawName = appt.test_description || fileUrl;
                        let displayName = cleanFileName(rawName);

                        // Date Logic (UTC Fix)
                        const rawDateVal = appt.real_test_date || appt.date;
                        const dateObj = rawDateVal ? new Date(rawDateVal) : null;
                        const formattedDate = dateObj ? dateObj.toLocaleDateString('en-CA') : "N/A";

                        return {
                            id: appt.id,
                            rawDate: dateObj, // Keep object for sorting
                            date: formattedDate, // String for display
                            type: displayName,
                            uploadedFiles: fileUrl,
                            doctorName: doc ? doc.name : "Unknown Doctor",
                            specialty: doc ? doc.specialty : "General",
                            doctorImage: doc && doc.profile_pic_path ? doc.profile_pic_path : null
                        };
                    });

                setRecords(myRecords);

            } catch (error) {
                console.error("Error loading medical records:", error);
            }
        };

        fetchData();
    }, [userId, navigate]);

    // --- FILTER & SORT LOGIC ---
    const filteredRecords = records
        .filter(rec => 
            rec.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rec.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (!a.rawDate) return 1;
            if (!b.rawDate) return -1;
            return sortOrder === 'newest' 
                ? b.rawDate - a.rawDate 
                : a.rawDate - b.rawDate;
        });

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

                {/* --- SEARCH & CONTROLS BAR --- */}
                <div className="controls-bar" style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                    <div className="search-box" style={{ flex: 1 }}>
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by file name or doctor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className="sort-btn" 
                        onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                        style={{ minWidth: '50px' }}
                        title={sortOrder === 'newest' ? "Newest First" : "Oldest First"}
                    >
                        {sortOrder === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                    </button>
                </div>

                {/* --- RECORDS TABLE --- */}
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
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map(record => (
                                    <tr key={record.id} className="table-row">
                                        <td>
                                            <div className="date-cell">
                                                <div className="icon-box date"><FaCalendarAlt /></div>
                                                <span className="text-strong">{record.date}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="doc-info">
                                                <div className="doc-avatar">
                                                    {record.doctorImage ? (
                                                        <img 
                                                            src={record.doctorImage} 
                                                            alt="Doc" 
                                                            style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} 
                                                        />
                                                    ) : (
                                                        <FaUserMd />
                                                    )}
                                                </div>
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
                                            <p>Try changing your search terms.</p>
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