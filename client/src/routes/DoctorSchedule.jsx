import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import { DB_SCHEDULES_KEY } from '../data/initDB'; 
import { doctorsData } from '../data/doctors'; 
import './DoctorSchedule.css'; 

export default function DoctorSchedule() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("activeUserEmail");
    
    const [doctorId, setDoctorId] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [saved, setSaved] = useState(false);

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

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
        setSaved(false);
    };

    const handleTimeChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
        setSaved(false);
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
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <h1>Manage Schedule</h1>
                    <p>Update your availability for patients.</p>
                </header>

                <div className="schedule-container">
                    {schedule.map((daySlot, index) => (
                        <div key={daySlot.day} className={`day-row ${daySlot.isActive ? 'active' : 'inactive'}`}>
                            <div className="day-label">
                                <input 
                                    type="checkbox" 
                                    checked={daySlot.isActive} 
                                    onChange={() => handleToggleDay(index)}
                                />
                                <span onClick={() => handleToggleDay(index)}>{daySlot.day}</span>
                            </div>
                            {daySlot.isActive ? (
                                <div className="time-inputs">
                                    <input 
                                        type="time" 
                                        value={daySlot.start}
                                        onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                    />
                                    <span>to</span>
                                    <input 
                                        type="time" 
                                        value={daySlot.end}
                                        onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="time-inputs disabled">Unavailable</div>
                            )}
                        </div>
                    ))}
                    <div className="save-section">
                        <button className="btn-save" onClick={saveSchedule}>Save Changes</button>
                        {saved && <span className="success-msg">✅ Live Updated!</span>}
                    </div>
                </div>
            </main>
        </div>
    );
}