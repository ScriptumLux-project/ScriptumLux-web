import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { MdHistory } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";
import { mockMovies } from '../../../mockData/data';
import { usePlaylists } from '../../context/PlaylistContext';
import EditPlaylistModal from '../../modals/EditPlaylistModal'; 
import DropdownMenu from '../../modals/DropdownMenu';
import PlaylistModal from '../../modals/PlaylistModal';

import './PlaylistDetails.css';

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const { playlists, setPlaylists } = usePlaylists();
  const [playlistMovies, setPlaylistMovies] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  
  //+*
  const [dropdownStates, setDropdownStates] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState(null);

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedMovieForPlaylist, setSelectedMovieForPlaylist] = useState(null);
  
  const currentPlaylist = playlists.find(playlist => playlist.id === parseInt(playlistId));
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    setPlaylistMovies(mockMovies.slice(0, 3));
  }, [playlistId]);
  
  const deletePlaylist = () => {
    setPlaylists(playlists.filter(playlist => playlist.id !== parseInt(playlistId)));
    navigate('/playlists');
  };

  const handleSaveTitle = (newTitle) => {
    const updatedPlaylists = playlists.map((playlist) =>
      playlist.id === parseInt(playlistId)
        ? { ...playlist, title: newTitle }
        : playlist
    );
    setPlaylists(updatedPlaylists);
  };
  
  const toggleDropdown = (movieId, event) => {
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 150
    };
    
    setDropdownPosition(position);
    
    setDropdownStates(prev => ({
      ...prev,
      [movieId]: !prev[movieId]
    }));
    
    Object.keys(dropdownStates).forEach(id => {
      if (id !== movieId.toString() && dropdownStates[id]) {
        setDropdownStates(prev => ({
          ...prev,
          [id]: false
        }));
      }
    });
  };
  
  const closeAllDropdowns = () => {
    setDropdownStates({});
  };
  
  //---------------------------------------------------------------------//*
  const handleRemoveFromPlaylist = (movieId) => {
    console.log(`Remove movie ${movieId} from playlist ${playlistId}`);
    setPlaylistMovies(playlistMovies.filter(movie => movie.id !== movieId));
  };
  
  const handleAddToHistory = (movieId) => {
    console.log(`Add movie ${movieId} to history`);
  };
  
  const handleAddToAnotherPlaylist = (movieId) => {
    const movie = playlistMovies.find(movie => movie.id === movieId);
    setSelectedMovieForPlaylist(movie);
    setIsPlaylistModalOpen(true);
  };
  //---------------------------------------------------------------------//*

  if (!currentPlaylist) {
    return <div className="playlist-details-page">Playlist not found</div>;
  }
  
  return (        
    <div className="playlist-details-page">
      <div className="playlist-details-container">
        <Link to="/playlists" className="back-link">
          <span className="back-icon">
            <IoIosArrowBack />
          </span>
          Back
        </Link>

        <div className="playlist-details-header">
          <h1 className="playlist-details-title">Playlist</h1>
        </div>
        
        <div className="playlist-details-content">
          <div className="playlist-details-main">
            <div className="playlist-holder">
              <img src={currentPlaylist.posterUrl} alt={currentPlaylist.title} className="playlist-holder-image" />
              <h3 className="playlist-holder-title">{currentPlaylist.title}</h3>
              <div className="playlist-holder-buttons">
                <button className="button button-edit" onClick={() => setIsEditModalOpen(true)}>
                  <MdModeEdit /> Edit
                </button>
                <button className="button button-delete" onClick={deletePlaylist}>
                  <FaRegTrashAlt /> Delete
                </button>
              </div>
            </div>
          </div>

          <div className="playlist-details-side">
            <div className="playlist-movies-list">
              {playlistMovies.length === 0 ? (
                <p className="no-movies-message">No movies in this playlist yet</p>
              ) : (
                <div className="playlist-movies">
                  {playlistMovies.map(movie => (
                    <div key={movie.id} className="playlist-movie-item">
                      <div className="playlist-movie-content">
                        <img src={movie.posterUrl} alt={movie.title} className="playlist-movie-poster" />
                        <div className="playlist-movie-details">
                          <div className="playlist-movie-title-container">
                            <h3 className="playlist-movie-title">{movie.title}</h3>
                            <BsThreeDotsVertical 
                              className="playlist-movie-remove" 
                              onClick={(e) => toggleDropdown(movie.id, e)}
                            />
                            
                            <DropdownMenu 
                              isOpen={dropdownStates[movie.id] || false}
                              onClose={closeAllDropdowns}
                              position={dropdownPosition}
                              options={[
                                {
                                  label: `Delete from Playlist "${currentPlaylist.title}"`,
                                  icon: <FiTrash2 />,
                                  onClick: () => handleRemoveFromPlaylist(movie.id)
                                },
                                {
                                  label: "Add to History",
                                  icon: <MdHistory />,
                                  onClick: () => handleAddToHistory(movie.id)
                                },
                                {
                                  label: "Add to another Playlist",
                                  icon: <MdPlaylistAdd />,
                                  onClick: () => handleAddToAnotherPlaylist(movie.id)
                                }
                              ]}
                            />
                          </div>
                          <p className="playlist-movie-genre">{movie.genres.map(genre => genre.name).join(', ')}</p>
                          <p className="playlist-movie-description">{movie.description}</p>
                          <p className="playlist-movie-director">Director: {movie.director}</p>
                          <p className="playlist-movie-year">Year: {movie.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <EditPlaylistModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentTitle={currentPlaylist.title}
        onSave={handleSaveTitle}
      />

{selectedMovieForPlaylist && (
        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => {
            setIsPlaylistModalOpen(false);
            setSelectedMovieForPlaylist(null);
          }}
          movieTitle={selectedMovieForPlaylist.title}
        />
      )}
    </div>
  );
};

export default PlaylistDetails;