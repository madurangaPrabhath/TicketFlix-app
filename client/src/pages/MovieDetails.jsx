import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import MovieCard from "../components/MovieCard";
import DateSelect from "../components/DateSelect";
import { Play, Heart, Star, Calendar, Clock, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userId } = useAuth();
  const {
    getMovieById,
    getShowsByMovieId,
    addToFavorites,
    removeFromFavorites,
    userFavorites,
    movies,
  } = useAppContext();

  const [movie, setMovie] = useState(null);
  const [dateTime, setDateTime] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  const formatRuntime = (minutes) => {
    const hours = Math.floor((minutes || 0) / 60);
    const mins = (minutes || 0) % 60;
    return `${hours}h ${mins}m`;
  };

  const buildDateTimeMap = (shows = []) => {
    const map = {};
    (shows || []).forEach((s) => {
      const d = s.showDate
        ? new Date(s.showDate).toISOString().split("T")[0]
        : null;
      if (!d) return;
      if (!map[d]) map[d] = [];
      map[d].push({
        id: s._id || s.id,
        time: s.showTime || s.time || "",
        theater: s.theater || null,
        pricing: s.pricing || null,
      });
    });
    return map;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        console.log("MovieDetails: Loading movie with id:", id);
        const m = await getMovieById(id);
        console.log("MovieDetails: Loaded movie:", m);
        const shows = await getShowsByMovieId(id);
        setMovie(m || null);
        const dt = buildDateTimeMap(shows || []);
        setDateTime(dt);

        if (userFavorites && Array.isArray(userFavorites)) {
          const fav = userFavorites.some((f) => {
            const favMovie = f.movieId || f;
            return favMovie?._id === m?._id || favMovie?.id === m?.id;
          });
          setIsFavorite(!!fav);
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);
        toast.error("Failed to load movie details");
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    load();
  }, [id, userFavorites]);

  const handleFavorite = async () => {
    try {
      console.log("MovieDetails: handleFavorite called -", {
        movie,
        userId,
        isFavorite,
      });

      if (!movie || !userId) {
        toast.error("Please sign in to add favorites");
        return;
      }

      if (isFavorite) {
        console.log("MovieDetails: Removing from favorites");
        const favorite = userFavorites?.find((f) => {
          const favMovie = f.movieId || f;
          return (
            favMovie?.id === id ||
            favMovie?._id === id ||
            Number(favMovie?.id) === Number(id) ||
            String(favMovie?.id) === String(id)
          );
        });

        if (favorite?._id) {
          await removeFromFavorites(userId, favorite._id);
          setIsFavorite(false);
          toast.success("Removed from favorites");
        } else {
          toast.error("Could not find favorite to remove");
        }
      } else {
        console.log("MovieDetails: Adding to favorites with movieId:", id);
        await addToFavorites(userId, id);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: movie?.overview,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Movie not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full">
        <div className="absolute inset-0 h-[40vh] sm:h-[50vh] md:h-[65vh] lg:h-[75vh]">
          <img
            src={movie.backdrop_path || movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-36 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-12 max-w-7xl">
            <div className="flex-shrink-0 w-full sm:w-60 md:w-72 lg:w-80 mx-auto sm:mx-0">
              <img
                src={movie.poster_path}
                alt={movie.title}
                className="w-full rounded-lg sm:rounded-2xl shadow-2xl shadow-black/80 border border-white/10 sm:border-2 hover:border-white/20 transition-colors"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                  {movie.original_language?.toUpperCase() || "EN"}
                </span>
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600/20 backdrop-blur-sm text-red-300 text-xs font-medium rounded-full border border-red-600/30 hover:bg-red-600/30 transition-colors">
                  {movie.release_date?.split("-")[0]}
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg italic mt-2 sm:mt-3">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-500/15 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/25 transition-colors text-xs sm:text-sm">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="text-white font-semibold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-colors text-xs sm:text-sm">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600/30 hover:border-gray-500/50 transition-colors text-xs sm:text-sm">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span>
                    {new Date(movie.release_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl pt-4">
                {movie.overview || "No description available"}
              </p>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Trailer</span>
                </button>

                <a
                  href="#dateSelect"
                  className="flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-black rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>Book</span>
                </a>

                <button
                  onClick={handleFavorite}
                  className={`px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                    isFavorite
                      ? "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-gray-300"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                      isFavorite ? "fill-white" : ""
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-gray-300 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="dateSelect" className="scroll-mt-20">
        <DateSelect dateTime={dateTime} id={id} />
      </div>

      {movie.casts && movie.casts.length > 0 && (
        <div className="px-4 sm:px-6 md:px-12 lg:px-36 py-8 sm:py-12 md:py-16 bg-black border-t border-neutral-800">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
            Cast
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {movie.casts.map((cast) => (
              <div key={cast.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl aspect-square mb-2 sm:mb-3 bg-neutral-800 border border-neutral-700 hover:border-red-600/50 transition-colors">
                  {cast.profile_path ? (
                    <img
                      src={cast.profile_path}
                      alt={cast.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
                      <div className="text-center">
                        <span className="text-2xl sm:text-3xl text-neutral-500">
                          👤
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <p className="text-white text-xs sm:text-sm font-semibold text-center line-clamp-2 group-hover:text-red-600 transition-colors">
                  {cast.name}
                </p>
                {cast.character && (
                  <p className="text-gray-400 text-xs text-center line-clamp-1 mt-0.5 hover:text-gray-300 transition-colors">
                    as {cast.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(movies || []).filter((m) => (m._id || m.id) !== (movie._id || movie.id))
        .length > 0 ? (
        <div className="px-4 sm:px-6 md:px-12 lg:px-36 py-8 sm:py-12 md:py-16 bg-neutral-950">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
            More Like This
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {(movies || [])
              .filter((m) => (m._id || m.id) !== (movie._id || movie.id))
              .slice(0, 6)
              .map((m) => (
                <MovieCard key={m._id || m.id} movie={m} />
              ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/movies")}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              Show More Movies
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 md:px-12 lg:px-36 py-8 sm:py-12 md:py-16 bg-neutral-950">
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm sm:text-base">
              Browse more movies in our collection
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="mt-4 px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-medium transition-colors duration-300 text-sm sm:text-base"
            >
              Explore All Movies
            </button>
          </div>
        </div>
      )}

      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-red-600 transition-colors text-3xl sm:text-4xl font-bold z-10"
            >
              ×
            </button>
            <div className="w-full h-full bg-neutral-900 rounded-lg sm:rounded-2xl flex items-center justify-center">
              <p className="text-white text-base sm:text-lg">
                Trailer player would go here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
