// src/api.js 
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5292';
const api = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
    headers: {'Content-Type': 'application/json'}
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
        const res = await api.post('/Users/login', {email, password});
        return res.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    }
}

export async function signup(email, password, nickname, confirmPassword, role = "string") {
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

export async function getSimilarMovies(id) {
    const res = await api.get(`/ai/similar/${id}`);
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

export async function createMovie(movieDto) {
    const res = await api.post('/Movies', movieDto);
    return res.data;
}


// Genres
export async function getGenres() {
    const res = await api.get('/Genres');
    return res.data; // [{ genreId, name }]
}

export const getGenreById = async (id) => {
    const res = await fetch(`/api/Genres/${id}`);
    if (!res.ok) throw new Error('Genre not found');
    return res.json(); // { genreId, name }
};

export async function createGenre(dto) {
    const res = await api.post('/Genres', dto);
    return res.data; // { genreId, name }
}

// Comments
export async function getComments(filter) {
    try {
        const res = await api.get('/Comments');
        let comments = res.data;

        if (filter) {
            if (filter.userId !== undefined) {
                comments = comments.filter(c => c.userId === Number(filter.userId));
            }
            if (filter.movieId !== undefined) {
                comments = comments.filter(c => c.movieId === Number(filter.movieId));
            }
        }

        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
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

// Улучшенная функция createPlaylist
// Улучшенная функция createPlaylist для api.js
export async function createPlaylist(name, firstMovieId = null) {
    console.log('🚀 API createPlaylist called with:', { name, firstMovieId });

    // Получаем текущего пользователя из localStorage
    let userId = null;

    try {
        const userFromStorage = localStorage.getItem('user');
        console.log('🔍 createPlaylist ➔ userFromStorage:', userFromStorage);

        if (userFromStorage && userFromStorage !== 'undefined') {
            const parsedUser = JSON.parse(userFromStorage);
            console.log('🔍 createPlaylist ➔ parsedUser:', parsedUser);

            // Пробуем разные варианты названий полей
            userId = parsedUser.id || parsedUser.userId || parsedUser.user_id;
        }

        // Если не нашли в localStorage, попробуем получить из токена
        if (!userId) {
            const token = localStorage.getItem('accessToken');
            if (token && token !== 'undefined') {
                try {
                    // Декодируем JWT токен (только payload, без проверки подписи)
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log('🔍 createPlaylist ➔ token payload:', payload);

                    userId = payload.sub || payload.userId || payload.user_id || payload.id;
                } catch (tokenError) {
                    console.error('Error decoding token:', tokenError);
                }
            }
        }

    } catch (error) {
        console.error("Error getting user data:", error);
    }

    console.log('🔍 createPlaylist ➔ final userId:', userId);

    if (!userId) {
        throw new Error('Unable to determine user ID. Please log in again.');
    }

    // Валидация входных данных
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Playlist name is required');
    }

    if (name.trim().length > 100) {
        throw new Error('Playlist name is too long (max 100 characters)');
    }

    // Данные для POST /api/playlists (соответствует PlaylistCreateDto)
    const playlistData = {
        name: name.trim(),
        userId: parseInt(userId, 10)
    };

    console.log('🔍 createPlaylist ➔ sending data:', playlistData);

    try {
        // Создаём плейлист
        const res = await api.post('/playlists', playlistData);
        console.log('🔍 createPlaylist ➔ server response:', res.data);

        // Проверяем ответ от сервера
        if (!res.data) {
            throw new Error('Empty response from server');
        }

        // Бэкенд возвращает объект с PlaylistId (PascalCase или camelCase)
        const createdPlaylist = res.data;
        const playlistId = createdPlaylist.playlistId || createdPlaylist.PlaylistId;

        if (!playlistId) {
            console.error('No playlist ID in response:', createdPlaylist);
            throw new Error('Server did not return playlist ID');
        }

        // Если передали firstMovieId — добавляем фильм в только что созданный плейлист
        if (firstMovieId && playlistId) {
            try {
                console.log('🔍 createPlaylist ➔ adding first movie:', firstMovieId, 'to playlist:', playlistId);
                await addMovieToPlaylist(playlistId, firstMovieId);
                console.log('🔍 createPlaylist ➔ first movie added successfully');
            } catch (movieError) {
                console.error("Error adding first movie to playlist:", movieError);
                // Не бросаем ошибку, плейлист уже создан
                // Но можно показать предупреждение
                console.warn("Playlist created but couldn't add the first movie");
            }
        }

        // Возвращаем объект с унифицированным ID для фронтенда
        const result = {
            ...createdPlaylist,
            id: playlistId, // добавляем поле id для совместимости с фронтендом
            playlistId: playlistId // оставляем оригинальное поле
        };

        console.log('🔍 createPlaylist ➔ returning result:', result);
        return result;

    } catch (error) {
        console.error('🔍 createPlaylist ➔ API error:', error);

        // Улучшенная обработка ошибок
        if (error.response) {
            // Ошибка от сервера
            const serverError = error.response.data;
            console.error('Server error response:', serverError);

            if (serverError.message) {
                throw new Error(serverError.message);
            } else if (serverError.errors) {
                // Ошибки валидации от ASP.NET Core
                const validationErrors = Object.values(serverError.errors).flat();
                throw new Error(validationErrors.join(', '));
            } else if (typeof serverError === 'string') {
                throw new Error(serverError);
            } else {
                throw new Error(`Server error: ${error.response.status} ${error.response.statusText}`);
            }
        } else if (error.request) {
            // Ошибка сети
            throw new Error('Network error: Unable to connect to server');
        } else {
            // Другие ошибки
            throw error;
        }
    }
}

export async function updatePlaylist(id, data) {
    const res = await api.put(`/playlists/${id}`, data);
    return res.data;
}

// Улучшенная функция удаления плейлиста
export async function deletePlaylist(id) {
    console.log('🗑️ API deletePlaylist called with ID:', id);

    if (!id) {
        throw new Error('Playlist ID is required');
    }

    try {
        const res = await api.delete(`/playlists/${id}`);
        console.log('🗑️ Delete playlist API response:', res.status);

        // Проверяем успешный статус (204 No Content или 200 OK)
        if (res.status === 204 || res.status === 200) {
            console.log('🗑️ Playlist deleted successfully');
            return { success: true, message: 'Playlist deleted successfully' };
        } else {
            throw new Error(`Unexpected response status: ${res.status}`);
        }

    } catch (error) {
        console.error('🗑️ Delete playlist API error:', error);

        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            console.error('🗑️ Error response:', { status, data: errorData });

            switch (status) {
                case 404:
                    throw new Error('Playlist not found. It may have been already deleted.');
                case 403:
                    throw new Error('You do not have permission to delete this playlist.');
                case 401:
                    throw new Error('You must be logged in to delete playlists.');
                case 400:
                    throw new Error('Invalid playlist ID.');
                default:
                    if (errorData?.message) {
                        throw new Error(errorData.message);
                    } else if (typeof errorData === 'string') {
                        throw new Error(errorData);
                    } else {
                        throw new Error(`Server error: ${status}`);
                    }
            }
        } else if (error.request) {
            throw new Error('Network error: Unable to connect to server.');
        } else {
            throw error;
        }
    }
}

export async function addMovieToPlaylist(playlistId, movieId) {
    // отправляем в PlaylistMoviesController.Create([FromBody] PlaylistMovieCreateDto dto)
    const res = await api.post('/playlistmovies', {
        playlistId: parseInt(playlistId, 10),
        movieId: parseInt(movieId, 10)
    });
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

// History
export async function getUserHistory(userId) {
    try {
        const res = await api.get('/History');

        return res.data.filter(item => item.userId === parseInt(userId));
    } catch (error) {
        console.error('Error fetching user history:', error);
        throw error;
    }
}

export async function addToHistory(movieId) {

    const user = localStorage.getItem('user');
    let userId = 0;

    if (user) {
        try {
            const userData = JSON.parse(user);
            userId = userData.id;
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }

    try {
        const historyData = {
            userId: userId,
            movieId: parseInt(movieId),
            viewedAt: new Date().toISOString()
        };

        const res = await api.post('/History', historyData);
        return res.data;
    } catch (error) {
        console.error('Error adding to history:', error);
        throw error;
    }
}

export async function deleteHistoryItem(id) {
    try {
        const res = await api.delete(`/History/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting history item:', error);
        throw error;
    }
}

export async function clearUserHistory(userId) {
    try {
        // If your API has a dedicated endpoint for clearing user history
        const res = await api.delete(`/History/user/${userId}`);
        return res.data;
    } catch (error) {
        console.error('Error clearing user history:', error);
        throw error;
    }
}