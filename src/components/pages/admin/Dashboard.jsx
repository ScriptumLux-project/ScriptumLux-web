import React, { useState } from 'react';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // Admin name - in real app would come from context/authentication
  const adminName = "Admin";
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // In a real app, you might navigate to different admin pages
    // For now we just update the active tab
  };
  
  const handleLogout = () => {
    // Log out logic - similar to your existing logout function
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard Page</h1>
        </div>
            
        <div className="admin-dashboard-underline"></div>
        
        <div className="admin-main-content">
          <div className="admin-users-section">
            <div className="admin-section-header">
              <div className="admin-user-icon">
                <i className="user-icon"></i>
              </div>
              <div className="admin-section-info">
                <div className="admin-section-title">Text</div>
                <div className="admin-section-description">Description</div>
              </div>
            </div>
            <button className="admin-action-button">Button</button>
          </div>
          
          <div className="admin-content-section">
            <div className="admin-section-header">
              <div className="admin-user-icon">
                <i className="user-icon"></i>
              </div>
              <div className="admin-section-info">
                <div className="admin-section-title">Text</div>
                <div className="admin-section-description">Description</div>
              </div>
            </div>
            <button className="admin-action-button">Button</button>
          </div>
          
          <div className="admin-quick-actions">
            <button className="admin-quick-action-button">Click Me</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;