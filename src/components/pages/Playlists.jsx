import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Playlists.css';
import { IoIosArrowBack } from "react-icons/io";
import NewPlaylistModal from '../modals/NewPlaylistModal';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([
    { id: 1, title: 'Sci-Fi Collection', posterUrl: '/posters/playlist1.jpg' },
    { id: 2, title: 'Oscar Winners', posterUrl: '/posters/playlist2.jpg' },
    { id: 3, title: 'Horror Classics', posterUrl: '/posters/playlist3.jpg' },
    { id: 4, title: 'Documentaries', posterUrl: '/posters/playlist4.jpg' },
    { id: 5, title: 'Animation Movies', posterUrl: '/posters/playlist5.jpg' },
    { id: 6, title: 'Comedy Favorites', posterUrl: '/posters/playlist6.jpg' },
    { id: 7, title: 'Action Movies', posterUrl: '/posters/playlist7.jpg' },
    { id: 8, title: 'Drama Collection', posterUrl: '/posters/playlist8.jpg' }
  ]);

  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);  //reset scroll position*
  }, []);

  const openNewPlaylistModal = () => setIsNewPlaylistModalOpen(true);
  const closeNewPlaylistModal = () => setIsNewPlaylistModalOpen(false);

  const handleCreatePlaylist = (newPlaylistName) => {
    const newPlaylist = {
      id: playlists.length + 1,
      title: newPlaylistName,
      posterUrl: '/posters/default.jpg', 
    };
    setPlaylists([...playlists, newPlaylist]);
    closeNewPlaylistModal();
  };

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

        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-card">
              <Link to={`/playlists/${playlist.id}`}>
                <img src={playlist.posterUrl} alt={playlist.title} className="playlist-poster" />
                <h3 className="playlist-card-title">{playlist.title}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {isNewPlaylistModalOpen && (
        <NewPlaylistModal
          isOpen={isNewPlaylistModalOpen}
          onClose={closeNewPlaylistModal}
          movieTitle="None selected"
          onPlaylistCreate={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

export default Playlists;
