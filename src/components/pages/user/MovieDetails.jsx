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
import {
    getSimilarMovies,
    getMovieDetails,
    getComments,
    postComment,
    getGenres,
    getMovies,
    addToHistory,
    getMovieRating,
    getUserReviewForMovie,
    createReview,
    updateReview,
    deleteReview
} from '../../../api';

const MovieDetails = () => {
    const {movieId} = useParams();
    const navigate = useNavigate();
    const {isAuthenticated, user} = useAuth();
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
    const [recommendationImagesLoaded, setRecommendationImagesLoaded] = useState({});

    const [isPlaying, setIsPlaying] = useState(false);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isNewTimecodeModalOpen, setIsNewTimecodeModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    const [historyAdded, setHistoryAdded] = useState(false);

    // Состояния для рейтинга
    const [movieRating, setMovieRating] = useState({averageRating: 0, totalReviews: 0});
    const [userReview, setUserReview] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingError, setRatingError] = useState(null);
    const [hoveredRating, setHoveredRating] = useState(0);

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
            setImgLoaded(false);
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

                // 2) Загружаем рейтинг фильма
                try {
                    const ratingData = await getMovieRating(movieId);
                    setMovieRating(ratingData);
                } catch (ratingErr) {
                    console.error('Error fetching movie rating:', ratingErr);
                    setMovieRating({averageRating: 0, totalReviews: 0});
                }

                // 3) Если пользователь авторизован, загружаем его отзыв
                if (isAuthenticated() && user?.id) {
                    try {
                        const userReviewData = await getUserReviewForMovie(user.id, movieId);
                        setUserReview(userReviewData);
                        if (userReviewData) {
                            setSelectedRating(userReviewData.rating);
                        }
                    } catch (reviewErr) {
                        console.error('Error fetching user review:', reviewErr);
                        setUserReview(null);
                    }
                }

                // 4) Загружаем комментарии
                try {
                    const commentData = await getComments({movieId});
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
    }, [movieId, isAuthenticated, user?.id]);

    // Отдельный useEffect для добавления в историю
    useEffect(() => {
        const addMovieToHistory = async () => {
            if (!movieId || !isAuthenticated() || historyAdded || loading) {
                return;
            }

            try {
                console.log('Adding movie to history:', movieId);
                await addToHistory(movieId);
                setHistoryAdded(true);
                console.log('Movie added to history successfully');
            } catch (historyError) {
                console.error('Error adding movie to history:', historyError);
            }
        };

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
                            movieId: sim.movieId,
                            title: sim.title,
                            description: sim.description,
                            posterUrl: details.posterUrl || '/api/placeholder/200/300',
                            rating: details.rating,
                            genreId: details.genreId,
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

// В файле MovieDetails.js найдите функцию renderStars и замените её на эту:

    const renderStars = (rating, interactive = false, onStarClick = null, onStarHover = null, hoveredValue = 0) => {
        const stars = [];
        let displayRating = rating;

        if (interactive) {
            if (hoveredValue > 0) {
                displayRating = hoveredValue;
            } else if (userReview && userReview.rating) {
                displayRating = userReview.rating;
            } else {
                displayRating = selectedRating;
            }
        }

        for (let i = 1; i <= 10; i++) {
            const isFilled = i <= displayRating;

            stars.push(
                <span
                    key={i}
                    className={`rating-star ${interactive ? 'interactive' : ''} ${isFilled ? 'filled' : 'empty'}`}
                    onClick={interactive ? () => onStarClick(i) : undefined}
                    onMouseEnter={interactive ? () => onStarHover(i) : undefined}
                    onMouseLeave={interactive ? () => onStarHover(0) : undefined}
                    style={{
                        cursor: interactive ? 'pointer' : 'default',
                        color: isFilled ? '#ffd700' : '#ddd',
                        fontSize: interactive ? '1.5rem' : '1rem',
                        margin: '0 2px',
                        transition: 'color 0.2s ease' // Добавляем плавный переход
                    }}
                >
                {isFilled ? <FaStar/> : <FaRegStar/>}
            </span>
            );
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

    // Функции для работы с рейтингом
// В файле MovieDetails.js найдите функцию handleRateClick и замените её на эту:

    const handleRateClick = async (newRating) => {
        if (!isAuthenticated()) {
            openLoginModal();
            return;
        }

        // Убираем проверку на одинаковый рейтинг - позволяем изменять
        setSelectedRating(newRating);

        // Сразу отправляем рейтинг
        setRatingLoading(true);
        setRatingError(null);

        try {
            let result;
            if (userReview && userReview.id) {
                // Обновляем существующий отзыв
                console.log('Updating existing review:', userReview.id, 'with rating:', newRating);
                result = await updateReview(userReview.id, newRating, userReview.comment || '');
            } else {
                // Создаем новый отзыв
                console.log('Creating new review for movie:', movieId, 'with rating:', newRating);
                result = await createReview(movieId, newRating, '');
            }

            setUserReview(result);

            // Обновляем общий рейтинг фильма
            const updatedRating = await getMovieRating(movieId);
            setMovieRating(updatedRating);

        } catch (error) {
            console.error('Error submitting rating:', error);
            setRatingError(error.message || 'Failed to submit rating. Please try again.');
            // Возвращаем предыдущий рейтинг при ошибке
            setSelectedRating(userReview ? userReview.rating : 0);
        } finally {
            setRatingLoading(false);
        }
    };

    const handleRatingSubmit = async (e, directRating = null) => {
        if (e) e.preventDefault();

        const ratingToSubmit = directRating || selectedRating;

        if (ratingToSubmit === 0) {
            setRatingError('Please select a rating');
            return;
        }

        setRatingLoading(true);
        setRatingError(null);

        try {
            let result;
            if (userReview) {
                // Обновляем существующий отзыв
                result = await updateReview(userReview.id, ratingToSubmit, userReview.comment || '');
                setUserReview(result);
            } else {
                // Создаем новый отзыв
                result = await createReview(movieId, ratingToSubmit, '');
                setUserReview(result);
            }

            // Обновляем общий рейтинг фильма
            const updatedRating = await getMovieRating(movieId);
            setMovieRating(updatedRating);

            setRatingError(null);

        } catch (error) {
            console.error('Error submitting rating:', error);
            setRatingError(error.message || 'Failed to submit rating. Please try again.');
        } finally {
            setRatingLoading(false);
        }
    };
    const handleDeleteRating = async () => {
        if (!userReview) return;

        if (!window.confirm('Are you sure you want to delete your rating?')) {
            return;
        }

        setRatingLoading(true);
        try {
            await deleteReview(userReview.id);
            setUserReview(null);
            setSelectedRating(0);


            // Обновляем общий рейтинг фильма
            const updatedRating = await getMovieRating(movieId);
            setMovieRating(updatedRating);

            alert('Rating deleted successfully!');
        } catch (error) {
            console.error('Error deleting rating:', error);
            setRatingError('Failed to delete rating. Please try again.');
        } finally {
            setRatingLoading(false);
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

    const getMovieId = (movie) => {
        const id = movie.movieId || movie.id || movie.Movie_ID || movie.movie_id;
        console.log('Getting movie ID from:', movie, 'Result:', id);
        return id;
    };

    const getPosterUrl = (movie) => {
        const url = movie.posterUrl || movie.poster_url || movie.posterURL || movie.Poster_URL;
        console.log('Getting poster URL for movie:', {
            movie,
            foundUrl: url,
            finalUrl: url || '/api/placeholder/200/300'
        });
        return url || '/api/placeholder/200/300';
    };

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

        if (targetMovieId.toString() === movieId.toString()) {
            console.log('Same movie, not navigating');
            return;
        }

        navigate(`/movies/${targetMovieId}`);
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    };

    const handleRecommendationImageLoad = (movieId) => {
        setRecommendationImagesLoaded(prev => ({
            ...prev,
            [movieId]: true
        }));
    };

    const handleRecommendationImageError = (e, movieId) => {
        console.log('Image load error for movie:', movieId);
        console.log('Failed URL:', e.target.src);
        console.log('Error event:', e);
        e.target.onerror = null;
        e.target.src = "/api/placeholder/200/300";
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
                                setImgLoaded(true);
                            }}
                        />
                    </div>

                    <div className="movie-info">
                        <h1 className="movie-title-detail">{movie.title}</h1>
                        <p className="movie-description">{movie.description}</p>

                        {/* Улучшенный блок рейтинга */}
                        <div className="movie-rating-section">
                            <div className="average-rating">
                                <span className="rating-label">Average Rating:</span>
                                <span className="rating-value">
                                    {movieRating.averageRating > 0 ? movieRating.averageRating.toFixed(1) : 'N/A'}
                                </span>
                                <div className="rating-display">
                                    {movieRating.averageRating > 0 ?
                                        renderStars(movieRating.averageRating) :
                                        <span className="no-rating">No ratings yet</span>
                                    }
                                </div>
                                <div className="rating-count">
                                    {movieRating.totalReviews} {movieRating.totalReviews === 1 ? 'review' : 'reviews'}
                                </div>
                            </div>

                            {/* Блок пользовательского рейтинга */}
                            <div className="user-rating-section">
                                {isAuthenticated() ? (
                                    <div className="user-rating-controls">
                                        <div className="rate-movie-section">
<span className="rate-label">
    {userReview ? 'Your rating :' : 'Rate this movie:'}
</span>
                                            <div className="interactive-rating">
                                                {renderStars(
                                                    0, // Передаем 0, так как логика отображения теперь внутри функции
                                                    true,
                                                    handleRateClick,
                                                    setHoveredRating,
                                                    hoveredRating
                                                )}
                                                <span className="rating-value">
        {hoveredRating || (userReview ? userReview.rating : selectedRating)}/10
    </span>
                                            </div>
                                            {userReview && userReview.comment && (
                                                <div className="user-comment">
                                                    "{userReview.comment}"
                                                </div>
                                            )}
                                            {ratingLoading && (
                                                <div className="rating-loading">
                                                    Updating rating...
                                                </div>
                                            )}
                                            {ratingError && (
                                                <div className="rating-error">
                                                    {ratingError}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="login-prompt">
                                        <button onClick={openLoginModal} className="login-to-rate-btn">
                                            Login to Rate
                                        </button>
                                    </div>
                                )}
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
                                    {formatGenre(movie.genreId)}</span>
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
                        {!isPlaying
                            ? (
                                <div
                                    className="video-placeholder"
                                    onClick={() => setIsPlaying(true)}
                                >
                                    <FaPlay className="play-button"/>
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
                                        style={{cursor: 'pointer'}}
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