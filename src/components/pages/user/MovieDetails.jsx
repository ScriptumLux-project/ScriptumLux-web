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
import {getMovieDetails, getComments, postComment, getMovies} from '../../../api';

const MovieDetails = () => {
    const {movieId} = useParams();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isNewTimecodeModalOpen, setIsNewTimecodeModalOpen] = useState(false);
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

    useEffect(() => {
        const fetchMovieData = async () => {
            console.count('fetchMovieData called');
            console.time('fetchMovie');  // старт измерения времени

            setLoading(true);
            setError(null);

            try {
                // 1) Загружаем детали
                const movieData = await getMovieDetails(movieId);
                console.timeEnd('fetchMovie');  // логируем время загрузки

                // 2) Маппим поля
                const processedMovie = {
                    ...movieData,
                    id: movieData.movieId ?? movieData.id,
                    posterUrl: movieData.posterUrl ?? '/api/placeholder/300/450',
                    rating: movieData.rating ?? 0,
                    genres: movieData.genre
                        ? [{id: movieData.genreId, name: movieData.genre}]
                        : movieData.genres ?? [],
                    releaseDate: movieData.releaseYear?.toString() || 'Unknown',
                    duration: movieData.duration || 'Unknown',
                    country: movieData.country || 'Unknown',
                    storyline: movieData.description || 'No description available'
                };
                //console.log('Processed movie data:', processedMovie);
                setMovie(processedMovie);

                // 3) Загружаем комментарии
                try {
                    const commentData = await getComments(movieId);
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
    }, [movieId]);


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
            // Post comment to API
            const newCommentData = await postComment(movieId, newComment);

            // Update local state with the new comment
            setComments(prevComments => [newCommentData, ...prevComments]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
            // Show error message to user
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
                                {movie.genres && movie.genres.length > 0 ? (
                                    movie.genres.map(genre => (
                                        <span key={typeof genre === 'object' ? genre.id : genre}
                                              className="genre-badge">
                      {typeof genre === 'object' ? genre.name : genre}
                    </span>
                                    ))
                                ) : (
                                    <span className="genre-badge">Not specified</span>
                                )}
                            </div>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Duration:</span>
                            <span className="detail-value">{movie.duration || 'Unknown'}</span>
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
                        <div className="video-placeholder">
                            <FaPlay className="play-button"/>
                        </div>
                    </div>

                    <div className="movie-icons">
                        <RxLapTimer
                            className="movie-icon"
                            onClick={handleHistoryClick}
                            title="Timecode History"
                        />
                        <MdPlaylistPlay
                            className="movie-icon"
                            onClick={handlePlaylistClick}
                            title="Add to Playlist"
                        />
                    </div>
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
                        comments.map(comment => (
                            <div key={comment.id || `temp-${Date.now()}-${Math.random()}`} className="comment-item">
                                <img
                                    src={comment.avatar || "/api/placeholder/42/42"}
                                    alt={`${comment.user || 'User'}'s avatar`}
                                    className="comment-avatar"
                                />
                                <div className="comment-content-container">
                                    <div className="comment-header">
                    <span className="comment-user">
                      {comment.user || comment.username || 'Anonymous'}
                        <span
                            className="comment-date"> — {comment.date || (comment.createdAt ? new Date(comment.createdAt).toISOString().split('T')[0] : 'Unknown')}</span>
                    </span>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                </div>
                            </div>
                        ))
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