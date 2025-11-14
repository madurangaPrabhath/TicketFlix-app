import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:3000/api";

  useEffect(() => {
    if (!dateTime || Object.keys(dateTime).length === 0) {
      fetchShowsAndBuildDates();
    } else {
      setDates(Object.keys(dateTime));
    }
  }, [dateTime, id]);

  const fetchShowsAndBuildDates = async () => {
    try {
      setLoading(true);
      console.log("Fetching shows for movie:", id);

      const response = await axios.get(`${API_BASE_URL}/shows/movie/${id}`);
      console.log("Shows response:", response.data);

      if (response.data.success && response.data.data) {
        const shows = response.data.data;

        const dateSet = new Set();
        (shows || []).forEach((show) => {
          if (show.showDate) {
            const dateStr = new Date(show.showDate).toISOString().split("T")[0];
            dateSet.add(dateStr);
          }
        });

        const uniqueDates = Array.from(dateSet).sort();
        setDates(uniqueDates);

        if (uniqueDates.length === 0) {
          console.warn("No shows found for this movie");
          toast.error("No shows available for this movie");
        }
      } else {
        console.warn("No shows data received");
        toast.error("Failed to load available dates");
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Failed to load available dates");
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      return { day, month, weekday };
    } catch (error) {
      return { day: "?", month: "?", weekday: "?" };
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const onBookHandler = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toISOString().split("T")[0];

    navigate(`/movie/${id}/${formattedDate}`, {
      state: { selectedDate: selectedDate },
    });
    window.scrollTo(0, 0);
  };

  if (!dates || dates.length === 0) {
    return (
      <div className="px-6 md:px-12 lg:px-36 py-16 bg-neutral-950">
        <div className="text-center text-gray-400 py-12">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-lg">
            {loading ? "Loading available dates..." : "No available dates"}
          </p>
          {!loading && (
            <p className="text-sm text-gray-500 mt-2">
              This movie has no scheduled shows
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 lg:px-36 py-16 bg-neutral-950 relative">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-red-600" />
            Select Date
          </h2>
          <p className="text-gray-400">
            Choose your preferred date to proceed with booking
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Choose Date</h3>

          <div className="relative group">
            {dates.length > 4 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-12 py-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {dates.map((date) => {
                const { day, month, weekday } = formatDate(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => handleDateClick(date)}
                    type="button"
                    className={`
                      flex-shrink-0 w-28 p-4 rounded-xl border-2 
                      transition-all duration-300 cursor-pointer
                      ${
                        isSelected
                          ? "bg-gradient-to-br from-red-600 to-red-700 border-red-500 shadow-lg shadow-red-600/50 scale-105 text-white"
                          : "bg-neutral-900 border-neutral-700 text-white hover:border-red-500 hover:bg-neutral-800 hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="text-xs font-semibold mb-2 uppercase">
                        {weekday}
                      </div>
                      <div className="text-3xl font-bold mb-1">{day}</div>
                      <div className="text-xs uppercase opacity-80">
                        {month}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDate && (
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-2xl p-6 shadow-xl animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-bold text-lg mb-3">
                  Your Selection
                </h4>
                <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span>
                      {formatDate(selectedDate).weekday},{" "}
                      {formatDate(selectedDate).month}{" "}
                      {formatDate(selectedDate).day}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onBookHandler}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Proceed to Booking
              </button>
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center text-gray-400 py-12 bg-neutral-900 rounded-xl border border-neutral-800">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-lg">
              Please select a date to proceed with booking
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DateSelect;
