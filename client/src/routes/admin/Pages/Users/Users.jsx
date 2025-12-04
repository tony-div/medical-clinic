import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import './Users.css'; 
import AddUserModal from './AddUserModal';
import { DB_PATIENTS_KEY, DB_DOCTORS_KEY, DB_ADMINS_KEY } from '../../../../data/initDB';

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
  const [filterRole, setFilterRole] = useState('All'); 
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [currentUser, setCurrentUser] = useState(null); 
  const [users, setUsers] = useState([]);

  const refreshData = () => {
    const patients = JSON.parse(localStorage.getItem(DB_PATIENTS_KEY) || "[]").map(p => ({ 
        ...p, role: 'patient', roleColor: '#e1f5fe', roleText: '#0288d1' 
    }));
    
    const doctors = JSON.parse(localStorage.getItem(DB_DOCTORS_KEY) || "[]").map(d => ({ 
        ...d, role: 'doctor', roleColor: '#e6f4ea', roleText: '#137333' 
    }));

    const admins = JSON.parse(localStorage.getItem(DB_ADMINS_KEY) || "[]").map(a => ({
        ...a, role: 'admin', roleColor: '#e8f0fe', roleText: '#1e4b8f'
    }));

    setUsers([...admins, ...doctors, ...patients]);
  };

  useEffect(() => { refreshData(); }, []);

  const handleAddNewClick = () => { setCurrentUser(null); setIsModalOpen(true); };
  const handleEditClick = (user) => { setCurrentUser(user); setIsModalOpen(true); };

  const handleSaveUser = (userData) => {
    const targetRole = userData.role.toLowerCase();
    let dbKey = DB_PATIENTS_KEY;
    if (targetRole === 'doctor') dbKey = DB_DOCTORS_KEY;
    if (targetRole === 'admin') dbKey = DB_ADMINS_KEY;

    const currentList = JSON.parse(localStorage.getItem(dbKey) || "[]");

    if (currentUser) {
      const updatedList = currentList.map(u => u.id === currentUser.id ? { ...u, ...userData, role: targetRole } : u);
      localStorage.setItem(dbKey, JSON.stringify(updatedList));
      Toast.fire({ icon: 'success', title: 'User updated successfully' });
    } else {
      const maxId = currentList.length > 0 ? Math.max(...currentList.map(u => u.id)) : 0;
      const newId = targetRole === 'patient' ? Date.now() : (maxId + 1);

      const newUser = {
        ...userData,
        id: newId,
        role: targetRole,
        password: userData.password || '123',
        image: userData.image || '', // No default image for anyone unless provided
        ...(targetRole === 'doctor' ? { reviews: [] } : {}),
        ...(targetRole === 'patient' ? { recentHistory: [] } : {})
      };

      currentList.push(newUser);
      localStorage.setItem(dbKey, JSON.stringify(currentList));
      Toast.fire({ icon: 'success', title: 'User added successfully' });
    }

    setIsModalOpen(false);
    setCurrentUser(null);
    refreshData(); 
  };

  const handleDeleteUser = (id, roleStr) => {
    const role = roleStr.toLowerCase();
    if (role === 'admin' && id === 1) { Swal.fire('Error', 'Cannot delete Super Admin', 'error'); return; }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let dbKey = DB_PATIENTS_KEY;
        if (role === 'doctor') dbKey = DB_DOCTORS_KEY;
        if (role === 'admin') dbKey = DB_ADMINS_KEY;

        const currentList = JSON.parse(localStorage.getItem(dbKey) || "[]");
        const filteredList = currentList.filter(u => u.id !== id);
        localStorage.setItem(dbKey, JSON.stringify(filteredList));
        refreshData(); 
        Toast.fire({ icon: 'success', title: 'User deleted.' });
      }
    });
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
          <button className="addButton" onClick={handleAddNewClick}><FaPlus style={{marginRight: '5px'}}/> Add New User</button>
        </div>
      </div>

      <div className="tableContainer">
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
                      
                      {/* --- FIX: SHOW INITIALS FOR PATIENTS / IMAGES FOR DOCTORS --- */}
                      {user.image && user.image !== '' ? (
                          <img src={user.image} alt="avatar" className="avatar" /> 
                      ) : (
                          <div 
                            className="avatar-placeholder" 
                            style={{
                                background: user.roleColor, 
                                color: user.roleText, 
                                width:'36px', 
                                height:'36px', 
                                borderRadius:'50%', 
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent:'center', 
                                fontWeight:'bold', 
                                fontSize:'14px', 
                                marginRight:'12px',
                                textTransform: 'uppercase'
                            }}
                          >
                            {user.name.charAt(0)}
                          </div>
                      )}
                      {/* ------------------------------------------------------------- */}

                      {user.name}
                    </div>
                  </td>
                  <td className="td">
                    <span className="roleTag" style={{ backgroundColor: user.roleColor, color: user.roleText, textTransform:'capitalize' }}>{user.role}</span>
                  </td>
                  <td className="td">{user.email}</td>
                  <td className="td">
                    <button className="actionBtn" onClick={() => handleEditClick(user)}><FaEdit color="#1e4b8f" /></button>
                    <button className="actionBtn deleteBtn" onClick={() => handleDeleteUser(user.id, user.role)}><FaTrash color="#d32f2f" /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="emptyState">No users found.</td></tr>
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