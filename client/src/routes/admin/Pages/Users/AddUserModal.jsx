import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AddUserModal.css';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getSpecialties } from '../../../../services/specialty';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const AddUserModal = ({ isOpen, onClose, onSave, existingUsers, currentUser }) => {
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone_number: '',
    address: '',
    gender: 'male',
    birth_date: '',
    specialty_id: '',
    consultation_fees: 200,
    waiting_time: 20,
    about_doctor: '',
    education_and_experience: '',
    status: 'active'
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Disable page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchSpecialties = async () => {
        try {
          const response = await getSpecialties();
          setSpecialtiesList(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch specialties:', error);
        }
      };
      fetchSpecialties();

      if (currentUser) {
        // Normalize status to lowercase
        const normalizedStatus = currentUser.status ? currentUser.status.toLowerCase() : 'active';

        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          password: '',
          role: (currentUser.role || 'patient').toLowerCase(),
          phone_number: currentUser.phone_number || currentUser.phone || '',
          address: currentUser.address || '',
          gender: currentUser.gender || 'male',
          birth_date: formatDateForInput(currentUser.birth_date),
          specialty_id: currentUser.specialty_id || '',
          consultation_fees: currentUser.consultation_fees || 200,
          waiting_time: currentUser.waiting_time || 20,
          about_doctor: currentUser.about_doctor || currentUser.bio || '',
          education_and_experience: currentUser.education_and_experience || '',
          status: normalizedStatus
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'patient',
          phone_number: '',
          address: '',
          gender: 'male',
          birth_date: '',
          specialty_id: '',
          consultation_fees: 200,
          waiting_time: 20,
          about_doctor: '',
          education_and_experience: '',
          status: 'active'
        });
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length > 11) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }

    if (name === 'consultation_fees' || name === 'waiting_time') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.fire({ icon: 'error', title: 'Name is required' });
      return false;
    }
    if (!formData.email.trim()) {
      Toast.fire({ icon: 'error', title: 'Email is required' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.fire({ icon: 'error', title: 'Invalid email format' });
      return false;
    }

    if (!currentUser && !formData.password.trim()) {
      Toast.fire({ icon: 'error', title: 'Password is required for new users' });
      return false;
    }

    if (formData.role === 'doctor' && !formData.specialty_id) {
      Toast.fire({ icon: 'error', title: 'Please select a specialty for the doctor' });
      return false;
    }

    if (!currentUser) {
      const emailExists = existingUsers.some((user) =>
        user.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        Toast.fire({ icon: 'error', title: 'Email already exists!' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if status is active (case-insensitive)
  const isActive = formData.status === 'active';

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <div className="modalHeader">
          <h3>{currentUser ? `Edit ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}` : 'Add New User'}</h3>
          <button onClick={onClose} className="closeBtn" disabled={loading}><FaTimes /></button>
        </div>

        <div className="modalBody">
          <form id="userForm" onSubmit={handleSubmit}>

            <h4 style={{ margin: '0 0 10px', color: '#3498DB', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Account Info
            </h4>

            <div className="formGroup">
              <label>Full Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="formGroup" style={{ flex: 1 }}>
                <label>Email <span style={{ color: 'red' }}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="user@example.com" />
              </div>
              <div className="formGroup" style={{ flex: 1 }}>
                <label>Password {!currentUser && <span style={{ color: 'red' }}>*</span>}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={currentUser ? '••••••••' : 'Enter password'}
                    style={{ paddingRight: '35px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#666' }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="formGroup">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} disabled={currentUser && currentUser.role === 'admin'}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <h4 style={{ margin: '15px 0 10px', color: '#3498DB', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Personal Details
            </h4>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="formGroup" style={{ flex: 1 }}>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="formGroup" style={{ flex: 1 }}>
                <label>Birth Date</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
              </div>
            </div>

            <div className="formGroup">
              <label>Phone Number (11 Digits)</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="01xxxxxxxxx" />
            </div>

            <div className="formGroup">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" />
            </div>

            {formData.role === 'doctor' && (
              <div className="doctor-fields">
                <h4 style={{ margin: '15px 0 10px', color: '#27AE60', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                  Doctor Specifics
                </h4>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      style={{
                        borderColor: isActive ? '#27AE60' : '#C0392B',
                        color: isActive ? '#27AE60' : '#C0392B',
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Specialty <span style={{ color: 'red' }}>*</span></label>
                    <select name="specialty_id" value={formData.specialty_id} onChange={handleChange}>
                      <option value="">Select Specialty</option>
                      {specialtiesList.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Consultation Fees (EGP)</label>
                    <input type="number" name="consultation_fees" value={formData.consultation_fees} onChange={handleChange} min="0" />
                  </div>
                  <div className="formGroup" style={{ flex: 1 }}>
                    <label>Waiting Time (Minutes)</label>
                    <input type="number" name="waiting_time" value={formData.waiting_time} onChange={handleChange} min="0" />
                  </div>
                </div>

                <div className="formGroup">
                  <label>About Doctor</label>
                  <textarea name="about_doctor" rows="2" value={formData.about_doctor} onChange={handleChange} placeholder="Brief description about the doctor..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>

                <div className="formGroup">
                  <label>Education & Experience</label>
                  <textarea name="education_and_experience" rows="2" value={formData.education_and_experience} onChange={handleChange} placeholder="Education background and work experience..." style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modalFooter">
          <button onClick={onClose} className="cancelBtn" disabled={loading}>Cancel</button>
          <button type="submit" form="userForm" className="saveBtn" disabled={loading}>
            {loading ? 'Saving...' : (currentUser ? 'Update User' : 'Save User')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;