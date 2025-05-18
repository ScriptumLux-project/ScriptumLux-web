import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import './Playlists.css';
import NewPlaylistModal from '../../modals/NewPlaylistModal';
import { useAuth } from '../../context/AuthContext';
import { getPlaylists, createPlaylist, addMovieToPlaylist } from '../../../api';

const Playlists = () => {
    const { currentUser } = useAuth();
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
            if (!currentUser || !currentUser.id) {
                throw new Error("User must be logged in to create a playlist");
            }

            const response = await createPlaylist(playlistName, firstMovieId);
            
            const newPlaylist = {
                id: response.id,
                title: playlistName,
                name: playlistName, 
                userId: currentUser.id,
                posterUrl: '/assets/icon_playlist.jpg',
                ...response 
            };
            
            // If a first movie was specified and not included in initial creation
            if (firstMovieId && !response.movies) {
                try {
                    await addMovieToPlaylist(newPlaylist.id, firstMovieId);
                } catch (addError) {
                    console.error("Error adding first movie to playlist:", addError);
                }
            }
            
            // Add to state
            setUserPlaylists(prev => [...prev, newPlaylist]);
            closeNewPlaylistModal();
        } catch (err) {
            console.error("Error creating playlist:", err);
            alert("Failed to create playlist. Please try again.");
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
                        userPlaylists.map((playlist) => (
                            <div key={playlist.id} className="playlist-card">
                                <div className="playlist-card-bg"></div>
                                <div className="playlist-card-bg-white"></div>
                                <div className="playlist-card-wrapper">
                                    <Link to={`/playlists/${playlist.id}`}>
                                        <img 
                                            src="/assets/icon_playlist.jpg" 
                                            alt={playlist.title || playlist.name} 
                                            className="playlist-poster" 
                                        />
                                        <h3 className="playlist-card-title">{playlist.title || playlist.name}</h3>
                                    </Link>
                                </div>
                            </div>
                        ))
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
                    movieTitle="None selected"
                    onPlaylistCreate={handleCreatePlaylist}
                />
            )}
        </div>
    );
};

export default Playlists;