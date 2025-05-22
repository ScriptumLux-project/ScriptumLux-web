import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { MdDeleteOutline } from 'react-icons/md';
import './Playlists.css';
import NewPlaylistModal from '../../modals/NewPlaylistModal';
import { useAuth } from '../../context/AuthContext';
import { usePlaylists } from '../../context/PlaylistContext';
import { useMovies } from '../../context/MovieContext';
import { getPlaylists, createPlaylist, addMovieToPlaylist, deletePlaylist } from '../../../api';

const Playlists = () => {
    const { currentUser } = useAuth();
    const { playlists, setPlaylists } = usePlaylists();
    const { movies } = useMovies();

    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchPlaylists = async () => {
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
            } catch (err) {
                console.error("Error fetching playlists:", err);
                setError("Failed to load playlists. Please try again later.");
                setIsLoading(false);
            }
        };

        fetchPlaylists();
    }, [currentUser]);

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

    if (isLoading) {
        return <div className="playlists-loading">Loading playlists...</div>;
    }

    return (
        <div className="playlists-page">
            <div className="playlists-container">
                <Link to="/account" className="back-link">
                    <span className="back-icon">
                        <IoIosArrowBack />
                    </span>
                    Back
                </Link>

                <div className="playlists-header">
                    <h1 className="playlists-title">Playlists</h1>
                    <div className="playlists-buttons">
                        <button onClick={openNewPlaylistModal} className="playlists-create-btn">
                            + Create
                        </button>
                    </div>
                </div>

                {error && <div className="playlists-error">{error}</div>}

                <div className="playlists-grid">
                    {userPlaylists.length > 0 ? (
                        userPlaylists.map((playlist) => {
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
                        <div className="no-playlists-message">
                            <p>You don't have any playlists yet.</p>
                        </div>
                    )}
                </div>
            </div>

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

export default Playlists;