import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaSave, FaCalendarAlt } from 'react-icons/fa';
import DoctorSidebar from '../../components/DoctorSidebar';
import { DB_SCHEDULES_KEY } from '../../data/initDB'; 
import { doctorsData } from '../../data/doctors'; 
import './DoctorSchedule.css'; 

export default function DoctorSchedule() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [doctorId, setDoctorId] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        if (!currentUserEmail) { navigate('/login'); return; }

        const nameKey = currentUserEmail.split('@')[0].toLowerCase();
        const doc = doctorsData.find(d => d.name.toLowerCase().includes(nameKey));
        
        if (doc) {
            setDoctorId(doc.id);
            loadSchedule(doc.id);
        }
    }, [currentUserEmail, navigate]);

    const loadSchedule = (id) => {
        const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
        const mySchedule = allSchedules.find(s => s.doctorId === id);

        const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        if (mySchedule) {
            const fullWeek = daysOfWeek.map(day => {
                const savedDay = mySchedule.days.find(d => d.day === day);
                return {
                    day,
                    isActive: !!savedDay,
                    start: savedDay?.start || "09:00",
                    end: savedDay?.end || "17:00"
                };
            });
            setSchedule(fullWeek);
        } else {
            setSchedule(daysOfWeek.map(day => ({ day, isActive: false, start: "09:00", end: "17:00" })));
        }
    };

    const handleToggleDay = (index) => {
        const newSchedule = [...schedule];
        newSchedule[index].isActive = !newSchedule[index].isActive;
        setSchedule(newSchedule);
    };

    const handleTimeChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const saveSchedule = () => {
        if (!doctorId) return;

        const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
        
        const activeDays = schedule.filter(s => s.isActive).map(s => ({
            day: s.day,
            start: s.start,
            end: s.end
        }));

        const existingIndex = allSchedules.findIndex(s => s.doctorId === doctorId);
        if (existingIndex >= 0) {
            allSchedules[existingIndex].days = activeDays;
        } else {
            allSchedules.push({ doctorId, days: activeDays });
        }

        localStorage.setItem(DB_SCHEDULES_KEY, JSON.stringify(allSchedules));
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 2000); // Auto hide after 2s
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
                    
                    {/* SCHEDULE TABLE HEADER */}
                    <div className="schedule-header-row">
                        <div className="col-day">Day</div>
                        <div className="col-status">Status</div>
                        <div className="col-time">Working Hours</div>
                    </div>

                    {/* DAYS LIST */}
                    <div className="days-list">
                        {schedule.map((daySlot, index) => (
                            <div key={daySlot.day} className={`day-row ${daySlot.isActive ? 'active' : 'inactive'}`}>
                                
                                {/* Day Name */}
                                <div className="col-day">
                                    <div className="day-name">{daySlot.day}</div>
                                </div>

                                {/* Toggle Switch */}
                                <div className="col-status">
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={daySlot.isActive} 
                                            onChange={() => handleToggleDay(index)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                    <span className={`status-label ${daySlot.isActive ? 'text-green' : 'text-gray'}`}>
                                        {daySlot.isActive ? "Available" : "Off"}
                                    </span>
                                </div>

                                {/* Time Inputs */}
                                <div className="col-time">
                                    {daySlot.isActive ? (
                                        <div className="time-group">
                                            <div className="time-input-wrapper">
                                                <input 
                                                    type="time" 
                                                    value={daySlot.start}
                                                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                                />
                                            </div>
                                            <span className="separator">to</span>
                                            <div className="time-input-wrapper">
                                                <input 
                                                    type="time" 
                                                    value={daySlot.end}
                                                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="unavailable-text">No Slots Available</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ACTIONS */}
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