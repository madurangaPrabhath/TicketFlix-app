import React, { useEffect, useState } from "react";
import { Trash2, Download, CheckCircle, Clock, Search } from "lucide-react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListBookings = () => {
  const { fetchAdminBookings, cancelBooking } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const dateString = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return timeStr ? `${dateString} at ${timeStr}` : dateString;
  };

  const getAllBookings = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching admin bookings...");
      const allBookings = await fetchAdminBookings();
      console.log("Fetched bookings:", allBookings);
      setBookings(allBookings || []);
      setFilteredBookings(allBookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log("Deleting booking:", id);
      await cancelBooking(id);
      setBookings(bookings.filter((booking) => booking._id !== id));
      setFilteredBookings(
        filteredBookings.filter((booking) => booking._id !== id),
      );
      setDeleteConfirm(null);
      toast.success("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error(error.response?.data?.message || "Failed to delete booking");
    }
  };

  const handleDownloadReceipt = (booking) => {
    try {
      const movieTitle =
        booking.movieId?.title ||
        booking.movieDetails?.title ||
        "Unknown Movie";
      const theaterInfo = booking.theater
        ? `${booking.theater.name}, ${booking.theater.city}`
        : "Theater info not available";
      const receiptContent = `
TicketFlix Booking Receipt
========================================

Booking ID: ${booking._id}
User ID: ${booking.userId}

Movie: ${movieTitle}
Theater: ${theaterInfo}
Show Date: ${formatDateTime(booking.showDate, booking.showTime)}

Seats: ${booking.seats?.join(", ") || "N/A"}
Total Amount: $${booking.totalPrice}
Payment Status: ${booking.paymentStatus}
Booking Status: ${booking.bookingStatus}

Booking Date: ${formatDateTime(booking.bookingDate || booking.createdAt)}

========================================
Thank you for your booking!
      `.trim();

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent),
      );
      element.setAttribute("download", `receipt_${booking._id}.txt`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Receipt downloaded");
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  useEffect(() => {
    let filtered = bookings;

    if (filterStatus === "paid") {
      filtered = filtered.filter(
        (booking) => booking.paymentStatus === "completed",
      );
    } else if (filterStatus === "unpaid") {
      filtered = filtered.filter(
        (booking) => booking.paymentStatus !== "completed",
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((booking) => {
        const movieTitle =
          booking.movieId?.title || booking.movieDetails?.title || "";
        const userId = booking.userId || "";
        const theaterName = booking.theater?.name || "";
        const city = booking.theater?.city || "";

        return (
          userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          theaterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredBookings(filtered);
  }, [searchTerm, filterStatus, bookings]);

  useEffect(() => {
    getAllBookings();

    const interval = setInterval(() => {
      getAllBookings();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        getAllBookings();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0 bg-black min-h-screen w-full">
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Title text1="All" text2="Bookings" />
      </div>

      <div className="px-4 md:px-6 lg:px-8 mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-3 md:px-4 py-2 md:py-2.5 w-full sm:flex-1 sm:max-w-sm">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search user/movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-800 text-white outline-none w-full text-xs sm:text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-2 sm:px-3 md:px-4 py-2 rounded transition font-medium text-xs sm:text-sm flex-1 sm:flex-none ${
              filterStatus === "all"
                ? "bg-red-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("paid")}
            className={`px-2 sm:px-3 md:px-4 py-2 rounded transition font-medium text-xs sm:text-sm flex-1 sm:flex-none ${
              filterStatus === "paid"
                ? "bg-green-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilterStatus("unpaid")}
            className={`px-2 sm:px-3 md:px-4 py-2 rounded transition font-medium text-xs sm:text-sm flex-1 sm:flex-none ${
              filterStatus === "unpaid"
                ? "bg-yellow-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 overflow-x-auto bg-neutral-900 rounded-lg">
        <table className="w-full text-xs sm:text-sm md:text-base min-w-[800px]">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800">
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                User
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Movie
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Show Date
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Seats
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Amount
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Status
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm w-[180px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr
                  key={booking._id || index}
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 transition"
                >
                  <td className="p-2 md:p-3 lg:p-4 text-white font-medium text-xs sm:text-sm truncate max-w-[120px]">
                    {booking.userId || "Unknown User"}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 text-xs sm:text-sm truncate max-w-[180px]">
                    {booking.movieId?.title ||
                      booking.movieDetails?.title ||
                      "Unknown Movie"}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                    {formatDateTime(booking.showDate, booking.showTime)}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4">
                    <div className="flex flex-wrap gap-0.5 md:gap-1">
                      {(booking.seats || []).slice(0, 3).map((seat, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-semibold"
                        >
                          {seat}
                        </span>
                      ))}
                      {(booking.seats || []).length > 3 && (
                        <span className="inline-block text-gray-400 text-xs px-1.5 md:px-2 py-0.5 md:py-1">
                          +{booking.seats.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-green-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                    ${booking.totalPrice || 0}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4">
                    <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                      {booking.paymentStatus === "completed" ? (
                        <>
                          <CheckCircle
                            size={16}
                            className="text-green-500 flex-shrink-0"
                          />
                          <span className="text-green-400 font-medium text-xs sm:text-sm">
                            Paid
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock
                            size={16}
                            className="text-yellow-500 flex-shrink-0"
                          />
                          <span className="text-yellow-400 font-medium text-xs sm:text-sm">
                            {booking.paymentStatus || "Pending"}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4">
                    <div className="flex gap-2 whitespace-nowrap">
                      <button
                        onClick={() => handleDownloadReceipt(booking)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded transition flex items-center gap-1.5 text-xs flex-shrink-0"
                        title="Download Receipt"
                      >
                        <Download size={14} />
                        <span>Receipt</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(booking._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded transition flex items-center gap-1.5 text-xs flex-shrink-0"
                        title="Delete Booking"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="p-4 md:p-6 lg:p-8 text-center text-gray-400 text-xs sm:text-sm"
                >
                  No bookings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 md:mt-8 px-4 md:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-neutral-900 rounded-lg p-4 md:p-6 border border-neutral-700">
          <p className="text-gray-400 text-xs md:text-sm">Total Bookings</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-2">
            {bookings.length}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 md:p-6 border border-neutral-700">
          <p className="text-gray-400 text-xs md:text-sm">Paid Bookings</p>
          <p className="text-2xl md:text-3xl font-bold text-green-400 mt-2">
            {bookings.filter((b) => b.paymentStatus === "completed").length}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-lg p-4 md:p-6 border border-neutral-700">
          <p className="text-gray-400 text-xs md:text-sm">Total Revenue</p>
          <p className="text-2xl md:text-3xl font-bold text-yellow-400 mt-2">
            $
            {bookings
              .reduce(
                (sum, b) =>
                  sum +
                  (b.paymentStatus === "completed" ? b.totalPrice || 0 : 0),
                0,
              )
              .toFixed(2)}
          </p>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-4 md:p-6 max-w-sm w-full border border-neutral-700">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-3 md:mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </p>
            <div className="flex gap-2 md:gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition text-xs md:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition text-xs md:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBookings;
