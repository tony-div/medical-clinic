import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import DoctorsList from './routes/DoctorsList.jsx';
import DoctorProfile from './routes/DoctorProfile.jsx';
import Home from './routes/home.jsx'; 
import Login from './routes/login.jsx'; 
import Register from './routes/register.jsx';
import AdminPage from './Admin/AdminPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
 {
    path: "/doctors",
    element: <DoctorsList />,
  },
  {
    path: "/doctor/:id",  
    element: <DoctorProfile />,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
