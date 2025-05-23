import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist, addMovieToPlaylist } from '../../api';

const DEFAULT_POSTER_URL = '/assets/icon_playlist.jpg';

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addDefaultPoster = (playlistData) => {
    if (Array.isArray(playlistData)) {
      return playlistData.map(playlist => ({
        ...playlist,
        posterUrl: playlist.posterUrl || DEFAULT_POSTER_URL
      }));
    }
    return {
      ...playlistData,
      posterUrl: playlistData.posterUrl || DEFAULT_POSTER_URL
    };
  };

  // Функция для обновления плейлистов (используем useCallback для стабильной ссылки)
  const refreshPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Refreshing playlists...');

      const data = await getPlaylists();
      console.log('🔄 Playlists data received:', data);

      const playlistsWithPosters = addDefaultPoster(data);
      setPlaylists(playlistsWithPosters);

      console.log('🔄 Playlists updated successfully');
    } catch (error) {
      console.error('🔄 Error refreshing playlists:', error);
      setError(error.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, []); // Пустой массив зависимостей, так как функция не зависит от внешних переменных

  // Загружаем плейлисты при инициализации
  useEffect(() => {
    refreshPlaylists();
  }, [refreshPlaylists]); // Теперь refreshPlaylists в зависимостях

  const addNewPlaylist = async (title, firstMovieId = null) => {
    try {
      console.log('➕ Creating new playlist:', { title, firstMovieId });

      const pl = await createPlaylist(title, firstMovieId);
      const playlistWithPoster = addDefaultPoster(pl);

      setPlaylists(prev => [...prev, playlistWithPoster]);
      console.log('➕ Playlist created successfully:', playlistWithPoster);

      return playlistWithPoster;
    } catch (error) {
      console.error('➕ Error creating playlist:', error);
      throw error;
    }
  };

  const removePlaylist = async (id) => {
    try {
      console.log('🗑️ Removing playlist:', id);

      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(p =>
          p.id !== id && p.playlistId !== id
      ));

      console.log('🗑️ Playlist removed successfully');
    } catch (error) {
      console.error('🗑️ Error removing playlist:', error);
      throw error;
    }
  };

  const renamePlaylist = async (id, newTitle) => {
    try {
      console.log('📝 Renaming playlist:', { id, newTitle });

      // Обновляем через API - используем правильное поле name вместо title
      const pl = await updatePlaylist(id, { name: newTitle });
      const playlistWithPoster = addDefaultPoster(pl);

      setPlaylists(prev => prev.map(p => {
        const isTarget = p.id === id || p.playlistId === id;
        return isTarget ? { ...playlistWithPoster, name: newTitle, title: newTitle } : p;
      }));

      console.log('📝 Playlist renamed successfully');
      return playlistWithPoster;
    } catch (error) {
      console.error('📝 Error renaming playlist:', error);
      throw error;
    }
  };

  const addToPlaylist = async (playlistId, movieId) => {
    try {
      console.log('🎬 Adding movie to playlist:', { playlistId, movieId });

      await addMovieToPlaylist(playlistId, movieId);

      // Обновляем счетчик фильмов в плейлисте
      setPlaylists(prev => prev.map(p => {
        const isTarget = p.id === playlistId || p.playlistId === playlistId;
        if (isTarget) {
          return {
            ...p,
            movieCount: (p.movieCount || 0) + 1,
            movies: (p.movies || 0) + 1 // для совместимости
          };
        }
        return p;
      }));

      console.log('🎬 Movie added to playlist successfully');
    } catch (error) {
      console.error('🎬 Error adding movie to playlist:', error);
      throw error;
    }
  };

  // Функция для обновления конкретного плейлиста в состоянии
  const updatePlaylistInState = (playlistId, updatedData) => {
    setPlaylists(prev => prev.map(playlist => {
      const isTarget = playlist.id === playlistId || playlist.playlistId === playlistId;
      return isTarget ? { ...playlist, ...updatedData } : playlist;
    }));
  };

  return (
      <PlaylistContext.Provider value={{
        playlists,
        loading,
        error,
        setPlaylists, // добавляем для прямого управления состоянием
        refreshPlaylists, // новая функция для обновления
        addNewPlaylist,
        removePlaylist,
        renamePlaylist,
        addToPlaylist,
        updatePlaylistInState // новая функция для обновления состояния
      }}>
        {children}
      </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};