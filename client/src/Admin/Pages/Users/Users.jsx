import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Swal from 'sweetalert2'; 
import './Users.css'; 
import AddUserModal from './AddUserModal';

// Toast Configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

const Users = () => {
  // 1. UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('All'); 
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // 2. Data State
  // 'currentUser' holds the object of the user being edited (null if adding new)
  const [currentUser, setCurrentUser] = useState(null); 
  
  const [users, setUsers] = useState([
    { id: 21, name: 'Sarah Smith', role: 'Admin', email: 'sarah.smith@gmail.com', roleColor: '#e8f0fe', roleText: '#1e4b8f' },
    { id: 22, name: 'Irmerl Johnson', role: 'Doctor', email: 'irmerl.johnson@gmail.com', roleColor: '#e6f4ea', roleText: '#137333' },
    { id: 23, name: 'Kvian Smith', role: 'Patient', email: 'kvian.smith@gmail.com', roleColor: '#e1f5fe', roleText: '#0288d1' },
    { id: 24, name: 'John Doe', role: 'Patient', email: 'john.doe@gmail.com', roleColor: '#e1f5fe', roleText: '#0288d1' },
    { id: 25, name: 'Alice Wonder', role: 'Doctor', email: 'alice@gmail.com', roleColor: '#e6f4ea', roleText: '#137333' },
    { id: 26, name: 'Bob Builder', role: 'Patient', email: 'bob@gmail.com', roleColor: '#e1f5fe', roleText: '#0288d1' },
  ]);

  // 3. Helper: Styles
  const getRoleStyle = (role) => {
    switch (role) {
      case 'Admin': return { bg: '#e8f0fe', text: '#1e4b8f' };
      case 'Doctor': return { bg: '#e6f4ea', text: '#137333' };
      case 'Patient': return { bg: '#e1f5fe', text: '#0288d1' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  // 4. Handler: Open Modal for ADDING
  const handleAddNewClick = () => {
    setCurrentUser(null); // Clear editing state
    setIsModalOpen(true);
  };

  // 5. Handler: Open Modal for EDITING
  const handleEditClick = (user) => {
    setCurrentUser(user); // Load user data
    setIsModalOpen(true);
  };

  // 6. Handler: Save (Handles both Create and Update)
  const handleSaveUser = (userData) => {
    const styles = getRoleStyle(userData.role);

    if (currentUser) {
      // === UPDATE LOGIC ===
      setUsers(users.map((u) => (u.id === currentUser.id ? { 
        ...u, 
        ...userData, 
        roleColor: styles.bg, 
        roleText: styles.text 
      } : u)));
      
      Toast.fire({ icon: 'success', title: 'User updated successfully' });
    } else {
      // === CREATE LOGIC ===
      const newUser = {
        id: Date.now(), 
        name: userData.name,
        role: userData.role,
        email: userData.email,
        roleColor: styles.bg,
        roleText: styles.text
      };
      setUsers([...users, newUser]);
      Toast.fire({ icon: 'success', title: 'User added successfully' });
    }

    setIsModalOpen(false);
    setCurrentUser(null); // Reset after save
  };

  // 7. Handler: Delete
  const handleDeleteUser = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers(users.filter((user) => user.id !== id));
        Toast.fire({ icon: 'success', title: 'User deleted successfully' });
      }
    });
  };

  // 8. Handler: Sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 9. Data Processing Pipeline (Filter -> Search -> Sort)
  const processedUsers = users
    .filter((user) => {
      if (filterRole !== 'All' && user.role !== filterRole) return false;
      return (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // 10. Pagination Logic
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterRole]);

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = processedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  // Helper for Sort Icons
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <FaSort className="sortIcon" style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="sortIcon" /> : <FaSortDown className="sortIcon" />;
  };

  return (
    <div>
      {/* Modal - Passing currentUser to enable Edit Mode */}
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
          {/* Role Filter */}
          <select 
            className="filterSelect"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Doctor">Doctor</option>
            <option value="Patient">Patient</option>
          </select>

          {/* Search */}
          <div className="searchWrapper">
            <FaSearch className="searchIcon" />
            <input 
              type="text" 
              placeholder="Search Users..." 
              className="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Add Button */}
          <button 
            className="addButton" 
            onClick={handleAddNewClick}
          >
            Add New User
          </button>
        </div>
      </div>

      <div className="tableContainer">
        <table className="table">
          <thead>
            <tr className="tableHeadRow">
              <th className="th sortable" onClick={() => handleSort('id')}>
                ID {getSortIcon('id')}
              </th>
              <th className="th sortable" onClick={() => handleSort('name')}>
                Name {getSortIcon('name')}
              </th>
              <th className="th">Role</th>
              <th className="th">Email</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="tableBodyRow">
                  <td className="td">{user.id}</td>
                  <td className="td">
                    <div className="userInfo">
                      <img 
                        src={`https://i.pravatar.cc/150?u=${user.id}`} 
                        alt="avatar" 
                        className="avatar"
                      /> 
                      {user.name}
                    </div>
                  </td>
                  <td className="td">
                    <span 
                      className="roleTag" 
                      style={{ backgroundColor: user.roleColor, color: user.roleText }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="td">{user.email}</td>
                  <td className="td">
                    {/* EDIT BUTTON */}
                    <button 
                      className="actionBtn" 
                      onClick={() => handleEditClick(user)}
                    >
                      <FaEdit color="#1e4b8f" />
                    </button>
                    
                    {/* DELETE BUTTON */}
                    <button 
                      className="actionBtn deleteBtn" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FaTrash color="#d32f2f" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="emptyState">
                  No users found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {processedUsers.length > itemsPerPage && (
          <div className="paginationContainer">
            <button 
              className="pageBtn" 
              onClick={prevPage} 
              disabled={currentPage === 1}
            >
              &lt; Prev
            </button>
            
            <span className="pageInfo">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              className="pageBtn" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
            >
              Next &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;