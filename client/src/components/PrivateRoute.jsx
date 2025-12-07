import { Navigate, useLocation } from 'react-router-dom';

/**
 * PrivateRoute - Protects routes that require authentication
 * Checks if user is logged in via localStorage token and currentUser
 * Redirects to login if not authenticated, preserving the intended destination
 */
const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Not logged in - redirect to login
    if (!token || !currentUser) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Check if user has required role (if roles are specified)
    if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role?.toLowerCase())) {
        // User doesn't have permission - redirect to their appropriate dashboard
        const role = currentUser.role?.toLowerCase();
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
        return <Navigate to="/patient/dashboard" replace />;
    }

    // User is authenticated and authorized
    return children;
};

export default PrivateRoute;
