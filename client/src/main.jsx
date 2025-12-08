import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { initializeDB } from './data/initDB';
import PrivateRoute from './components/PrivateRoute';
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
  // Public routes
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/doctors", element: <DoctorsList /> },
  { path: "/doctor/:id", element: <DoctorProfile /> },

  // Patient routes (require login + patient/admin role)
  {
    path: "/book/:doctorId",
    element: <PrivateRoute allowedRoles={['patient', 'admin']}><BookingPage /></PrivateRoute>
  },
  {
    path: "/patient/dashboard",
    element: <PrivateRoute allowedRoles={['patient']}><PatientDashboard /></PrivateRoute>
  },
  {
    path: "/patient/appointments",
    element: <PrivateRoute allowedRoles={['patient']}><MyAppointments /></PrivateRoute>
  },
  {
    path: "/patient/appointment/:id",
    element: <PrivateRoute allowedRoles={['patient', 'admin']}><AppointmentDetails /></PrivateRoute>
  },
  {
    path: "/patient/records",
    element: <PrivateRoute allowedRoles={['patient']}><MedicalRecords /></PrivateRoute>
  },
  {
    path: "/patient/profile",
    element: <PrivateRoute allowedRoles={['patient', 'admin']}><PatientProfile /></PrivateRoute>
  },

  // Doctor routes (require login + doctor/admin role)
  {
    path: "/doctor/dashboard",
    element: <PrivateRoute allowedRoles={['doctor']}><DoctorDashboard /></PrivateRoute>
  },
  {
    path: "/doctor/appointments",
    element: <PrivateRoute allowedRoles={['doctor']}><DoctorAppointments /></PrivateRoute>
  },
  {
    path: "/doctor/schedule",
    element: <PrivateRoute allowedRoles={['doctor']}><DoctorSchedule /></PrivateRoute>
  },
  {
    path: "/doctor/diagnosis/:appointmentId",
    element: <PrivateRoute allowedRoles={['doctor']}><Diagnosis /></PrivateRoute>
  },
  {
    path: "/doctor/profile",
    element: <PrivateRoute allowedRoles={['doctor', 'admin']}><DoctorPrivateProfile /></PrivateRoute>
  },
  {
    path: "/doctor/patient-profile/:patientEmail",
    element: <PrivateRoute allowedRoles={['doctor']}><DoctorPatientProfile /></PrivateRoute>
  },

  // Admin routes (require login + admin role)
  {
    path: "/admin/dashboard",
    element: <PrivateRoute allowedRoles={['admin']}><AdminApp /></PrivateRoute>
  },
  {
    path: "/admin/doctor-details/:id",
    element: <PrivateRoute allowedRoles={['admin']}><DoctorPrivateProfile /></PrivateRoute>
  },
  {
    path: "/admin/patient-details/:email",
    element: <PrivateRoute allowedRoles={['admin']}><PatientProfile /></PrivateRoute>
  },
  {
    path: "/admin/appointment/:id",
    element: <PrivateRoute allowedRoles={['admin']}><AdminAppointmentDetails /></PrivateRoute>
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
