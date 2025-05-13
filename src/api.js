// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5292/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

// Auth
export async function login(email, password) {
    const res = await api.post('/Users/login', { email, password });
    return res.data;
}

export async function signup(email, password, nickname) {
    const res = await api.post('/Users/register', { email, password, nickname });
    return res.data;
}

// Movies
export async function getMovies() {
    const res = await api.get('/Movies');
    return res.data;
}

export async function getMovieDetails(id) {
    const res = await api.get(`/Movies/${id}`);
    return res.data;
}

// Comments
export async function getComments(movieId) {
    const res = await api.get(`/movies/${movieId}/comments`);
    return res.data;
}

export async function postComment(movieId, comment) {
    const res = await api.post(`/movies/${movieId}/comments`, { content: comment });
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
