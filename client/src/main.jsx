import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { initializeDB } from './data/initDB';
import Login from './routes/auth/login.jsx';
import Register from './routes/auth/register.jsx';
import Home from './routes/public/home.jsx';
import BookingPage from './routes/public/BookingPage.jsx';
import DoctorsList from './routes/doctor/DoctorsList.jsx';
import DoctorProfile from './routes/doctor/DoctorProfile.jsx';
import DoctorDashboard from './routes/doctor/DoctorDashboard.jsx';
import DoctorAppointments from './routes/doctor/DoctorAppointments.jsx';
import DoctorSchedule from './routes/doctor/DoctorSchedule.jsx';
import Diagnosis from './routes/doctor/Diagnosis.jsx';
import DoctorPrivateProfile from './routes/doctor/DoctorPrivateProfile.jsx';
import DoctorPatientProfile from './routes/doctor/DoctorPatientProfile.jsx';
import PatientDashboard from './routes/patient/PatientDashboard.jsx';
import MyAppointments from './routes/patient/MyAppointments.jsx';
import AppointmentDetails from './routes/patient/AppointmentDetails.jsx';
import PatientProfile from './routes/patient/PatientProfile.jsx';
import MedicalRecords from './routes/patient/MedicalRecords.jsx';
import AdminApp from './routes/admin/AdminPage.jsx';
import AdminAppointmentDetails from './routes/admin/Pages/Appointments/AdminAppointmentDetails.jsx';

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
    { path: "/admin/dashboard", element: <AdminApp /> },
    { path: "/admin/doctor-details/:id", element: <DoctorPrivateProfile /> },
    { path: "/admin/patient-details/:id", element: <PatientProfile /> },
    { path: "/admin/appointment/:id", element: <AdminAppointmentDetails /> }, 
    {path: "/patient/appointment/:id", element: <AppointmentDetails /> },
    {path: "/patient/appointments", element: <MyAppointments /> },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
