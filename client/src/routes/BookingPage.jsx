import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientsData } from '../data/patients';
import { DB_APPOINTMENTS_KEY, DB_SCHEDULES_KEY, DB_DOCTORS_KEY, DB_PATIENTS_KEY} from '../data/initDB'; 
import Nav from '../components/Nav'; 
import './BookingPage.css';

export default function BookingPage() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        const allDoctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]");
        const foundDoc = allDoctors.find(d => d.id === Number(doctorId));
        
        if (foundDoc) {
            setDoctor(foundDoc);
        } else {
            alert("Doctor not found.");
            navigate('/doctors');
        }
    }, [doctorId, navigate]);

    const currentUserEmail = localStorage.getItem("activeUserEmail");
    const allPatients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]");
    const currentUser = allPatients.find(p => p.email === currentUserEmail);

    const [reason, setReason] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [startIndex, setStartIndex] = useState(0);
    const DAYS_TO_SHOW = 3; 

    const next7Days = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    }, []);

    const getSlotsForDate = (dateObj) => {
        if (!doctor) return [];

        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = dateObj.toISOString().split('T')[0]; 

        const allSchedules = JSON.parse(localStorage.getItem(DB_SCHEDULES_KEY) || "[]");
        const docSchedule = allSchedules.find(s => s.doctorId === doctor.id);
        const activeDay = docSchedule?.days.find(d => d.day === dayName);

        if (!activeDay) return []; 

        const rawSlots = [];
        let current = new Date(`2025-01-01T${activeDay.start}`);
        const endTime = new Date(`2025-01-01T${activeDay.end}`);

        while (current < endTime) {
            rawSlots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            current.setMinutes(current.getMinutes() + 30);
        }

        const allAppointments = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        
        const availableSlots = rawSlots.filter(timeSlot => {
            const isTaken = allAppointments.some(appt => 
                (appt.doctor === doctor.name || appt.doctorName === doctor.name) &&
                appt.date === dateString && 
                appt.time === timeSlot &&
                appt.status !== 'Cancelled'
            );
            return !isTaken;
        });

        return availableSlots;
    };

    const handleSlotClick = (dateObj, time) => {
        const dateStr = dateObj.toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setSelectedTime(time);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(URL.createObjectURL(file));
    };

    const handleConfirm = () => {
        if (!currentUserEmail) { alert("Please login."); navigate('/login'); return; }
        if (!selectedDate || !selectedTime || !reason) { alert("Please fill in all details."); return; }

        const newAppointment = {
            id: Date.now(),
            doctor: doctor.name,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            image: doctor.image,
            fees: doctor.fees, 
            
            patientName: currentUser ? currentUser.name : "Guest",
            patientEmail: currentUserEmail,
            date: selectedDate,
            time: selectedTime,
            reason: reason,
            status: "Scheduled",
            uploadedFiles: selectedFile
        };
        
        const allAppointments = JSON.parse(localStorage.getItem(DB_APPOINTMENTS_KEY) || "[]");
        allAppointments.push(newAppointment);
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(allAppointments));
        localStorage.setItem(`appointment_${currentUserEmail}`, JSON.stringify(newAppointment));

        setShowModal(true);
    };

    const handleNext = () => {
        if (startIndex + DAYS_TO_SHOW < next7Days.length) setStartIndex(startIndex + 1);
    };
    const handlePrev = () => {
        if (startIndex > 0) setStartIndex(startIndex - 1);
    };

    const visibleDays = next7Days.slice(startIndex, startIndex + DAYS_TO_SHOW);

    if (!doctor) return <div style={{textAlign:'center', marginTop:'100px'}}>Loading Doctor Details...</div>;

    return (
        <div className="booking-container">
            <Nav /> 
            <div className="booking-content">
                <h1>Book Appointment</h1>
                
                <div className="booking-grid">
                    <div className="summary-card">
                        <img src={doctor.image} alt={doctor.name} />
                        <h3>{doctor.name}</h3>
                        
                        <p className="specialty">{doctor.specialty}</p>
                        
                        <div className="fee-row">
                            <span>Consultation Fees:</span>
                            <strong>{doctor.fees} EGP</strong>
                        </div>
                    </div>

                    <div className="form-card">
                        <div className="carousel-wrapper">
                            <button className="nav-arrow" onClick={handlePrev} disabled={startIndex === 0}>‹</button>
                            
                            <div className="carousel-container">
                                {visibleDays.map((dateObj, index) => {
                                    const dateStr = dateObj.toISOString().split('T')[0];
                                    const slots = getSlotsForDate(dateObj);
                                    const isToday = new Date().toDateString() === dateObj.toDateString();
                                    const displayDate = isToday ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

                                    return (
                                        <div key={index} className="day-column">
                                            <div className="day-header">{displayDate}</div>
                                            <div className="slots-list">
                                                {slots.length > 0 ? (
                                                    slots.map(slot => (
                                                        <div 
                                                            key={slot} 
                                                            className={`time-slot ${selectedDate === dateStr && selectedTime === slot ? 'active' : ''}`}
                                                            onClick={() => handleSlotClick(dateObj, slot)}
                                                        >
                                                            {slot}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-slots">Not Available</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button className="nav-arrow" onClick={handleNext} disabled={startIndex + DAYS_TO_SHOW >= next7Days.length}>›</button>
                        </div>

                        {selectedDate && selectedTime && (
                            <div className="additional-info">
                                <div className="selected-summary">
                                    You selected: <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>
                                </div>

                                <div className="form-section">
                                    <label>Reason for Visit</label>
                                    <textarea rows="2" onChange={(e) => setReason(e.target.value)} placeholder="Describe your symptoms..."></textarea>
                                </div>

                                <div className="form-section">
                                    <label>Upload Tests</label>
                                    <input type="file" onChange={handleFileChange} />
                                </div>

                                <button className="confirm-btn" onClick={handleConfirm}>Confirm Booking</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>✅ Booking Confirmed!</h3>
                        <p>See you on {selectedDate} at {selectedTime}</p>
                        <button className="auth-btn" onClick={() => window.location.href = '/patient/dashboard'}>Go to Dashboard</button>
                    </div>
                </div>
            )}
        </div>
    );
}