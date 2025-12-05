import React, { useState, useEffect, useRef } from 'react'; // 1. Import useEffect & useRef
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; 
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import './Navbar.css';

const Navbar = ({ activePage, toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate(); 
  
  // 2. Create a Ref for the dropdown container
  const dropdownRef = useRef(null);

  const formatTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleLogout = () => {
    localStorage.removeItem("activeUserEmail"); 
    localStorage.removeItem("admin_active_tab"); 
    navigate('/'); 
  };

  // 3. Add Click Outside Logic
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
      
      {/* 4. Attach Ref to the container */}
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