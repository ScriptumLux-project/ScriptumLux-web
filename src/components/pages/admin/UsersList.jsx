import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersList.css';
import { IoArrowBack } from "react-icons/io5";
import { MdReadMore } from "react-icons/md";

const UsersList = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([
    { id: 1, nickname: 'JohnDoe', email: 'john@example.com', registrationDate: '15-05-2023', comments: 12 },
    { id: 2, nickname: 'JaneSmith', email: 'jane@example.com', registrationDate: '22-07-2023', comments: 8 },
    { id: 3, nickname: 'MikeJohnson', email: 'mike@example.com', registrationDate: '05-01-2024', comments: 23 },
    { id: 4, nickname: 'SarahWilliams', email: 'sarah@example.com', registrationDate: '10-03-2024', comments: 5 },
    { id: 5, nickname: 'DavidBrown', email: 'david@example.com', registrationDate: '14-04-2024', comments: 17 },
    { id: 6, nickname: 'EmmaJones', email: 'emma@example.com', registrationDate: '28-06-2024', comments: 3 },
    { id: 7, nickname: 'RobertDavis', email: 'robert@example.com', registrationDate: '19-08-2024', comments: 9 },
    { id: 8, nickname: 'OliviaMiller', email: 'olivia@example.com', registrationDate: '07-09-2024', comments: 11 },
    { id: 9, nickname: 'WilliamGarcia', email: 'william@example.com', registrationDate: '30-09-2024', comments: 14 },
  ]);

  const handleBanUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    
    setUsers(updatedUsers);
    
  };

  const handleBackClick = () => {
    navigate('/dashboard'); 
  };

  const handleCommentsListClick = (userId) => {
    navigate(`/admin-comments-list/${userId}`);
  };
  

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
                <th>Date of Registration</th>
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
                  <td>{user.comments}
                  <button className="comment-icon" onClick={() => handleCommentsListClick(user.id)}>
  <MdReadMore />
</button>
                  </td>
                  <td>
                    <button 
                      className="ban-button"
                      onClick={() => handleBanUser(user.id)}
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;