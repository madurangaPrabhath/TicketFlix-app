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
      <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={show.movie.backdrop_path || show.movie.poster_path}
            alt={show.movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 h-full px-6 md:px-12 lg:px-36 pt-24 pb-16">
          <div className="h-full flex flex-col md:flex-row gap-8 items-end md:items-center">
            <div className="shrink-0">
              <img
                src={show.movie.poster_path}
                alt={show.movie.title}
                className="w-48 md:w-64 lg:w-80 rounded-xl shadow-2xl shadow-black/50 border-2 border-white/10"
              />
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20">
                  {show.movie.original_language?.toUpperCase() || "EN"}
                </span>
                <span className="px-3 py-1 bg-red-600/20 backdrop-blur-sm text-red-400 text-sm font-medium rounded-full border border-red-600/30">
                  {show.movie.release_date?.split("-")[0]}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {show.movie.title}
              </h1>

              {show.movie.tagline && (
                <p className="text-gray-400 text-lg italic mb-4">
                  "{show.movie.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/30">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-semibold">
                    {show.movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({show.movie.vote_count?.toLocaleString()} votes)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{formatRuntime(show.movie.runtime)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(show.movie.release_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-neutral-800/80 backdrop-blur-sm text-gray-300 text-sm rounded-full border border-neutral-700"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-3xl">
                {show.movie.overview}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </button>

                <a
                  href="#dateSelect"
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Tickets
                </a>

                <button
                  onClick={handleFavorite}
                  className={`px-4 py-3 ${
                    isFavorite
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  } text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2`}
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
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
