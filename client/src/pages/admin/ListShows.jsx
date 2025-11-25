import React from "react";
import { Edit2, Trash2, Search, AlertCircle } from "lucide-react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const { fetchAdminShows, updateShow, deleteShow } = useAppContext();
  const [shows, setShows] = React.useState([]);
  const [filteredShows, setFilteredShows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [editingShow, setEditingShow] = React.useState(null);

  const formatDateTime = (dateStr, timeStr) => {
    try {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      const dateString = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return timeStr ? `${dateString} at ${timeStr}` : dateString;
    } catch (error) {
      return "N/A";
    }
  };

  const getAllShows = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching admin shows...");
      const allShows = await fetchAdminShows();
      console.log("Fetched shows:", allShows);
      setShows(allShows || []);
      setFilteredShows(allShows || []);
    } catch (error) {
      console.error("Error fetching shows:", error);
      toast.error("Failed to load shows");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const filtered = shows.filter((show) => {
      const movieTitle = show.movieId?.title || show.movie?.title || "";
      const theaterName = show.theater?.name || "";
      const city = show.theater?.city || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        movieTitle.toLowerCase().includes(searchLower) ||
        theaterName.toLowerCase().includes(searchLower) ||
        city.toLowerCase().includes(searchLower)
      );
    });
    setFilteredShows(filtered);
  }, [searchTerm, shows]);

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      console.log("Deleting show:", id);
      await deleteShow(id);
      setShows(shows.filter((show) => show._id !== id));
      setFilteredShows(filteredShows.filter((show) => show._id !== id));
      setDeleteConfirm(null);
      toast.success("Show deleted successfully");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error(error.response?.data?.message || "Failed to delete show");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (show) => {
    setEditingId(show._id);
    setEditingShow({ ...show });
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingShow.showTime || !editingShow.showDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsLoading(true);
      console.log("Updating show:", editingId, editingShow);

      // Prepare update data
      const updateData = {
        showDate: editingShow.showDate,
        showTime: editingShow.showTime,
        theater: editingShow.theater,
        language: editingShow.language,
        format: editingShow.format,
        pricing: editingShow.pricing,
        status: editingShow.status || "active",
      };

      await updateShow(editingId, updateData);

      // Refresh the shows list
      await getAllShows();

      setEditingId(null);
      setEditingShow(null);
      toast.success("Show updated successfully");
    } catch (error) {
      console.error("Error updating show:", error);
      toast.error(error.response?.data?.message || "Failed to update show");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getAllShows();
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
                  key={show._id || index}
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 transition"
                >
                  <td className="p-2 md:p-3 lg:p-4 flex items-center gap-1 md:gap-2 lg:gap-3">
                    <img
                      src={show.movieId?.poster_path || show.movie?.poster_path}
                      alt={show.movieId?.title || show.movie?.title}
                      className="w-6 h-8 sm:w-8 sm:h-12 md:w-12 md:h-16 rounded object-cover flex-shrink-0"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/48x64?text=No+Image")
                      }
                    />
                    <div className="min-w-0">
                      <span className="text-white font-medium block truncate text-xs sm:text-sm">
                        {show.movieId?.title || show.movie?.title || "Unknown"}
                      </span>
                      <span className="text-gray-500 text-xs block truncate sm:hidden">
                        {formatDateTime(show.showDate, show.showTime)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 hidden sm:table-cell text-xs sm:text-sm">
                    {formatDateTime(show.showDate, show.showTime)}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-green-400 font-semibold text-xs sm:text-sm">
                    ${show.pricing?.standard || show.showPrice || "N/A"}
                  </td>
                  <td className="p-2 md:p-3 lg:p-4 text-gray-300 hidden md:table-cell">
                    <div className="text-xs sm:text-sm">
                      {show.seats?.booked?.length || 0}/
                      {show.seats?.total || 150}
                    </div>
                    <div className="w-12 md:w-16 lg:w-20 bg-neutral-700 h-1.5 md:h-2 rounded mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded"
                        style={{
                          width: `${
                            ((show.seats?.booked?.length || 0) /
                              (show.seats?.total || 150)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 lg:p-4">
                    <div className="flex gap-1 md:gap-2 lg:gap-2">
                      <button
                        onClick={() => handleEdit(show)}
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

      {editingId && editingShow && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-4 md:p-6 max-w-2xl w-full border border-neutral-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-4 md:mb-6">
              Edit Show
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-2">
                  Show Date
                </label>
                <input
                  type="date"
                  value={editingShow.showDate || ""}
                  onChange={(e) =>
                    setEditingShow({
                      ...editingShow,
                      showDate: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg border border-neutral-700 outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-2">
                  Show Time
                </label>
                <input
                  type="time"
                  value={editingShow.showTime || ""}
                  onChange={(e) =>
                    setEditingShow({
                      ...editingShow,
                      showTime: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg border border-neutral-700 outline-none focus:border-blue-600 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-2">
                  Standard Price
                </label>
                <input
                  type="number"
                  value={editingShow.pricing?.standard || ""}
                  onChange={(e) =>
                    setEditingShow({
                      ...editingShow,
                      pricing: {
                        ...editingShow.pricing,
                        standard: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-neutral-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg border border-neutral-700 outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-2">
                  Premium Price
                </label>
                <input
                  type="number"
                  value={editingShow.pricing?.premium || ""}
                  onChange={(e) =>
                    setEditingShow({
                      ...editingShow,
                      pricing: {
                        ...editingShow.pricing,
                        premium: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-neutral-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg border border-neutral-700 outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm font-semibold mb-2">
                  VIP Price
                </label>
                <input
                  type="number"
                  value={editingShow.pricing?.vip || ""}
                  onChange={(e) =>
                    setEditingShow({
                      ...editingShow,
                      pricing: {
                        ...editingShow.pricing,
                        vip: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-neutral-800 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg border border-neutral-700 outline-none focus:border-blue-600 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditingShow(null);
                }}
                className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition text-xs md:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 md:px-4 py-1.5 md:py-2 rounded transition text-xs md:text-sm"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListShows;
