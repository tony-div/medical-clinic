// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { FaClock, FaCheckCircle, FaSave, FaCalendarAlt } from 'react-icons/fa';
// import DoctorSidebar from '../../components/DoctorSidebar';
// import { DB_SCHEDULES_KEY } from '../../data/initDB'; 
// import { doctorsData } from '../../data/doctors'; 
// import './DoctorSchedule.css'; 

// export default function DoctorSchedule() {
//     const navigate = useNavigate();
//     const currentUserEmail = localStorage.getItem("activeUserEmail");
    
//     const [doctorId, setDoctorId] = useState(null);
//     const [schedule, setSchedule] = useState([]);
//     const [showSuccessPopup, setShowSuccessPopup] = useState(false);

//     useEffect(() => {
//         if (!currentUserEmail) { navigate('/login'); return; }

//         const nameKey = currentUserEmail.split('@')[0].toLowerCase();
//         const doc = doctorsData.find(d => d.name.toLowerCase().includes(nameKey));
        
//         if (doc) {
//             setDoctorId(doc.id);
//             loadSchedule(doc.id);
//         }
//     }, [currentUserEmail, navigate]);

//     const loadSchedule = (id) => {
//         const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
//         const mySchedule = allSchedules.find(s => s.doctorId === id);

//         const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

//         if (mySchedule) {
//             const fullWeek = daysOfWeek.map(day => {
//                 const savedDay = mySchedule.days.find(d => d.day === day);
//                 return {
//                     day,
//                     isActive: !!savedDay,
//                     start: savedDay?.start || "09:00",
//                     end: savedDay?.end || "17:00"
//                 };
//             });
//             setSchedule(fullWeek);
//         } else {
//             setSchedule(daysOfWeek.map(day => ({ day, isActive: false, start: "09:00", end: "17:00" })));
//         }
//     };

//     const handleToggleDay = (index) => {
//         const newSchedule = [...schedule];
//         newSchedule[index].isActive = !newSchedule[index].isActive;
//         setSchedule(newSchedule);
//     };

//     const handleTimeChange = (index, field, value) => {
//         const newSchedule = [...schedule];
//         newSchedule[index][field] = value;
//         setSchedule(newSchedule);
//     };

//     const saveSchedule = () => {
//         if (!doctorId) return;

//         const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
        
//         const activeDays = schedule.filter(s => s.isActive).map(s => ({
//             day: s.day,
//             start: s.start,
//             end: s.end
//         }));

//         const existingIndex = allSchedules.findIndex(s => s.doctorId === doctorId);
//         if (existingIndex >= 0) {
//             allSchedules[existingIndex].days = activeDays;
//         } else {
//             allSchedules.push({ doctorId, days: activeDays });
//         }

//         localStorage.setItem(DB_SCHEDULES_KEY, JSON.stringify(allSchedules));
//         setShowSuccessPopup(true);
//         setTimeout(() => setShowSuccessPopup(false), 2000); // Auto hide after 2s
//     };

//     return (
//         <div className="dashboard-layout">
//             <DoctorSidebar />
            
//             <main className="dashboard-main fade-in">
//                 {/* HEADER */}
//                 <header className="dashboard-header">
//                     <div>
//                         <h1>Manage Schedule</h1>
//                         <p>Set your weekly availability for patient bookings.</p>
//                     </div>
//                 </header>

//                 <div className="schedule-container">
                    
//                     {/* SCHEDULE TABLE HEADER */}
//                     <div className="schedule-header-row">
//                         <div className="col-day">Day</div>
//                         <div className="col-status">Status</div>
//                         <div className="col-time">Working Hours</div>
//                     </div>

//                     {/* DAYS LIST */}
//                     <div className="days-list">
//                         {schedule.map((daySlot, index) => (
//                             <div key={daySlot.day} className={`day-row ${daySlot.isActive ? 'active' : 'inactive'}`}>
                                
//                                 {/* Day Name */}
//                                 <div className="col-day">
//                                     <div className="day-name">{daySlot.day}</div>
//                                 </div>

//                                 {/* Toggle Switch */}
//                                 <div className="col-status">
//                                     <label className="switch">
//                                         <input 
//                                             type="checkbox" 
//                                             checked={daySlot.isActive} 
//                                             onChange={() => handleToggleDay(index)}
//                                         />
//                                         <span className="slider round"></span>
//                                     </label>
//                                     <span className={`status-label ${daySlot.isActive ? 'text-green' : 'text-gray'}`}>
//                                         {daySlot.isActive ? "Available" : "Off"}
//                                     </span>
//                                 </div>

//                                 {/* Time Inputs */}
//                                 <div className="col-time">
//                                     {daySlot.isActive ? (
//                                         <div className="time-group">
//                                             <div className="time-input-wrapper">
//                                                 <input 
//                                                     type="time" 
//                                                     value={daySlot.start}
//                                                     onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
//                                                 />
//                                             </div>
//                                             <span className="separator">to</span>
//                                             <div className="time-input-wrapper">
//                                                 <input 
//                                                     type="time" 
//                                                     value={daySlot.end}
//                                                     onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <span className="unavailable-text">No Slots Available</span>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* ACTIONS */}
//                     <div className="schedule-footer">
//                         <button className="btn-primary-action save-btn" onClick={saveSchedule}>
//                             <FaSave /> Save Changes
//                         </button>
//                     </div>
//                 </div>

//                 {/* SUCCESS TOAST */}
//                 {showSuccessPopup && (
//                     <div className="toast-notification slide-up">
//                         <FaCheckCircle /> Schedule Updated Successfully!
//                     </div>
//                 )}

//             </main>
//         </div>
//     );
// }
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSave } from "react-icons/fa";
import DoctorSidebar from "../../components/DoctorSidebar";

import {
    getDoctorScheduleByDocId,
    createSchedule,
    updateSchedule,
    deleteSchedule
} from "../../services/doctors.js"; 

import "./DoctorSchedule.css";

export default function DoctorSchedule() {
    const navigate = useNavigate();
    const [doctorId, setDoctorId] = useState(null);
    const [scheduleId, setScheduleId] = useState(null); // backend schedule ID
    const [schedule, setSchedule] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const daysOfWeek = [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }

        const parsed = JSON.parse(storedUser);

        if (!parsed.doctor_id) {
            console.warn("Logged user is not a doctor");
            navigate("/");
            return;
        }

        setDoctorId(parsed.doctor_id);
        loadSchedule(parsed.doctor_id);
    }, []);

    const loadSchedule = async (docId) => {
        try {
            const res = await getDoctorScheduleByDocId(docId);

            if (!res.data.schedule) {
                // doctor has no saved schedule → create empty one
                setSchedule(
                    daysOfWeek.map((day) => ({
                        day,
                        isActive: false,
                        start: "09:00",
                        end: "17:00"
                    }))
                );
                return;
            }

            const backendSchedule = res.data.schedule;
            setScheduleId(backendSchedule.id);

            const fullWeek = daysOfWeek.map((day) => {
                const saved = backendSchedule.days.find((d) => d.day === day);
                return {
                    day,
                    isActive: !!saved,
                    start: saved?.start || "09:00",
                    end: saved?.end || "17:00"
                };
            });
            setSchedule(fullWeek);
        } catch (err) {
            console.error("Error loading schedule:", err);
        }
    };

    const handleToggleDay = (index) => {
        const updated = [...schedule];
        updated[index].isActive = !updated[index].isActive;
        setSchedule(updated);
    };

    const handleTimeChange = (index, field, value) => {
        const updated = [...schedule];
        updated[index][field] = value;
        setSchedule(updated);
    };

    const saveSchedule = async () => {
        const activeDays = schedule
            .filter((d) => d.isActive)
            .map((d) => ({
                day: d.day,
                start: d.start,
                end: d.end
            }));

        try {
            let res;

            if (!scheduleId) {
                // first time creating schedule
                res = await createSchedule({ days: activeDays });
                setScheduleId(res.data.schedule_id);
            } else {
                // updating existing schedule
                await updateSchedule(scheduleId, { days: activeDays });
            }

            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 2000);
        } catch (err) {
            console.error("Failed to save schedule", err);
        }
    };

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />

            <main className="dashboard-main fade-in">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>Manage Schedule</h1>
                        <p>Set your weekly availability for patient bookings.</p>
                    </div>
                </header>

                <div className="schedule-container">
                    {/* HEADER ROW */}
                    <div className="schedule-header-row">
                        <div className="col-day">Day</div>
                        <div className="col-status">Status</div>
                        <div className="col-time">Working Hours</div>
                    </div>

                    {/* DAYS */}
                    <div className="days-list">
                        {schedule.map((daySlot, index) => (
                            <div
                                key={daySlot.day}
                                className={`day-row ${daySlot.isActive ? "active" : "inactive"}`}
                            >
                                {/* Day Name */}
                                <div className="col-day">
                                    <div className="day-name">{daySlot.day}</div>
                                </div>

                                {/* Toggle */}
                                <div className="col-status">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={daySlot.isActive}
                                            onChange={() => handleToggleDay(index)}
                                        />
                                        <span className="slider round"></span>
                                    </label>

                                    <span
                                        className={`status-label ${
                                            daySlot.isActive ? "text-green" : "text-gray"
                                        }`}
                                    >
                                        {daySlot.isActive ? "Available" : "Off"}
                                    </span>
                                </div>

                                {/* Time Controls */}
                                <div className="col-time">
                                    {daySlot.isActive ? (
                                        <div className="time-group">
                                            <input
                                                type="time"
                                                value={daySlot.start}
                                                onChange={(e) =>
                                                    handleTimeChange(index, "start", e.target.value)
                                                }
                                            />
                                            <span className="separator">to</span>
                                            <input
                                                type="time"
                                                value={daySlot.end}
                                                onChange={(e) =>
                                                    handleTimeChange(index, "end", e.target.value)
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <span className="unavailable-text">No Slots Available</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save */}
                    <div className="schedule-footer">
                        <button className="btn-primary-action save-btn" onClick={saveSchedule}>
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>

                {/* SUCCESS TOAST */}
                {showSuccessPopup && (
                    <div className="toast-notification slide-up">
                        <FaCheckCircle /> Schedule Updated Successfully!
                    </div>
                )}
            </main>
        </div>
    );
}
