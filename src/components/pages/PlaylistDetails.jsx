import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { MdModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { mockMovies } from '../../mockData/data';
import { usePlaylists } from '../context/PlaylistContext';
import './PlaylistDetails.css';

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const { playlists, setPlaylists } = usePlaylists();
  const [playlistMovies, setPlaylistMovies] = useState([]);
  
  const currentPlaylist = playlists.find(playlist => playlist.id === parseInt(playlistId));
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    setPlaylistMovies(mockMovies.slice(0, 3));
  }, [playlistId]);
  
  
  const deletePlaylist = () => {
    setPlaylists(playlists.filter(playlist => playlist.id !== parseInt(playlistId)));
    window.location.href = '/playlists';
  };
  
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
  {/* Левая часть: холдер */}
  <div className="playlist-details-main">
    <div className="playlist-holder">
      <img src={currentPlaylist.posterUrl} alt={currentPlaylist.title} className="playlist-holder-image" />
      <h3 className="playlist-holder-title">{currentPlaylist.title}</h3>
      <div className="playlist-holder-buttons">
        <button className="edit-button">
          <MdModeEdit /> Edit
        </button>
        <button className="delete-button" onClick={deletePlaylist}>
          <FaRegTrashAlt /> Delete
        </button>
      </div>
    </div>
  </div>

  {/* Правая часть: фильмы */}
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
                    <BsThreeDotsVertical className="playlist-movie-remove" />
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
    </div>
  );
};

export default PlaylistDetails;