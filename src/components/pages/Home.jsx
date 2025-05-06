import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';
import { RiArrowDropDownLine } from "react-icons/ri";
import { CiFilter } from "react-icons/ci";
import './Home.css';

const Home = () => {
  const { movies, loading, error } = useMovies();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchTerm(query);
  }, [location.search]);

  const handleShowInfo = (movie) => {
    navigate(`/movies/${movie.id}`);
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (movie.genres && movie.genres.some(genre => 
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  ).filter(movie => 
    (genreFilter ? movie.genres && movie.genres.some(genre => genre.name === genreFilter) : true) &&
    (yearFilter ? movie.year === yearFilter : true) &&
    (ratingFilter ? movie.rating >= ratingFilter : true)
  );
  
  if (loading) {
    return (
      <div className="loading">
        <p>Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="movies-container">
      <div className="content">
        <div className="movies-header">
          <h1 className="movies-title">Movies</h1>
          
          <div className="filter-section">
            
            <button 
              className="filter-btn"
              onClick={() => setGenreFilter(genreFilter ? '' : 'Action')}>
                Genre {genreFilter && `: ${genreFilter}`}
                <span>
                <RiArrowDropDownLine className="dropdown-icon" />
            </span>
            </button>

            <button 
              className="filter-btn"
              onClick={() => setYearFilter(yearFilter ? '' : '2020')}>
              Year {yearFilter}
              <span>
                <RiArrowDropDownLine className="dropdown-icon" />
            </span>
            </button>

            <button 
              className="filter-btn"
              onClick={() => setRatingFilter(ratingFilter ? '' : 7)}>
              Rating {ratingFilter}
              <span>
                <RiArrowDropDownLine className="dropdown-icon" />
            </span>
            </button>

            <button 
            className="filter-apply-btn" 
            onClick={() => console.log("Filter button clicked")}>
            Filter
                <CiFilter className="filter-icon" />
            </button>

        </div>
        </div>

        <div className="movies-grid">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={handleShowInfo} 
            />
          ))}
          
          {filteredMovies.length === 0 && (
            <div className="no-results">
              <p>No movies found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onClick }) => {
  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <img 
        src={movie.posterUrl} 
        alt={movie.title} 
        className="movie-poster" 
      />
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
        <div className="movie-meta-split">
  <div className="genres-left">
    {movie.genres && movie.genres.map((genre) => (
      <span key={genre.id}>{genre.name}</span>
    ))}
  </div>
  <div className="year-duration-right">
    <span>{movie.year}</span>
    <span>{movie.duration}</span>
  </div>
</div>
        
        </div>
      </div>
    </div>
  );
};

export default Home;
