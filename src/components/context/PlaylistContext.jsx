import React, { createContext, useState, useContext } from 'react';

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([
    { id: 1, title: 'Sci-Fi Collection', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 2, title: 'Oscar Winners', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 3, title: 'Horror Classics', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 4, title: 'Documentaries', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 5, title: 'Animation Movies', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 6, title: 'Comedy Favorites', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 7, title: 'Action Movies', posterUrl: '/assets/icon_playlist.jpg' },
    { id: 8, title: 'Drama Collection', posterUrl: '/assets/icon_playlist.jpg' }
  ]);

  const addPlaylist = (newPlaylist) => {
    setPlaylists([...playlists, newPlaylist]);
  };

  return (
    <PlaylistContext.Provider value={{ playlists, setPlaylists, addPlaylist }}>
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