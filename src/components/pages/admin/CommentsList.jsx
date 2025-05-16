import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './UsersList.css'; 
import { IoArrowBack } from "react-icons/io5";
import { mockComments } from '../../../mockData/data'; 
import { FaRegTrashAlt } from "react-icons/fa";

const CommentsList = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [comms, setComments] = useState(
    mockComments.filter(comm => comm.userId === Number(userId))
  );

  const handleDeleteComment = (commId) => {
    const updatedComments = comms.filter(comm => comm.id !== commId);
    setComments(updatedComments);
  };

  const handleBackClick = () => {
    navigate('/admin-users-list'); 
  };

  return (
    <div className="admin-users-list-container">
      <div className="admin-users-list-content">
        <div className="admin-users-list-header">
          <button className="back-button" onClick={handleBackClick}>
            <IoArrowBack /> Back
          </button>
          <div>
            <h1>List of Comments</h1>
            <div className="admin-header-underline"></div>
          </div>
        </div>

        <div className="users-table-container">
            
          {comms.map(comm => (
            <div className="comment-card" key={comm.id}>
              <div className="comment-header">
                <div className="comment-info">
                  <div className="comment-values">
                    <span className="value">{comm.userName || 'Anonymous'}</span>
                    <span className="value">{comm.date}</span>
                    <span className="value">{comm.movieTitle}</span>
                  </div>
                </div>
                <button
                  className="delete-comment-button"
                  onClick={() => handleDeleteComment(comm.id)}
                >
                  <FaRegTrashAlt />
                </button>
              </div>
                <p className="comment-text">{comm.text}</p>
              </div>
           
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommentsList;