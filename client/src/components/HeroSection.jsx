import React from 'react';
import { Calendar, Clock, Play, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/backgroundImage.png';
import marvelLogo from '../assets/marvelLogo.svg';

const HeroSection = ({ movie }) => {
  const navigate = useNavigate();

  const defaultMovie = {
    title: 'Avengers: Endgame',
    genres: ['Action', 'Adventure', 'Drama'],
    year: 2019,
    duration: '3h 1m',
    description: 'In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.',
    backgroundImage: backgroundImage,
    logo: marvelLogo,
    id: '1'
  };

  const displayMovie = movie || defaultMovie;

  const handleBookTickets = () => {
    navigate(`/movie/${displayMovie.id}`);
  };

  const handleWatchTrailer = () => {
    console.log('Watch trailer clicked');
  };

  return (
    <div 
      className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen relative'
      style={{
        backgroundImage: `url(${displayMovie.backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div className='absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent'></div>
      <div className='absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent'></div>

      <div className='relative z-10 max-w-3xl'>
        {displayMovie.logo && (
          <img 
            src={displayMovie.logo} 
            alt={`${displayMovie.title} logo`} 
            className="max-h-11 lg:h-14 mt-20 mb-6 object-contain"
          />
        )}

        <h1 className='text-5xl md:text-[70px] md:leading-20 font-semibold max-w-[600px] text-white mb-6'>
          {displayMovie.title.split(' ').slice(0, 2).join(' ')}
          {displayMovie.title.split(' ').length > 2 && (
            <>
              <br />
              {displayMovie.title.split(' ').slice(2).join(' ')}
            </>
          )}
        </h1>

        <div className='flex items-center gap-4 text-gray-300 text-sm md:text-base mb-6'>
          <span className='flex items-center gap-1.5'>
            {displayMovie.genres.join(' | ')}
          </span>
          
          <div className='flex items-center gap-1.5'>
            <Calendar className='w-4 h-4' />
            <span>{displayMovie.year}</span>
          </div>
          
          <div className='flex items-center gap-1.5'>
            <Clock className='w-4 h-4' />
            <span>{displayMovie.duration}</span>
          </div>
        </div>

        {displayMovie.description && (
          <p className='text-gray-200 text-base md:text-lg leading-relaxed max-w-2xl mb-8'>
            {displayMovie.description}
          </p>
        )}

        <div className='flex items-center gap-4 flex-wrap'>
          <button 
            onClick={() => navigate('/movies')}
            className='flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-md text-white font-semibold text-base shadow-lg hover:shadow-red-600/50 hover:scale-105'
          >
            Explore Movies
            <ArrowRight className="w-5 h-5"/>
          </button>
        </div>
      </div>

      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce'>
        <div className='w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2'>
          <div className='w-1 h-3 bg-white/50 rounded-full'></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;