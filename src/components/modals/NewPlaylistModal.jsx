import React, { useState, useEffect } from 'react';
import './NewPlaylistModal.css';
import { IoClose } from "react-icons/io5";

const NewPlaylistModal = ({
                            isOpen,        // флаг, открыт ли модал
                            onClose,       // коллбэк закрытия
                            onPlaylistCreate, // коллбэк создания (name, firstMovieId)
                            movies = []    // сюда придут все фильмы (с дефолтным значением)
                          }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Сбрасываем поля при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setNewPlaylistName('');
      setSelectedMovieId('');
      setError('');
      setIsCreating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🔔 NewPlaylistModal ➔ handleSubmit fired', {
      newPlaylistName,
      selectedMovieId,
      moviesLength: movies?.length
    });

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
      // Передаем только ID фильма (число) или null
      const movieId = selectedMovieId ? parseInt(selectedMovieId, 10) : null;

      console.log('🔔 NewPlaylistModal ➔ calling onPlaylistCreate with:', {
        name: newPlaylistName.trim(),
        movieId
      });

      await onPlaylistCreate(newPlaylistName.trim(), movieId);

      // Если дошли до сюда, то создание прошло успешно
      console.log('🔔 NewPlaylistModal ➔ playlist created successfully');

    } catch (error) {
      console.error('🔔 NewPlaylistModal ➔ error creating playlist:', error);

      // Показываем понятную ошибку пользователю
      if (error.message) {
        setError(error.message);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data) {
        setError('Server error: ' + JSON.stringify(error.response.data));
      } else {
        setError('Failed to create playlist. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Обработка закрытия модала
  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  // Обработка клика по overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isCreating) {
      onClose();
    }
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
                <div className="error-message" style={{
                  color: '#e74c3c',
                  backgroundColor: '#fdf2f2',
                  border: '1px solid #e74c3c',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
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
                    if (error) setError(''); // Очищаем ошибку при вводе
                  }}
                  placeholder="Enter playlist title"
                  autoFocus
                  maxLength={100}
                  disabled={isCreating}
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="movie-select">First movie (optional):</label>
              <select
                  id="movie-select"
                  value={selectedMovieId}
                  onChange={e => setSelectedMovieId(e.target.value)}
                  disabled={isCreating}
              >
                <option value="">-- Select a movie --</option>
                {movies && movies.length > 0 ? (
                    movies.map(movie => {
                      // Проверяем разные варианты ID и title
                      const movieId = movie.id || movie.movieId || movie.Movie_Id;
                      const movieTitle = movie.title || movie.name || movie.Title || `Movie ${movieId}`;

                      return (
                          <option key={`movie-${movieId}`} value={movieId}>
                            {movieTitle}
                          </option>
                      );
                    })
                ) : (
                    <option disabled>No movies available</option>
                )}
              </select>
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