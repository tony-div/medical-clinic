import { db } from '../../config/database.js';

export const getTimeSlots = async (req, res) => {
    const doctorId = req.params.doctorId;
    let startDate = req.query.startDate;

    if (startDate){
        if(!isValidDateFormat(startDate)){
            return res.status(400).json({ 
                message: 'Invalid date format. Please use YYYY-MM-DD (e.g., 2025-01-01).' 
            });
        }
    }
    else {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const dayOfWeek = getDayOfWeek(startDate);

    const scheduleQuery = `
    SELECT day, starts_at, ends_at, slot_duration
    FROM DoctorSchedule
    WHERE doctor_id = ? AND day = ?`

    const BookedSlotsQuery = `
    SELECT date, starts_at
    FROM Appointment
    WHERE date = ?
    `
    
    try{
        let [scheduleRow] = await db.query(scheduleQuery, [doctorId, dayOfWeek]);
        const [bookedSlots] = await db.query(BookedSlotsQuery, [startDate]);

        scheduleRow = scheduleRow[0];
        if(scheduleRow){
            const slot_duration = scheduleRow.slot_duration;
            const starts_at = scheduleRow.starts_at;
            const ends_at = scheduleRow.ends_at;
            const slots = []
            // Format: 'HH:MM:SS'
            const bookedTimes = new Set(bookedSlots.map(slot => slot.starts_at));

            const baseDate = new Date(startDate);
            const [startHour, startMinute] = starts_at.split(':').map(Number);
            
            let currentSlot = new Date(baseDate);
            currentSlot.setHours(startHour, startMinute, 0, 0);

            const [endHour, endMinute] = ends_at.split(':').map(Number);

            const scheduleEnd = new Date(baseDate);
            scheduleEnd.setHours(endHour, endMinute, 0, 0);
            
            while (currentSlot < scheduleEnd) {
                const slotEndTime = addMinutes(currentSlot, slot_duration);
                
                // If the slot ends exactly when the schedule ends, we include it,
                // but if it overshoots, we stop.
                if (slotEndTime > scheduleEnd) {
                    break; 
                }
                // Format the start time as HH:MM:SS for comparison against the bookedTimes Set
                const slotTimeString = currentSlot.toTimeString().substring(0, 8); 
                
                const isBooked = bookedTimes.has(slotTimeString);
                
                slots.push({
                    date: startDate,
                    day: dayOfWeek,
                    startTime: currentSlot.toTimeString().substring(0, 5), // HH:MM
                    endTime: slotEndTime.toTimeString().substring(0, 5),     // HH:MM
                    status: isBooked ? 'booked' : 'available'
                });
                
                currentSlot = slotEndTime;
            }
            return res.status(200).json({ 
                message: `Slots for ${startDate}`,
                data: slots
            });        

        }
        else{
            return res.status(200).json({ 
                message: `Doctor is not available on ${dayOfWeek}`
            });
        }
    

    } catch(error){
        console.error('Error generating time slots:', error);
        return res.status(500).json({
            message: 'Internal server error while processing slots.',
            error: error.message
        });
    }
   
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);


const isValidDateFormat = (startDate) => {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateFormatRegex.test(startDate);
}


const getDayOfWeek = (dateString) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const dateObject = new Date(dateString);
    const dayIndex = dateObject.getDay();
    return dayNames[dayIndex];
}