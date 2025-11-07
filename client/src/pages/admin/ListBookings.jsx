import React, { useEffect, useState } from "react";
import { Trash2, Download, CheckCircle, Clock, Search } from "lucide-react";
import { dummyBookingData } from "../../assets/assets";
import Title from "../../components/admin/Title";

const ListBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const getAllBookings = async () => {
    try {
      setBookings(dummyBookingData);
      setFilteredBookings(dummyBookingData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    setBookings(bookings.filter((booking) => booking._id !== id));
    setDeleteConfirm(null);
  };

  useEffect(() => {
    let filtered = bookings;

    if (filterStatus === "paid") {
      filtered = filtered.filter((booking) => booking.isPaid);
    } else if (filterStatus === "unpaid") {
      filtered = filtered.filter((booking) => !booking.isPaid);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.show.movie.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, filterStatus, bookings]);

  useEffect(() => {
    getAllBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen">
      <Title text1="All" text2="Bookings" />

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-4 py-2 flex-1 max-w-md">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-800 text-white outline-none w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded transition font-medium ${
              filterStatus === "all"
                ? "bg-red-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("paid")}
            className={`px-4 py-2 rounded transition font-medium ${
              filterStatus === "paid"
                ? "bg-green-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilterStatus("unpaid")}
            className={`px-4 py-2 rounded transition font-medium ${
              filterStatus === "unpaid"
                ? "bg-yellow-600 text-white"
                : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
            }`}
          >
            Unpaid
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-neutral-900 rounded-lg">
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800">
              <th className="p-4 text-left text-gray-300 font-semibold">
                User
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Movie
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Show Date & Time
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Seats
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Amount
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Status
              </th>
              <th className="p-4 text-left text-gray-300 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr
                  key={index}
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 transition"
                >
                  <td className="p-4 text-white font-medium">
                    {booking.user.name}
                  </td>
                  <td className="p-4 text-gray-300 truncate max-w-xs">
                    {booking.show.movie.title}
                  </td>
                  <td className="p-4 text-gray-300">
                    {formatDateTime(booking.show.showDateTime)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {booking.bookedSeats.map((seat, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-2 py-1 rounded text-xs font-semibold"
                        >
                          {seat}
                        </span>
                      ))}
                      <span className="inline-block text-gray-400 text-xs font-medium px-2 py-1">
                        ({booking.bookedSeats.length} seats)
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-green-400 font-bold">
                    ${booking.amount}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {booking.isPaid ? (
                        <>
                          <CheckCircle size={18} className="text-green-500" />
                          <span className="text-green-400 font-medium">
                            Paid
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock size={18} className="text-yellow-500" />
                          <span className="text-yellow-400 font-medium">
                            Unpaid
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition flex items-center gap-2"
                        title="Download Receipt"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(booking._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400">
                  No bookings found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <p className="text-gray-400 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-white mt-2">
            {bookings.length}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <p className="text-gray-400 text-sm">Paid Bookings</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {bookings.filter((b) => b.isPaid).length}
          </p>
        </div>
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ${bookings.reduce((sum, b) => sum + (b.isPaid ? b.amount : 0), 0)}
          </p>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-sm w-full border border-neutral-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this booking? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
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
