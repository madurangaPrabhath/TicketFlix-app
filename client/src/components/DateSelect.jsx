import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import React, { useState, useRef } from "react";
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
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return { day, month, weekday };
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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

    const selectedShow = dateTime[selectedDate].find(
      (show) => show.time === selectedTime
    );

    if (selectedShow) {
      navigate(`/movie/${id}/${selectedShow.showId}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="px-6 md:px-12 lg:px-36 py-16 bg-neutral-950">
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

          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-white transition-colors duration-300 shadow-lg"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-12 py-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {dates.map((date) => {
                const { day, month, weekday } = formatDate(date);
                const isPast = isDateInPast(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => {
                      if (!isPast) {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }
                    }}
                    disabled={isPast}
                    className={`shrink-0 w-24 p-4 rounded-xl border-2 transition-all duration-300 ${
                      isPast
                        ? "bg-neutral-900/50 border-neutral-800 cursor-not-allowed opacity-50"
                        : isSelected
                        ? "bg-red-600 border-red-600 shadow-lg shadow-red-600/30 scale-105"
                        : "bg-neutral-900 border-neutral-700 hover:border-red-600/50 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="text-center">
                      <p
                        className={`text-xs font-medium mb-1 ${
                          isPast
                            ? "text-gray-600"
                            : isSelected
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {weekday}
                      </p>
                      <p
                        className={`text-2xl font-bold mb-1 ${
                          isPast
                            ? "text-gray-600"
                            : isSelected
                            ? "text-white"
                            : "text-white"
                        }`}
                      >
                        {day}
                      </p>
                      <p
                        className={`text-xs ${
                          isPast
                            ? "text-gray-600"
                            : isSelected
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      >
                        {month}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-white transition-colors duration-300 shadow-lg"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {selectedDate && (
          <div className="mb-8 animate-fadeIn">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              Select Show Time
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dateTime[selectedDate].map((show, index) => {
                const time = formatTime(show.time);
                const isSelected = selectedTime === show.time;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedTime(show.time)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isSelected
                        ? "bg-red-600 border-red-600 shadow-lg shadow-red-600/30 scale-105"
                        : "bg-neutral-900 border-neutral-700 hover:border-red-600/50 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="text-center">
                      <Clock
                        className={`w-5 h-5 mx-auto mb-2 ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`text-lg font-semibold ${
                          isSelected ? "text-white" : "text-white"
                        }`}
                      >
                        {time}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Your Selection
                </h4>
                <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span>
                      {formatDate(selectedDate).weekday},{" "}
                      {formatDate(selectedDate).month}{" "}
                      {formatDate(selectedDate).day}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>{formatTime(selectedTime)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onBookHandler}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 hover:scale-105 whitespace-nowrap"
              >
                Book Now
              </button>
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="text-center text-gray-500 text-sm mt-8">
            Please select a date to view available show times
          </div>
        )}
      </div>
    </div>
  );
};

export default DateSelect;
