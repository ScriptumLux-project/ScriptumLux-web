import React, {useEffect, useState} from 'react';
import {Link, useParams, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {FaStar, FaRegStar, FaStarHalfAlt, FaPlay} from 'react-icons/fa';
import {MdHistory} from "react-icons/md";
import {RxLapTimer} from "react-icons/rx";
import {MdPlaylistPlay} from "react-icons/md";
import {IoIosArrowBack} from "react-icons/io";
import './MovieDetails.css';
import TimecodeHistoryModal from '../../modals/TimecodeHistoryModal';
import NewTimecodeModal from '../../modals/NewTimecodeModal';
import PlaylistModal from '../../modals/PlaylistModal';
import Login from '../../authorization/Login';
import SignUp from '../../authorization/SignUp';
import {getSimilarMovies, getMovieDetails, getComments, postComment, getGenres, getMovies, addToHistory} from '../../../api';

const MovieDetails = () => {
    const {movieId} = useParams();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [movie, setMovie] = useState(null);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);

    // Рекомендации
    const [similarMovies, setSimilarMovies] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsError, setRecommendationsError] = useState(null);
    // Добавляем состояние для отслеживания загрузки постеров рекомендаций
    const [recommendationImagesLoaded, setRecommendationImagesLoaded] = useState({});

    const [isPlaying, setIsPlaying] = useState(false);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isNewTimecodeModalOpen, setIsNewTimecodeModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    // Добавляем состояние для отслеживания добавления в историю
    const [historyAdded, setHistoryAdded] = useState(false);

    useEffect(() => {
        getGenres()
            .then(data => setGenres(data))
            .catch(err => {
                console.error('Error loading genres:', err);
            });
    }, []);

    useEffect(() => {
        if (!movieId) return;

        const fetchMovieData = async () => {
            console.count('fetchMovieData called');
            console.time('fetchMovie');

            setLoading(true);
            setError(null);
            // Сбрасываем состояние загрузки основного постера
            setImgLoaded(false);
            // Сбрасываем флаг добавления в историю при смене фильма
            setHistoryAdded(false);

            try {
                // 1) Загружаем детали
                const movieData = await getMovieDetails(movieId);
                console.timeEnd('fetchMovie');

                setMovie({
                    id: movieData.movieId,
                    title: movieData.title,
                    releaseDate: movieData.releaseYear,
                    genreId: movieData.genreId,
                    rating: movieData.rating ?? 0,
                    posterUrl: movieData.posterUrl || '/api/placeholder/300/450',
                    country: movieData.country || 'Unknown',
                    storyline: movieData.description || 'No storyline available',
                    videoUrl: movieData.videoUrl
                });

                // 3) Загружаем комментарии
                try {
                    const commentData = await getComments({ movieId });
                    setComments(Array.isArray(commentData) ? commentData : []);
                } catch {
                    console.error('Error fetching comments');
                    setComments([]);
                }

            } catch (err) {
                console.error('Error in fetchMovieData:', err);
                setError('Failed to load movie details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (movieId) {
            fetchMovieData();
        }
    }, [movieId]); // Убираем isAuthenticated из зависимостей

    // Отдельный useEffect для добавления в историю
    useEffect(() => {
        const addMovieToHistory = async () => {
            // Проверяем все условия перед добавлением в историю
            if (!movieId || !isAuthenticated() || historyAdded || loading) {
                return;
            }

            try {
                console.log('Adding movie to history:', movieId);
                await addToHistory(movieId);
                setHistoryAdded(true); // Отмечаем, что добавили в историю
                console.log('Movie added to history successfully');
            } catch (historyError) {
                console.error('Error adding movie to history:', historyError);
                // Не показываем ошибку пользователю, так как это не критично
            }
        };

        // Добавляем небольшую задержку, чтобы убедиться что фильм загрузился
        const timeoutId = setTimeout(addMovieToHistory, 500);
        return () => clearTimeout(timeoutId);
    }, [movieId, isAuthenticated, historyAdded, loading]);

    // Отдельный useEffect для загрузки рекомендаций после основной загрузки
    useEffect(() => {
        if (!movieId || loading) return;

        const fetchSimilarMovies = async () => {
            setRecommendationsLoading(true);
            setRecommendationsError(null);
            setRecommendationImagesLoaded({});

            try {
                const similarData = await getSimilarMovies(movieId);

                const top6 = Array.isArray(similarData)
                    ? similarData.slice(0, 6)
                    : [];

                const enriched = await Promise.all(
                    top6.map(async sim => {
                        const details = await getMovieDetails(sim.movieId);
                        return {
                            movieId:    sim.movieId,
                            title:      sim.title,
                            description: sim.description,
                            posterUrl:  details.posterUrl    || '/api/placeholder/200/300',
                            rating:     details.rating,
                            genreId:    details.genreId,
                        };
                    })
                );

                setSimilarMovies(enriched);
            } catch (err) {
                console.error('Error fetching similar movies:', err);
                setRecommendationsError('Failed to load recommendations');
            } finally {
                setRecommendationsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSimilarMovies, 500);
        return () => clearTimeout(timeoutId);
    }, [movieId, loading]);

    const formatGenre = id => {
        const g = genres.find(x => x.genreId === id);
        return g ? g.name : 'Not specified';
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating / 2);
        const hasHalfStar = rating % 2 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i}/>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i}/>);
            } else {
                stars.push(<FaRegStar key={i}/>);
            }
        }

        return stars;
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!isAuthenticated()) {
            openLoginModal();
            return;
        }

        try {
            const newCommentData = await postComment(movieId, newComment);
            setComments(prevComments => [newCommentData, ...prevComments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('Failed to post comment. Please try again later.');
        }
    };

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
        setIsSignUpModalOpen(false);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const openSignUpModal = () => {
        setIsSignUpModalOpen(true);
        setIsLoginModalOpen(false);
    };

    const closeSignUpModal = () => {
        setIsSignUpModalOpen(false);
    };

    const handleHistoryClick = () => {
        if (!isAuthenticated()) {
            openLoginModal();
        } else {
            setIsHistoryModalOpen(true);
        }
    };

    const handleNewTimecodeClick = () => {
        if (!isAuthenticated()) {
            openLoginModal();
        } else {
            setIsNewTimecodeModalOpen(true);
        }
    };

    const handlePlaylistClick = () => {
        if (!isAuthenticated()) {
            openLoginModal();
        } else {
            setIsPlaylistModalOpen(true);
        }
    };

    const closeHistoryModal = () => setIsHistoryModalOpen(false);
    const closeNewTimecodeModal = () => setIsNewTimecodeModalOpen(false);
    const closePlaylistModal = () => setIsPlaylistModalOpen(false);

    // Функция для получения корректного ID фильма
    const getMovieId = (movie) => {
        // Проверяем все возможные поля для ID
        const id = movie.movieId || movie.id || movie.Movie_ID || movie.movie_id;
        console.log('Getting movie ID from:', movie, 'Result:', id);
        return id;
    };

    // Функция для получения корректного URL постера
    const getPosterUrl = (movie) => {
        const url = movie.posterUrl || movie.poster_url || movie.posterURL || movie.Poster_URL;
        console.log('Getting poster URL for movie:', {
            movie,
            foundUrl: url,
            finalUrl: url || '/api/placeholder/200/300'
        });
        return url || '/api/placeholder/200/300';
    };

    // Функция для обработки клика по рекомендации
    const handleRecommendationClick = (recommendedMovie) => {
        const targetMovieId = getMovieId(recommendedMovie);

        console.log('Clicking on recommendation:', {
            movie: recommendedMovie,
            targetMovieId,
            currentMovieId: movieId
        });

        if (!targetMovieId) {
            console.error('No valid movie ID found in recommendation:', recommendedMovie);
            return;
        }

        // Проверяем, что мы не переходим на ту же страницу
        if (targetMovieId.toString() === movieId.toString()) {
            console.log('Same movie, not navigating');
            return;
        }

        // Используем navigate для программного перехода
        navigate(`/movies/${targetMovieId}`);
        // Прокручиваем страницу вверх после перехода
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    };

    // Функция для обработки загрузки изображения рекомендации
    const handleRecommendationImageLoad = (movieId) => {
        setRecommendationImagesLoaded(prev => ({
            ...prev,
            [movieId]: true
        }));
    };

    // Функция для обработки ошибки загрузки изображения рекомендации
    const handleRecommendationImageError = (e, movieId) => {
        console.log('Image load error for movie:', movieId);
        console.log('Failed URL:', e.target.src);
        console.log('Error event:', e);
        e.target.onerror = null; // Предотвращаем бесконечный цикл
        e.target.src = "/api/placeholder/200/300";
        // Отмечаем как загруженное, чтобы убрать placeholder
        setRecommendationImagesLoaded(prev => ({
            ...prev,
            [movieId]: true
        }));
    };

    if (loading) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-container">
                    <div className="loading">
                        <p>Loading movie details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-container">
                    <div className="error-message">
                        <p>{error}</p>
                        <Link to="/" className="back-link">
                            <span className="back-icon"><IoIosArrowBack/></span>
                            Back to Movies
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-container">
                    <div className="error-message">
                        <p>Movie not found</p>
                        <Link to="/" className="back-link">
                            <span className="back-icon"><IoIosArrowBack/></span>
                            Back to Movies
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="movie-detail-page">
            <div className="movie-detail-container">
                <Link to="/" className="back-link">
                    <span className="back-icon"><IoIosArrowBack/></span>
                    Back to Movies
                </Link>

                {/* Main (poster/other) */}
                <div className="header-section">
                    <div className="poster-container">
                        {!imgLoaded && <div className="poster-placeholder"/>}
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className={`movie-poster-detail ${imgLoaded ? 'visible' : 'hidden'}`}
                            onLoad={() => setImgLoaded(true)}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/300/450";
                                setImgLoaded(true); // Отмечаем как загруженное даже при ошибке
                            }}
                        />
                    </div>

                    <div className="movie-info">
                        <h1 className="movie-title-detail">{movie.title}</h1>
                        <p className="movie-description">{movie.description}</p>

                        <div className="movie-rating">
                            <span className="rating-value">{movie.rating?.toFixed(1) || 'N/A'}</span>
                            <div className="rating-stars">
                                {movie.rating ? renderStars(movie.rating) : 'No rating available'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details/storyline */}
                <div className="content-section">
                    <div className="details-container">
                        <h2 className="section-title">Details</h2>

                        <div className="detail-item">
                            <span className="detail-label">Country:</span>
                            <span className="detail-value">{movie.country || 'Unknown'}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Release Date:</span>
                            <span className="detail-value">{movie.releaseDate || 'Unknown'}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Genre:</span>
                            <div className="detail-value">
                                <span className="genre-badge">
                                    {formatGenre(movie.genreId) }</span>
                            </div>
                        </div>
                    </div>

                    <div className="storyline-container">
                        <h2 className="section-title">Storyline</h2>
                        <p className="storyline-text">
                            {movie.storyline || movie.description || 'No storyline available'}
                        </p>
                    </div>
                </div>

                {/* Player */}
                <div className="player-section">
                    <h2 className="section-title">Watch Movie</h2>

                    <div className="video-container">
                        { !isPlaying
                            ? (
                                <div
                                    className="video-placeholder"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    <FaPlay className="play-button" />
                                </div>
                            ) : (
                                <video
                                    src={movie.videoUrl}
                                    controls
                                    autoPlay
                                    className="movie-video"
                                />
                            )
                        }
                    </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations-section">
                    <h2 className="section-title">You Might Also Like</h2>

                    {recommendationsLoading ? (
                        <div className="recommendations-loading">
                            <p>Loading recommendations...</p>
                        </div>
                    ) : recommendationsError ? (
                        <div className="recommendations-error">
                            <p>{recommendationsError}</p>
                        </div>
                    ) : similarMovies.length > 0 ? (
                        <div className="recommendations-grid">
                            {similarMovies.map((movie, index) => {
                                const movieIdKey = getMovieId(movie) || `movie-${index}`;
                                const posterUrl = getPosterUrl(movie);
                                const isImageLoaded = recommendationImagesLoaded[movieIdKey];

                                console.log('Rendering recommendation:', {
                                    movie,
                                    movieIdKey,
                                    posterUrl,
                                    isImageLoaded
                                });

                                return (
                                    <div
                                        key={movieIdKey}
                                        className="recommendation-item"
                                        onClick={() => handleRecommendationClick(movie)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="recommendation-poster">
                                            {!isImageLoaded && (
                                                <div className="recommendation-poster-placeholder">
                                                    <span>Loading...</span>
                                                </div>
                                            )}
                                            <img
                                                src={posterUrl}
                                                alt={movie.title || 'Movie poster'}
                                                className={`recommendation-image ${isImageLoaded ? 'visible' : 'hidden'}`}
                                                onLoad={() => handleRecommendationImageLoad(movieIdKey)}
                                                onError={(e) => handleRecommendationImageError(e, movieIdKey)}
                                            />
                                        </div>
                                        <div className="recommendation-title">
                                            {movie.title || 'Unknown Title'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-recommendations">
                            <p>No recommendations available at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Comments */}
                <div className="comments-section">
                    <h2 className="section-title">Comments</h2>

                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <div className="comment-input-wrapper">
              <textarea
                  className="comment-input"
                  placeholder="Leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
              />
                            <button type="submit" className="submit-comment">Send</button>
                        </div>
                    </form>

                    {comments.length > 0 ? (
                        comments.map(comment => {
                            const getNickname = c => {
                                return typeof c.userName === 'string' && c.userName.trim()
                                    ? c.userName
                                    : 'Anonymous';
                            };

                            const nick = getNickname(comment);
                            const date = comment.createdAt
                                ? new Date(comment.createdAt).toISOString().split('T')[0]
                                : 'Unknown';

                            return (
                                <div key={comment.commentId} className="comment-item">
                                    <div className="comment-content-container">
                                        <div className="comment-header">
            <span className="comment-user">
              {nick}
                <span className="comment-date"> — {date}</span>
            </span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>
            </div>

            <TimecodeHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={closeHistoryModal}
                movieTitle={movie.title}
            />

            <NewTimecodeModal
                isOpen={isNewTimecodeModalOpen}
                onClose={closeNewTimecodeModal}
                movieTitle={movie.title}
            />

            <PlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                movieTitle={movie.title}
            />

            <Login
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
                switchToSignUp={openSignUpModal}
            />

            <SignUp
                isOpen={isSignUpModalOpen}
                onClose={closeSignUpModal}
                switchToLogin={openLoginModal}
            />
        </div>
    );
};

export default MovieDetails;