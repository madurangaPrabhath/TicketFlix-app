import React, { useState, useEffect } from "react";
import {
  Star,
  Check,
  X,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { dummyShowsData } from "../../assets/assets";
import Title from "../../components/admin/Title";
import toast from "react-hot-toast";

const AddShows = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPrice, setShowPrice] = useState("");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [errors, setErrors] = useState({});

  const fetchNowPlayingMovies = async () => {
    try {
      setMovies(dummyShowsData);
    } catch (error) {
      console.error("Error fetching movies:", error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(selectedMovie?.id === movie.id ? null : movie);
    setErrors({ ...errors, movie: "" });
  };

  const validatePrice = (price) => {
    const priceNum = parseFloat(price);
    if (!price) return "Price is required";
    if (isNaN(priceNum) || priceNum <= 0) return "Price must be greater than 0";
    if (priceNum > 999) return "Price must be less than 999";
    return "";
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      setErrors({ ...errors, datetime: "Date and time is required" });
      return;
    }

    const selectedDateTime = new Date(dateTimeInput);
    const now = new Date();

    if (selectedDateTime <= now) {
      setErrors({
        ...errors,
        datetime: "Please select a future date and time",
      });
      return;
    }

    if (selectedTimes.some((time) => time === dateTimeInput)) {
      setErrors({ ...errors, datetime: "This time slot already exists" });
      return;
    }

    setSelectedTimes([...selectedTimes, dateTimeInput]);
    setDateTimeInput("");
    setErrors({ ...errors, datetime: "" });
    toast.success("Time slot added");
  };

  const handleRemoveTime = (index) => {
    setSelectedTimes(selectedTimes.filter((_, i) => i !== index));
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddShow = async () => {
    const newErrors = {};

    if (!selectedMovie) newErrors.movie = "Please select a movie";
    const priceError = validatePrice(showPrice);
    if (priceError) newErrors.price = priceError;
    if (selectedTimes.length === 0)
      newErrors.times = "Please add at least one time slot";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log({
        movie: selectedMovie,
        price: parseFloat(showPrice),
        times: selectedTimes,
      });

      toast.success("Show added successfully!");

      setSelectedMovie(null);
      setShowPrice("");
      setSelectedTimes([]);
      setDateTimeInput("");
      setErrors({});
    } catch (error) {
      toast.error("Failed to add show");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen">
      <Title text1="Add" text2="Shows" />

      <div className="grid grid-cols-1 gap-6">
        {/* Movie Selection Section */}
        <div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-red-600">◆</span> Select Movie
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                    selectedMovie?.id === movie.id
                      ? "ring-4 ring-red-600 shadow-lg shadow-red-600/50 scale-105"
                      : "hover:ring-2 hover:ring-gray-600"
                  }`}
                >
                  <div className="relative group">
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="w-full h-auto object-cover aspect-[3/4.5]"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/150x225?text=No+Image")
                      }
                    />

                    <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-md">
                      <Star size={12} fill="currentColor" />
                      {movie.vote_average.toFixed(1)}
                    </div>

                    {selectedMovie?.id === movie.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-red-600 rounded-full p-3 shadow-lg">
                          <Check
                            size={24}
                            className="text-white"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs md:text-sm">
                        Click to Select
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-800 min-h-20 flex flex-col justify-between border-t border-neutral-700">
                    <p className="text-white font-semibold text-xs md:text-sm truncate leading-tight">
                      {movie.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(movie.release_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {errors.movie && (
              <div className="mt-4 flex items-center gap-3 bg-red-600/20 border border-red-600 text-red-400 p-4 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm">{errors.movie}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div>
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-700">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-red-600">◆</span> Details
            </h2>

            {selectedMovie && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-600/10 to-red-600/5 rounded-lg border border-red-600/30">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-2">
                  ✓ Selected Movie
                </p>
                <p className="text-white font-semibold text-sm truncate">
                  {selectedMovie.title}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Show Price ($)
              </label>
              <div className="relative">
                <DollarSign
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={showPrice}
                  onChange={(e) => {
                    setShowPrice(e.target.value);
                    setErrors({ ...errors, price: "" });
                  }}
                  className={`w-full bg-neutral-800 text-white pl-11 pr-4 py-3 rounded-lg border outline-none transition focus:ring-2 ${
                    errors.price
                      ? "border-red-600 focus:ring-red-500/50"
                      : "border-neutral-700 focus:border-red-600 focus:ring-red-500/30"
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.price}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Add Show Time
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Calendar
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <input
                    type="datetime-local"
                    value={dateTimeInput}
                    onChange={(e) => {
                      setDateTimeInput(e.target.value);
                      setErrors({ ...errors, datetime: "" });
                    }}
                    className={`w-full bg-neutral-800 text-white px-4 py-3 pl-11 rounded-lg border outline-none transition focus:ring-2 text-sm ${
                      errors.datetime
                        ? "border-red-600 focus:ring-red-500/50"
                        : "border-neutral-700 focus:border-red-600 focus:ring-red-500/30"
                    }`}
                  />
                </div>
                <button
                  onClick={handleDateTimeAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 whitespace-nowrap sm:flex-none"
                  title="Add time slot"
                >
                  <Plus size={18} />
                  <span className="inline">Add</span>
                </button>
              </div>
              {errors.datetime && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.datetime}
                </p>
              )}
            </div>

            {selectedTimes.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-blue-600/30 text-blue-400 px-2 py-1 rounded text-xs font-bold">
                    {selectedTimes.length}
                  </span>
                  Time Slots
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedTimes.map((time, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg border border-neutral-700 hover:border-neutral-600 transition group"
                    >
                      <span className="text-gray-300 text-sm font-medium">
                        {formatDateTime(time)}
                      </span>
                      <button
                        onClick={() => handleRemoveTime(index)}
                        className="text-gray-500 hover:text-red-500 transition p-1 hover:bg-red-600/10 rounded"
                        title="Remove time slot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.times && (
              <div className="mb-6 flex items-center gap-3 bg-red-600/20 border border-red-600 text-red-400 p-4 rounded-lg">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm">{errors.times}</span>
              </div>
            )}

            <button
              onClick={handleAddShow}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-bold transition-all duration-200 transform hover:shadow-lg hover:shadow-red-600/40 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Show
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
      `}</style>
    </div>
  );
};

export default AddShows;
