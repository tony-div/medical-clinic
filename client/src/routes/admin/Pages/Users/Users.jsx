import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaPlus, FaTags } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './Users.css';
import AddUserModal from './AddUserModal';
import SpecialtiesModal from './SpecialtiesModal';
// [REPLACED] - Removed localStorage imports, added API service imports
import { getAllUsers, updateUser, deleteUser, createPatient, createDoctor } from '../../../../services/users';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // [ADDED] - Loading state for API calls
  const [loading, setLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  // [REPLACED] - Now fetching from API instead of localStorage
  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Toast.fire({ icon: 'error', title: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const handleAddNewClick = () => { setCurrentUser(null); setIsModalOpen(true); };
  const handleEditClick = (user) => { setCurrentUser(user); setIsModalOpen(true); };

  // [REPLACED] - Now using API for create and update operations
  const handleSaveUser = async (userData) => {
    const targetRole = userData.role.toLowerCase();
    setLoading(true);

    try {
      if (currentUser) {
        // [ADDED] - UPDATE USER via API
        const updatePayload = {
          email: userData.email,
          name: userData.name,
          phone_number: userData.phone_number || userData.phoneNumber,
          address: userData.address,
          gender: userData.gender,
          birth_date: userData.birth_date || userData.birthDate,
        };

        // Include password only if provided
        if (userData.password && userData.password.trim() !== '') {
          updatePayload.password = userData.password;
        }

        // Add doctor-specific fields if updating a doctor
        if (targetRole === 'doctor') {
          if (userData.specialty_id) updatePayload.specialty_id = userData.specialty_id;
          if (userData.profile_pic_path) updatePayload.profile_pic_path = userData.profile_pic_path;
          if (userData.consultation_fees) updatePayload.consultation_fees = userData.consultation_fees;
          if (userData.waiting_time) updatePayload.waiting_time = userData.waiting_time;
          if (userData.about_doctor) updatePayload.about_doctor = userData.about_doctor;
          if (userData.education_and_experience) updatePayload.education_and_experience = userData.education_and_experience;
          if (userData.status) updatePayload.status = userData.status;
        }

        await updateUser(currentUser.id, updatePayload);
        Toast.fire({ icon: 'success', title: 'User updated successfully' });

      } else {
        // [ADDED] - CREATE USER via API (patient or doctor only, no admin)
        if (targetRole === 'doctor') {
          // Create doctor
          const doctorPayload = {
            email: userData.email,
            password: userData.password || '123456',
            name: userData.name,
            phone_number: userData.phone_number || userData.phoneNumber,
            address: userData.address || '',
            gender: userData.gender || null,
            birth_date: userData.birth_date || userData.birthDate || null,
            specialty_id: userData.specialty_id,
            consultation_fees: userData.consultation_fees || 0,
            waiting_time: userData.waiting_time || 30,
            about_doctor: userData.about_doctor || '',
            education_and_experience: userData.education_and_experience || '',
          };
          await createDoctor(doctorPayload);
          Toast.fire({ icon: 'success', title: 'Doctor added successfully' });

        } else if (targetRole === 'patient') {
          // Create patient
          const patientPayload = {
            email: userData.email,
            password: userData.password || '123456',
            name: userData.name,
            phone_number: userData.phone_number || userData.phoneNumber,
            address: userData.address || '',
            gender: userData.gender || null,
            birth_date: userData.birth_date || userData.birthDate || null,
          };
          await createPatient(patientPayload);
          Toast.fire({ icon: 'success', title: 'Patient added successfully' });

        } else if (targetRole === 'admin') {
          // Admin creation not supported via this form
          Toast.fire({ icon: 'warning', title: 'Admin creation is not available here' });
          setLoading(false);
          return;
        }
      }

      setIsModalOpen(false);
      setCurrentUser(null);
      refreshData();

    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save user';
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // [REPLACED] - Now using API for delete operation
  const handleDeleteUser = async (id, roleStr) => {
    const role = roleStr.toLowerCase();
    if (role === 'admin' && id === 1) {
      Swal.fire('Error', 'Cannot delete Super Admin', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteUser(id);
        Toast.fire({ icon: 'success', title: 'User deleted.' });
        refreshData();
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.error || 'Failed to delete user';
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Sorting/Filtering Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedUsers = users.filter((user) => {
    if (filterRole !== 'All' && user.role.toLowerCase() !== filterRole.toLowerCase()) return false;
    return (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole]);
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort className="sortIcon" style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="sortIcon" /> : <FaSortDown className="sortIcon" />;
  };

  return (
    <div>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        existingUsers={users}
        currentUser={currentUser}
      />

      <SpecialtiesModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      <div className="headerContainer">
        <h2 className="headerTitle">User Management</h2>
        <div className="actionsContainer">
          <select className="filterSelect" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Doctor">Doctor</option>
            <option value="Patient">Patient</option>
          </select>
          <div className="searchWrapper">
            <FaSearch className="searchIcon" />
            <input type="text" placeholder="Search Users..." className="searchInput" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button
            className="addButton"
            onClick={() => setIsSpecModalOpen(true)}
            style={{ backgroundColor: '#8e44ad', marginRight: '5px' }}
          >
            <FaTags style={{ marginRight: '5px' }} /> Specialties
          </button>
          <button className="addButton" onClick={handleAddNewClick} disabled={loading}>
            <FaPlus style={{ marginRight: '5px' }} /> Add New User
          </button>
        </div>
      </div>

      <div className="tableContainer">
        {/* [ADDED] - Loading indicator */}
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}

        <table className="table">
          <thead>
            <tr className="tableHeadRow">
              <th className="th sortable" onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
              <th className="th sortable" onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
              <th className="th">Role</th>
              <th className="th">Email</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={`${user.role}-${user.id}`} className="tableBodyRow">
                  <td className="td">{user.id}</td>
                  <td className="td">
                    <div className="userInfo">
                      {user.image && user.image !== '' ? (
                        <img src={user.image} alt="avatar" className="avatar" />
                      ) : (
                        <div
                          className="avatar-placeholder"
                          style={{
                            background: user.roleColor || '#f5f5f5',
                            color: user.roleText || '#333',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginRight: '12px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                      )}
                      {user.name}
                    </div>
                  </td>
                  <td className="td">
                    <span className="roleTag" style={{ backgroundColor: user.roleColor || '#f5f5f5', color: user.roleText || '#333', textTransform: 'capitalize' }}>{user.role}</span>
                  </td>
                  <td className="td">{user.email}</td>
                  <td className="td">
                    <button className="actionBtn" onClick={() => handleEditClick(user)} disabled={loading}><FaEdit color="#1e4b8f" /></button>
                    <button className="actionBtn deleteBtn" onClick={() => handleDeleteUser(user.id, user.role)} disabled={loading}><FaTrash color="#d32f2f" /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="emptyState">{loading ? 'Loading...' : 'No users found.'}</td></tr>
            )}
          </tbody>
        </table>

        {processedUsers.length > itemsPerPage && (
          <div className="paginationContainer">
            <button className="pageBtn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt; Prev</button>
            <span className="pageInfo">Page {currentPage} of {totalPages}</span>
            <button className="pageBtn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next &gt;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;