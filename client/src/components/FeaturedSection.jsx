import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Star } from 'lucide-react';

const FeaturedSection = () => {
  const navigate = useNavigate();

  const featuredMovies = [
    {
      id: 1,
      title: 'Spider-Man: No Way Home',
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      rating: 8.5,
      year: '2021',
      duration: '2h 28m',
      genres: ['Action', 'Adventure', 'Sci-Fi']
    },
    {
      id: 2,
      title: 'The Batman',
      poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      rating: 8.2,
      year: '2022',
      duration: '2h 56m',
      genres: ['Action', 'Crime', 'Drama']
    },
    {
      id: 3,
      title: 'Dune',
      poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      rating: 8.0,
      year: '2021',
      duration: '2h 35m',
      genres: ['Sci-Fi', 'Adventure']
    },
    {
      id: 4,
      title: 'Top Gun: Maverick',
      poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      rating: 8.4,
      year: '2022',
      duration: '2h 10m',
      genres: ['Action', 'Drama']
    },
    {
      id: 5,
      title: 'Avatar: The Way of Water',
      poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      rating: 7.9,
      year: '2022',
      duration: '3h 12m',
      genres: ['Sci-Fi', 'Adventure']
    },
    {
      id: 6,
      title: 'Black Panther',
      poster: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
      rating: 7.3,
      year: '2018',
      duration: '2h 14m',
      genres: ['Action', 'Adventure']
    }
  ];

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    window.scrollTo(0, 0);
  };

  return (
    <section className="px-6 md:px-16 lg:px-36 py-16 bg-black">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600 rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Now Showing</h2>
        </div>
        <button 
          onClick={() => navigate('/movies')}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors duration-300"
        >
          View All
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {featuredMovies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => handleMovieClick(movie.id)}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative aspect-2/3 rounded-lg overflow-hidden shadow-lg mb-3">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{movie.year}</span>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {movie.genres.slice(0, 2).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-red-600/80 text-white rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-semibold text-white">{movie.rating}</span>
              </div>
            </div>

            <h3 className="text-sm md:text-base font-semibold text-white line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
              {movie.title}
            </h3>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={() => {
            navigate('/movies');
            window.scrollTo(0, 0);
          }}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-600/50"
        >
          Show More
        </button>
      </div>
    </section>
  );
};

export default FeaturedSection;