import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiAccountCircleLine } from 'react-icons/ri';
import { IoTrashOutline } from 'react-icons/io5';
import { MdDeleteOutline } from 'react-icons/md';
import './Account.css';
import './Playlists.css';
import './History.css';
import { useMovies } from '../../context/MovieContext';
import { usePlaylists } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import NewPlaylistModal from '../../modals/NewPlaylistModal';
import {
    getPlaylists,
    createPlaylist,
    addMovieToPlaylist,
    deletePlaylist,
    getUserHistory,
    getMovieDetails,
    deleteHistoryItem,
    clearUserHistory
} from '../../../api.js';

const Account = () => {
    const { movies } = useMovies();
    const { playlists, setPlaylists } = usePlaylists();
    const { currentUser } = useAuth();

    const [avatar, setAvatar] = useState(null);
    const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [historyMovies, setHistoryMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);

    // Универсальная функция для получения userId
    const getCurrentUserId = () => {
        try {
            // Сначала пробуем получить из currentUser
            if (currentUser?.id) {
                return parseInt(currentUser.id);
            }

            // Затем из localStorage
            const userFromStorage = localStorage.getItem('user');
            if (userFromStorage && userFromStorage !== 'undefined') {
                const userData = JSON.parse(userFromStorage);
                const userId = userData.id || userData.userId || userData.user_id;
                if (userId) {
                    return parseInt(userId);
                }
            }

            // Если не нашли в user, пробуем получить из токена
            const token = localStorage.getItem('accessToken');
            if (token && token !== 'undefined') {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.sub || payload.userId || payload.user_id || payload.id;
                    if (userId) {
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

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchUserPlaylists = async () => {
            try {
                setIsLoading(true);
                const allPlaylists = await getPlaylists();
                const userId = getCurrentUserId();

                if (userId) {
                    const userPlaylistsData = allPlaylists.filter(
                        playlist => playlist.userId === userId
                    );
                    setUserPlaylists(userPlaylistsData);
                } else {
                    setUserPlaylists(allPlaylists);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching user playlists:", error);
                setError("Failed to load playlists. Please try again later.");
                setIsLoading(false);
            }
        };

        const fetchUserHistory = async () => {
            const userId = getCurrentUserId();
            console.log('📺 Fetching history for user ID:', userId);

            if (!userId) {
                console.log('📺 No user ID found, skipping history fetch');
                setHistoryLoading(false);
                return;
            }

            try {
                setHistoryLoading(true);
                setHistoryError(null);

                // Получаем историю пользователя
                const historyData = await getUserHistory(userId);
                console.log('📺 Raw history data:', historyData);

                if (!Array.isArray(historyData) || historyData.length === 0) {
                    console.log('📺 No history found for user');
                    setHistoryMovies([]);
                    setHistoryLoading(false);
                    return;
                }

                // Для каждой записи в истории получаем детали фильма
                const moviesWithDetails = await Promise.allSettled(
                    historyData.slice(0, 8).map(async (historyItem) => { // Берем только первые 8 для Account
                        try {
                            console.log('📺 Loading movie details for:', historyItem.movieId);
                            const movieDetails = await getMovieDetails(historyItem.movieId);

                            return {
                                ...movieDetails,
                                // Добавляем информацию из истории
                                userId: historyItem.userId,
                                movieId: historyItem.movieId,
                                viewedAt: historyItem.viewedAt,
                                historyId: historyItem.id,
                                // Убираем description для экономии памяти
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
                console.error('Error fetching user history:', error);
                setHistoryError("Failed to load history. Please try again later.");
            } finally {
                setHistoryLoading(false);
            }
        };

        fetchUserPlaylists();
        fetchUserHistory();
    }, [currentUser, movies]);

    const openNewPlaylistModal = () => setIsNewPlaylistModalOpen(true);
    const closeNewPlaylistModal = () => setIsNewPlaylistModalOpen(false);

    const handleCreatePlaylist = async (playlistName, firstMovieId = null) => {
        try {
            console.log('▶️ handleCreatePlaylist ➔ currentUser:', currentUser);
            console.log('▶️ handleCreatePlaylist ➔ currentUser full object:', JSON.stringify(currentUser, null, 2));

            // Попытаемся получить ID пользователя из разных источников
            let userId = getCurrentUserId();

            console.log('▶️ handleCreatePlaylist ➔ final userId:', userId);

            // Проверяем, что получили валидный ID
            if (userId === null || userId === undefined) {
                // Показываем детальную информацию для отладки
                console.error('❌ User ID debugging info:', {
                    currentUser,
                    localStorage_user: localStorage.getItem('user'),
                    available_keys: currentUser ? Object.keys(currentUser) : 'no currentUser'
                });
                throw new Error("User ID is missing. Please check if you are logged in correctly.");
            }

            console.log('▶️ handleCreatePlaylist ➔ creating playlist with name:', playlistName,
                'firstMovieId:', firstMovieId);

            // Вызываем API
            const response = await createPlaylist(playlistName, firstMovieId);
            console.log('▶️ handleCreatePlaylist ➔ createPlaylist response:', response);

            // Проверяем ID в ответе (бэкенд возвращает PlaylistId)
            const returnedId = response.playlistId || response.PlaylistId || response.id;
            console.log('▶️ handleCreatePlaylist ➔ returned playlist ID:', returnedId);

            if (!returnedId) {
                throw new Error('Playlist creation failed: no ID in response');
            }

            // Создаем объект плейлиста
            const newPlaylist = {
                id: returnedId,
                title: playlistName,
                name: playlistName,
                userId: userId,
                posterUrl: '/assets/icon_playlist.jpg',
                ...response
            };
            console.log('▶️ handleCreatePlaylist ➔ newPlaylist object:', newPlaylist);

            // Обновляем список плейлистов
            setUserPlaylists(prev => [...prev, newPlaylist]);

            // Также обновляем глобальный контекст, если нужно
            if (setPlaylists) {
                setPlaylists(prev => [...prev, newPlaylist]);
            }

            closeNewPlaylistModal();
            console.log('▶️ handleCreatePlaylist ➔ playlist creation flow finished');

        } catch (error) {
            console.error("❌ Error creating playlist in handleCreatePlaylist:", error);
            alert(`Failed to create playlist: ${error.message}`);
        }
    };

    const handleDeletePlaylist = async (playlistId, playlistName) => {
        console.log('🗑️ handleDeletePlaylist called with:', { playlistId, playlistName });

        // Подтверждение удаления
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the playlist "${playlistName}"?\n\nThis action cannot be undone.`
        );

        if (!isConfirmed) {
            console.log('🗑️ Delete cancelled by user');
            return;
        }

        try {
            setDeletingPlaylistId(playlistId);
            console.log('🗑️ Deleting playlist with ID:', playlistId);

            // Вызываем API для удаления
            await deletePlaylist(playlistId);
            console.log('🗑️ Playlist deleted successfully');

            // Обновляем локальный список плейлистов
            setUserPlaylists(prev => prev.filter(playlist => {
                const currentId = playlist.id || playlist.playlistId || playlist.PlaylistId;
                return currentId !== playlistId;
            }));

            // Также обновляем глобальный контекст
            if (setPlaylists) {
                setPlaylists(prev => prev.filter(playlist => {
                    const currentId = playlist.id || playlist.playlistId || playlist.PlaylistId;
                    return currentId !== playlistId;
                }));
            }

            console.log('🗑️ Playlist removed from state');

        } catch (error) {
            console.error('🗑️ Error deleting playlist:', error);

            let errorMessage = 'Failed to delete playlist. Please try again.';

            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Playlist not found. It may have been already deleted.';
                    // Удаляем из локального состояния, даже если сервер вернул 404
                    setUserPlaylists(prev => prev.filter(playlist => {
                        const currentId = playlist.id || playlist.playlistId || playlist.PlaylistId;
                        return currentId !== playlistId;
                    }));
                } else if (error.response.status === 403) {
                    errorMessage = 'You do not have permission to delete this playlist.';
                } else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            alert(errorMessage);
        } finally {
            setDeletingPlaylistId(null);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl);
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

    const displayPlaylists = userPlaylists.slice(0, 4);
    const displayHistory = historyMovies.slice(0, 8);

    if (isLoading) {
        return <div className="playlists-loading">Loading...</div>;
    }

    return (
        <div className="account-page">
            <div className="account-container">
                <h1 className="account-title">Your Profile</h1>

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
                        <div className="account-detail">{currentUser?.name || 'User'}</div>
                        <div className="account-detail">{currentUser?.email || 'Email not available'}</div>
                        <div className="account-detail">{currentUser?.role === 'admin' ? 'Administrator' : 'User'}</div>
                    </div>
                </div>

                {/* History Section */}
                <div className="account-section">
                    <div className="account-section-header">
                        <h2 className="account-section-title">History</h2>
                        <Link to="/history" className="account-seeall-btn">See All</Link>
                    </div>

                    {/* History Content */}
                    {historyLoading ? (
                        <div className="history-loading">
                            <p>Loading your viewing history...</p>
                        </div>
                    ) : historyError ? (
                        <div className="history-error">
                            <p>{historyError}</p>
                        </div>
                    ) : displayHistory.length > 0 ? (
                        <div className="history-movies account-history-grid">
                            {displayHistory.map(movie => {
                                const uniqueKey = `${movie.userId}-${movie.movieId}`;
                                return (
                                    <div key={uniqueKey} className="account-history-item">
                                        <Link to={`/movies/${movie.movieId}`}>
                                            <img
                                                src={movie.posterUrl || '/placeholder-poster.jpg'}
                                                alt={movie.title}
                                                className="history-movie-poster"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-poster.jpg';
                                                }}
                                            />
                                            <div className="history-item-info">
                                                <h3 className="account-card-title">
                                                    {movie.title}
                                                    {movie.isPlaceholder && (
                                                        <span className="placeholder-indicator"> (Loading...)</span>
                                                    )}
                                                </h3>
                                                {movie.viewedAt && (
                                                    <p className="history-viewed-time">
                                                        {formatViewedAt(movie.viewedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-history">
                            <p>Your viewing history is empty.</p>
                            <p>Start watching movies to see them here!</p>
                            <Link to="/" className="browse-movies-btn">
                                Browse Movies
                            </Link>
                        </div>
                    )}
                </div>

                {/* Playlists Section */}
                <div className="account-section">
                    <div className="account-section-header">
                        <h2 className="account-section-title">Playlists</h2>
                        <div className="account-buttons">
                            <button onClick={openNewPlaylistModal} className="account-create-btn">+ Create</button>
                            <Link to="/playlists" className="account-seeall-btn">See All</Link>
                        </div>
                    </div>

                    {/* Playlists grid */}
                    <div className="playlists-grid account-playlists-grid">
                        {displayPlaylists.length > 0 ? (
                            displayPlaylists.map(playlist => {
                                const playlistId = playlist.id || playlist.playlistId || playlist.PlaylistId;
                                const playlistName = playlist.title || playlist.name || playlist.Name;
                                const isDeleting = deletingPlaylistId === playlistId;

                                return (
                                    <div key={playlistId} className={`playlist-card ${isDeleting ? 'deleting' : ''}`}>
                                        <div className="playlist-card-bg"></div>
                                        <div className="playlist-card-bg-white"></div>

                                        {/* Кнопка удаления */}
                                        <button
                                            className="playlist-delete-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeletePlaylist(playlistId, playlistName);
                                            }}
                                            disabled={isDeleting}
                                            title={`Delete "${playlistName}" playlist`}
                                            aria-label={`Delete ${playlistName} playlist`}
                                        >
                                            {isDeleting ? (
                                                <div className="delete-spinner"></div>
                                            ) : (
                                                <MdDeleteOutline />
                                            )}
                                        </button>

                                        <div className="playlist-card-wrapper">
                                            <Link to={`/playlists/${playlistId}`}>
                                                <img
                                                    src="/assets/icon_playlist.jpg"
                                                    alt={playlistName}
                                                    className="playlist-poster"
                                                />
                                                <h3 className="playlist-card-title">{playlistName}</h3>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-items-message">No playlists available</p>
                        )}
                    </div>
                    {error && <div className="playlists-error">{error}</div>}
                </div>
            </div>

            {/* New Playlist Modal */}
            {isNewPlaylistModalOpen && (
                <NewPlaylistModal
                    isOpen={isNewPlaylistModalOpen}
                    onClose={closeNewPlaylistModal}
                    onPlaylistCreate={handleCreatePlaylist}
                    movies={movies || []}
                />
            )}
        </div>
    );
};

export default Account;