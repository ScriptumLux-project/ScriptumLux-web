import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import {
  getUserHistory,
  deleteHistoryItem,
  clearUserHistory,
  getMovieDetails
} from '../../../api.js';
import './History.css';

const History = () => {
  const [historyMovies, setHistoryMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [deleting, setDeleting] = useState({});

  // Получаем userId из localStorage при монтировании компонента
  useEffect(() => {
    const getUserId = () => {
      try {
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage && userFromStorage !== 'undefined') {
          const userData = JSON.parse(userFromStorage);
          return userData.id || userData.userId || userData.user_id;
        }

        // Если не нашли в user, пробуем получить из токена
        const token = localStorage.getItem('accessToken');
        if (token && token !== 'undefined') {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || payload.userId || payload.user_id || payload.id;
          } catch (tokenError) {
            console.error('Error decoding token:', tokenError);
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
      return null;
    };

    const currentUserId = getUserId();
    if (currentUserId) {
      setUserId(currentUserId);
    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, []);

  // Загружаем историю когда получили userId
  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📺 Loading history for user:', userId);

      // Получаем историю пользователя
      const historyData = await getUserHistory(userId);
      console.log('📺 History data received:', historyData);

      // Для каждой записи в истории получаем детали фильма
      const moviesWithDetails = await Promise.all(
          historyData.map(async (historyItem) => {
            try {
              const movieDetails = await getMovieDetails(historyItem.movieId);
              return {
                ...movieDetails,
                historyId: historyItem.id || historyItem.historyId,
                viewedAt: historyItem.viewedAt
              };
            } catch (movieError) {
              console.error(`Error loading movie ${historyItem.movieId}:`, movieError);
              // Возвращаем базовую информацию если не удалось загрузить детали
              return {
                id: historyItem.movieId,
                historyId: historyItem.id || historyItem.historyId,
                title: `Movie #${historyItem.movieId}`,
                description: 'Details not available',
                posterUrl: '/placeholder-poster.jpg',
                director: 'Unknown',
                year: 'Unknown',
                genres: [],
                viewedAt: historyItem.viewedAt
              };
            }
          })
      );

      console.log('📺 Movies with details:', moviesWithDetails);
      setHistoryMovies(moviesWithDetails);

    } catch (error) {
      console.error('Error loading history:', error);
      setError(`Failed to load history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (movieHistoryId, movieTitle) => {
    if (!movieHistoryId) {
      console.error('No history ID provided for deletion');
      return;
    }

    // Показываем индикатор загрузки для конкретного фильма
    setDeleting(prev => ({ ...prev, [movieHistoryId]: true }));

    try {
      console.log('🗑️ Deleting history item:', movieHistoryId);

      await deleteHistoryItem(movieHistoryId);

      // Обновляем состояние, удаляя фильм из списка
      setHistoryMovies(prev =>
          prev.filter(movie => movie.historyId !== movieHistoryId)
      );

      console.log('🗑️ History item deleted successfully');

    } catch (error) {
      console.error('Error deleting history item:', error);
      setError(`Failed to delete "${movieTitle}": ${error.message}`);
    } finally {
      setDeleting(prev => ({ ...prev, [movieHistoryId]: false }));
    }
  };

  const deleteHistory = async () => {
    if (!userId) return;

    if (!window.confirm('Are you sure you want to delete your entire viewing history? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🗑️ Clearing entire history for user:', userId);

      await clearUserHistory(userId);

      // Очищаем состояние
      setHistoryMovies([]);

      console.log('🗑️ History cleared successfully');

    } catch (error) {
      console.error('Error clearing history:', error);
      setError(`Failed to clear history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Функция для форматирования даты просмотра
  const formatViewedAt = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
        <div className="history-page">
          <div className="history-container">
            <Link to="/account" className="back-link">
            <span className="back-icon">
              <IoIosArrowBack />
            </span>
              Back
            </Link>
            <div className="history-header">
              <h1 className="history-title">History</h1>
            </div>
            <div className="loading-message">
              <p>Loading your viewing history...</p>
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="history-page">
          <div className="history-container">
            <Link to="/account" className="back-link">
            <span className="back-icon">
              <IoIosArrowBack />
            </span>
              Back
            </Link>
            <div className="history-header">
              <h1 className="history-title">History</h1>
            </div>
            <div className="error-message">
              <p>Error: {error}</p>
              <button onClick={loadHistory} className="retry-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="history-page">
        <div className="history-container">
          <Link to="/account" className="back-link">
          <span className="back-icon">
            <IoIosArrowBack />
          </span>
            Back
          </Link>

          <div className="history-header">
            <h1 className="history-title">History</h1>
            {historyMovies.length > 0 && (
                <div className="history-buttons">
                  <button
                      onClick={deleteHistory}
                      className="history-delete-btn"
                      disabled={loading}
                  >
                    <FaRegTrashAlt className="history-delete-icon" />
                    Delete History
                  </button>
                </div>
            )}
          </div>

          <div className="history-movies">
            {historyMovies.length === 0 ? (
                <div className="empty-history">
                  <p>Your viewing history is empty.</p>
                  <p>Start watching movies to see them here!</p>
                </div>
            ) : (
                historyMovies.map(movie => (
                    <div key={movie.historyId || movie.id} className="history-movie">
                      <div className="history-movie-content">
                        <img
                            src={movie.posterUrl || '/placeholder-poster.jpg'}
                            alt={movie.title}
                            className="history-movie-poster"
                            onError={(e) => {
                              e.target.src = '/placeholder-poster.jpg';
                            }}
                        />
                        <div className="history-movie-details">
                          <div className="history-movie-title-container">
                            <h3 className="history-movie-title">{movie.title}</h3>
                            <button
                                className={`history-movie-delete ${deleting[movie.historyId] ? 'deleting' : ''}`}
                                onClick={() => deleteMovie(movie.historyId, movie.title)}
                                disabled={deleting[movie.historyId]}
                                title="Remove from history"
                            >
                              {deleting[movie.historyId] ? '...' : <RxCross2 />}
                            </button>
                          </div>

                          {movie.genres && movie.genres.length > 0 && (
                              <p className="history-movie-genre">
                                {movie.genres.map(genre => genre.name || genre).join(', ')}
                              </p>
                          )}

                          {movie.viewedAt && (
                              <p className="history-movie-viewed">
                                Watched {formatViewedAt(movie.viewedAt)}
                              </p>
                          )}

                          {movie.description && (
                              <p className="history-movie-description">{movie.description}</p>
                          )}

                          {movie.director && (
                              <p className="history-movie-director">Director: {movie.director}</p>
                          )}

                          {movie.year && (
                              <p className="history-movie-year">Year: {movie.year}</p>
                          )}
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

export default History;