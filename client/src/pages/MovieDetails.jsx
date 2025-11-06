import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import DateSelect from "../components/DateSelect";
import {
  Play,
  Heart,
  Star,
  Calendar,
  Clock,
  Languages,
  Share2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const getShow = async () => {
    const movie = dummyShowsData.find((show) => show._id === id);
    if (movie) {
      setShow({
        movie: movie,
        dateTime: dummyDateTimeData,
      });
    }
  };

  useEffect(() => {
    getShow();
    window.scrollTo(0, 0);
  }, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      { icon: "❤️" }
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: show?.movie.title,
        text: show?.movie.overview,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!show) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full">
        <div className="absolute inset-0 h-[50vh] md:h-[70vh]">
          <img
            src={show.movie.backdrop_path || show.movie.poster_path}
            alt={show.movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-36 py-12 md:py-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl">
            <div className="flex-shrink-0 w-full sm:w-64 md:w-72 lg:w-80">
              <img
                src={show.movie.poster_path}
                alt={show.movie.title}
                className="w-full rounded-2xl shadow-2xl shadow-black/80 border-2 border-white/10 hover:border-white/20 transition-colors"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4 md:space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                  {show.movie.original_language?.toUpperCase() || "EN"}
                </span>
                <span className="px-3 py-1.5 bg-red-600/20 backdrop-blur-sm text-red-300 text-xs sm:text-sm font-medium rounded-full border border-red-600/30 hover:bg-red-600/30 transition-colors">
                  {show.movie.release_date?.split("-")[0]}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {show.movie.title}
                </h1>
                {show.movie.tagline && (
                  <p className="text-gray-400 text-base md:text-lg italic mt-3">
                    "{show.movie.tagline}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 bg-yellow-500/15 px-3 py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/25 transition-colors">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-sm md:text-base">
                    {show.movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-xs md:text-sm">
                    ({show.movie.vote_count?.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-colors">
                  <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">
                    {formatRuntime(show.movie.runtime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300 px-3 py-2 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-colors">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">
                    {new Date(show.movie.release_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {show.movie.genres?.slice(0, 5).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 bg-neutral-800/60 backdrop-blur-sm text-gray-300 text-xs md:text-sm rounded-full border border-neutral-700 hover:bg-neutral-800/80 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl pt-2">
                {show.movie.overview?.slice(0, 200)}
                {show.movie.overview?.length > 200 ? "..." : ""}
              </p>

              <div className="flex flex-wrap gap-2 md:gap-3 pt-4">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 text-sm md:text-base"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Trailer</span>
                </button>

                <a
                  href="#dateSelect"
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 text-sm md:text-base"
                >
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Book</span>
                </a>

                <button
                  onClick={handleFavorite}
                  className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 ${
                    isFavorite
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      isFavorite ? "fill-white" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 md:px-4 py-2.5 md:py-3 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="dateSelect" className="scroll-mt-20">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      {show.movie.casts && show.movie.casts.length > 0 && (
        <div className="px-6 md:px-12 lg:px-36 py-16 bg-black">
          <h2 className="text-3xl font-bold text-white mb-8">
            Your Favorite Cast
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
            {show.movie.casts.slice(0, 12).map((cast, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                  <img
                    src={cast.profile_path}
                    alt={cast.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-white text-sm font-medium text-center line-clamp-2">
                  {cast.name}
                </p>
                {cast.character && (
                  <p className="text-gray-400 text-xs text-center line-clamp-1">
                    {cast.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-12 lg:px-36 py-16 bg-neutral-950">
        <h2 className="text-3xl font-bold text-white mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
          {dummyShowsData
            .filter((movie) => movie._id !== id)
            .slice(0, 6)
            .map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/movies")}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            Show More Movies
          </button>
        </div>
      </div>

      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-600 transition-colors text-4xl font-bold"
            >
              ×
            </button>
            <div className="w-full h-full bg-neutral-900 rounded-lg flex items-center justify-center">
              <p className="text-white text-lg">Trailer player would go here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
