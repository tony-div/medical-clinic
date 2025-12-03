import React, { useState } from 'react';
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; // Icons for the menu
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import './Navbar.css';

const Navbar = ({ activePage, toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // const navigate = useNavigate();

  const formatTitle = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // const handleLogout = () => {
  //   navigate('');
  // };
  
  return (
    <div className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰ 
        </button>

        <div className="breadcrumbs">
          <span className="crumb-light">Admin</span> 
          <span className="crumb-separator">&gt;</span> 
          <span className="crumb-dark">{formatTitle(activePage)}</span>
        </div>
      </div>
      
      {/* PROFILE CONTAINER */}
      <div 
        className="profile-container" 
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <div className="profile-btn">
          {/* The Avatar Circle */}
          <div className="avatar-circle">
            <FaUser className="avatar-icon" />
          </div>
          
          <span className="profile-name">Admin Profile</span>
          
          {/* Rotate arrow when open */}
          <MdKeyboardArrowDown 
            className={`arrow-icon ${isProfileOpen ? 'rotate' : ''}`} 
          />
        </div>

        {/* DROPDOWN MENU */}
        {isProfileOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item logout"
                // onClick={handleLogout}
            >
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