import React, { useState, useEffect } from "react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import {
  BarChart3,
  DollarSign,
  Film,
  Users,
  Calendar,
  Star,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const { fetchAdminDashboard, fetchAdminShows, deleteShow } = useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalShows: 0,
    totalUsers: 0,
    totalMovies: 0,
    activeShows: 0,
    completedShows: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    recentShows: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || 0,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Monthly Revenue",
      value: `$${dashboardData.monthlyRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Total Shows",
      value: dashboardData.totalShows || 0,
      icon: Film,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers || 0,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard data...");

      const stats = await fetchAdminDashboard();
      console.log("Dashboard stats:", stats);

      const shows = await fetchAdminShows();
      console.log("Admin shows:", shows);

      setDashboardData({
        totalBookings: stats?.totalBookings || 0,
        totalRevenue: stats?.monthlyRevenue || 0,
        totalShows: stats?.totalShows || 0,
        totalUsers: stats?.totalUsers || 0,
        totalMovies: stats?.totalMovies || 0,
        activeShows: stats?.activeShows || 0,
        completedShows: stats?.completedShows || 0,
        todayBookings: stats?.todayBookings || 0,
        monthlyRevenue: stats?.monthlyRevenue || 0,
        recentShows: (shows || []).slice(0, 6),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const handleEditShow = (showId) => {
    toast("Edit feature coming soon", { icon: "📝" });
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm("Are you sure you want to delete this show?")) {
      return;
    }

    try {
      console.log("Deleting show:", showId);
      await deleteShow(showId);

      setDashboardData((prev) => ({
        ...prev,
        recentShows: prev.recentShows.filter((show) => show._id !== showId),
        totalShows: Math.max(0, prev.totalShows - 1),
      }));

      toast.success("Show deleted successfully");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error(error.response?.data?.message || "Failed to delete show");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto">
      <Title text1="Admin" text2="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 md:p-6 hover:border-neutral-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${card.color} w-5 h-5 md:w-6 md:h-6`} />
                </div>
                <TrendingUp className="text-green-500 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <p className="text-gray-400 text-xs md:text-sm mb-2">
                {card.title}
              </p>
              <p className="text-white text-2xl md:text-3xl font-bold truncate">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
          Recent Shows
        </h2>
        {dashboardData.recentShows && dashboardData.recentShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dashboardData.recentShows.map((show) => (
              <div
                key={show._id}
                className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video bg-neutral-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      show.movieDetails?.poster_path ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={show.movieDetails?.title || "Unknown Movie"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image")
                    }
                  />
                </div>

                <div className="p-4 md:p-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-sm md:text-base truncate">
                    {show.movieDetails?.title || "Unknown Movie"}
                  </h3>

                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-500 font-semibold">
                        ${show.pricing?.standard || show.showPrice || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-400">
                        {show.movieId?.vote_average?.toFixed(1) ||
                          show.movie?.vote_average?.toFixed(1) ||
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-400 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(show.showDate)} at {show.showTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {show.theater?.name || "Theater"} -{" "}
                        {show.theater?.city || "City"}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Format:</span>{" "}
                      {show.format || "2D"} |{" "}
                      <span className="text-gray-500">Lang:</span>{" "}
                      {show.language || "English"}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-neutral-700 mt-auto">
                    <button
                      onClick={() => handleEditShow(show._id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm font-medium transition-colors active:scale-95"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteShow(show._id)}
                      className="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-xs md:text-sm font-medium transition-colors active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <Film className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm md:text-base">
              No shows available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
