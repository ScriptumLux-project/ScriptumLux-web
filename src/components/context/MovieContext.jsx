// src/context/MovieContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { mockMovies } from '../../mockData/data';

const MovieContext = createContext(null);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API fetch delay
    const fetchMovies = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setMovies(mockMovies);
        setLoading(false);
      } catch (err) {
        setError('Failed to load movies');
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getMovieById = (movieId) => {
    return movies.find(movie => movie.id === parseInt(movieId));
  };

  const value = {
    movies,
    loading,
    error,
    getMovieById
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

export const useMovies = () => {
  return useContext(MovieContext);
};