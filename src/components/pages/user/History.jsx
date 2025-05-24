import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [clearingHistory, setClearingHistory] = useState(false);

  const navigate = useNavigate();

  // Универсальная функция для получения userId
  const getCurrentUserId = () => {
    try {
      // Сначала пробуем получить из localStorage
      const userFromStorage = localStorage.getItem('user');
      console.log('🔍 userFromStorage:', userFromStorage);

      if (userFromStorage && userFromStorage !== 'undefined') {
        const userData = JSON.parse(userFromStorage);
        console.log('🔍 parsed userData:', userData);

        const userId = userData.id || userData.userId || userData.user_id;
        if (userId) {
          console.log('🔍 Found userId in localStorage:', userId);
          return parseInt(userId);
        }
      }

      // Если не нашли в user, пробуем получить из токена
      const token = localStorage.getItem('accessToken');
      if (token && token !== 'undefined') {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 token payload:', payload);

          const userId = payload.sub || payload.userId || payload.user_id || payload.id;
          if (userId) {
            console.log('🔍 Found userId in token:', userId);
            return parseInt(userId);
          }
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
        }
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
    return null;
  };

  // Получаем userId при монтировании компонента
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    console.log('🔍 Current user ID:', currentUserId);

    if (currentUserId) {
      setUserId(currentUserId);
    } else {
      setError('User not authenticated. Please log in again.');
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
    if (!userId) {
      console.error('No userId available for loading history');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📺 Loading history for user:', userId);

      // Получаем историю пользователя
      const historyData = await getUserHistory(userId);
      console.log('📺 History data received:', historyData);

      if (!Array.isArray(historyData) || historyData.length === 0) {
        console.log('📺 No history found for user');
        setHistoryMovies([]);
        setLoading(false);
        return;
      }

      // Для каждой записи в истории получаем детали фильма
      const moviesWithDetails = await Promise.allSettled(
          historyData.map(async (historyItem) => {
            try {
              console.log('📺 Loading movie details for:', historyItem.movieId);
              const movieDetails = await getMovieDetails(historyItem.movieId);

              return {
                ...movieDetails,
                // Добавляем информацию из истории
                userId: historyItem.userId,
                movieId: historyItem.movieId,
                viewedAt: historyItem.viewedAt,
                historyId: historyItem.id, // если есть ID записи истории
                // Убираем description из объекта для экономии памяти
                description: undefined
              };
            } catch (movieError) {
              console.error(`Error loading movie ${historyItem.movieId}:`, movieError);
              // Возвращаем базовую информацию если не удалось загрузить детали
              return {
                id: historyItem.movieId,
                userId: historyItem.userId,
                movieId: historyItem.movieId,
                title: `Movie #${historyItem.movieId}`,
                posterUrl: '/placeholder-poster.jpg',
                year: 'Unknown',
                viewedAt: historyItem.viewedAt,
                historyId: historyItem.id,
                isPlaceholder: true
              };
            }
          })
      );

      // Обрабатываем результаты Promise.allSettled
      const successfulMovies = moviesWithDetails
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(movie => movie !== null);

      console.log('📺 Movies with details loaded:', successfulMovies.length);
      setHistoryMovies(successfulMovies);

    } catch (error) {
      console.error('Error loading history:', error);
      setError(`Failed to load history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMovie = async (movieId, movieTitle) => {
    console.log('🗑️ Attempting to delete movie:', { userId, movieId });

    if (!userId || !movieId) {
      console.error('No user ID or movie ID provided for deletion');
      setError('Unable to delete movie: invalid ID');
      return;
    }

    // Создаем уникальный ключ для состояния загрузки
    const deletingKey = `${userId}-${movieId}`;
    setDeleting(prev => ({ ...prev, [deletingKey]: true }));
    setError(null);

    try {
      console.log('🗑️ Deleting history item:', { userId, movieId });

      await deleteHistoryItem(userId, movieId);

      // Обновляем состояние, удаляя фильм из списка
      setHistoryMovies(prev =>
          prev.filter(movie => !(movie.userId === userId && movie.movieId === movieId))
      );

      console.log('🗑️ History item deleted successfully');

    } catch (error) {
      console.error('Error deleting history item:', error);
      setError(`Failed to delete "${movieTitle}": ${error.message}`);

      // Перезагружаем историю в случае ошибки для синхронизации состояния
      setTimeout(() => {
        loadHistory();
      }, 1000);

    } finally {
      setDeleting(prev => ({ ...prev, [deletingKey]: false }));
    }
  };

  const deleteHistory = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    const confirmMessage = `Are you sure you want to delete your entire viewing history? 
This will remove ${historyMovies.length} movie(s) from your history. This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setClearingHistory(true);
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

      // Перезагружаем историю в случае ошибки
      setTimeout(() => {
        loadHistory();
      }, 1000);

    } finally {
      setClearingHistory(false);
    }
  };

  // Функция для перехода к деталям фильма
  const handlePosterClick = (movieId) => {
    console.log('🎬 Navigating to movie details:', movieId);
    navigate(`/movies/${movieId}`);
  };

  // Функция для форматирования даты просмотра
  const formatViewedAt = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = (now - date) / (1000 * 60);
        if (diffInMinutes < 5) {
          return 'Just now';
        }
        return `${Math.floor(diffInMinutes)} minutes ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      return '';
    }
  };

  // Компонент для отображения ошибки с возможностью повтора
  const ErrorMessage = ({ error, onRetry }) => (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={onRetry} className="retry-btn">
          Try Again
        </button>
      </div>
  );

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

  if (error && historyMovies.length === 0) {
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
            <ErrorMessage error={error} onRetry={loadHistory} />
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
            <h1 className="history-title">
              History {historyMovies.length > 0 && `(${historyMovies.length})`}
            </h1>
            {historyMovies.length > 0 && (
                <div className="history-buttons">
                  <button
                      onClick={deleteHistory}
                      className="history-delete-btn"
                      disabled={clearingHistory}
                  >
                    <FaRegTrashAlt className="history-delete-icon" />
                    {clearingHistory ? 'Clearing...' : 'Delete History'}
                  </button>
                </div>
            )}
          </div>

          {/* Показываем ошибки если они есть */}
          {error && (
              <div className="error-banner" style={{
                background: '#ff4444',
                color: 'white',
                padding: '10px',
                marginBottom: '20px',
                borderRadius: '5px'
              }}>
                {error}
                <button
                    onClick={() => setError(null)}
                    style={{
                      float: 'right',
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                >
                  ×
                </button>
              </div>
          )}

          <div className="history-movies">
            {historyMovies.length === 0 ? (
                <div className="empty-history">
                  <p>Your viewing history is empty.</p>
                  <p>Start watching movies to see them here!</p>
                  <Link to="/" className="browse-movies-btn">
                    Browse Movies
                  </Link>
                </div>
            ) : (
                historyMovies.map(movie => {
                  // Создаем уникальный ключ для каждого элемента
                  const uniqueKey = `${movie.userId}-${movie.movieId}`;
                  const deletingKey = `${userId}-${movie.movieId}`;

                  return (
                      <div key={uniqueKey} className="history-movie">
                        <div className="history-movie-content">
                          <img
                              src={movie.posterUrl || '/placeholder-poster.jpg'}
                              alt={movie.title}
                              className="history-movie-poster clickable-poster"
                              onClick={() => handlePosterClick(movie.movieId)}
                              onError={(e) => {
                                e.target.src = '/placeholder-poster.jpg';
                              }}
                              title={`View details for ${movie.title}`}
                              style={{ cursor: 'pointer' }}
                          />
                          <div className="history-movie-details">
                            <div className="history-movie-title-container">
                              <h3 className="history-movie-title">
                                {movie.title}
                                {movie.isPlaceholder && (
                                    <span className="placeholder-indicator"> (Loading...)</span>
                                )}
                              </h3>
                              <button
                                  className={`history-movie-delete ${deleting[deletingKey] ? 'deleting' : ''}`}
                                  onClick={() => deleteMovie(movie.movieId, movie.title)}
                                  disabled={deleting[deletingKey]}
                                  title="Remove from history"
                              >
                                {deleting[deletingKey] ? '...' : <RxCross2 />}
                              </button>
                            </div>

                            {movie.year && (
                                <p className="history-movie-year">
                                  {movie.year}
                                </p>
                            )}

                            {movie.viewedAt && (
                                <p className="history-movie-viewed">
                                  Watched {formatViewedAt(movie.viewedAt)}
                                </p>
                            )}
                          </div>
                        </div>
                      </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
  );
};

export default History;