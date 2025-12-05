import React, { useState } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; 
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import './Navbar.css';

const Navbar = ({ activePage, toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate(); 

  const formatTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleLogout = () => {
    localStorage.removeItem("activeUserEmail"); // Clear Session
    localStorage.removeItem("admin_active_tab"); // Clear Remembered Tab (NEW)
    navigate('/'); 
  };

  
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
      
      <div 
        className="profile-container" 
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