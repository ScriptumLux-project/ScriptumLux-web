import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { MdNavigateNext } from "react-icons/md";
import { FaUserLarge, FaFilm } from "react-icons/fa6";
import AddMovieModal from '../../modals/AddMovieModal'; 
import { useMovies } from '../../context/MovieContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const { refreshMovies } = useMovies();
  
  // Admin name - in real app would come from context/authentication
  const adminName = "Admin";
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // In a real app, you might navigate to different admin pages
    // For now we just update the active tab
  };

  const handleUsersListClick = () => {
    navigate('/admin-users-list');
  };
  
  const handleMoviesListClick = () => {
    navigate('/admin-movies-list');
  };

  const handleAddMovieClick = () => {
    setIsAddMovieModalOpen(true);
  };
  
  const closeAddMovieModal = () => {
    setIsAddMovieModalOpen(false);
  };
  
  const handleMovieAdded = (newMovie) => {
    // Refresh the movies context to include the newly added movie
    refreshMovies();
  };
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <div className="admin-header-top">
            <div>
              <h1>Dashboard</h1>
              <div className="admin-header-underline"></div>
            </div>
            <button className="admin-quick-action-button" onClick={handleAddMovieClick}>Add Movie +</button>
          </div>
        </div>
        
        <div className="admin-main-content">
          <div className="admin-users-section">
            <div className="admin-section-header">
              <div className="admin-user-icon">
                <i className="user-icon"> <FaUserLarge /></i>
              </div>
              <div className="admin-section-info">
                <div className="admin-section-title">Users</div>
                <div className="admin-section-description">Manage user accounts</div>
              </div>
            </div>
            
            <button className="admin-action-button" onClick={handleUsersListClick}>
              <span>List of users</span>
              <MdNavigateNext className="next-icon" />
            </button>
          </div>
          
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div className="admin-user-icon">
                <i className="user-icon"><FaFilm /></i>
              </div>
              <div className="admin-section-info">
                <div className="admin-section-title">Movies</div>
                <div className="admin-section-description">Manage movie content</div>
              </div>
            </div>
            <button className="admin-action-button" onClick={handleMoviesListClick}>
              <span>List of movies</span>
              <MdNavigateNext className="next-icon" />
            </button>
          </div>
        </div>
      </div>
      
      <AddMovieModal
        isOpen={isAddMovieModalOpen} 
        onClose={closeAddMovieModal}
        onMovieAdded={handleMovieAdded}
      />
    </div>
  );
};

export default Dashboard;