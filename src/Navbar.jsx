import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './components/context/AuthContext'; 
import { CiSearch } from "react-icons/ci";
import { RiAccountCircleLine } from "react-icons/ri";
import { RiArrowDropDownLine } from 'react-icons/ri';
import './Navbar.css';
import LoginModal from './components/authorization/Login';
import SignUpModal from './components/authorization/SignUp';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  
  const [showDropdown, setShowDropdown] = useState(false);

  const isAdminPage = location.pathname === '/dashboard' || 
                      location.pathname === '/admin-dashboard' || 
                      location.pathname.includes('/admin-users-list') ||
                      location.pathname.includes('/admin-movies-list') ||
                      location.pathname.includes('/admin-comments-list');

  const isAdmin = currentUser?.role === 'admin';

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleLogout = () => {
    logout();                       
    localStorage.removeItem('accessToken');  
    navigate('/');                 
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    //implementation* 
  };
  
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignUpModalOpen(false);
  };
  
  const openSignUpModal = () => {
    setIsSignUpModalOpen(true);
    setIsLoginModalOpen(false);
  };
  
  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(false);
  };
  
  const switchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };
  
  const switchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <>
      <nav className={`navbar ${isAdminPage ? 'dashboard-navbar' : ''}`}>
        <div className="navbar-logo">
          <Link to="/">Scriptum Lux</Link>
        </div>

        <div className="navbar-links">
          {!isAdminPage && (
            <div className="navbar-search">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-bar"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <CiSearch className="search-icon" />
              </div>
            </div>
          )}

          <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Catalogue</Link>

          {currentUser && isAdmin && (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </Link>
          )}
          
          {currentUser ? (
            <div className="user-dropdown">
              <div className="user-icon-group" onClick={toggleDropdown}>
                <RiAccountCircleLine className="user-icon" />
                <RiArrowDropDownLine className="dropdown-arrow" />
              </div>
              {showDropdown && (
                <div className="navbar-dropdown-menu">
                  <Link to="/account" className="navbar-dropdown-item">Account</Link>
                  <Link to="/playlists" className="navbar-dropdown-item">Playlist</Link>
                  <Link to="/history" className="navbar-dropdown-item">History</Link>
                  {isAdmin && (
                    <Link to="/dashboard" className="navbar-dropdown-item">Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="navbar-dropdown-item">Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={openLoginModal} className="login-btn">Log In</button>
              <button onClick={openSignUpModal} className="signup-btn">Sign Up</button>
            </>
          )}
        </div>
      </nav>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModals} 
        switchToSignUp={switchToSignUp} 
      />
      
      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={closeModals} 
        switchToLogin={switchToLogin} 
      />
    </>
  );
};

export default Navbar;