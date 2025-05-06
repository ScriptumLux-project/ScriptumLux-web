import React, { useState } from 'react';
import './PlaylistModal.css'; // Change to use a separate CSS file
import { IoClose } from "react-icons/io5";
import { AiOutlinePlusCircle } from "react-icons/ai";

const PlaylistModal = ({ isOpen, onClose, movieTitle }) => {
  // Mock data for playlists
  const [playlists, setPlaylists] = useState([
    { id: 1, name: "Favorites", movies: 12 },
    { id: 2, name: "Watch Later", movies: 8 },
    { id: 3, name: "Best Action", movies: 5 }
  ]);
  
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!isOpen) return null;

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist = {
      id: playlists.length + 1,
      name: newPlaylistName,
      movies: 1
    };
    
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setIsCreatingNew(false);
  };

  return (
    <div className="playlist-modal-overlay">
      <div className="playlist-modal-container">
        <div className="playlist-modal-header">
          <h2>Add to Playlist</h2>
          <IoClose className="playlist-close-icon" onClick={onClose} />
        </div>
        <div className="playlist-modal-content">
          <h3 className="movie-title-modal">{movieTitle}</h3>
          
          <div className="playlist-list">
            {playlists.map(playlist => (
              <div key={playlist.id} className="playlist-item">
                <span className="playlist-name">{playlist.name}</span>
                <span className="playlist-count">{playlist.movies} movies</span>
              </div>
            ))}
          </div>
          
          {isCreatingNew ? (
            <form onSubmit={handleCreatePlaylist} className="new-playlist-form">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                autoFocus
              />
              <div className="playlist-form-actions">
                <button type="button" onClick={() => setIsCreatingNew(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          ) : (
            <div className="create-playlist" onClick={() => setIsCreatingNew(true)}>
              <AiOutlinePlusCircle className="add-icon" />
              <span>Create new playlist</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;