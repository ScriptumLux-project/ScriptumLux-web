import React from 'react';
import { Link } from 'react-router-dom';
import { RiAccountCircleLine } from 'react-icons/ri';
import { useState } from 'react';
import './Account.css';
import { useMovies } from '../context/MovieContext'; 

const Account = () => {
    const { movies } = useMovies();
  
    const [avatar, setAvatar] = useState(null); // для пользовательского изображения
  
    const handleAvatarChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setAvatar(imageUrl);
      }
    };
  
    const user = {
      nickname: 'user123',
      email: 'juser@gmail.com',
    };
  
    const historyMovies = movies.slice(0, 6);
    const playlists = [
      { id: 1, title: 'Sci-Fi Collection', posterUrl: '/posters/playlist1.jpg' },
      { id: 2, title: 'Oscar Winners', posterUrl: '/posters/playlist2.jpg' },
    ];
  
    return (
      <div className="account-page">
        <div className="account-container">
          <h1 className="account-title">Your Profile/Account</h1>
  
          <div className="account-header">
            <label className="account-avatar" htmlFor="avatar-upload">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="account-avatar-img" />
              ) : (
                <RiAccountCircleLine className="account-icon" />
              )}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
  
            <div className="account-info">
              <div className="account-detail">{user.nickname}</div>
              <div className="account-detail">{user.email}</div>
            </div>
          </div>

        {/* History Section */}
        <div className="account-section">
          <div className="account-section-header">
            <h2 className="account-section-title">History</h2>
            <Link to="/history" className="account-seeall-btn">See All</Link>
          </div>
          <div className="account-grid">
            {historyMovies.map(movie => (
              <div key={movie.id} className="account-card">
                <img src={movie.posterUrl} alt={movie.title} className="account-poster" />
                <h3 className="account-card-title">{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Playlists Section */}
        <div className="account-section">
          <div className="account-section-header">
            <h2 className="account-section-title">Playlists</h2>
            <div className="account-buttons">
              <Link to="/playlists/create" className="account-create-btn">+ Create</Link>
              <Link to="/playlists" className="account-seeall-btn">See All</Link>
            </div>
          </div>
          <div className="account-grid">
            {playlists.map(playlist => (
              <div key={playlist.id} className="account-card">
                <img src={playlist.posterUrl} alt={playlist.title} className="account-poster" />
                <h3 className="account-card-title">{playlist.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;