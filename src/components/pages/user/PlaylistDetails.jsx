import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdDeleteOutline } from 'react-icons/md';
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { MdSearch } from "react-icons/md";
import { usePlaylists } from '../../context/PlaylistContext';
import EditPlaylistModal from '../../modals/EditPlaylistModal';
import DropdownMenu from '../../modals/DropdownMenu';
import { getPlaylistMovies, removeMovieFromPlaylist, updatePlaylist, deletePlaylist, getPlaylistById, searchMovies, addMovieToPlaylist } from '../../../api';

import './PlaylistDetails.css';

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const { playlists, setPlaylists, refreshPlaylists, updatePlaylistInState } = usePlaylists();
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [playlistMovies, setPlaylistMovies] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [dropdownStates, setDropdownStates] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState(null);

  // Состояние для удаления фильмов (добавлено по аналогии с Playlists)
  const [deletingMovieId, setDeletingMovieId] = useState(null);

  // Состояние для поиска и добавления фильмов
  const [isAddMovieMode, setIsAddMovieMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Загрузка плейлиста и его фильмов
  useEffect(() => {
    const loadPlaylistData = async () => {
      if (!playlistId) return;

      setLoading(true);
      setError(null);

      try {
        window.scrollTo(0, 0);

        console.log('🔍 Loading playlist with ID:', playlistId);
        console.log('🔍 Available playlists:', playlists);

        // Сначала ищем плейлист в локальном состоянии
        let playlist = playlists.find(p =>
            p.playlistId === parseInt(playlistId) || p.id === parseInt(playlistId)
        );

        // Если не найден локально, пытаемся загрузить с сервера
        if (!playlist) {
          console.log('🔍 Playlist not found locally, fetching from server...');
          try {
            playlist = await getPlaylistById(playlistId);
            console.log('🔍 Playlist loaded from server:', playlist);
          } catch (serverError) {
            console.error('🔍 Error loading playlist from server:', serverError);
            throw new Error('Playlist not found');
          }
        }

        if (!playlist) {
          throw new Error('Playlist not found');
        }

        setCurrentPlaylist(playlist);
        console.log('🔍 Current playlist set:', playlist);

        // Получаем фильмы плейлиста с дополнительным логированием
        console.log('🔍 Loading movies for playlist:', playlistId);
        console.log('🔍 Playlist object before loading movies:', playlist);

        try {
          const movies = await getPlaylistMovies(playlistId);
          console.log('🔍 Loaded playlist movies:', movies);
          setPlaylistMovies(movies || []);
        } catch (moviesError) {
          console.error('🔍 Error loading playlist movies:', moviesError);
          console.error('🔍 Error details:', {
            status: moviesError.response?.status,
            statusText: moviesError.response?.statusText,
            data: moviesError.response?.data,
            message: moviesError.message
          });

          // Если ошибка 400, попробуем альтернативные варианты
          if (moviesError.response?.status === 400) {
            console.warn('🔍 Bad Request error, trying alternative approaches...');

            // Вариант 1: Попробуем с другим ID (если есть playlistId в объекте)
            if (playlist.playlistId && playlist.playlistId !== parseInt(playlistId)) {
              try {
                console.log('🔍 Trying with playlist.playlistId:', playlist.playlistId);
                const moviesAlt = await getPlaylistMovies(playlist.playlistId);
                console.log('🔍 Movies loaded with alternative ID:', moviesAlt);
                setPlaylistMovies(moviesAlt || []);
                return; // Успешно загрузили, выходим
              } catch (altError) {
                console.error('🔍 Alternative ID also failed:', altError);
              }
            }

            // Вариант 2: Если плейлист пустой, устанавливаем пустой массив
            console.warn('🔍 Setting empty movies array due to 400 error');
            setPlaylistMovies([]);

            // Не выбрасываем ошибку, просто показываем пустой плейлист
            console.log('🔍 Continuing with empty playlist...');
          } else {
            // Для других ошибок показываем сообщение
            throw new Error(`Failed to load playlist movies: ${moviesError.message}`);
          }
        }

      } catch (error) {
        console.error('🔍 Error loading playlist data:', error);
        setError(error.message || 'Failed to load playlist');
        setCurrentPlaylist(null);
        setPlaylistMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylistData();
  }, [playlistId, playlists]);

  // Поиск фильмов
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMovies(query);
      // Фильтруем результаты, исключая фильмы, которые уже есть в плейлисте
      const currentMovieIds = playlistMovies.map(movie => movie.id || movie.movieId);
      const filteredResults = results.filter(movie =>
          !currentMovieIds.includes(movie.id || movie.movieId)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Добавление фильма в плейлист
  const handleAddMovieToPlaylist = async (movieId) => {
    try {
      const playlistIdToUse = currentPlaylist.playlistId || currentPlaylist.id;
      console.log('🎬 Adding movie to playlist:', { playlistIdToUse, movieId });

      await addMovieToPlaylist(playlistIdToUse, movieId);

      // Обновляем список фильмов плейлиста
      const updatedMovies = await getPlaylistMovies(playlistIdToUse);
      setPlaylistMovies(updatedMovies || []);

      // Обновляем счетчик фильмов
      const newMovieCount = (updatedMovies || []).length;
      setCurrentPlaylist(prev => ({
        ...prev,
        movieCount: newMovieCount,
        movies: newMovieCount
      }));

      // Обновляем в контексте
      updatePlaylistInState(playlistIdToUse, {
        movieCount: newMovieCount,
        movies: newMovieCount
      });

      // Убираем добавленный фильм из результатов поиска
      setSearchResults(prev => prev.filter(movie =>
          (movie.id || movie.movieId) !== movieId
      ));

      console.log(`🎬 Movie ${movieId} added to playlist successfully`);

    } catch (error) {
      console.error('🎬 Error adding movie to playlist:', error);
      alert('Failed to add movie to playlist: ' + (error.message || 'Unknown error'));
    }
  };

  // Удаление плейлиста
  const handleDeletePlaylist = async () => {
    if (!currentPlaylist) return;

    const playlistName = currentPlaylist.name || currentPlaylist.title || 'Untitled Playlist';
    const confirmDelete = window.confirm(`Are you sure you want to delete playlist "${playlistName}"?`);
    if (!confirmDelete) return;

    try {
      const playlistIdToDelete = currentPlaylist.playlistId || currentPlaylist.id;
      console.log('🗑️ Deleting playlist with ID:', playlistIdToDelete);

      await deletePlaylist(playlistIdToDelete);

      // Обновляем локальное состояние - убираем плейлист из списка
      setPlaylists(prev => prev.filter(playlist =>
          (playlist.id !== parseInt(playlistId)) &&
          (playlist.playlistId !== parseInt(playlistId))
      ));

      // Обновляем контекст
      await refreshPlaylists();

      navigate('/playlists');
    } catch (error) {
      console.error('🗑️ Error deleting playlist:', error);
      alert('Failed to delete playlist: ' + (error.message || 'Unknown error'));
    }
  };

  // Сохранение нового названия плейлиста
  const handleSaveTitle = async (newTitle) => {
    if (!currentPlaylist || !newTitle.trim()) return;

    try {
      const playlistIdToUpdate = currentPlaylist.playlistId || currentPlaylist.id;
      console.log('📝 Updating playlist title:', { playlistIdToUpdate, newTitle });

      // Обновляем плейлист через API
      const updatedPlaylist = await updatePlaylist(playlistIdToUpdate, { name: newTitle.trim() });

      // Обновляем локальное состояние текущего плейлиста
      setCurrentPlaylist(prev => ({
        ...prev,
        name: newTitle.trim(),
        title: newTitle.trim()
      }));

      // Обновляем локальное состояние списка плейлистов
      setPlaylists(prev => prev.map((playlist) => {
        const isCurrentPlaylist =
            playlist.id === parseInt(playlistId) ||
            playlist.playlistId === parseInt(playlistId);

        return isCurrentPlaylist
            ? { ...playlist, name: newTitle.trim(), title: newTitle.trim() }
            : playlist;
      }));

      // Обновляем контекст
      await refreshPlaylists();

      console.log('📝 Playlist title updated successfully');

    } catch (error) {
      console.error('📝 Error updating playlist title:', error);
      alert('Failed to update playlist title: ' + (error.message || 'Unknown error'));
    }
  };

  // Управление выпадающими меню
  const toggleDropdown = (movieId, event) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 150
    };

    setDropdownPosition(position);

    setDropdownStates(prev => ({
      ...prev,
      [movieId]: !prev[movieId]
    }));

    // Закрываем другие открытые меню
    Object.keys(dropdownStates).forEach(id => {
      if (id !== movieId.toString() && dropdownStates[id]) {
        setDropdownStates(prev => ({
          ...prev,
          [id]: false
        }));
      }
    });
  };

  const closeAllDropdowns = () => {
    setDropdownStates({});
  };

  // Удаление фильма из плейлиста (обновлено по аналогии с Playlists)
  const handleRemoveFromPlaylist = async (movieId, movieTitle) => {
    console.log('🗑️ handleRemoveFromPlaylist called with:', { movieId, movieTitle });

    // Подтверждение удаления
    const playlistName = currentPlaylist.name || currentPlaylist.title || 'Untitled Playlist';


    try {
      setDeletingMovieId(movieId);
      const playlistIdToUse = currentPlaylist.playlistId || currentPlaylist.id;
      console.log('🗑️ Removing movie from playlist:', { playlistIdToUse, movieId });

      // Удаляем через API
      await removeMovieFromPlaylist(playlistIdToUse, movieId);
      console.log('🗑️ Movie removed successfully');

      // Обновляем локальное состояние фильмов
      setPlaylistMovies(prev => prev.filter(movie =>
          (movie.id !== movieId) && (movie.movieId !== movieId)
      ));

      // Обновляем счетчик фильмов
      const currentMovieCount = currentPlaylist.movieCount || currentPlaylist.movies || playlistMovies.length;
      const newMovieCount = Math.max(0, currentMovieCount - 1);

      // Обновляем текущий плейлист
      setCurrentPlaylist(prev => ({
        ...prev,
        movieCount: newMovieCount,
        movies: newMovieCount
      }));

      // Обновляем в контексте
      updatePlaylistInState(playlistIdToUse, {
        movieCount: newMovieCount,
        movies: newMovieCount
      });

      // Также обновляем локальный state playlists
      setPlaylists(prev => prev.map(playlist => {
        const isTarget = playlist.id === playlistIdToUse || playlist.playlistId === playlistIdToUse;
        if (isTarget) {
          return {
            ...playlist,
            movieCount: newMovieCount,
            movies: newMovieCount
          };
        }
        return playlist;
      }));

      closeAllDropdowns();
      console.log(`🗑️ Movie ${movieId} removed from playlist successfully`);

    } catch (error) {
      console.error('🗑️ Error removing movie from playlist:', error);

      let errorMessage = 'Failed to remove movie from playlist. Please try again.';

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Movie not found in playlist. It may have been already removed.';
          // Удаляем из локального состояния, даже если сервер вернул 404
          setPlaylistMovies(prev => prev.filter(movie =>
              (movie.id !== movieId) && (movie.movieId !== movieId)
          ));
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to remove this movie.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }

      alert(errorMessage);
    } finally {
      setDeletingMovieId(null);
    }
  };

  // Переход к деталям фильма
  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  // Закрываем выпадающие меню при клике вне их
  useEffect(() => {
    const handleClickOutside = () => {
      closeAllDropdowns();
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && isAddMovieMode) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isAddMovieMode]);

  // Обработка случаев загрузки и ошибок
  if (loading) {
    return (
        <div className="playlist-details-page">
          <div className="playlist-details-container">
            <Link to="/playlists" className="back-link">
              <span className="back-icon">
                <IoIosArrowBack />
              </span>
              Back
            </Link>
            <div className="loading-message">Loading playlist...</div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="playlist-details-page">
          <div className="playlist-details-container">
            <Link to="/playlists" className="back-link">
              <span className="back-icon">
                <IoIosArrowBack />
              </span>
              Back
            </Link>
            <div className="error-message">
              <h2>Error: {error}</h2>
              <p>Available playlist IDs: {playlists.map(p => p.playlistId || p.id).join(', ')}</p>
              <p>Requested ID: {playlistId}</p>
            </div>
          </div>
        </div>
    );
  }

  if (!currentPlaylist) {
    return (
        <div className="playlist-details-page">
          <div className="playlist-details-container">
            <Link to="/playlists" className="back-link">
              <span className="back-icon">
                <IoIosArrowBack />
              </span>
              Back
            </Link>
            <div className="playlist-details-header">
              <h1 className="playlist-details-title">Playlist not found</h1>
              <p>Available playlist IDs: {playlists.map(p => p.playlistId || p.id).join(', ')}</p>
              <p>Requested ID: {playlistId}</p>
            </div>
          </div>
        </div>
    );
  }

  const playlistTitle = currentPlaylist.name || currentPlaylist.title || 'Untitled Playlist';
  const playlistPoster = currentPlaylist.posterUrl || '/default-playlist-poster.jpg';

  return (
      <div className="playlist-details-page">
        <div className="playlist-details-container">
          <Link to="/playlists" className="back-link">
            <span className="back-icon">
              <IoIosArrowBack />
            </span>
            Back
          </Link>

          <div className="playlist-details-header">
            <h1 className="playlist-details-title">Playlist</h1>
          </div>

          <div className="playlist-details-content">
            <div className="playlist-details-main">
              <div className="playlist-holder">
                <img
                    src={playlistPoster}
                    alt={playlistTitle}
                    className="playlist-holder-image"
                    onError={(e) => {
                      e.target.src = '/default-playlist-poster.jpg';
                    }}
                />
                <h3 className="playlist-holder-title">{playlistTitle}</h3>
                <div className="playlist-holder-buttons">
                  <button className="button button-edit" onClick={() => setIsEditModalOpen(true)}>
                    <MdModeEdit /> Edit
                  </button>
                  <button className="button button-delete" onClick={handleDeletePlaylist}>
                    <FaRegTrashAlt /> Delete
                  </button>
                  <button
                      className="button button-add-movie"
                      onClick={() => {
                        setIsAddMovieMode(!isAddMovieMode);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                  >
                    <MdAdd /> {isAddMovieMode ? 'Cancel' : 'Add Movie'}
                  </button>
                </div>
              </div>
            </div>

            <div className="playlist-details-side">
              {/* Блок поиска и добавления фильмов */}
              {isAddMovieMode && (
                  <div className="add-movie-section">
                    <div className="search-container">
                      <div className="search-input-wrapper">
                        <MdSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search movies to add..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                      </div>
                    </div>

                    {isSearching && (
                        <div className="search-loading">Searching...</div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="search-results">
                          <h4>Search Results:</h4>
                          <div className="search-results-list">
                            {searchResults.map(movie => {
                              const movieId = movie.id || movie.movieId;
                              const movieTitle = movie.title || movie.name || 'Untitled Movie';

                              return (
                                  <div key={movieId} className="search-result-item">
                                    <img
                                        src={movie.posterUrl || '/default-movie-poster.jpg'}
                                        alt={movieTitle}
                                        className="search-result-poster"
                                        onError={(e) => {
                                          e.target.src = '/default-movie-poster.jpg';
                                        }}
                                    />
                                    <div className="search-result-info">
                                      <h5>{movieTitle}</h5>
                                      <p>{movie.year || movie.releaseYear || 'Unknown Year'}</p>
                                    </div>
                                    <button
                                        className="add-movie-btn"
                                        onClick={() => handleAddMovieToPlaylist(movieId)}
                                    >
                                      <MdAdd /> Add
                                    </button>
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                    )}

                    {searchQuery && !isSearching && searchResults.length === 0 && (
                        <div className="no-search-results">
                          No movies found for "{searchQuery}"
                        </div>
                    )}
                  </div>
              )}

              <div className="playlist-movies-list">
                {playlistMovies.length === 0 ? (
                    <div className="no-movies-container">
                      <p className="no-movies-message">
                        {error && error.includes('400')
                            ? 'This playlist appears to be empty or there was an issue loading movies.'
                            : 'No movies in this playlist yet'
                        }
                      </p>
                      {error && error.includes('400') && (
                          <p className="no-movies-hint">
                            You can add movies to this playlist using the "Add Movie" button above.
                          </p>
                      )}
                    </div>
                ) : (
                    <div className="playlist-movies">
                      {playlistMovies.map(movie => {
                        const movieId = movie.id || movie.movieId;
                        const movieTitle = movie.title || movie.name || 'Untitled Movie';
                        const movieGenres = movie.genres || [];
                        const genreText = Array.isArray(movieGenres)
                            ? movieGenres.map(genre => genre.name || genre).join(', ')
                            : 'Unknown Genre';
                        const isDeleting = deletingMovieId === movieId;

                        return (
                            <div key={movieId} className={`playlist-movie-item ${isDeleting ? 'deleting' : ''}`}>
                              <div className="playlist-movie-content">
                                <img
                                    src={movie.posterUrl || '/default-movie-poster.jpg'}
                                    alt={movieTitle}
                                    className="playlist-movie-poster clickable-poster"
                                    onClick={() => handleMovieClick(movieId)}
                                    onError={(e) => { e.target.src = '/default-movie-poster.jpg'; }}
                                />
                                <div className="playlist-movie-details">
                                  <div className="playlist-movie-title-container">
                                    <h3
                                        className="playlist-movie-title clickable-title"
                                        onClick={() => handleMovieClick(movieId)}
                                    >
                                      {movieTitle}
                                    </h3>
                                    <button
                                        className="delete-button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleRemoveFromPlaylist(movieId, movieTitle);
                                        }}
                                        disabled={isDeleting}
                                        title={`Remove "${movieTitle}" from playlist`}
                                        aria-label={`Remove ${movieTitle} from playlist`}
                                    >
                                      {isDeleting ? <div className="delete-spinner"></div> : <MdDeleteOutline />}
                                    </button>
                                  </div>

                                  {/* Жанры оставляем */}
                                  <p className="playlist-movie-genre">{genreText}</p>
                                  {/* Убрали поля Director и Description */}
                                  {/* <p className="playlist-movie-description">…</p> */}
                                  {/* <p className="playlist-movie-director">…</p> */}

                                  <p className="playlist-movie-year">
                                    Year: {movie.year || movie.releaseYear || 'Unknown'}
                                  </p>
                                </div>
                              </div>
                            </div>
                        );
                      })}

                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <EditPlaylistModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            currentTitle={playlistTitle}
            onSave={handleSaveTitle}
        />
      </div>
  );
};

export default PlaylistDetails;