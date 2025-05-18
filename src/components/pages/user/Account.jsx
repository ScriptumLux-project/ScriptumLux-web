import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiAccountCircleLine } from 'react-icons/ri';
import './Account.css';
import './Playlists.css'; 
import './History.css'; 
import { useMovies } from '../../context/MovieContext'; 
import { usePlaylists } from '../../context/PlaylistContext';
import { useAuth } from '../../context/AuthContext';
import NewPlaylistModal from '../../modals/NewPlaylistModal';
import { getPlaylists, createPlaylist, addMovieToPlaylist } from '../../../api';

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
            try {
                if (movies && movies.length > 0) {
                    const mockHistory = movies.slice(0, 8).map(movie => ({
                        userId: currentUser?.id,
                        movieId: movie.id,
                        viewedAt: new Date().toISOString(),
                        movie: movie 
                    }));
                    setHistoryMovies(mockHistory);
                }
            } catch (error) {
                console.error("Error fetching user history:", error);
            }
        };

        fetchUserPlaylists();
        fetchUserHistory();
    }, [currentUser, movies]);
  
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
          
            if (firstMovieId && !response.movies) {
                try {
                    await addMovieToPlaylist(newPlaylist.id, firstMovieId);
                } catch (addError) {
                    console.error("Error adding first movie to playlist:", addError);
                }
            }
            
            setUserPlaylists(prev => [...prev, newPlaylist]);
            closeNewPlaylistModal();
        } catch (error) {
            console.error("Error creating playlist:", error);
            alert("Failed to create playlist. Please try again.");
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
                  <div key={`history-${historyItem.movieId}-${historyItem.viewedAt}`} className="account-history-item">
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
              displayPlaylists.map(playlist => (
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
          movieTitle="None selected"
          onPlaylistCreate={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

export default Account;