import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersList.css'; 
import { IoArrowBack } from "react-icons/io5";
import { FaRegTrashAlt } from "react-icons/fa";
import { useMovies } from '../../context/MovieContext';
import { deleteMovie } from '../../../api';

const MovieList = () => {
  const navigate = useNavigate();
  const { movies: apiMovies, loading, error } = useMovies(); 
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (apiMovies) {
      const normalized = apiMovies.map(movie => ({
        ...movie,
        id: movie.id ?? movie.movieId,
      }));
      setMovies(normalized);
    }
  }, [apiMovies]);

  const handleDeleteMovie = async (movieId) => {
    if (!movieId) {
      console.error('Invalid movie ID:', movieId);
      return;
    }

    try {
      console.log('Deleting movie with ID:', movieId);
      await deleteMovie(movieId);
      
      const updatedMovies = movies.filter(movie => movie.id !== movieId);
      setMovies(updatedMovies);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data || error.message;
      console.error(`Error deleting movie (status ${status}):`, message);
      alert(`Failed to delete movie. Server responded with status ${status}`);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard'); 
  };

  const formatGenres = (genres) => {
    if (!genres) return 'N/A';
    return genres.map(genre => genre.name).join(', ');
  };

  if (loading) {
    return (
      <div className="admin-users-list-container">
        <div className="admin-users-list-content">
          <div className="admin-users-list-header">
            <h1>Loading movies...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-list-container">
        <div className="admin-users-list-content">
          <div className="admin-users-list-header">
            <h1>Error loading movies: {error}</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-list-container">
      <div className="admin-users-list-content">
        <div className="admin-users-list-header">
          <button className="back-button" onClick={handleBackClick}>
            <IoArrowBack /> Back
          </button>
          <div>
            <h1>List of Movies</h1>
            <div className="admin-header-underline"></div>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Year</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(movie => (
                <tr key={movie.id}>
                  <td>{movie.title}</td>
                  <td>{movie.year}</td>
                  <td>{formatGenres(movie.genres)}</td>
                  <td>{movie.rating || 'N/A'}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteMovie(movie.id)}
                    >
                      Delete <FaRegTrashAlt /> 
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovieList;