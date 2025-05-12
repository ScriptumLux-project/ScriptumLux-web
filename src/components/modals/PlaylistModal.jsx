import React, { useState } from 'react';
import './PlaylistModal.css';
import { IoClose } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import NewPlaylistModal from './NewPlaylistModal';

const PlaylistModal = ({ isOpen, onClose, movieTitle }) => {
  //Mock data*
  const [playlists, setPlaylists] = useState([
    { id: 1, name: "Favorites", movies: 12 },
    { id: 2, name: "Watch Later", movies: 8 },
    { id: 3, name: "Best Action", movies: 5 }
  ]);
  
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  if (!isOpen) return null;

  const openNewPlaylistModal = () => {
    setIsNewPlaylistModalOpen(true);
  };

  const closeNewPlaylistModal = () => {
    setIsNewPlaylistModalOpen(false);
  };

  const handleSelectPlaylist = (id) => {
    if (selectedPlaylist === id) {
      setSelectedPlaylist(null);
    } else {
      
      setSelectedPlaylist(id);
    }
  };

  return (
    <>
      <div className="playlist-modal-overlay">
        <div className="playlist-modal-container">
          <div className="playlist-modal-header">
            <h2>Choose Playlist</h2>
            <IoClose className="playlist-close-icon" onClick={onClose} />
          </div>
          <div className="playlist-modal-content">
            {playlists.length > 0 ? (
              <div className="playlist-list">
                {playlists.map(playlist => (
                  <div 
                    key={playlist.id} 
                    className={`playlist-item ${selectedPlaylist === playlist.id ? 'selected' : ''}`}
                    onClick={() => handleSelectPlaylist(playlist.id)}
                  >
                    <div className="playlist-checkbox">
                      <div className="checkbox-inner"></div>
                    </div>
                    <div className="playlist-info">
                      <span className="playlist-name">{playlist.name}</span>
                      <span className="playlist-count">{playlist.movies} movies</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-playlists">No playlists created yet.</p>
            )}
            
            {selectedPlaylist ? (
              <button className="add-to-playlist-btn" onClick={() => {
                alert(`Added to ${playlists.find(p => p.id === selectedPlaylist).name}`);
                onClose();
              }}>
                Add
              </button>
            ) : (
              <button className="create-new-playlist-btn" onClick={openNewPlaylistModal}>
                <IoAdd /> Create New
              </button>
            )}
          </div>
        </div>
      </div>

      {isNewPlaylistModalOpen && (
        <NewPlaylistModal
          isOpen={isNewPlaylistModalOpen}
          onClose={closeNewPlaylistModal}
          movieTitle={movieTitle}
          onPlaylistCreate={(newPlaylistName) => {
            const newPlaylist = {
              id: playlists.length + 1,
              name: newPlaylistName,
              movies: 1
            };
            setPlaylists([...playlists, newPlaylist]);
            closeNewPlaylistModal();
          }}
        />
      )}
    </>
  );
};

export default PlaylistModal;