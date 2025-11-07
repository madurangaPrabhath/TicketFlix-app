import React from "react";
import { Edit2, Trash2, Search } from "lucide-react";
import Title from "../../components/admin/Title";
import { dummyShowsData, dummyDashboardData } from "../../assets/assets";

const ListShows = () => {
  const [shows, setShows] = React.useState([]);
  const [filteredShows, setFilteredShows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);

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

  const getAllShows = async () => {
    try {
      const allShows = dummyDashboardData.activeShows.map((show) => ({
        _id: show.movie.id,
        movie: show.movie,
        showDateTime: show.date,
        showPrice: show.price,
        seatsBooked: Math.floor(Math.random() * 45) + 10,
        totalSeats: 90,
      }));

      setShows(allShows);
      setFilteredShows(allShows);
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const filtered = shows.filter((show) =>
      show.movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredShows(filtered);
  }, [searchTerm, shows]);

  const handleDelete = (id) => {
    setShows(shows.filter((show) => show._id !== id));
    setDeleteConfirm(null);
  };

  const handleEdit = (id) => {
    alert(`Edit show ${id} - Feature to be implemented`);
  };

  React.useEffect(() => {
    getAllShows();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-0 md:p-0 bg-black min-h-screen w-full">
      <div className="px-4 md:px-6 lg:px-8 py-6">
        <Title text1="All" text2="Shows" />
      </div>

      <div className="mb-4 md:mb-6 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 bg-neutral-800 rounded-lg px-3 md:px-4 py-2 md:py-2.5 w-full sm:max-w-md">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-800 text-white outline-none w-full text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 overflow-x-auto bg-neutral-900 rounded-lg">
        <table className="w-full text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800">
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Movie
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                Date & Time
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Price
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm hidden md:table-cell">
                Seats
              </th>
              <th className="p-2 md:p-3 lg:p-4 text-left text-gray-300 font-semibold text-xs sm:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredShows.length > 0 ? (
              filteredShows.map((show, index) => (
                <tr
                  key={index}
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 transition"
                >
                  <td className="p-2 md:p-3 lg:p-4 flex items-center gap-1 md:gap-2 lg:gap-3">
                    <img
                      src={show.movie.poster_path}
                      alt={show.movie.title}
                      className="w-6 h-8 sm:w-8 sm:h-12 md:w-12 md:h-16 rounded object-cover flex-shrink-0"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/48x64?text=No+Image")
                      }
                    />
                    <span className="text-white font-medium truncate text-xs sm:text-sm line-clamp-2 md:line-clamp-1">
                      {show.movie.title}
                    </span>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 hidden sm:table-cell text-xs sm:text-sm">
                    {formatDateTime(show.showDateTime)}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-green-400 font-semibold text-xs sm:text-sm">
                    ${show.showPrice}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 hidden md:table-cell">
                    <div className="text-xs sm:text-sm">
                      {show.seatsBooked}/{show.totalSeats}
                    </div>
                    <div className="w-12 md:w-16 lg:w-20 bg-neutral-700 h-1.5 md:h-2 rounded mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded"
                        style={{
                          width: `${
                            (show.seatsBooked / show.totalSeats) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4">
                    <div className="flex gap-1 md:gap-2 lg:gap-2">
                      <button
                        onClick={() => handleEdit(show._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-1 md:py-2 rounded transition flex items-center gap-1 text-xs md:text-sm flex-shrink-0"
                      >
                        <Edit2 size={14} className="md:size-4" />
                        <span className="hidden lg:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(show._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-3 py-1 md:py-2 rounded transition flex items-center gap-1 text-xs md:text-sm flex-shrink-0"
                      >
                        <Trash2 size={14} className="md:size-4" />
                        <span className="hidden lg:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 md:p-6 lg:p-8 text-center text-gray-400 text-xs sm:text-sm"
                >
                  No shows found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-4 md:p-6 max-w-sm w-full border border-neutral-700">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-3 md:mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-300 mb-4 md:mb-6 text-xs sm:text-sm md:text-base">
              Are you sure you want to delete this show? This action cannot be
              undone.
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

export default ListShows;
