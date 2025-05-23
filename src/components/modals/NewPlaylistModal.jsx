import React, { useState, useEffect } from 'react';
import './NewPlaylistModal.css';
import { IoClose } from "react-icons/io5";

const NewPlaylistModal = ({
                            isOpen,            // флаг, открыт ли модал
                            onClose,           // коллбэк закрытия
                            onPlaylistCreate   // коллбэк создания (name, firstMovieId)
                          }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Сбрасываем поля при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setNewPlaylistName('');
      setError('');
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }
    if (newPlaylistName.trim().length < 2) {
      setError('Playlist name must be at least 2 characters long');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Первый фильм не нужен — передаём null
      await onPlaylistCreate(newPlaylistName.trim(), null);
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(
          err.response?.data?.message
          || err.message
          || 'Failed to create playlist. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isCreating) onClose();
  };

  return (
      <div className="new-playlist-modal-overlay" onClick={handleOverlayClick}>
        <div className="new-playlist-modal-container">
          <div className="new-playlist-modal-header">
            <h2>New Playlist</h2>
            <IoClose
                className={`new-playlist-close-icon ${isCreating ? 'disabled' : ''}`}
                onClick={handleClose}
            />
          </div>

          <form onSubmit={handleSubmit} className="new-playlist-form">
            {error && (
                <div className="error-message">
                  {error}
                </div>
            )}

            <div className="form-group">
              <label htmlFor="playlist-name">Playlist Name *</label>
              <input
                  id="playlist-name"
                  type="text"
                  value={newPlaylistName}
                  onChange={e => {
                    setNewPlaylistName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter playlist title"
                  autoFocus
                  maxLength={100}
                  disabled={isCreating}
                  required
              />
            </div>

            <div className="new-playlist-form-actions">
              <button
                  type="button"
                  onClick={handleClose}
                  className="cancel-btn"
                  disabled={isCreating}
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="create-btn"
                  disabled={!newPlaylistName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default NewPlaylistModal;
