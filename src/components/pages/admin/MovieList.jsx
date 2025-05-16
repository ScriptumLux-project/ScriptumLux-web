import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersList.css'; 
import { IoArrowBack } from "react-icons/io5";
import { mockMovies } from '../../../mockData/data'; 
import { FaRegTrashAlt } from "react-icons/fa";
import {useState} from 'react';

const MovieList = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState(mockMovies);

  const handleDeleteMovie = (movieId) => {
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    setMovies(updatedMovies);
  };

  const handleBackClick = () => {
    navigate('/dashboard'); 
  };

  const formatGenres = (genres) => {
    return genres.map(genre => genre.name).join(', ');
  };

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