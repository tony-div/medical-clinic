import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Nav from '../../components/Nav';
import './BookingPage.css';

import { getDoctorById } from '../../services/doctors';
import { getTimeSlots } from '../../services/time-slots';
import { createAppointment } from '../../services/appointment';
import { createMedicalTest, uploadMedicalTestFile  } from "../../services/medical-tests";

export default function BookingPage() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [slotsByDate, setSlotsByDate] = useState({});
    const [reason, setReason] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const DAYS_TO_SHOW = 3;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const currentUserEmail = currentUser?.email || null;

    useEffect(() => {
        async function loadDoctor() {
            try {
                const res = await getDoctorById(doctorId);
                const doc = res.data.data?.[0] || null;

                if (!doc) {
                    Swal.fire('Error', 'Doctor not found.', 'error')
                        .then(() => navigate('/doctors'));
                    return;
                }
                setDoctor(doc);

            } catch (err) {
                Swal.fire('Error', 'Failed to load doctor.', 'error');
            }
        }

        loadDoctor();
    }, [doctorId, navigate]);

    const next7Days = useMemo(() => {
        const arr = [];
        const base = new Date();

        for (let i = 0; i < 7; i++) {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');

            arr.push({
                dateObj: d,
                dateStr: `${year}-${month}-${day}`
            });
        }

        return arr;
    }, []);

    const fetchSlotsForDate = async (dateStr) => {
        if (slotsByDate[dateStr]) return; // already loaded

        try {
            const res = await getTimeSlots(doctorId, dateStr);
            const data = res.data.data || [];
            console.log("schedules: "+ data);

            setSlotsByDate(prev => ({
                ...prev,
                [dateStr]: data
            }));
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
    if (!doctor) return;

    next7Days.forEach(d => {
        fetchSlotsForDate(d.dateStr);
    });

    setSelectedDate(next7Days[0].dateStr);
}, [doctor, next7Days]);


    const handleDateClick = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setSelectedDate(dateStr);
        setSelectedSlot(null);

        fetchSlotsForDate(dateStr);
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
    };

    const [filePreviewUrl, setFilePreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setSelectedFile(file);
            setFilePreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setFilePreviewUrl(null);
        }
    };


    const handleConfirm = async () => {
        if (!currentUserEmail) {
            Swal.fire({
                title: 'Login Required',
                text: 'You must be logged in to book an appointment.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Login'
            }).then((r) => {
                if (r.isConfirmed) navigate('/login');
            });
            return;
        }
        if (!selectedDate || !selectedSlot || !reason.trim()) {
            Swal.fire(
                'Missing Information',
                'Please choose a date, a time slot, and provide a reason.',
                'warning'
            );
            return;
        }

        try {
            setIsLoading(true); 
            const payload = {
                doctor_id: Number(doctorId),
                reason: reason.trim(),
                date: selectedDate,
                starts_at: selectedSlot.startTime,
                ends_at: selectedSlot.endTime
            };

            const appointmentRes = await createAppointment(payload);
            const appointmentId = appointmentRes?.data?.appointment_id;

            if (!appointmentId) {
                throw new Error("Failed to retrieve appointment ID.");
            }
            if (selectedFile) {
                // ✅ FIX: Use selectedFile.name instead of reason.trim()
                const testPayload = {
                    appointment_id: appointmentId,
                    description: selectedFile.name, 
                    test_date: null
                };

                const testRes = await createMedicalTest(testPayload);
                const medicalTestId = testRes?.data?.medical_test?.id;

                if (!medicalTestId) {
                    throw new Error("Failed to create medical test.");
                }

                await uploadMedicalTestFile(medicalTestId, selectedFile);
            }
            setIsLoading(false); 
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Your appointment has been booked.",
                confirmButtonText: "Go to Dashboard",
                confirmButtonColor: "#27AE60"
            }).then(() => navigate("/patient/dashboard"));

        } catch (err) {
            setIsLoading(false); 
            const msg =
                err.response?.data?.error ||
                err.message ||
                "An unexpected error occurred.";

            Swal.fire("Error", msg, "error");
        }
    };
    const handleNext = () => {
        if (startIndex + DAYS_TO_SHOW < next7Days.length)
            setStartIndex(startIndex + 1);
    };

    const handlePrev = () => {
        if (startIndex > 0)
            setStartIndex(startIndex - 1);
    };

    const visibleDays = next7Days.slice(startIndex, startIndex + DAYS_TO_SHOW);

    if (!doctor) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
    }

    return (
        <div className="booking-container">
            <Nav />

            <div className="booking-content">
                <button onClick={() => navigate(-1)} className="back-link">
                    ← Back
                </button>

                <h1>Book Appointment</h1>

                <div className="booking-grid">
                    {/* Doctor Summary */}
                    <div className="summary-card">
                        <img src={doctor.profile_pic_path} alt={doctor.name} />
                        <h3>{doctor.name}</h3>
                        <p className="specialty">{doctor.specialty}</p>
                        <div className="fee-row">
                            <span>Consultation Fees:</span>
                            <strong>{doctor.consultation_fees} EGP</strong>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="form-card">
                        <div className="carousel-wrapper">
                            <button className="nav-arrow" onClick={handlePrev} disabled={startIndex === 0}>‹</button>

                            <div className="carousel-container">
                                {visibleDays.map((day, idx) => {
                                    const { dateObj, dateStr } = day;

                                    const isToday = new Date().toDateString() === dateObj.toDateString();
                                    const slots = slotsByDate[dateStr] || [];

                                    const displayDate = isToday
                                        ? "Today"
                                        : dateObj.toLocaleDateString('en-US', {
                                                weekday: "short",
                                                month: "numeric",
                                                day: "numeric"
                                            });

                                    return (
                                        <div
                                            key={idx}
                                            className="day-column"
                                            onClick={() => handleDateClick(dateObj)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="day-header">{displayDate}</div>

                                            <div className="slots-list">
                                                {slots.length > 0 ? (
                                                    slots
                                                        .filter(s => s.status === "available")
                                                        .map((slot, i) => (
                                                            <div
                                                                key={i}
                                                                className={`time-slot ${
                                                                    selectedSlot === slot ? "active" : ""
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDateClick(day.dateObj);
                                                                    handleSlotClick(slot);
                                                                }}
                                                            >
                                                                {slot.startTime}
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="no-slots">Select</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                
                            </div>

                            <button className="nav-arrow" onClick={handleNext} disabled={startIndex + DAYS_TO_SHOW >= next7Days.length}>›</button>
                        </div>

                        {selectedDate && selectedSlot && (
                            <div className="additional-info">
                                <div className="selected-summary">
                                    You selected: <strong>{selectedDate}</strong> at <strong>{selectedSlot.startTime}</strong>
                                </div>

                                <div className="form-section">
                                    <label>Reason for Visit</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Describe your symptoms..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    ></textarea>
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
            {isLoading && (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Please wait…</p>
            </div>
        )}
        </div>
    );
}