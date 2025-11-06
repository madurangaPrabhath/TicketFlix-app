import { useParams, useNavigate, useLocation } from "react-router-dom";
import { dummyShowsData } from "../assets/assets";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, Check, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const SeatLayout = () => {
  const { id, showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const bookedSeats = ["A1", "A2", "B5", "C3", "D7", "E2"];

  const availableTimes = [
    { time: "09:00 AM", availableSeats: 45 },
    { time: "12:30 PM", availableSeats: 32 },
    { time: "03:45 PM", availableSeats: 28 },
    { time: "06:15 PM", availableSeats: 15 },
    { time: "09:30 PM", availableSeats: 50 },
  ];

  const getShow = async () => {
    try {
      const movie = dummyShowsData.find((show) => show._id === id);
      console.log("Found movie:", movie);

      if (movie) {
        setShow({
          movie: movie,
        });
      } else {
        console.error("Movie not found with id:", id);
      }
    } catch (error) {
      console.error("Error fetching show:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getShow();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (location.state?.selectedDate) {
      setSelectedDate(location.state.selectedDate);
      console.log("Received date from previous page:", location.state.selectedDate);
    }
  }, [location.state]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      return { day, month, weekday };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { day: "?", month: "?", weekday: "?" };
    }
  };

  const handleSeatClick = (seat) => {
    if (!selectedTime) {
      toast.error("Please select a show time first");
      return;
    }

    if (bookedSeats.includes(seat)) {
      toast.error("This seat is already booked");
      return;
    }

    if (!selectedSeats.includes(seat) && selectedSeats.length >= 10) {
      toast.error("You can only select up to 10 seats");
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        return prev.filter((s) => s !== seat);
      }
      return [...prev, seat];
    });
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 justify-center">
      {Array.from({ length: count }).map((_, index) => {
        const seatNumber = `${row}${index + 1}`;
        const isSelected = selectedSeats.includes(seatNumber);
        const isBooked = bookedSeats.includes(seatNumber);

        return (
          <button
            key={seatNumber}
            onClick={() => handleSeatClick(seatNumber)}
            disabled={isBooked}
            className={`
              w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-semibold
              ${
                isBooked
                  ? "bg-red-600/50 cursor-not-allowed opacity-50"
                  : isSelected
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-green-500 cursor-pointer active:scale-95"
              }
            `}
          >
            {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
            {!isSelected && !isBooked && (
              <span className="text-xs">{index + 1}</span>
            )}
            {isBooked && <span className="text-xs">×</span>}
          </button>
        );
      })}
    </div>
  );

  const ticketPrice = 12;
  const totalPrice = selectedSeats.length * ticketPrice;
  const convenienceFee = selectedSeats.length * 1.5;
  const grandTotal = totalPrice + convenienceFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading seat layout...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <p className="text-white text-lg mb-4">Show not found</p>
          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-8 sm:pb-16">
      <div className="px-4 sm:px-6 md:px-12 lg:px-36 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
          {show.movie.title}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Select your seats and proceed to checkout
        </p>
      </div>

      <div className="px-4 sm:px-6 md:px-12 lg:px-36">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-800">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                Select Show Time
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {availableTimes.map((item) => (
                  <button
                    key={item.time}
                    onClick={() => setSelectedTime(item.time)}
                    className={`
                      p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 text-center
                      ${
                        selectedTime === item.time
                          ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/50 scale-105"
                          : "bg-neutral-800 border-neutral-700 text-gray-300 hover:border-green-500 hover:bg-neutral-700 active:scale-95"
                      }
                    `}
                  >
                    <p className="text-xs sm:text-sm font-semibold">
                      {item.time}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                      {item.availableSeats}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-800">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 text-center">
                Select Your Seats
              </h2>

              <div className="mb-6 sm:mb-8 md:mb-12 text-center">
                <div className="inline-block px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full mb-2 sm:mb-3">
                  <p className="text-white font-bold text-base sm:text-lg">SCREEN</p>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">↓ Screen is below ↓</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 overflow-x-auto">
                {groupRows.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-2 sm:space-y-3">
                    {group.map((row) => renderSeats(row))}
                    {groupIdx < groupRows.length - 1 && (
                      <div className="h-1 sm:h-2"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center pt-4 sm:pt-6 border-t border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded border border-gray-700"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 rounded"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-600/50 rounded"></div>
                  <span className="text-gray-400 text-xs sm:text-sm">Booked</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-800 lg:sticky lg:top-20">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                Booking Summary
              </h3>

              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-neutral-700">
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl mb-3 sm:mb-4 aspect-[2/3] bg-neutral-800 max-h-48 sm:max-h-56">
                  <img
                    src={show.movie.poster_path}
                    alt={show.movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm font-medium line-clamp-2">
                  {show.movie.title}
                </p>
                {show.movie.release_date && (
                  <p className="text-gray-500 text-xs mt-1 sm:mt-2">
                    {new Date(show.movie.release_date).getFullYear()}
                  </p>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-neutral-700">
                {selectedDate ? (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Date
                    </p>
                    <p className="text-white font-semibold text-base sm:text-lg mt-1">
                      {formatDate(selectedDate).weekday}, {formatDate(selectedDate).month} {formatDate(selectedDate).day}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Date
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Please select a date first</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    Show Time
                  </p>
                  <p className="text-white font-semibold text-base sm:text-lg mt-1">
                    {selectedTime || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Selected Seats</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-600/20 border border-green-600 text-green-400 rounded text-xs sm:text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs sm:text-sm">No seats selected</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Number of Seats</p>
                  <p className="text-white font-semibold text-base sm:text-lg mt-1">
                    {selectedSeats.length}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-neutral-700">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">${ticketPrice.toFixed(2)} × {selectedSeats.length}</span>
                  <span className="text-white font-semibold">
                    ${(selectedSeats.length * ticketPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span className="text-white font-semibold">
                    ${convenienceFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-neutral-700">
                <span className="text-white font-bold text-sm sm:text-base">Total</span>
                <span className="text-green-400 font-bold text-lg sm:text-xl">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (!selectedDate) {
                    toast.error("Please go back and select a date first");
                    return;
                  }
                  if (!selectedTime) {
                    toast.error("Please select a show time");
                    return;
                  }
                  if (selectedSeats.length === 0) {
                    toast.error("Please select at least one seat");
                    return;
                  }
                  navigate(`/booking`, {
                    state: {
                      movie: show.movie,
                      date: selectedDate,
                      time: selectedTime,
                      seats: selectedSeats,
                      totalPrice: grandTotal,
                    },
                  });
                }}
                disabled={selectedSeats.length === 0 || !selectedTime || !selectedDate}
                className={`w-full py-2.5 sm:py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  selectedSeats.length > 0 && selectedTime && selectedDate
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95"
                    : "bg-neutral-700 text-gray-400 cursor-not-allowed opacity-50"
                }`}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <p className="text-gray-500 text-xs mt-3 sm:mt-4 text-center">
                Up to 10 seats per booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;