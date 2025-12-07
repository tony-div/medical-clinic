import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ activePage, toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Create a Ref for the dropdown container
  const dropdownRef = useRef(null);

  const formatTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("activeUserEmail");
    localStorage.removeItem("admin_active_tab");
    localStorage.removeItem("userRole");

    // Close dropdown before navigating
    setIsProfileOpen(false);

    // Use replace: true to prevent back navigation to admin page
    navigate('/', { replace: true });
  };

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If menu is open AND click is NOT inside the dropdown container
      if (isProfileOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    // Attach listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-left">
        <button className="admin-menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>

        <div className="admin-breadcrumbs">
          <span className="crumb-light">Admin</span>
          <span className="crumb-separator">&gt;</span>
          <span className="crumb-dark">{formatTitle(activePage)}</span>
        </div>
      </div>

      {/* Attach Ref to the container */}
      <div
        className="profile-container"
        ref={dropdownRef}
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <div className="profile-btn">
          <div className="avatar-circle">
            <FaUser className="avatar-icon" />
          </div>

          <span className="profile-name">Admin Profile</span>

          <MdKeyboardArrowDown
            className={`arrow-icon ${isProfileOpen ? 'rotate' : ''}`}
          />
        </div>

        {isProfileOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="item-icon" />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;