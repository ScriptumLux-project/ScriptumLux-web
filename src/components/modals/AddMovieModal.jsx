import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/pages/admin/UsersList.css';
import { mockMovies } from '../../mockData/data';
import { IoMdClose } from "react-icons/io";
import { LuDownload } from "react-icons/lu";
import { IoPersonAddOutline } from "react-icons/io5";
import { createMovie, createGenre } from '../../api';
import './AddMovieModal.css';

const AddMovieModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState(mockMovies);
  const [allGenres, setAllGenres] = useState([]);
  const [posterImage, setPosterImage] = useState(null);
  const [movieFile, setMovieFile] = useState(null);
  const posterInputRef = useRef(null);
  const movieFileInputRef = useRef(null);

    const [movieData, setMovieData] = useState({
        title: '',
        releaseYear: '',
        genreName: '',
        description: ''
    });

  // const [movieData, setMovieData] = useState({
  //   title: '',
  //   releaseYear: '',
  //   genre: '',
  //   country: '',
  //   language: '',
  //   description: '',
  //  // cast: [{ actorName: '', role: '' }]
  // });



  const handleDeleteMovie = (movieId) => {
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    setMovies(updatedMovies);
  };

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

  const handleCastInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCast = [...movieData.cast];
    updatedCast[index] = {
      ...updatedCast[index],
      [name]: value
    };

    setMovieData({
      ...movieData,
      cast: updatedCast
    });
  };

  const handleAddCastMember = () => {
    setMovieData({
      ...movieData,
      cast: [...movieData.cast, { actorName: '', role: '' }]
    });
  };

  const handleRemoveCastMember = (index) => {
    const updatedCast = [...movieData.cast];
    updatedCast.splice(index, 1);

    setMovieData({
      ...movieData,
      cast: updatedCast
    });
  };

  const handlePosterClick = () => {
    posterInputRef.current.click();
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterImage(URL.createObjectURL(file));
    }
  };

  const handleMovieFileClick = () => {
    movieFileInputRef.current.click();
  };

  const handleMovieFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMovieFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      // Проверка обязательных полей
      if (!movieData.title || !movieData.releaseYear || !movieData.genre) {
          alert('Пожалуйста, заполните обязательные поля: Title, Release Year, Genre');
          return;
      }

      const genreNameTrimmed = movieData.genre.trim();

      let genre = allGenres.find(g => g.name.toLowerCase() === genreNameTrimmed.toLowerCase());

      if (!genre) {
          // Если жанр не найден — создаём новый
          try {
              genre = await createGenre({ name: genreNameTrimmed });
              setAllGenres([...allGenres, genre]);
          } catch (err) {
              console.error('Error creating genre', err);
              alert('Не удалось создать жанр');
              return;
          }
      }

      // Формируем DTO фильма для API
      const dto = {
          Title: movieData.title,
          ReleaseYear: parseInt(movieData.releaseYear, 10),
          GenreName: genre.name,      // или GenreId: genre.genreId если нужно id
          PosterUrl: posterImage || null,
          VideoUrl: movieFile ? URL.createObjectURL(movieFile) : null,
          Description: movieData.description || null,
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
            <div className="upload-section">
              <div
                className="upload-poster-area"
                onClick={handlePosterClick}
                style={{
                  backgroundImage: posterImage ? `url(${posterImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!posterImage && (
                  <>
                    <span>Add Poster</span>
                    <LuDownload/>
                  </>
                )}
                <input
                  type="file"
                  ref={posterInputRef}
                  onChange={handlePosterChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div className="upload-file-section">
                <p>Upload File {movieFile && `(${movieFile.name})`}</p>
                <button
                  type="button"
                  className="upload-button"
                  onClick={handleMovieFileClick}
                >
                  Browse <LuDownload/>
                </button>
                <input
                  type="file"
                  ref={movieFileInputRef}
                  onChange={handleMovieFileChange}
                  accept="video/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

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
                  {allGenres.map(g => (
                      <option key={g.genreId} value={g.name} />
                  ))}
                </datalist>
              </div>


              {/*<div className="form-row">*/}
              {/*  <div className="form-group-add half">*/}
              {/*    <label>Country</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      name="country"*/}
              {/*      value={movieData.country}*/}
              {/*      onChange={handleInputChange}*/}
              {/*    />*/}
              {/*  </div>*/}

              {/*  <div className="form-group-add half">*/}
              {/*    <label>Language</label>*/}
              {/*    <input*/}
              {/*      type="text"*/}
              {/*      name="language"*/}
              {/*      value={movieData.language}*/}
              {/*      onChange={handleInputChange}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}

              <div className="form-group-add">
                <label>Description</label>
                <textarea
                  name="description"
                  value={movieData.description}
                  onChange={handleInputChange}
                  placeholder="Lorem ipsum dolor sit amet consectetur. Vitae imperdiet pretium pellentesque facilisi ac augue. Feugiat adipiscing commodo mi erat quis porta"
                ></textarea>
              </div>

              {/*<div className="cast-section">*/}
              {/*  {movieData.cast.map((castMember, index) => (*/}
              {/*    <div key={index} className="cast-member">*/}
              {/*      <div className="form-row">*/}
              {/*        <div className="form-group-add half">*/}
              {/*          <label>Actor name</label>*/}
              {/*          <input*/}
              {/*            type="text"*/}
              {/*            name="actorName"*/}
              {/*            value={castMember.actorName}*/}
              {/*            onChange={(e) => handleCastInputChange(index, e)}*/}
              {/*          />*/}
              {/*        </div>*/}

              {/*        <div className="form-group-add half">*/}
              {/*          <label>Role</label>*/}
              {/*          <input*/}
              {/*            type="text"*/}
              {/*            name="role"*/}
              {/*            value={castMember.role}*/}
              {/*            onChange={(e) => handleCastInputChange(index, e)}*/}
              {/*          />*/}
              {/*        </div>*/}
              {/*      </div>*/}

              {/*      {index > 0 && (*/}
              {/*        <button*/}
              {/*          type="button"*/}
              {/*          className="remove-cast-btn"*/}
              {/*          onClick={() => handleRemoveCastMember(index)}*/}
              {/*        >*/}
              {/*          <IoMdClose />*/}
              {/*        </button>*/}
              {/*      )}*/}
              {/*    </div>*/}
              {/*  ))}*/}

              {/*  <div className="add-cast-button-container">*/}
              {/*    <button*/}
              {/*      type="button"*/}
              {/*      onClick={handleAddCastMember}*/}
              {/*      className="add-cast-btn"*/}
              {/*    >*/}
              {/*      <IoPersonAddOutline /> Add Actor*/}
              {/*    </button>*/}
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="add-movie-btn">Add movie</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMovieModal;