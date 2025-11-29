import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { initializeDB } from './data/initDB'; 
import Home from './routes/home.jsx';
import Login from './routes/login.jsx';
import Register from './routes/register.jsx';
import DoctorsList from './routes/DoctorsList.jsx';
import DoctorProfile from './routes/DoctorProfile.jsx';
import BookingPage from './routes/BookingPage.jsx';
import PatientDashboard from './routes/PatientDashboard.jsx';
import MyAppointments from './routes/MyAppointments.jsx';
import Diagnosis from './routes/Diagnosis.jsx';
import DoctorAppointments from './routes/DoctorAppointments.jsx';
import DoctorDashboard from './routes/DoctorDashboard.jsx';
import DoctorSchedule from './routes/DoctorSchedule.jsx';
import AppointmentDetails from './routes/AppointmentDetails.jsx';
import DoctorPatientProfile from './routes/DoctorPatientProfile.jsx';
import MedicalRecords from './routes/MedicalRecords.jsx';
import PatientProfile from './routes/PatientProfile.jsx';
import DoctorPrivateProfile from './routes/DoctorPrivateProfile.jsx';

initializeDB(); 

const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/doctors", element: <DoctorsList /> },
    { path: "/doctor/:id", element: <DoctorProfile /> },
    { path: "/book/:doctorId", element: <BookingPage /> },
    { path: "/patient/dashboard", element: <PatientDashboard /> },
    { path: "/patient/appointments", element: <MyAppointments /> },
    { path: "/doctor/diagnosis/:appointmentId", element: <Diagnosis /> },
    { path: "/doctor/appointments", element: <DoctorAppointments /> },
    { path: "/doctor/dashboard", element: <DoctorDashboard /> },
    { path: "/doctor/schedule", element: <DoctorSchedule /> },
    { path: "/doctor/appointments", element: <DoctorAppointments /> },
    { path: "/patient/appointment/:id", element: <AppointmentDetails /> },
    { path: "/doctor/patient-profile/:patientEmail", element: <DoctorPatientProfile /> },
    { path: "/patient/records", element: <MedicalRecords /> },
    { path: "/patient/profile", element: <PatientProfile /> },
    { path: "/doctor/profile", element: <DoctorPrivateProfile /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);