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
      getUserHistory,       // ← сюда
      deleteHistoryItem,    // ← необязательно, если будете удалять из истории
  clearUserHistory      // ← необязательно, если будете очищать всю историю
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

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchUserPlaylists = async () => {
            try {
                setIsLoading(true);
                const allPlaylists = await getPlaylists();

                if (currentUser && currentUser.id) {
                    const userPlaylistsData = allPlaylists.filter(
                        playlist => playlist.userId === currentUser.id
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
            if (!currentUser?.id) return;
            try {
                setIsLoading(true);
                const historyData = await getUserHistory(currentUser.id);
                // Если ваш API сразу возвращает детали фильма, можно сразу setHistoryMovies(historyData).
                // Если нет — нужно дополнительно оборачивать в { movieId, viewedAt, movie: {...} }
                setHistoryMovies(historyData);
            } catch (error) {
                console.error("Error fetching user history:", error);
                setError("Failed to load history. Please try again later.");
            } finally {
                setIsLoading(false);
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
            let userId = null;

            // 1. Попробуем из currentUser
            if (currentUser?.id !== undefined) {
                userId = currentUser.id;
            } else if (currentUser?.userId !== undefined) {
                userId = currentUser.userId;
            } else if (currentUser?.user_id !== undefined) {
                userId = currentUser.user_id;
            }

            // 2. Если не нашли в currentUser, попробуем localStorage
            if (userId === null) {
                try {
                    const userFromStorage = localStorage.getItem('user');
                    console.log('▶️ handleCreatePlaylist ➔ userFromStorage raw:', userFromStorage);

                    if (userFromStorage && userFromStorage !== 'undefined') {
                        const parsedUser = JSON.parse(userFromStorage);
                        console.log('▶️ handleCreatePlaylist ➔ parsedUser:', parsedUser);

                        userId = parsedUser.id || parsedUser.userId || parsedUser.user_id;
                    }
                } catch (storageError) {
                    console.error('Error parsing user from localStorage:', storageError);
                }
            }

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

    const displayPlaylists = userPlaylists.slice(0, 4);
    const displayHistory = historyMovies.slice(0, 8);

    if (isLoading) {
        return <div className="playlists-loading">Loading playlists...</div>;
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

                    {/* History grid */}
                    <div className="history-movies account-history-grid">
                        {displayHistory.length > 0 ? (
                            displayHistory.map(historyItem => {
                                const movie = historyItem.movie || movies.find(m => m.id === historyItem.movieId);

                                if (!movie) return null;

                                return (
                                    <div key={historyItem.id} className="account-history-item">
                                        <Link to={`/movies/${movie.id}`}>
                                            <img src={movie.posterUrl} alt={movie.title} className="history-movie-poster" />
                                            <h3 className="account-card-title">{movie.title}</h3>
                                        </Link>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-items-message">No history available</p>
                        )}
                    </div>
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