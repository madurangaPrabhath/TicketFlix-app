import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { dummyShowsData } from '../assets/assets';
import MovieCard from './MovieCard';

const FeaturedSection = () => {
  const navigate = useNavigate();
  
  const featuredMovies = dummyShowsData.slice(0, 6).map(movie => ({
    ...movie,
    poster: movie.poster_path,
  }));

  const handleViewAll = () => {
    navigate('/movies');
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
          onClick={handleViewAll}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors duration-300 group"
          aria-label="View all movies"
        >
          <span className="hidden sm:inline">View All</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {featuredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={handleViewAll}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-600/50"
          aria-label="Show more movies"
        >
          Show More
        </button>
      </div>
    </section>
  );
};

export default FeaturedSection;