import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import {
  Heart,
  Trash2,
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Favorite = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { getUserFavorites, removeFromFavorites, userFavorites } =
    useAppContext();
  const [favoritesList, setFavoritesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently-added");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        if (userId) {
          console.log("Loading favorites for userId:", userId);
          const userFavorites = await getUserFavorites(userId);
          console.log("Received favorites from API:", userFavorites);
          setFavoritesList(userFavorites || []);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
        toast.error("Failed to load favorites");
        setFavoritesList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [userId]);

  useEffect(() => {
    console.log("userFavorites from AppContext changed:", userFavorites);
    if (userFavorites && Array.isArray(userFavorites)) {
      console.log("Setting favoritesList to userFavorites");
      setFavoritesList(userFavorites);
    }
  }, [userFavorites]);

  // Fetch full movie data for each favorite that only has movieId
  const enrichedFavorites = favoritesList.map((fav) => {
    const movie = fav.movieId || fav;
    // If movie is just a number (TMDB ID), we'll need to fetch it
    // For now, return as-is and let MovieCard handle it
    return {
      ...fav,
      movieId: movie,
    };
  });

  const filteredFavorites = favoritesList
    .filter((fav) => {
      const movie = fav.movieId || fav;
      const title = movie?.title || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((favA, favB) => {
      const movieA = favA.movieId || favA;
      const movieB = favB.movieId || favB;

      switch (sortBy) {
        case "recently-added":
          return (
            new Date(favB.addedAt || favB.createdAt || 0) -
            new Date(favA.addedAt || favA.createdAt || 0)
          );
        case "title":
          return (movieA?.title || "").localeCompare(movieB?.title || "");
        case "rating":
          return (movieB?.vote_average || 0) - (movieA?.vote_average || 0);
        default:
          return 0;
      }
    });

  console.log("favoritesList:", favoritesList);
  console.log("filteredFavorites:", filteredFavorites);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      if (!userId) return;
      await removeFromFavorites(userId, favoriteId);
      const updatedList = favoritesList.filter(
        (movie) => movie._id !== favoriteId
      );
      setFavoritesList(updatedList);
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to remove all favorites?")) {
      try {
        setIsLoading(true);
        if (!userId) return;
        for (const fav of favoritesList) {
          await removeFromFavorites(userId, fav._id);
        }
        setFavoritesList([]);
        toast.success("All favorites cleared");
      } catch (error) {
        console.error("Error clearing favorites:", error);
        toast.error("Failed to clear favorites");
        if (userId) {
          const userFavorites = await getUserFavorites(userId);
          setFavoritesList(userFavorites || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16">
        <div className="px-6 md:px-12 lg:px-36">
          <div className="animate-pulse">
            <div className="h-12 bg-neutral-800 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-2/3 bg-neutral-800 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-36">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            My Favorites
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {favoritesList.length}{" "}
            {favoritesList.length === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        {favoritesList.length > 0 ? (
          <>
            <div className="mb-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search in favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
                  >
                    <option value="recently-added">Recently Added</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="rating">Rating</option>
                  </select>

                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3.5 bg-neutral-900 hover:bg-red-600 border border-neutral-800 hover:border-red-600 text-white rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredFavorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredFavorites.map((fav) => {
                  const movie = fav.movieId ? fav.movieId : fav;
                  const favoriteId = fav._id || fav.id;

                  console.log("Rendering favorite:", {
                    fav,
                    movie,
                    favoriteId,
                  });

                  if (!movie) {
                    console.warn("No movie found in favorite:", fav);
                    return null;
                  }

                  return (
                    <div key={favoriteId} className="relative group">
                      <MovieCard movie={movie} />

                      <button
                        onClick={() => handleRemoveFavorite(favoriteId)}
                        className="absolute top-3 right-3 z-20 p-2 bg-black/80 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>

                      <div className="absolute top-3 left-3 z-20 p-2 bg-red-600/90 rounded-full">
                        <Heart className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  No favorites match your search. Try a different keyword.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-gray-700" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              No Favorites Yet
            </h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Start adding movies to your favorites to see them here. Browse our
              collection and click the heart icon on any movie you love!
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorite;
