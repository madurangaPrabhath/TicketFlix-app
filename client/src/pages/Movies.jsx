import React, { useState, useMemo, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";

const Movies = () => {
  const { fetchAllMovies } = useAppContext();
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const movies = await fetchAllMovies();
        setAllMovies(movies || []);

        if (!movies || movies.length === 0) {
          toast("No movies available in database", { icon: "🎬" });
        }
      } catch (error) {
        console.error("Error loading movies:", error);
        toast.error("Failed to load movies. Check console for details.");
        setAllMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);
  const genres = useMemo(() => {
    const allGenres = allMovies.flatMap((movie) =>
      (movie.genres || []).map((g) => (typeof g === "object" ? g.name : g))
    );
    return ["All", ...new Set(allGenres)];
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    let filtered = allMovies.filter((movie) => {
      const matchesSearch = movie.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const movieGenreNames = (movie.genres || []).map((g) =>
        typeof g === "object" ? g.name : g
      );
      const matchesGenre =
        selectedGenre === "All" || movieGenreNames.includes(selectedGenre);

      return matchesSearch && matchesGenre;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return (b.vote_average || 0) - (a.vote_average || 0);
        case "title":
          return a.title.localeCompare(b.title);
        case "release_date":
          return new Date(b.release_date) - new Date(a.release_date);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedGenre, sortBy, allMovies]);

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-36">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Now Showing
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Discover the latest movies and book your tickets
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading movies...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white hover:border-red-600 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <div
                className={`${
                  showFilters ? "flex" : "hidden"
                } md:flex flex-col md:flex-row gap-4`}
              >
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="release_date">Release Date</option>
                  </select>
                </div>

                {(selectedGenre !== "All" ||
                  sortBy !== "popularity" ||
                  searchQuery) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedGenre("All");
                        setSortBy("popularity");
                        setSearchQuery("");
                      }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 whitespace-nowrap"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 text-sm">
                {filteredMovies.length}{" "}
                {filteredMovies.length === 1 ? "movie" : "movies"} found
              </p>
            </div>

            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard movie={movie} key={movie._id} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Movies Found
                </h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  No movies match your search criteria. Try adjusting your
                  filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedGenre("All");
                    setSortBy("popularity");
                    setSearchQuery("");
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Movies;
