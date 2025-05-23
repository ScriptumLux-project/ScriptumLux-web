import React, { useState } from 'react';
import './PlaylistModal.css';
import { IoClose } from "react-icons/io5";
import { IoAdd } from "react-icons/io5";
import NewPlaylistModal from './NewPlaylistModal';
import { usePlaylists } from '../context/PlaylistContext';

const PlaylistModal = ({ isOpen, onClose, movieTitle, movieId }) => {
  const { playlists, addToPlaylist, addNewPlaylist } = usePlaylists();
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !movieId) {
      alert('Please select a playlist and ensure movie ID is available');
      return;
    }

    try {
      setLoading(true);

      const selectedPlaylistData = playlists.find(p =>
          p.id === selectedPlaylist || p.playlistId === selectedPlaylist
      );

      await addToPlaylist(selectedPlaylist, movieId);

      alert(`"${movieTitle}" added to "${selectedPlaylistData?.name || selectedPlaylistData?.title || 'playlist'}" successfully!`);
      onClose();

    } catch (error) {
      console.error('Error adding movie to playlist:', error);
      alert('Failed to add movie to playlist: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPlaylist = async (newPlaylistName) => {
    try {
      setLoading(true);

      // Создаем новый плейлист с фильмом
      await addNewPlaylist(newPlaylistName, movieId);

      alert(`New playlist "${newPlaylistName}" created and "${movieTitle}" added successfully!`);
      closeNewPlaylistModal();
      onClose();

    } catch (error) {
      console.error('Error creating new playlist:', error);
      alert('Failed to create playlist: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
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
              {movieTitle && (
                  <p className="movie-title-info">Adding: <strong>{movieTitle}</strong></p>
              )}

              {playlists.length > 0 ? (
                  <div className="playlist-list">
                    {playlists.map(playlist => {
                      const playlistId = playlist.id || playlist.playlistId;
                      const playlistName = playlist.name || playlist.title || 'Untitled Playlist';
                      const movieCount = playlist.movieCount || playlist.movies || 0;

                      return (
                          <div
                              key={playlistId}
                              className={`playlist-item ${selectedPlaylist === playlistId ? 'selected' : ''}`}
                              onClick={() => handleSelectPlaylist(playlistId)}
                          >
                            <div className="playlist-checkbox">
                              <div className="checkbox-inner"></div>
                            </div>
                            <div className="playlist-info">
                              <span className="playlist-name">{playlistName}</span>
                              <span className="playlist-count">{movieCount} movies</span>
                            </div>
                          </div>
                      );
                    })}
                  </div>
              ) : (
                  <p className="no-playlists">No playlists created yet.</p>
              )}

              <div className="playlist-modal-actions">
                {selectedPlaylist ? (
                    <button
                        className="add-to-playlist-btn"
                        onClick={handleAddToPlaylist}
                        disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add to Playlist'}
                    </button>
                ) : null}

                <button
                    className="create-new-playlist-btn"
                    onClick={openNewPlaylistModal}
                    disabled={loading}
                >
                  <IoAdd /> Create New Playlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {isNewPlaylistModalOpen && (
            <NewPlaylistModal
                isOpen={isNewPlaylistModalOpen}
                onClose={closeNewPlaylistModal}
                movieTitle={movieTitle}
                onPlaylistCreate={handleCreateNewPlaylist}
            />
        )}
      </>
  );
};

export default PlaylistModal;