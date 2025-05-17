// src/api.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5292';
const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error("API Request Error:", error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth
export async function login(email, password) {
  try {
    const res = await api.post('/Users/login', { email, password });
    return res.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

export async function signup(email, password, nickname, confirmPassword, role) {
  try {
    const res = await api.post('/Users/register', {
      name: nickname,
      email,
      password,
      confirmPassword,
      role
    });
    return res.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    throw error;
  }
}

// Movies
export async function getMovies() {
  const res = await api.get('/Movies');
  return res.data;
}

export async function getMovieDetails(id) {
  try {
    const res = await api.get(`/Movies/${id}`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const allMovies = await getMovies();
      const movie = allMovies.find(m => m.movieId === +id || m.id === +id);
      if (movie) return movie;
    }
    throw error;
  }
}

// Comments
export async function getComments(userId) {
    const res = await api.get('/Comments');
    return res.data.filter(comment => comment.userId === Number(userId)); 
  }
  
export async function deleteComment(id) {
  const res = await api.delete(`/Comments/${id}`);
  return res.data;
}

export async function postComment(movieId, comment) {
  const res = await api.post('/Comments', {
    movieId: parseInt(movieId),
    content: comment
  });
  return res.data;
}

// Playlists
export async function getPlaylists() {
  const res = await api.get('/playlists');
  return res.data;
}

export async function createPlaylist(name, firstMovieId) {
  const res = await api.post('/playlists', { title: name, firstMovieId });
  return res.data;
}

export async function updatePlaylist(id, data) {
  const res = await api.put(`/playlists/${id}`, data);
  return res.data;
}

export async function deletePlaylist(id) {
  const res = await api.delete(`/playlists/${id}`);
  return res.data;
}

export async function addMovieToPlaylist(playlistId, movieId) {
  const res = await api.post(`/playlists/${playlistId}/movies`, { movieId });
  return res.data;
}

export async function deleteMovie(id) {
  const res = await api.delete(`/Movies/${id}`);
  return res.data;
}

// Users
export async function getAllUsers() {
  const res = await api.get('/Users');
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/Users/${id}`);
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/Users/${id}`);
  return res.data;
}
