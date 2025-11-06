import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Download,
  Share2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";
import { dummyShowsData, dummyBookingData } from "../assets/assets";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const mockBookings = [
    {
      id: "BK001",
      movieTitle: dummyShowsData[0].title,
      moviePoster: dummyShowsData[0].poster_path,
      theater: "PVR Cinema - Downtown",
      date: "2025-11-15",
      time: "07:00 PM",
      seats: ["A1", "A2", "B1", "B2"],
      totalPrice: "$48.00",
      status: "confirmed",
      bookingDate: "2025-11-06",
      ticketFormat: "E-Ticket",
    },
    {
      id: "BK002",
      movieTitle: dummyShowsData[1].title,
      moviePoster: dummyShowsData[1].poster_path,
      theater: "INOX Multiplex - Mall Road",
      date: "2025-11-20",
      time: "09:30 PM",
      seats: ["C5", "C6"],
      totalPrice: "$24.00",
      status: "confirmed",
      bookingDate: "2025-11-05",
      ticketFormat: "E-Ticket",
    },
    {
      id: "BK003",
      movieTitle: dummyShowsData[2].title,
      moviePoster: dummyShowsData[2].poster_path,
      theater: "Cinemark - City Center",
      date: "2025-10-25",
      time: "04:00 PM",
      seats: ["D3", "D4"],
      totalPrice: "$24.00",
      status: "completed",
      bookingDate: "2025-10-18",
      ticketFormat: "E-Ticket",
    },
    {
      id: "BK004",
      movieTitle: dummyShowsData[3].title,
      moviePoster: dummyShowsData[3].poster_path,
      theater: "Showcase Cinema",
      date: "2025-11-10",
      time: "06:00 PM",
      seats: ["E2"],
      totalPrice: "$12.00",
      status: "cancelled",
      bookingDate: "2025-11-01",
      ticketFormat: "E-Ticket",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter((booking) => booking.status === filter);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownloadTicket = (bookingId) => {
    toast.success("Ticket downloaded successfully!");
  };

  const handleShareTicket = (bookingId) => {
    if (navigator.share) {
      navigator.share({
        title: "My Movie Ticket",
        text: "Check out my movie ticket!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Booking link copied to clipboard!");
    }
  };

  const handlePrintTicket = (bookingId) => {
    toast.success("Opening print dialog...");
    window.print();
  };

  const handleCancelBooking = (bookingId) => {
    toast.success("Booking cancelled successfully!");
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600/20 border-green-600 text-green-400";
      case "completed":
        return "bg-blue-600/20 border-blue-600 text-blue-400";
      case "cancelled":
        return "bg-red-600/20 border-red-600 text-red-400";
      default:
        return "bg-gray-600/20 border-gray-600 text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-14 sm:pt-16 md:pt-18 pb-12">
      <div className="px-3 sm:px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
            My Bookings
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            View and manage all your movie tickets
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 border-b border-neutral-700 pb-3">
          {["all", "upcoming", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-xs sm:text-xs capitalize whitespace-nowrap ${
                filter === tab
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                  : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
              }`}
            >
              {tab === "upcoming" ? "Upcoming" : tab === "completed" ? "Completed" : tab === "cancelled" ? "Cancelled" : "All"}
              <span className="ml-1.5 text-xs">
                ({bookings.filter((b) => tab === "all" || b.status === tab).length})
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-lg sm:rounded-xl overflow-hidden border border-neutral-700 hover:border-neutral-600 transition-colors duration-300 shadow-md"
              >
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-0">
                  <div className="relative overflow-hidden h-32 sm:h-40 bg-neutral-800">
                    <img
                      src={booking.moviePoster}
                      alt={booking.movieTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${getStatusBadgeColor(
                          booking.status
                        )} backdrop-blur-sm`}
                      >
                        {getStatusIcon(booking.status)}
                        <span className="text-xs sm:text-sm font-semibold capitalize">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-4 p-3 sm:p-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                              {booking.movieTitle}
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">
                              Booking ID: {booking.id}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs sm:text-sm">Total Price</p>
                            <p className="text-green-400 font-bold text-xl sm:text-2xl">
                              {booking.totalPrice}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wider">
                            Theater
                          </p>
                          <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                            <span className="line-clamp-2">{booking.theater}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Date</p>
                          <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Time</p>
                          <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                            <span>{booking.time}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-gray-500 text-xs uppercase tracking-wider">
                            Seats
                          </p>
                          <div className="flex items-center gap-2 text-white text-xs sm:text-sm">
                            <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                            <span className="font-semibold">
                              {booking.seats.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-neutral-700">
                      <button
                        onClick={() => handleDownloadTicket(booking.id)}
                        disabled={booking.status === "cancelled"}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                          booking.status === "cancelled"
                            ? "bg-neutral-700 text-gray-500 cursor-not-allowed opacity-50"
                            : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                        }`}
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </button>

                      <button
                        onClick={() => handlePrintTicket(booking.id)}
                        disabled={booking.status === "cancelled"}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                          booking.status === "cancelled"
                            ? "bg-neutral-700 text-gray-500 cursor-not-allowed opacity-50"
                            : "bg-purple-600 hover:bg-purple-700 text-white active:scale-95"
                        }`}
                      >
                        <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Print</span>
                      </button>

                      <button
                        onClick={() => handleShareTicket(booking.id)}
                        disabled={booking.status === "cancelled"}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm ${
                          booking.status === "cancelled"
                            ? "bg-neutral-700 text-gray-500 cursor-not-allowed opacity-50"
                            : "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Share</span>
                      </button>

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 active:scale-95"
                        >
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => navigate("/movies")}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm bg-neutral-700 hover:bg-neutral-600 text-white active:scale-95"
                      >
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Book Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-3 bg-neutral-900 rounded-full mb-3">
              <Ticket className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              No {filter !== "all" ? filter : ""} bookings found
            </h3>
            <p className="text-gray-400 mb-4 text-xs sm:text-sm">
              {filter === "all"
                ? "Start booking your favorite movies now!"
                : `You have no ${filter} bookings at the moment.`}
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 text-xs sm:text-sm"
            >
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;