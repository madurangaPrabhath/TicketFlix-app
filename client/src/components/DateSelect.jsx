import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = Object.keys(dateTime);

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

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const onBookHandler = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedTime) {
      toast.error("Please select a show time");
      return;
    }

    const selectedShow = dateTime[selectedDate]?.find(
      (show) => show.time === selectedTime
    );

    if (selectedShow) {
      navigate(`/movie/${id}/${selectedShow.showId}`);
      window.scrollTo(0, 0);
    } else {
      toast.error("Show not found");
    }
  };

  if (!dates || dates.length === 0) {
    return (
      <div className="px-6 md:px-12 lg:px-36 py-16 bg-neutral-950">
        <div className="text-center text-gray-400 py-12">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-lg">No available dates</p>
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
            Select Date & Time
          </h2>
          <p className="text-gray-400">
            Choose your preferred date and show time to proceed with booking
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
                      <div className="text-3xl font-bold mb-1">
                        {day}
                      </div>
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

        {selectedDate && dateTime[selectedDate] && dateTime[selectedDate].length > 0 ? (
          <div className="mb-8 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Select Show Time
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dateTime[selectedDate].map((show, index) => {
                const time = formatTime(show.time);
                const isSelected = selectedTime === show.time;

                return (
                  <button
                    key={index}
                    onClick={() => handleTimeClick(show.time)}
                    type="button"
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                      ${
                        isSelected
                          ? "bg-gradient-to-br from-green-600 to-green-700 border-green-500 shadow-lg shadow-green-600/50 scale-105"
                          : "bg-neutral-900 border-neutral-700 text-white hover:border-green-500 hover:bg-neutral-800 hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    <div className="text-center">
                      <Clock
                        className={`w-5 h-5 mx-auto mb-2 ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      />
                      <p className="text-lg font-semibold text-white">
                        {time}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isSelected ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {show.availableSeats || "Available"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : selectedDate ? (
          <div className="text-center text-gray-400 py-8">
            No show times available for this date
          </div>
        ) : null}

        {selectedDate && selectedTime && (
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
                  <div className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{formatTime(selectedTime)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onBookHandler}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                Proceed to Book
              </button>
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center text-gray-400 py-12 bg-neutral-900 rounded-xl border border-neutral-800">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-lg">
              Please select a date to view available show times
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
