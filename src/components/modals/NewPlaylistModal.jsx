import React, { useState } from 'react';
import './NewPlaylistModal.css';
import { IoClose } from "react-icons/io5";

const NewPlaylistModal = ({ isOpen, onClose, movieTitle, onPlaylistCreate }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen) return null;

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    onPlaylistCreate(newPlaylistName);
    setNewPlaylistName('');
  };

  return (
    <div className="new-playlist-modal-overlay">
      <div className="new-playlist-modal-container">
        <div className="new-playlist-modal-header">
          <h2>New Playlist</h2>
          <IoClose className="new-playlist-close-icon" onClick={onClose} />
        </div>
        <div className="new-playlist-modal-content">
          <form onSubmit={handleCreatePlaylist} className="new-playlist-form">
            <div className="form-group">
              <input
                type="text"
                id="playlist-name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Title"
                autoFocus
              />
            </div>
            
            <p className="movie-info">
              <strong>First movie:</strong> {movieTitle}
            </p>

            <div className="new-playlist-form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" className="create-btn">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPlaylistModal;