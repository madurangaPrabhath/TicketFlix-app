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
  const { fetchAdminDashboard, fetchNowPlayingShows, deleteShow } =
    useAppContext();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalShows: 0,
    totalUsers: 0,
    activeShows: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total Revenue",
      value: `$${dashboardData.totalRevenue}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Total Shows",
      value: dashboardData.totalShows,
      icon: Film,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const adminDashboard = await fetchAdminDashboard();
      const shows = await fetchNowPlayingShows();

      setDashboardData({
        totalBookings: adminDashboard?.totalBookings || 0,
        totalRevenue: adminDashboard?.totalRevenue || 0,
        totalShows: adminDashboard?.totalShows || 0,
        totalUsers: adminDashboard?.totalUsers || 0,
        activeShows: (shows || []).slice(0, 6),
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
    try {
      await deleteShow(showId);
      setDashboardData((prev) => ({
        ...prev,
        activeShows: prev.activeShows.filter((show) => show._id !== showId),
      }));
      toast.success("Show deleted successfully");
    } catch (error) {
      console.error("Error deleting show:", error);
      toast.error("Failed to delete show");
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
          Active Shows
        </h2>
        {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dashboardData.activeShows.map((show, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-video bg-neutral-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={show.movie?.poster_path}
                    alt={show.movie?.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/400x300")
                    }
                  />
                </div>

                <div className="p-4 md:p-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-white font-bold text-sm md:text-base truncate">
                    {show.movie?.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-500 font-semibold">
                        ${show.showPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-400">
                        {show.movie?.vote_average?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(show.showDateTime)}
                    </span>
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
              No active shows available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
