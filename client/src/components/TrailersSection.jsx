import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import { dummyTrailers } from '../assets/assets';

const TrailersSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(null);

  const handleTrailerClick = (trailer) => {
    setCurrentTrailer(trailer);
  };

  const handleClose = () => {
    setCurrentTrailer(null);
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && currentTrailer) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [currentTrailer]);

  return (
    <section className="px-6 md:px-16 lg:px-36 py-16 bg-black relative overflow-hidden">
      <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-1 h-8 bg-red-600 rounded-full"></div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Latest Trailers</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {dummyTrailers.map((trailer, index) => (
          <div
            key={index}
            onClick={() => handleTrailerClick(trailer)}
            className="group relative cursor-pointer rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20"
          >
            <div className="relative aspect-video">
              <img
                src={trailer.image}
                alt={`Trailer ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600 shadow-lg">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-600/50 rounded-lg transition-all duration-300"></div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black via-black/80 to-transparent">
              <p className="text-white text-sm font-semibold group-hover:text-red-600 transition-colors duration-300">
                Watch Trailer {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      {currentTrailer && (
        <div 
          className="fixed inset-0 bg-black/95 z-9999 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-red-600 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-10"
            aria-label="Close video"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>

          <div 
            className="w-full max-w-6xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-2xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeId(currentTrailer.videoUrl)}?autoplay=1&modestbranding=1&rel=0&controls=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TrailersSection;