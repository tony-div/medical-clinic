import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddUserModal.css';
import { FaTimes } from 'react-icons/fa';
import { DB_SPECIALTIES_KEY } from '../../../../data/initDB'; // Import Key

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const AddUserModal = ({ isOpen, onClose, onSave, existingUsers, currentUser }) => {
  const [specialtiesList, setSpecialtiesList] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    phone: '', address: '', gender: 'male', birth_date: '',
    specialty: '', fees: '', waitingTime: '20 Mins', bio: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) {
      // 1. REFRESH SPECIALTIES LIST EVERY TIME MODAL OPENS
      const specs = JSON.parse(localStorage.getItem(DB_SPECIALTIES_KEY) || "[]");
      setSpecialtiesList(specs);

      // 2. SET FORM DATA
      if (currentUser) {
        // EDIT MODE
        setFormData({
          ...currentUser,
          role: currentUser.role.toLowerCase(),
          password: currentUser.password || '',
          status: currentUser.status || 'Active'
        });
      } else {
        // ADD MODE
        setFormData({
          name: '', email: '', password: '123123', role: 'patient',
          phone: '', address: '', gender: 'male', birth_date: '',
          specialty: '', fees: 200, waitingTime: '20 Mins', bio: '',
          status: 'Active'
        });
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length > 11) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // [FIX] - Only check for duplicate email when ADDING new users, not when editing
    if (!currentUser) {
      const emailExists = existingUsers.some((user) =>
        user.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (emailExists) {
        Toast.fire({ icon: 'error', title: 'Email already exists!' });
        return;
      }
    }

    onSave(formData);
  };

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <div className="modalHeader">
          <h3>{currentUser ? `Edit ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}` : 'Add New User'}</h3>
          <button onClick={onClose} className="closeBtn"><FaTimes /></button>
        </div>

        <div className="modalBody">
          <form id="userForm" onSubmit={handleSubmit}>

            <h4 style={{ margin: '0 0 10px', color: '#3498DB', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Account Info</h4>
            <div className="formGroup"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="formGroup" style={{ flex: 1 }}><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="formGroup" style={{ flex: 1 }}><label>Password</label><input type="text" name="password" value={formData.password} onChange={handleChange} required /></div>
            </div>
            <div className="formGroup"><label>Role</label><select name="role" value={formData.role} onChange={handleChange} disabled={currentUser && currentUser.role === 'admin'}><option value="doctor">Doctor</option><option value="patient">Patient</option></select></div>

            <h4 style={{ margin: '15px 0 10px', color: '#3498DB', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Personal Details</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="formGroup" style={{ flex: 1 }}><label>Gender</label><select name="gender" value={formData.gender} onChange={handleChange}><option value="male">Male</option><option value="female">Female</option></select></div>
              <div className="formGroup" style={{ flex: 1 }}><label>Birth Date</label><input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} /></div>
            </div>
            <div className="formGroup"><label>Phone Number (11 Digits)</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="01xxxxxxxxx" /></div>
            <div className="formGroup"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" /></div>

            {/* --- DOCTOR SPECIFIC --- */}
            {formData.role === 'doctor' && (
              <div className="doctor-fields">
                <h4 style={{ margin: '15px 0 10px', color: '#27AE60', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Doctor Specifics</h4>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} style={{ borderColor: formData.status === 'Active' ? '#27AE60' : '#C0392B', color: formData.status === 'Active' ? '#27AE60' : '#C0392B', fontWeight: 'bold' }}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* --- SPECIALTY DROPDOWN --- */}
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Specialty</label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                    >
                      <option value="">Select Specialty</option>
                      {specialtiesList.map(spec => (
                        <option key={spec.id} value={spec.name}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="formGroup" style={{ flex: 1 }}><label>Fees (EGP)</label><input type="number" name="fees" value={formData.fees} onChange={handleChange} /></div>
                  <div className="formGroup" style={{ flex: 1 }}><label>Waiting Time</label><input type="text" name="waitingTime" value={formData.waitingTime} onChange={handleChange} /></div>
                </div>
                <div className="formGroup"><label>Bio</label><textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }}></textarea></div>
              </div>
            )}
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