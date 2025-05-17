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
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

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
    try {
        const res = await api.get(`/Movies/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Error fetching movie ${id}:`, error.response?.data || error.message);
        
        // If we get a 404, try to fetch from the movies list as a fallback
        if (error.response && error.response.status === 404) {
            try {
                const allMovies = await getMovies();
                const movie = allMovies.find(m => m.movieId === parseInt(id) || m.id === parseInt(id));
                
                if (movie) {
                    return movie;
                }
            } catch (fallbackError) {
                console.error('Fallback fetch failed:', fallbackError);
            }
        }
        
        throw error;
    }
}

// Comments
export async function getComments(movieId) {
    try {
        const res = await api.get(`/Comments/movie/${movieId}`);
        return res.data;
    } catch (error) {
        console.error(`Error fetching comments for movie ${movieId}:`, error.response?.data || error.message);
        // Return empty array instead of throwing to prevent component crash
        return [];
    }
}

export async function postComment(movieId, comment) {
    const res = await api.post(`/Comments`, { 
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