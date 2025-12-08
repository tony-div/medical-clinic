import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSave } from "react-icons/fa";
import DoctorSidebar from "../../components/DoctorSidebar";

import {
    getDoctorScheduleByDocId,
    createSchedule,
    deleteSchedule
} from "../../services/doctors";

import "./DoctorSchedule.css";

export default function DoctorSchedule() {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const [doctorId, setDoctorId] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Frontend → readable days
    const daysOfWeek = [
        { label: "Saturday", key: "Sat" },
        { label: "Sunday", key: "Sun" },
        { label: "Monday", key: "Mon" },
        { label: "Tuesday", key: "Tue" },
        { label: "Wednesday", key: "Wed" },
        { label: "Thursday", key: "Thur" },
        { label: "Friday", key: "Fri" }
    ];

    useEffect(() => {
        console.log(storedUser);
        if (!storedUser) {
            navigate("/login");
            return;
        }

        if (storedUser.role !== "doctor") {
            navigate("/");
            return;
        }
        console.log("doc id : ", storedUser.doctor_id);
        setDoctorId(storedUser.doctor_id);
        loadSchedule(storedUser.doctor_id);
    }, []);

    const loadSchedule = async (docId) => {
        try {
            const res = await getDoctorScheduleByDocId(docId);
            const backendSchedule = res.data.schedule;

            if (!backendSchedule || backendSchedule.length === 0) {
                // No schedule → default blank week
                setSchedule(
                    daysOfWeek.map((day) => ({
                        label: day.label,
                        key: day.key,
                        isActive: false,
                        start: "09:00",
                        end: "17:00"
                    }))
                );
                return;
            }

            const fullWeek = daysOfWeek.map((d) => {
                const saved = backendSchedule.find((s) => s.day === d.key);

                return {
                    label: d.label,
                    key: d.key,
                    isActive: !!saved,
                    start: saved ? saved.starts_at.slice(0, 5) : "09:00",
                    end: saved ? saved.ends_at.slice(0, 5) : "17:00"
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
        try {
            // 1. Delete all existing schedule rows for this doctor
            await deleteSchedule(doctorId);

            // 2. Recreate each active schedule row
            const activeDays = schedule.filter((d) => d.isActive);

            for (const d of activeDays) {
                await createSchedule({
                    day: d.key,
                    starts_at: d.start,
                    ends_at: d.end,
                    slot_duration: 30
                });
            }

            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 2000);

            loadSchedule(doctorId);
        } catch (err) {
            console.error("Failed to save schedule:", err);
        }
    };

    return (
        <div className="dashboard-layout">
            <DoctorSidebar />

            <main className="dashboard-main fade-in">
                <header className="dashboard-header">
                    <div>
                        <h1>Manage Schedule</h1>
                        <p>Set your weekly availability for patient bookings.</p>
                    </div>
                </header>

                <div className="schedule-container">
                    <div className="schedule-header-row">
                        <div className="col-day">Day</div>
                        <div className="col-status">Status</div>
                        <div className="col-time">Working Hours</div>
                    </div>

                    <div className="days-list">
                        {schedule.map((daySlot, index) => (
                            <div key={daySlot.key} className={`day-row ${daySlot.isActive ? "active" : "inactive"}`}>
                                <div className="col-day">
                                    <div className="day-name">{daySlot.label}</div>
                                </div>

                                <div className="col-status">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={daySlot.isActive}
                                            onChange={() => handleToggleDay(index)}
                                        />
                                        <span className="slider round"></span>
                                    </label>

                                    <span className={`status-label ${daySlot.isActive ? "text-green" : "text-gray"}`}>
                                        {daySlot.isActive ? "Available" : "Off"}
                                    </span>
                                </div>

                                <div className="col-time">
                                    {daySlot.isActive ? (
                                        <div className="time-group">
                                            <input
                                                type="time"
                                                value={daySlot.start}
                                                onChange={(e) => handleTimeChange(index, "start", e.target.value)}
                                            />
                                            <span className="separator">to</span>
                                            <input
                                                type="time"
                                                value={daySlot.end}
                                                onChange={(e) => handleTimeChange(index, "end", e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <span className="unavailable-text">No Slots Available</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="schedule-footer">
                        <button className="btn-primary-action save-btn" onClick={saveSchedule}>
                            <FaSave /> Save Changes
                        </button>
                    </div>
                </div>

                {showSuccessPopup && (
                    <div className="toast-notification slide-up">
                        <FaCheckCircle /> Schedule Updated Successfully!
                    </div>
                )}
            </main>
        </div>
    );
}
