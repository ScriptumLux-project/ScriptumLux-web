// src/components/context/MovieContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMovies } from '../../api';

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getMovies()
        .then(data => {
          setMovies(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to load movies');
          setLoading(false);
        });
  }, []);

  const getMovieById = (movieId) => {
    return movies.find(m => m.id === parseInt(movieId, 10));
  };

  return (
      <MovieContext.Provider value={{ movies, loading, error, getMovieById }}>
        {children}
      </MovieContext.Provider>
  );
};

export const useMovies = () => useContext(MovieContext);
