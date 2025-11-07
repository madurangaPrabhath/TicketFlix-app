import React, { useState, useEffect } from "react";
import { dummyDashboardData, dummyShowsData } from "../../assets/assets";
import Title from "../../components/admin/Title";
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
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalShows: 0,
    totalUsers: 0,
    activeShows: [],
  });

  const [loading, setLoading] = useState(true);

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
    setDashboardData(dummyDashboardData);
    setLoading(false);
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

  if (loading) {
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
    <div className="space-y-8">
      <Title text1="Admin" text2="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 hover:border-neutral-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${card.color} w-6 h-6`} />
                </div>
                <TrendingUp className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-gray-400 text-sm mb-2">{card.title}</p>
              <p className="text-white text-3xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Active Shows</h2>
        {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.activeShows.map((show, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden hover:border-neutral-600 transition-all duration-300"
              >
                <div className="aspect-video bg-neutral-800 flex items-center justify-center">
                  <img
                    src={show.movie?.poster_path}
                    alt={show.movie?.title}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/400x300")
                    }
                  />
                </div>
                <div className="p-4 space-y-3">
                  <h3 className="text-white font-bold truncate">
                    {show.movie?.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-semibold">
                        ${show.showPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400 text-sm">
                        {show.movie?.vote_average?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(show.showDateTime)}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-neutral-700">
                    <button className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No active shows available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
