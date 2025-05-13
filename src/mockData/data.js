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
export const mockComments = {
  1: [
    {
      id: 1,
      user: "DreamExplorer",
      date: "2023-11-15",
      content: "Mind-bending concept and incredible visuals. The way Nolan plays with time and reality is masterful. DiCaprio's performance is one of his best.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      user: "CinematicVisionary",
      date: "2023-10-22",
      content: "This movie rewards multiple viewings. Each time I watch it, I notice something new in the intricate plot structure.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      user: "FilmBuffJane",
      date: "2023-09-30",
      content: "Hans Zimmer's score elevates every scene. That 'BWAAAH' sound is iconic now.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ],
  2: [
    {
      id: 1,
      user: "PrisonDramaFan",
      date: "2023-12-05",
      content: "A perfect story about hope and resilience. Morgan Freeman's narration adds so much depth to the film.",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    {
      id: 2,
      user: "ClassicMovieLover",
      date: "2023-11-18",
      content: "This movie deserves its spot at the top of many 'best films' lists. The character development is flawless.",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg"
    }
  ],
  3: [
    {
      id: 1,
      user: "BatmanEnthusiast",
      date: "2023-12-10",
      content: "Heath Ledger's Joker is the greatest villain performance in cinema history. Period.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: 2,
      user: "ComicBookCritic",
      date: "2023-11-25",
      content: "This transcends the superhero genre and stands as one of the best crime dramas ever made.",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg"
    },
    {
      id: 3,
      user: "FilmStudentX",
      date: "2023-10-14",
      content: "The practical effects and IMAX filming techniques give this film a weight that CGI-heavy superhero movies lack.",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg"
    }
  ],
  4: [
    {
      id: 1,
      user: "TarantinoFan90",
      date: "2023-12-08",
      content: "The non-linear storytelling was revolutionary at the time and still feels fresh today.",
      avatar: "https://randomuser.me/api/portraits/men/78.jpg"
    },
    {
      id: 2,
      user: "DialogueExpert",
      date: "2023-11-20",
      content: "Some of the most quotable lines in cinema history. Tarantino's dialogue is unmatched.",
      avatar: "https://randomuser.me/api/portraits/women/26.jpg"
    }
  ],
  5: [
    {
      id: 1,
      user: "PhilosophicalViewer",
      date: "2023-12-12",
      content: "A scathing critique of consumerism wrapped in an entertaining package. Fincher's direction is impeccable.",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg"
    },
    {
      id: 2,
      user: "CinematicRebel",
      date: "2023-11-05",
      content: "The twist still works even when you know it's coming. That's good filmmaking.",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg"
    },
    {
      id: 3,
      user: "FilmTechnician",
      date: "2023-10-22",
      content: "The gritty visual style perfectly matches the story's tone. Every technical aspect serves the narrative.",
      avatar: "https://randomuser.me/api/portraits/men/36.jpg"
    }
  ]
};