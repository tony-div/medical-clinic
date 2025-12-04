import { doctorsData } from './doctors';
import { patientsData } from './patients';
import { initialSchedules } from './scheduleData'; 

export const DB_DOCTORS_KEY = 'db_doctors';
export const DB_PATIENTS_KEY = 'db_users'; 
export const DB_APPOINTMENTS_KEY = 'db_appointments';
export const DB_SCHEDULES_KEY = 'db_schedules';
export const DB_ADMINS_KEY = 'db_admins';

export function initializeDB() {
    if (!localStorage.getItem(DB_DOCTORS_KEY)) {
        localStorage.setItem(DB_DOCTORS_KEY, JSON.stringify(doctorsData));
        console.log('✅ Database: Doctors initialized');
    }

    if (!localStorage.getItem(DB_PATIENTS_KEY)) {
        const formattedPatients = patientsData.map(p => ({...p, role: 'patient'}));
        localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(formattedPatients));
        console.log('✅ Database: Patients initialized');
    }

    if (!localStorage.getItem(DB_APPOINTMENTS_KEY)) {
        let initialAppointments = [];
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(initialAppointments));
    }

    if (!localStorage.getItem(DB_SCHEDULES_KEY)) {
        localStorage.setItem(DB_SCHEDULES_KEY, JSON.stringify(initialSchedules));
    }

    if (!localStorage.getItem(DB_ADMINS_KEY)) {
        const defaultAdmin = [
            { 
                id: 1, 
                name: "Super Admin", 
                email: "admin@clinic.com", 
                password: "123", 
                role: "admin" 
            }
        ];
        localStorage.setItem(DB_ADMINS_KEY, JSON.stringify(defaultAdmin));
        console.log('✅ Database: Admin initialized');
    }
}