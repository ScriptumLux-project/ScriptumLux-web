import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegTrashAlt } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import { useAuth } from '../../context/AuthContext';
import { useMovies } from '../../context/MovieContext';
import './History.css';

const History = () => {
  const { currentUser } = useAuth();
  const { movies } = useMovies();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setIsLoading(true);
        
        if (movies && movies.length > 0 && currentUser) {
         
          const mockHistory = movies.map((movie, index) => ({
            userId: currentUser.id,
            movieId: movie.id,
            viewedAt: new Date(Date.now() - index * 86400000).toISOString(), 
          
            movie: movie
          }));
          
          setHistoryItems(mockHistory);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchUserHistory();
  }, [currentUser, movies]);

  const deleteHistoryItem = (movieId, viewedAt) => {
    setHistoryItems(historyItems.filter(item => 
      !(item.movieId === movieId && item.viewedAt === viewedAt)
    ));
  };

  const deleteAllHistory = () => {
    setHistoryItems([]);
  };

  if (isLoading) {
    return <div className="history-loading">Loading history...</div>;
  }

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
            <button 
              onClick={deleteAllHistory} 
              className="history-delete-btn"
              disabled={historyItems.length === 0}
            >
              <FaRegTrashAlt className="history-delete-icon" /> Delete History
            </button>
          </div>
        </div>

        {error && <div className="history-error">{error}</div>}

        <div className="history-movies">
          {historyItems.length > 0 ? (
            historyItems.map(item => {
              const movie = item.movie || movies.find(m => m.id === item.movieId);
              
              if (!movie) return null;
              
              const formattedDate = new Date(item.viewedAt).toLocaleDateString();
              
              return (
                <div key={`${item.movieId}-${item.viewedAt}`} className="history-movie">
                  <div className="history-movie-content">
                    <img src={movie.posterUrl} alt={movie.title} className="history-movie-poster" />
                    <div className="history-movie-details">
                      <div className="history-movie-title-container">
                        <h3 className="history-movie-title">{movie.title}</h3>
                        <div className="history-movie-metadata">
                          <span className="history-view-date">Viewed on: {formattedDate}</span>
                          <RxCross2  
                            className="history-movie-delete" 
                            onClick={() => deleteHistoryItem(item.movieId, item.viewedAt)} 
                          />
                        </div>
                      </div>
                      {movie.genres && (
                        <p className="history-movie-genre">
                          {movie.genres.map(genre => genre.name).join(', ')}
                        </p>
                      )}
                      <p className="history-movie-description">{movie.description}</p>
                      {movie.director && <p className="history-movie-director">Director: {movie.director}</p>}
                      {movie.year && <p className="history-movie-year">Year: {movie.year}</p>}
                      <Link to={`/movies/${movie.id}`} className="history-movie-watch-btn">
                        Watch Again
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-history-message">
              <p>Your history is empty</p>
              <Link to="/" className="browse-movies-btn">Browse Movies</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;