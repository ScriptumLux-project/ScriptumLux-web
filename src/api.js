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

// Search Movies function
export async function searchMovies(query) {
    console.log('🔍 Searching movies with query:', query);

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return [];
    }

    try {
        // Option 1: If you have a dedicated search endpoint
        // const res = await api.get(`/Movies/search?q=${encodeURIComponent(query.trim())}`);
        // return res.data;

        // Option 2: Search through all movies (fallback approach)
        const allMovies = await getMovies();
        const searchTerm = query.trim().toLowerCase();

        const filteredMovies = allMovies.filter(movie => {
            const title = (movie.title || movie.name || '').toLowerCase();
            const description = (movie.description || movie.summary || '').toLowerCase();
            const director = (movie.director || '').toLowerCase();

            return title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                director.includes(searchTerm);
        });

        console.log(`🔍 Found ${filteredMovies.length} movies for query: "${query}"`);
        return filteredMovies;

    } catch (error) {
        console.error('🔍 Error searching movies:', error);

        // Return empty array on error instead of throwing
        // This prevents the search functionality from breaking the UI
        return [];
    }
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
    console.log('📋 Getting all playlists');

    try {
        const res = await api.get('/playlists');
        console.log('📋 Playlists response:', res.data);
        return res.data || [];
    } catch (error) {
        console.error('📋 Error getting playlists:', error);

        if (error.response?.status === 404) {
            // No playlists found
            return [];
        }

        throw new Error(`Failed to load playlists: ${error.message}`);
    }
}

export async function getPlaylistMovies(playlistId) {
    console.log('🎬 Getting movies for playlist:', playlistId);

    if (!playlistId) {
        throw new Error('Playlist ID is required');
    }

    try {
        // GET /api/playlistmovies
        const res = await api.get('/playlistmovies');
        const allLinks = Array.isArray(res.data) ? res.data : [];

        // Оставляем только связи для нужного плейлиста
        const links = allLinks.filter(pm => pm.playlistId === Number(playlistId));

        // По каждой связи запрашиваем детали фильма
        const movies = await Promise.all(
            links.map(async pm => {
                try {
                    return await getMovieDetails(pm.movieId);
                } catch (err) {
                    console.error(`Error loading movie ${pm.movieId}:`, err);
                    return null;
                }
            })
        );

        // Убираем неудачные запросы
        return movies.filter(m => m !== null);
    } catch (error) {
        console.error('🎬 Error getting playlist movies:', error);
        throw new Error(`Failed to load playlist movies: ${error.message}`);
    }
}

export async function getPlaylistById(playlistId) {
    console.log('📋 Getting playlist by ID:', playlistId);

    try {
        const res = await api.get(`/playlists/${playlistId}`);
        return res.data;
    } catch (error) {
        console.error('📋 Error getting playlist:', error);

        if (error.response?.status === 404) {
            throw new Error('Playlist not found');
        }

        throw new Error(`Failed to load playlist: ${error.message}`);
    }
}

export async function removeMovieFromPlaylistDirect(playlistId, movieId) {
    console.log('🗑️ Removing movie from playlist (direct):', { playlistId, movieId });

    try {
        const res = await api.delete(`/playlistmovies/playlist/${playlistId}/movie/${movieId}`);
        return res.data;
    } catch (error) {
        console.error('🗑️ Error removing movie from playlist (direct):', error);
        throw error;
    }
}

export async function removeMovieFromPlaylist(playlistId, movieId) {
    console.log('🗑️ Removing movie from playlist:', { playlistId, movieId });

    if (!playlistId || !movieId) {
        throw new Error('Both playlist ID and movie ID are required');
    }

    try {
        // DELETE /api/playlistmovies/{playlistId}/{movieId}
        await api.delete(`/playlistmovies/${Number(playlistId)}/${Number(movieId)}`);
        console.log('🗑️ Movie removed from playlist successfully');
    } catch (error) {
        console.error('🗑️ Error removing movie from playlist:', error);
        if (error.response?.status === 404) {
            throw new Error('Movie or playlist not found');
        }
        throw new Error(`Failed to remove movie from playlist: ${error.message}`);
    }
}
// Улучшенная функция createPlaylist
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

// Замените существующую функцию updatePlaylist в api.js на эту улучшенную версию
export async function updatePlaylist(id, data) {
    console.log('📝 Updating playlist:', { id, data });

    if (!id) {
        throw new Error('Playlist ID is required');
    }

    if (!data || (!data.name && !data.title)) {
        throw new Error('Playlist name is required');
    }

    try {
        // Подготавливаем данные для обновления
        const updateData = {
            name: data.name || data.title,
            // Добавьте другие поля, если они нужны
            ...(data.description && { description: data.description }),
            ...(data.posterUrl && { posterUrl: data.posterUrl })
        };

        console.log('📝 Sending update data:', updateData);

        const res = await api.put(`/playlists/${id}`, updateData);
        console.log('📝 Playlist updated successfully:', res.data);

        return res.data;

    } catch (error) {
        console.error('📝 Error updating playlist:', error);

        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            switch (status) {
                case 404:
                    throw new Error('Playlist not found');
                case 403:
                    throw new Error('You do not have permission to edit this playlist');
                case 401:
                    throw new Error('You must be logged in to edit playlists');
                case 400:
                    if (errorData?.message) {
                        throw new Error(errorData.message);
                    } else if (errorData?.errors) {
                        const validationErrors = Object.values(errorData.errors).flat();
                        throw new Error(validationErrors.join(', '));
                    } else {
                        throw new Error('Invalid playlist data');
                    }
                default:
                    throw new Error(`Server error: ${status}`);
            }
        } else if (error.request) {
            throw new Error('Network error: Unable to connect to server');
        } else {
            throw error;
        }
    }
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
    console.log('📺 Getting history for user:', userId);

    if (!userId) {
        throw new Error('User ID is required');
    }

    try {
        const res = await api.get('/History');
        console.log('📺 Raw history response:', res.data);

        // Фильтруем по userId и сортируем по дате (новые сначала)
        const userHistory = res.data
            .filter(item => item.userId === parseInt(userId))
            .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

        console.log('📺 Filtered user history:', userHistory);
        return userHistory;
    } catch (error) {
        console.error('Error fetching user history:', error);

        // Если история не найдена (404), возвращаем пустой массив
        if (error.response?.status === 404) {
            return [];
        }

        throw error;
    }
}

// Универсальная функция для получения userId
function getCurrentUserId() {
    try {
        // Сначала пробуем получить из localStorage
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage && userFromStorage !== 'undefined') {
            const userData = JSON.parse(userFromStorage);
            const userId = userData.id || userData.userId || userData.user_id;
            if (userId) return userId;
        }

        // Если не нашли в user, пробуем получить из токена
        const token = localStorage.getItem('accessToken');
        if (token && token !== 'undefined') {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.sub || payload.userId || payload.user_id || payload.id;
                if (userId) return userId;
            } catch (tokenError) {
                console.error('Error decoding token:', tokenError);
            }
        }
    } catch (error) {
        console.error("Error getting user ID:", error);
    }
    return null;
}

export async function addToHistory(movieId) {
    console.log('📺 Adding movie to history:', movieId);

    if (!movieId) {
        throw new Error('Movie ID is required');
    }

    const userId = getCurrentUserId();
    if (!userId) {
        throw new Error('User not authenticated');
    }

    try {
        // Проверяем, есть ли уже этот фильм в истории пользователя
        const existingHistory = await getUserHistory(userId);
        const existingItem = existingHistory.find(item =>
            item.movieId === parseInt(movieId)
        );

        // Если фильм уже в истории, обновляем дату просмотра
        if (existingItem) {
            console.log('📺 Movie already in history, updating view time');

            // Удаляем старую запись
            await deleteHistoryItem(existingItem.id);

            // Добавляем новую запись с текущим временем
            const historyData = {
                userId: parseInt(userId),
                movieId: parseInt(movieId),
                viewedAt: new Date().toISOString()
            };

            const res = await api.post('/History', historyData);
            console.log('📺 History updated successfully:', res.data);
            return res.data;
        }

        const historyData = {
            userId: parseInt(userId),
            movieId: parseInt(movieId),
            viewedAt: new Date().toISOString()
        };

        console.log('📺 Sending history data:', historyData);

        const res = await api.post('/History', historyData);
        console.log('📺 History added successfully:', res.data);

        return res.data;
    } catch (error) {
        console.error('Error adding to history:', error);

        // Если это ошибка валидации, показываем более понятное сообщение
        if (error.response?.status === 400) {
            throw new Error('Invalid data provided');
        }

        throw error;
    }
}

// Теперь принимает два параметра: userId и movieId
export async function deleteHistoryItem(userId, movieId) {
    console.log('🗑️ Deleting history item:', { userId, movieId });

    if (!userId || !movieId) {
        throw new Error('User ID and Movie ID are required to delete history item');
    }

    try {
        // Формируем URL с двумя параметрами
        const res = await api.delete(`/History/${userId}/${movieId}`);
        console.log('🗑️ History item deleted successfully');

        return res.data;
    } catch (error) {
        console.error('Error deleting history item:', error);

        if (error.response?.status === 404) {
            throw new Error('History item not found');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to delete this item');
        }

        throw error;
    }
}

// Исправленная функция очистки всей истории пользователя
export async function clearUserHistory(userId) {
    console.log('🗑️ Clearing history for user:', userId);

    if (!userId) {
        // Если userId не передан, пытаемся получить его автоматически
        userId = getCurrentUserId();
        if (!userId) {
            throw new Error('User ID is required');
        }
    }

    try {
        // Пробуем использовать специальный endpoint для очистки истории пользователя
        const res = await api.delete(`/History/user/${userId}`);
        console.log('🗑️ User history cleared successfully');

        return res.data;
    } catch (error) {
        console.error('Error clearing user history:', error);

        // Если специального endpoint нет, очищаем по одному элементу
        if (error.response?.status === 404 || error.response?.status === 405) {
            console.log('🗑️ No bulk delete endpoint, clearing items individually');

            try {
                // Получаем всю историю пользователя
                const userHistory = await getUserHistory(userId);

                if (userHistory.length === 0) {
                    return { message: 'History is already empty' };
                }

                // Удаляем каждый элемент по отдельности используя составной ключ
                const deletePromises = userHistory.map(item => {
                    const itemUserId = item.userId;
                    const itemMovieId = item.movieId;

                    if (!itemUserId || !itemMovieId) {
                        console.warn('History item without proper IDs:', item);
                        return Promise.resolve();
                    }

                    return deleteHistoryItem(itemUserId, itemMovieId);
                });

                await Promise.all(deletePromises);
                console.log('🗑️ All history items deleted successfully');

                return { message: 'History cleared successfully' };
            } catch (individualDeleteError) {
                console.error('Error during individual deletion:', individualDeleteError);
                throw new Error('Failed to clear history completely');
            }
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to clear this history');
        }

        throw error;
    }
}

// Дополнительная функция для получения статистики истории
export async function getHistoryStats(userId) {
    console.log('📊 Getting history stats for user:', userId);

    if (!userId) {
        userId = getCurrentUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
    }

    try {
        const history = await getUserHistory(userId);

        const stats = {
            totalMovies: history.length,
            watchedToday: 0,
            watchedThisWeek: 0,
            watchedThisMonth: 0,
            mostWatchedGenres: {},
            recentActivity: history.slice(0, 5) // Последние 5 фильмов
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        history.forEach(item => {
            const viewDate = new Date(item.viewedAt);

            if (viewDate >= today) {
                stats.watchedToday++;
            }
            if (viewDate >= weekAgo) {
                stats.watchedThisWeek++;
            }
            if (viewDate >= monthAgo) {
                stats.watchedThisMonth++;
            }
        });

        return stats;
    } catch (error) {
        console.error('Error getting history stats:', error);
        return {
            totalMovies: 0,
            watchedToday: 0,
            watchedThisWeek: 0,
            watchedThisMonth: 0,
            mostWatchedGenres: {},
            recentActivity: []
        };
    }
}