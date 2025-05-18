import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersList.css';
import { IoArrowBack } from "react-icons/io5";
import { MdReadMore } from "react-icons/md";
import { getAllUsers, deleteUser } from '../../../api';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getAllUsers();
  
        const formattedUsers = userData.map(user => {
          const normalizedId = user.id ?? user._id ?? user.userId;
  
          return {
            id: normalizedId,
            nickname: user.name || 'Unnamed',
            email: user.email || 'No email',
            registrationDate: new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB'),
            comments: Array.isArray(user.comments) ? user.comments.length : 0,
          };
        });
  
        setUsers(formattedUsers);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUsers();
  }, []);
  

  const handleBanUser = async (userId) => {
    if (!userId) {
      console.error('Invalid user ID:', userId);
      return;
    }
  
    try {
      console.log('Deleting user with ID:', userId);
      await deleteUser(userId);
  
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data || error.message;
      console.error(`Error deleting user (status ${status}):`, message);
      alert(`Failed to delete user. Server responded with status ${status}`);
    }
  };  

  const handleBackClick = () => navigate('/dashboard');
  const handleCommentsListClick = (userId) => navigate(`/admin-comments-list/${userId}`);


  if (loading) return <p>Loading users...</p>;

  return (
    <div className="admin-users-list-container">
      <div className="admin-users-list-content">
        <div className="admin-users-list-header">
          <button className="back-button" onClick={handleBackClick}>
            <IoArrowBack /> Back
          </button>
          <div>
            <h1>List of Users</h1>
            <div className="admin-header-underline"></div>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nickname</th>
                <th>Email</th>
                <th>Date</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>{user.registrationDate}</td>
                  <td>
                    <button className="comment-icon" onClick={() => handleCommentsListClick(user.id)}>
                      <MdReadMore />
                    </button>
                  </td>
                  <td>
                    <button className="ban-button" onClick={() => handleBanUser(user.id)}>
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
