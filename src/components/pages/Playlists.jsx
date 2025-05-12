import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Playlists.css';
import { IoIosArrowBack } from "react-icons/io";
import NewPlaylistModal from '../modals/NewPlaylistModal';
import { usePlaylists } from '../context/PlaylistContext';

const Playlists = () => {
    const { playlists, setPlaylists } = usePlaylists();
      
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
            posterUrl: '/assets/icon_playlist.jpg', 
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
                            <div className="playlist-card-bg"></div>
                            <div className="playlist-card-bg-white"></div>
                            <div className="playlist-card-wrapper">
                                <Link to={`/playlists/${playlist.id}`}>
                                    <img src={playlist.posterUrl} alt={playlist.title} className="playlist-poster" />
                                    <h3 className="playlist-card-title">{playlist.title}</h3>
                                </Link>
                            </div>
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