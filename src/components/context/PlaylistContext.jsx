// src/components/context/PlaylistContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist, addMovieToPlaylist } from '../../api';

const PlaylistContext = createContext(null);

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading,    setLoading]  = useState(true);

  useEffect(() => {
    getPlaylists()
        .then(data => {
          setPlaylists(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
  }, []);

  const addNewPlaylist = async (title, firstMovieId = null) => {
    const pl = await createPlaylist(title, firstMovieId);
    setPlaylists(prev => [...prev, pl]);
    return pl;
  };

  const removePlaylist = async (id) => {
    await deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  const renamePlaylist = async (id, newTitle) => {
    const pl = await updatePlaylist(id, { title: newTitle });
    setPlaylists(prev => prev.map(p => p.id === id ? pl : p));
    return pl;
  };

  const addToPlaylist = async (playlistId, movieId) => {
    const pl = await addMovieToPlaylist(playlistId, movieId);
    // обновим локальный стейт: найдём плейлист и добавим movieId
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...pl }; // сервер вернёт обновлённый объект
      }
      return p;
    }));
    return pl;
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
