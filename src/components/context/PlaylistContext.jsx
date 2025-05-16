import React, { createContext, useState, useEffect, useContext } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist, addMovieToPlaylist } from '../../api';

const DEFAULT_POSTER_URL = '/assets/icon_playlist.jpg';

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    getPlaylists()
      .then(data => {
        const playlistsWithPosters = addDefaultPoster(data);
        setPlaylists(playlistsWithPosters);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addNewPlaylist = async (title, firstMovieId = null) => {
    const pl = await createPlaylist(title, firstMovieId);
    const playlistWithPoster = addDefaultPoster(pl);
    setPlaylists(prev => [...prev, playlistWithPoster]);
    return playlistWithPoster;
  };

  const removePlaylist = async (id) => {
    await deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const renamePlaylist = async (id, newTitle) => {
    const pl = await updatePlaylist(id, { title: newTitle });
    const playlistWithPoster = addDefaultPoster(pl);
    setPlaylists(prev => prev.map(p => p.id === id ? playlistWithPoster : p));
    return playlistWithPoster;
  };

  const addToPlaylist = async (playlistId, movieId) => {
    const pl = await addMovieToPlaylist(playlistId, movieId);
    const playlistWithPoster = addDefaultPoster(pl);
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return playlistWithPoster;
      }
      return p;
    }));
    return playlistWithPoster;
  };

  return (
    <PlaylistContext.Provider value={{
      playlists, loading,
      addNewPlaylist, removePlaylist,
      renamePlaylist, addToPlaylist
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);