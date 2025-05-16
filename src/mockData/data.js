export const mockMovies = [
    {
      id: 1,
      title: "Inception",
      genres: [{ id: 1, name: "Sci-Fi" }, { id: 2, name: "Action" }],
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      director: "Christopher Nolan",
      year: 2010,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      genres: [{ id: 3, name: "Drama" }],
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      director: "Frank Darabont",
      year: 1994,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"
    },
    {
      id: 3,
      title: "The Dark Knight",
      genres: [{ id: 2, name: "Action" }, { id: 4, name: "Crime" }],
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      director: "Christopher Nolan",
      year: 2008,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
    },
    {
      id: 4,
      title: "Pulp Fiction",
      genres: [{ id: 4, name: "Crime" }, { id: 5, name: "Drama" }],
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      director: "Quentin Tarantino",
      year: 1994,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"
    },
    {
      id: 5,
      title: "Fight Club",
      genres: [{ id: 5, name: "Drama" }],
      description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
      director: "David Fincher",
      year: 1999,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"
    },
    {
      id: 6,
      title: "The Matrix",
      genres: [{ id: 1, name: "Sci-Fi" }, { id: 2, name: "Action" }],
      description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      director: "Lana Wachowski, Lilly Wachowski",
      year: 1999,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      rating: 8.7,
      duration: "2h 16m"
    },
    {
      id: 7,
      title: "Interstellar",
      genres: [{ id: 1, name: "Sci-Fi" }, { id: 5, name: "Drama" }, { id: 6, name: "Adventure" }],
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      director: "Christopher Nolan",
      year: 2014,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      rating: 8.6,
      duration: "2h 49m"
    },
    {
      id: 8,
      title: "The Godfather",
      genres: [{ id: 4, name: "Crime" }, { id: 5, name: "Drama" }],
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      director: "Francis Ford Coppola",
      year: 1972,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      rating: 9.2,
      duration: "2h 55m"
    },
    {
      id: 9,
      title: "Forrest Gump",
      genres: [{ id: 5, name: "Drama" }, { id: 7, name: "Romance" }],
      description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.",
      director: "Robert Zemeckis",
      year: 1994,
      posterUrl: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      rating: 8.8,
      duration: "2h 22m"
    }
    
  ];
  
  export const genresList = [
    { id: 1, name: "Sci-Fi" },
    { id: 2, name: "Action" },
    { id: 3, name: "Drama" },
    { id: 4, name: "Crime" },
    { id: 5, name: "Comedy" },
    { id: 6, name: "Horror" },
    { id: 7, name: "Romance" },
    { id: 8, name: "Thriller" },
    { id: 9, name: "Fantasy" },
    { id: 10, name: "Animation" }
  ];
  
  export const mockUsers = [
    {
      id: 1,
      email: "user@gmail.com",
      password: "user123",
      name: "Regular User",
      role: "user"
    }
  ];

//----------------------------------------------------------------------------------------//
export const mockMovieDetails = {
  1: {
    rating: 8.8,
    releaseDate: "16 July 2010",
    country: "United States",
    language: "English",
    storyline: "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in this treacherous new world of corporate espionage, but it has also made him an international fugitive and cost him everything he has ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back but only if he can accomplish the impossible, inception. Instead of the perfect heist, Cobb and his team of specialists have to pull off the reverse: their task is not to steal an idea, but to plant one. If they succeed, it could be the perfect crime. But no amount of careful planning or expertise can prepare the team for the dangerous enemy that seems to predict their every move. An enemy that only Cobb could have seen coming.",
    
  },
  2: {
    rating: 9.3,
    releaseDate: "14 October 1994",
    country: "United States",
    language: "English",
    storyline: "Chronicles the experiences of a formerly successful banker as a prisoner in the gloomy jailhouse of Shawshank after being found guilty of a crime he did not commit. The film portrays the man's unique way of dealing with his new, torturous life; along the way he befriends a number of fellow prisoners, most notably a wise long-term inmate named Red. Over the years, Andy finds ways to live out life with some dignity and purpose, all while a terrible warden threatens to take it all away.",
    
  },
  3: {
    rating: 9.0,
    releaseDate: "18 July 2008",
    country: "United States",
    language: "English",
    storyline: "Set within a year after the events of Batman Begins (2005), Batman, Lieutenant James Gordon, and new District Attorney Harvey Dent successfully begin to round up the criminals that plague Gotham City, until a mysterious and sadistic criminal mastermind known only as \"The Joker\" appears in Gotham, creating a new wave of chaos. Batman's struggle against The Joker becomes deeply personal, forcing him to \"confront everything he believes\" and improve his technology to stop him. A love triangle develops between Bruce Wayne, Dent, and Rachel Dawes.",
    
  },
  4: {
    rating: 8.9,
    releaseDate: "14 October 1994",
    country: "United States",
    language: "English",
    storyline: "Jules Winnfield and Vincent Vega are two hitmen who are out to retrieve a suitcase stolen from their employer, mob boss Marsellus Wallace. Wallace has also asked Vincent to take his wife Mia out a few days later when Wallace himself will be out of town. Butch Coolidge is an aging boxer who is paid by Wallace to lose his fight. The lives of these seemingly unrelated people are woven together comprising of a series of funny, bizarre and uncalled-for incidents.",
    
  },
  5: {
    rating: 8.8,
    releaseDate: "15 October 1999",
    country: "United States",
    language: "English",
    storyline: "A nameless first person narrator (Edward Norton) attends support groups in attempt to subdue his emotional state and relieve his insomniac state. When he meets Marla (Helena Bonham Carter), another fake attendee of support groups, his life seems to become a little more bearable. However when he associates himself with Tyler (Brad Pitt) he is dragged into an underground fight club and soap making scheme. Together the two men spiral out of control and engage in competitive rivalry for love and power.",
    
  }
};

//----------------------------------------------------------------------------------------//
export const mockComments = [
  {
      id: 1,
      userId: 1, // JohnDoe
      userName: "JohnDoe",
      movieId: 1,
      movieTitle: "Inception",
      text: "Mind-bending concept and incredible visuals. The way Nolan plays with time and reality is masterful.",
      date: "15-11-2023"
  },
  {
      id: 2,
      userId: 2, // JaneSmith
      userName: "JaneSmith",
      movieId: 1,
      movieTitle: "Inception",
      text: "This movie rewards multiple viewings. Each time I watch it, I notice something new in the intricate plot structure.",
      date: "22-10-2023"
  },
  {
      id: 3,
      userId: 1, // JohnDoe
      userName: "JohnDoe",
      movieId: 2,
      movieTitle: "The Shawshank Redemption",
      text: "A perfect story about hope and resilience. The narration adds so much depth to the film.",
      date: "05-12-2023"
  },
  {
      id: 4,
      userId: 3, // MikeJohnson
      userName: "MikeJohnson",
      movieId: 3,
      movieTitle: "The Dark Knight",
      text: "Heath Ledger's Joker is the greatest villain performance in cinema history. Period.",
      date: "10-12-2023"
  },
  {
      id: 5,
      userId: 4, // SarahWilliams
      userName: "SarahWilliams",
      movieId: 3,
      movieTitle: "The Dark Knight",
      text: "This transcends the superhero genre and stands as one of the best crime dramas ever made.",
      date: "25-11-2023"
  },
  {
      id: 6,
      userId: 5, // DavidBrown
      userName: "DavidBrown",
      movieId: 4,
      movieTitle: "Pulp Fiction",
      text: "The non-linear storytelling was revolutionary at the time and still feels fresh today.",
      date: "08-12-2023"
  },
  {
      id: 7,
      userId: 6, // EmmaJones
      userName: "EmmaJones",
      movieId: 4,
      movieTitle: "Pulp Fiction",
      text: "Some of the most quotable lines in cinema history. Tarantino's dialogue is unmatched.",
      date: "20-11-2023"
  },
  {
      id: 8,
      userId: 7, // RobertDavis
      userName: "RobertDavis",
      movieId: 5,
      movieTitle: "Fight Club",
      text: "A scathing critique of consumerism wrapped in an entertaining package. Fincher's direction is impeccable.",
      date: "12-12-2023"
  },
  {
      id: 9,
      userId: 8, // OliviaMiller
      userName: "OliviaMiller",
      movieId: 5,
      movieTitle: "Fight Club",
      text: "The twist still works even when you know it's coming. That's good filmmaking.",
      date: "05-11-2023"
  },
  {
      id: 10,
      userId: 3, // MikeJohnson
      userName: "MikeJohnson",
      movieId: 6,
      movieTitle: "The Matrix",
      text: "Revolutionary visual effects that still hold up today. A sci-fi masterpiece.",
      date: "15-01-2024"
  },
  {
      id: 11,
      userId: 3, // MikeJohnson
      userName: "MikeJohnson",
      movieId: 7,
      movieTitle: "Interstellar",
      text: "Emotional and scientifically fascinating. The black hole visuals were groundbreaking.",
      date: "22-02-2024"
  },
  {
      id: 12,
      userId: 1, // JohnDoe
      userName: "JohnDoe",
      movieId: 8,
      movieTitle: "The Godfather",
      text: "The definitive gangster movie. Brando and Pacino deliver iconic performances.",
      date: "10-03-2024"
  },
  {
      id: 13,
      userId: 9, // WilliamGarcia
      userName: "WilliamGarcia",
      movieId: 8,
      movieTitle: "The Godfather",
      text: "Perfect pacing and storytelling. Every scene has purpose and impact.",
      date: "17-03-2024"
  },
  {
      id: 14,
      userId: 3, // MikeJohnson
      userName: "MikeJohnson",
      movieId: 9,
      movieTitle: "Forrest Gump",
      text: "Tom Hanks deserved his Oscar. A journey through American history with heart.",
      date: "05-04-2024"
  },
  {
      id: 15,
      userId: 8, // OliviaMiller
      userName: "OliviaMiller",
      movieId: 9,
      movieTitle: "Forrest Gump",
      text: "The integration of Forrest into historical footage was groundbreaking for its time.",
      date: "12-04-2024"
  },
  {
      id: 16,
      userId: 5, // DavidBrown
      userName: "DavidBrown",
      movieId: 7,
      movieTitle: "Interstellar",
      text: "The score by Hans Zimmer perfectly complements the epic scale of the visuals.",
      date: "25-04-2024"
  },
  {
      id: 17,
      userId: 7, // RobertDavis
      userName: "RobertDavis",
      movieId: 6,
      movieTitle: "The Matrix",
      text: "Redefined action cinema and inspired countless imitators. A true classic.",
      date: "14-05-2024"
  },
  {
      id: 18,
      userId: 8, // OliviaMiller
      userName: "OliviaMiller",
      movieId: 2,
      movieTitle: "The Shawshank Redemption",
      text: "This movie deserves its spot at the top of many 'best films' lists. The character development is flawless.",
      date: "18-05-2024"
  },
  {
      id: 19,
      userId: 2, // JaneSmith
      userName: "JaneSmith",
      movieId: 3,
      movieTitle: "The Dark Knight",
      text: "The practical effects and IMAX filming techniques give this film a weight that CGI-heavy superhero movies lack.",
      date: "01-06-2024"
  },
  {
      id: 20,
      userId: 9, // WilliamGarcia
      userName: "WilliamGarcia",
      movieId: 5,
      movieTitle: "Fight Club",
      text: "The gritty visual style perfectly matches the story's tone. Every technical aspect serves the narrative.",
      date: "15-06-2024"
  }
];