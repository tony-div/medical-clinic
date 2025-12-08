import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSave } from "react-icons/fa";
import DoctorSidebar from "../../components/DoctorSidebar";

import {
    getDoctorScheduleByDocId,
    createSchedule,
    deleteSchedule,
    updateSchedule
} from "../../services/doctors";

import "./DoctorSchedule.css";

export default function DoctorSchedule() {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const [isLoading, setIsLoading] = useState(false);
    const [doctorId, setDoctorId] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [originalSchedule, setOriginalSchedule] = useState([]);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

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

            const fullWeek = daysOfWeek.map((d) => {
                const saved = backendSchedule?.find((s) => s.day === d.key);

                return {
                    label: d.label,
                    key: d.key,
                    id: saved ? saved.id : null,        // <-- IMPORTANT
                    isActive: !!saved,
                    start: saved ? saved.starts_at.slice(0, 5) : "09:00",
                    end: saved ? saved.ends_at.slice(0, 5) : "17:00",
                    slot_duration: saved ? saved.slot_duration : 30
                };
            });

            setSchedule(fullWeek);
            setOriginalSchedule(backendSchedule);
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
            setIsLoading(true);
            // Validate: end time must be later than start time
            for (const d of schedule) {
                if (d.isActive) {
                    if (d.end <= d.start) {
                        setErrorMessage(`Invalid time range on ${d.label}: End time must be later than start time.`);
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 2500);
                        setIsLoading(false);
                        return; // Stop saving completely
                    }
                }
            }

            const oldMap = {};
            originalSchedule.forEach((s) => {
                oldMap[s.day] = {
                    id: s.id,
                    day: s.day,
                    starts_at: s.starts_at.slice(0, 5),
                    ends_at: s.ends_at.slice(0, 5),
                    slot_duration: s.slot_duration
                };
            });
            const newMap = {};
            schedule.forEach((d) => {
                if (d.isActive) {
                    newMap[d.key] = {
                        day: d.key,
                        starts_at: d.start,
                        ends_at: d.end,
                        slot_duration: 30
                    };
                }
            });

            const updates = [];
            const deletes = [];
            const creates = [];

            // 1. For each old item → update or delete
            for (const day in oldMap) {
                const oldItem = oldMap[day];

                if (newMap[day]) {
                    const newItem = newMap[day];
                        console.log("COMPARE:", {
                            old_start: oldItem.starts_at,
                            new_start: newItem.starts_at,
                            old_end: oldItem.ends_at,
                            new_end: newItem.ends_at
                        });

                    if (
                        oldItem.starts_at !== newItem.starts_at ||
                        oldItem.ends_at !== newItem.ends_at
                    ) {
                        console.log("added new one to update list", newItem);
                        updates.push({
                            id: oldItem.id,
                            ...newItem
                        });
                    }

                } else {
                    deletes.push(oldItem.id);
                }
            }

            // 2. For each new item → create if it didn’t exist before
            for (const day in newMap) {
                if (!oldMap[day]) {
                    creates.push(newMap[day]);
                }
            }

            // DELETE
            for (const id of deletes) {
                console.log("DELETE schedule id:", id);
                await deleteSchedule(id);
            }

            // UPDATE
            for (const upd of updates) {
                console.log("UPDATE schedule:", upd.id, upd);
                await updateSchedule(upd.id, {
                    starts_at: upd.starts_at,
                    ends_at: upd.ends_at,
                    slot_duration: upd.slot_duration
                });
            }

            // CREATE
            for (const newItem of creates) {
                console.log("CREATE schedule:", newItem);
                await createSchedule(newItem);
            }

            setIsLoading(false);
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 2000);

            loadSchedule(doctorId);

        } catch (err) {
            setIsLoading(false);
            setErrorMessage(msg);
            setShowErrorPopup(true);
            setTimeout(() => setShowErrorPopup(false), 2500);
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
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Please wait…</p>
                    </div>
                )}
                {showErrorPopup && (
                    <div className="toast-notification error slide-up">
                        <FaCheckCircle style={{ transform: "rotate(45deg)" }} />
                        {errorMessage}
                    </div>
                )}

            </main>
        </div>
    );
}
