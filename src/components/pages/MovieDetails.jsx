import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext'; //+1*
import { FaStar, FaRegStar, FaStarHalfAlt, FaPlay } from 'react-icons/fa';
import { MdHistory } from "react-icons/md";
import { RxLapTimer } from "react-icons/rx";
import { MdPlaylistPlay } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { mockMovieDetails, mockComments } from '../../mockData/data';
import './MovieDetails.css';
import TimecodeHistoryModal from './TimecodeHistoryModal';
import NewTimecodeModal from './NewTimecodeModal';
import PlaylistModal from './PlaylistModal';
import Login from '../authorization/Login'; //+1*
import SignUp from '../authorization/SignUp'; //+1*

const MovieDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { getMovieById } = useMovies();
  const { isAuthenticated } = useAuth(); //+1*
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isNewTimecodeModalOpen, setIsNewTimecodeModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  //+*
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const foundMovie = getMovieById(movieId);
        if (foundMovie) {
          const additionalDetails = mockMovieDetails[movieId] || {
            rating: 8.0,
            releaseDate: "Unknown",
            country: "Unknown",
            language: "English",
            duration: foundMovie.duration || "Unknown",
            storyline: foundMovie.description,
            cast: []
          };
          
          const movieComments = mockComments[movieId] || [];
          
          setMovie({
            ...foundMovie,
            ...additionalDetails,
          });
          
          setComments(movieComments);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId, getMovieById, navigate]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    
    return stars;
  };

  //+*
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!isAuthenticated()) {
      openLoginModal();
      return;
    }
    
    const comment = {
      id: comments.length + 1,
      user: "You",
      date: new Date().toISOString().split('T')[0],
      content: newComment
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  //+*
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
      <div className="loading">
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-message">
        <p>Movie not found</p>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-detail-container">
      <Link to="/" className="back-link">
      <span className="back-icon">   <IoIosArrowBack /></span>
      Back to Movies
      </Link>
        {/*main (poster/other*/}
        <div className="header-section">
          <div className="poster-container">
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="movie-poster-detail" 
            />
          </div>
          
          <div className="movie-info">
            <h1 className="movie-title-detail">{movie.title}</h1>
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-rating">
              <span className="rating-value">{movie.rating.toFixed(1)}</span>
              <div className="rating-stars">
                {renderStars(movie.rating)}
              </div>
            </div>
          </div>
        </div>
        
        {/*details/storyline*/}
        <div className="content-section">
          <div className="details-container">
            <h2 className="section-title">Details</h2>
            
            <div className="detail-item">
              <span className="detail-label">Country:</span>
              <span className="detail-value">{movie.country}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Language:</span>
              <span className="detail-value">{movie.language}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Release Date:</span>
              <span className="detail-value">{movie.releaseDate}</span>
            </div>
        
            <div className="detail-item">
              <span className="detail-label">Genre:</span>
              <div className="detail-value">
                {movie.genres && movie.genres.map(genre => (
                  <span key={genre.id} className="genre-badge">
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="storyline-container">
            <h2 className="section-title">Storyline</h2>
            <p className="storyline-text">
              {movie.storyline}
            </p>
          </div>
        </div>
        
        {/*cast*/}
        <div className="cast-section">
  <h2 className="section-title">Cast</h2>
  <div className="cast-list-container">
    {movie.cast && movie.cast.length > 0 ? (
      <div className="cast-list">
        {movie.cast.map(actor => (
          <div key={actor.id} className="cast-list-item">
            <span className="actor-name">{actor.name}</span>
            <span className="actor-role">{actor.character}</span>
          </div>
        ))}
      </div>
    ) : (
      <p>Cast information not available</p>
    )}
          </div>
        </div>
        
        {/*player*/}
        <div className="player-section">
          <h2 className="section-title">Watch Movie</h2>
          <div className="video-container">
            <div className="video-placeholder">
              <FaPlay className="play-button" />
            </div>
            </div>

            <div className="movie-icons">
            <MdHistory 
              className="movie-icon" 
              /*onClick={handleHistoryClick}*/
              title="Timecode History"
            />
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
        
        {/*comments*/}
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
              <div key={comment.id} className="comment-item">
                <img 
                  src={comment.avatar || "/api/placeholder/42/42"} 
                  alt={`${comment.user}'s avatar`} 
                  className="comment-avatar" 
                />
                <div className="comment-content-container">
                  <div className="comment-header">
                    <span className="comment-user">
                      {comment.user}
                      <span className="comment-date"> — {comment.date}</span>
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
      
      {/*+*/}
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