import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Clock } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const genreString = movie.genres?.slice(0, 2).map(genre => genre.name).join(' | ') || '';

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  const handleMovieClick = () => {
    navigate(`/movie/${movie.id}`);
    window.scrollTo(0, 0);
  };

  const handleBuyTickets = (e) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
      <div 
        onClick={handleMovieClick}
        className="relative aspect-2/3 rounded-lg overflow-hidden shadow-lg mb-3"
      >
        <img
          src={movie.poster_path || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <Calendar className="w-3 h-3" />
            <span>{releaseYear}</span>
            <Clock className="w-3 h-3 ml-2" />
            <span>{formatRuntime(movie.runtime)}</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres?.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-red-600/80 text-white rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <button
            onClick={handleBuyTickets}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-red-600/50"
          >
            Buy Tickets
          </button>
        </div>

        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span className="text-xs font-semibold text-white">
            {movie.vote_average?.toFixed(1) || 'N/A'}
          </span>
        </div>
      </div>

      <h3 
        onClick={handleMovieClick}
        className="text-sm md:text-base font-semibold text-white line-clamp-2 group-hover:text-red-600 transition-colors duration-300 mb-1"
      >
        {movie.title}
      </h3>

      <p className="text-xs text-gray-400 line-clamp-1">
        {releaseYear} • {genreString} • {formatRuntime(movie.runtime)}
      </p>
    </div>
  );
};

export default MovieCard;