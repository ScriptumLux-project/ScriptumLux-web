import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { getComments, deleteComment } from '../../../api';
import './UsersList.css';

const CommentsList = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(userId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [userId]);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleBackClick = () => navigate('/admin-users-list');

  if (loading) return <p>Loading comments...</p>;

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
          {comments.length === 0 ? (
            <p>No comments found for this user.</p>
          ) : (
            comments.map(comment => (
              <div className="comment-card" key={comment.id}>
                <div className="comment-header">
                  <div className="comment-info">
                    <div className="comment-values">
                      <span className="value">{comment.userName || `User ID: ${comment.userId}`}</span>
                      <span className="value">{new Date(comment.date).toLocaleDateString()}</span>
                      <span className="value">{comment.movieTitle || `Movie ID: ${comment.movieId}`}</span>
                    </div>
                  </div>
                  <button
                    className="delete-comment-button"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsList;
