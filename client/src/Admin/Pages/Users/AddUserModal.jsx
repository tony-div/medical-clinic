import React, { useState, useEffect } from 'react'; // Import useEffect
import Swal from 'sweetalert2';
import './AddUserModal.css';
import { FaTimes } from 'react-icons/fa';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// 1. Add 'currentUser' to props
const AddUserModal = ({ isOpen, onClose, onSave, existingUsers, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Patient', 
  });

  // 2. The Logic
  useEffect(() => {
    if (isOpen && currentUser) {
      // EDIT MODE: Fill the form with the user's data
      setFormData(currentUser);
    } else if (isOpen && !currentUser) {
      // ADD MODE: Reset the form to blank
      setFormData({ name: '', email: '', role: 'Patient' });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return; 

    // Validation: Check for duplicates, but EXCLUDE the current user if editing
    const emailExists = existingUsers.some((user) => 
      user.email.toLowerCase() === formData.email.toLowerCase() && 
      user.id !== formData.id // Don't flag myself as a duplicate
    );

    if (emailExists) {
      Toast.fire({ icon: 'error', title: 'Email already exists!' });
      return; 
    }
    
    onSave(formData); 
    // We don't reset here anymore, the useEffect handles it on close/open
  };

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <div className="modalHeader">
          {/* 3. Dynamic Title */}
          <h3>{currentUser ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="closeBtn"><FaTimes /></button>
        </div>
        {/* ... [Body and Form Inputs remain exactly the same] ... */}
        <div className="modalBody">
          <form id="userForm" onSubmit={handleSubmit}>
             {/* ... Inputs ... */}
             <div className="formGroup">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
             <div className="formGroup">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
             <div className="formGroup">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="Doctor">Doctor</option>
                <option value="Patient">Patient</option>
              </select>
            </div>
          </form>
        </div>
        <div className="modalFooter">
          <button onClick={onClose} className="cancelBtn">Cancel</button>
          <button type="submit" form="userForm" className="saveBtn">
            {currentUser ? 'Update User' : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;