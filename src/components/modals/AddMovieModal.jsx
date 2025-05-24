import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/pages/admin/UsersList.css';
import { mockMovies } from '../../mockData/data';
import { IoMdClose } from 'react-icons/io';
import { createMovie, createGenre } from '../../api';
import './AddMovieModal.css';

const AddMovieModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState(mockMovies);
  const [allGenres, setAllGenres] = useState([]);
  const [movieData, setMovieData] = useState({
    title: '',
    releaseYear: '',
    genre: '',
    posterUrl: '',
    videoUrl: '',
    description: ''
  });

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData({
      ...movieData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка обязательных полей
    if (!movieData.title || !movieData.releaseYear || !movieData.genre) {
      alert('Пожалуйста, заполните обязательные поля: Title, Release Year, Genre');
      return;
    }

    const genreNameTrimmed = movieData.genre.trim();
    let genre = allGenres.find(
        (g) => g.name.toLowerCase() === genreNameTrimmed.toLowerCase()
    );

    if (!genre) {
      try {
        genre = await createGenre({ name: genreNameTrimmed });
        setAllGenres([...allGenres, genre]);
      } catch (err) {
        console.error('Error creating genre', err);
        alert('Не удалось создать жанр');
        return;
      }
    }

    const dto = {
      Title: movieData.title,
      ReleaseYear: parseInt(movieData.releaseYear, 10),
      GenreName: genre.name,
      PosterUrl: movieData.posterUrl || null,
      VideoUrl: movieData.videoUrl || null,
      Description: movieData.description || null
    };

    try {
      const created = await createMovie(dto);
      console.log('Movie created:', created);
      alert('Фильм успешно создан!');
      onClose();
      navigate('/admin-movies-list');
    } catch (err) {
      console.error('Error creating movie:', err);
      alert('Не удалось создать фильм');
    }
  };

  if (!isOpen) return null;

  return (
      <div className="modal-overlay">
        <div className="add-movie-modal">
          <div className="modal-header">
            <h1>Add Movie</h1>
            <button className="close-button" onClick={onClose}>
              <IoMdClose />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-content">
              <div className="form-fields">
                <div className="form-group-add">
                  <label>Title</label>
                  <input
                      type="text"
                      name="title"
                      value={movieData.title}
                      onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-add">
                  <label>Release Year</label>
                  <input
                      type="text"
                      name="releaseYear"
                      value={movieData.releaseYear}
                      onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-add">
                  <label>Genre</label>
                  <input
                      list="genre-list"
                      name="genre"
                      value={movieData.genre}
                      onChange={handleInputChange}
                  />
                  <datalist id="genre-list">
                    {allGenres.map((g) => (
                        <option key={g.genreId} value={g.name} />
                    ))}
                  </datalist>
                </div>


                <div className="form-group-add">
                  <label>Poster URL</label>
                  <input
                      type="text"
                      name="posterUrl"
                      placeholder="https://example.com/poster.jpg"
                      value={movieData.posterUrl}
                      onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-add">
                  <label>Video URL</label>
                  <input
                      type="text"
                      name="videoUrl"
                      placeholder="https://example.com/video.mp4"
                      value={movieData.videoUrl}
                      onChange={handleInputChange}
                  />
                </div>

                <div className="form-group-add">
                  <label>Description</label>
                  <textarea
                      name="description"
                      value={movieData.description}
                      onChange={handleInputChange}
                      placeholder="Lorem ipsum dolor sit amet consectetur..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="add-movie-btn">
                Add movie
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddMovieModal;
