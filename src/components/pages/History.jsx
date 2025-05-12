import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiDeleteBinLine } from 'react-icons/ri';
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import { mockMovies } from '../../mockData/data';
import './History.css';

const History = () => {
  const [historyMovies, setHistoryMovies] = useState(mockMovies); 

  const deleteMovie = (id) => {
    setHistoryMovies(historyMovies.filter(movie => movie.id !== id));
  };

  const deleteHistory = () => {
    setHistoryMovies([]);
  };

  return (
    <div className="history-page">
      <div className="history-container">
        <Link to="/account" className="back-link">
          <span className="back-icon">
            <IoIosArrowBack />
          </span>
          Back
        </Link>
        <div className="history-header">
          <h1 className="history-title">History</h1>
          <div className="history-buttons">
            <button onClick={deleteHistory} className="history-delete-btn">
              <RiDeleteBinLine className="history-delete-icon" /> Delete History
            </button>
          </div>
        </div>

        <div className="history-movies">
          {historyMovies.map(movie => (
            <div key={movie.id} className="history-movie">
              <div className="history-movie-content">
                <img src={movie.posterUrl} alt={movie.title} className="history-movie-poster" />
                <div className="history-movie-details">
                  <div className="history-movie-title-container">
                    <h3 className="history-movie-title">{movie.title}</h3>
                    <RxCross2  
                      className="history-movie-delete" 
                      onClick={() => deleteMovie(movie.id)} 
                    />
                  </div>
                  <p className="history-movie-genre">{movie.genres.map(genre => genre.name).join(', ')}</p>
                  <p className="history-movie-description">{movie.description}</p>
                  <p className="history-movie-director">Director: {movie.director}</p>
                  <p className="history-movie-year">Year: {movie.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;