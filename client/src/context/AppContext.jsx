import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userDashboard, setUserDashboard] = useState(null);

  const [adminDashboard, setAdminDashboard] = useState(null);
  const [adminShows, setAdminShows] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState(null);

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    genre: "",
    language: "",
    city: "",
    dateRange: "",
  });

  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    console.log("AppContext initialized with BASE_URL:", BASE_URL);
  }, []);

  const handleError = (error, message = "An error occurred") => {
    console.error(message, error);
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      initializeUser();
    }
  }, [isLoaded, isSignedIn, userId]);

  const initializeUser = async () => {
    try {
      setLoading(true);
      if (userId) {
        await fetchUserProfile(userId);
        await fetchUserDashboard(userId);
      }
    } catch (err) {
      handleError(err, "Failed to initialize user");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMovies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/movies/");
      setMovies(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch movies");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/movies/search`, {
        params: { q: query },
      });
      setSearchResults(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to search movies");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMoviesByGenre = async (genre) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/movies/genre`, {
        params: { genre },
      });
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch movies by genre");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getTopRatedMovies = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/movies/top-rated");
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch top-rated movies");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMovieById = async (movieId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/movies/${movieId}`);
      setSelectedMovie(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch movie details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNowPlayingShows = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/shows/now-playing");
      setShows(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch now playing shows");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingShows = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/shows/upcoming");
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch upcoming shows");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getShowsByMovieId = async (movieId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/shows/movie/${movieId}`);
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch shows for this movie");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getShowsByDate = async (movieId, date) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/shows/movie/${movieId}/date/${date}`
      );
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch shows for this date");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getShowDetails = async (showId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/shows/details/${showId}`);
      setSelectedShow(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch show details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSeatAvailability = async (showId) => {
    try {
      const response = await axiosInstance.get(`/shows/seats/${showId}`);
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch seat availability");
      return [];
    }
  };

  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/bookings/", bookingData);
      setBookingDetails(response.data.data);
      handleSuccess("Booking created successfully!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to create booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (userId) => {
    try {
      const response = await axiosInstance.get(`/bookings/user/${userId}`);
      setUserBookings(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch bookings");
      return [];
    }
  };

  const getActiveBookings = async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/bookings/user/${userId}/active`
      );
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch active bookings");
      return [];
    }
  };

  const getPastBookings = async (userId) => {
    try {
      const response = await axiosInstance.get(`/bookings/user/${userId}/past`);
      return response.data.data || [];
    } catch (err) {
      handleError(err, "Failed to fetch past bookings");
      return [];
    }
  };

  const getBookingDetails = async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch booking details");
      return null;
    }
  };

  const getBookingSummary = async (bookingId) => {
    try {
      const response = await axiosInstance.get(
        `/bookings/summary/${bookingId}`
      );
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch booking summary");
      return null;
    }
  };

  const updateBooking = async (bookingId, updates) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/bookings/${bookingId}`,
        updates
      );
      handleSuccess("Booking updated successfully!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (bookingId, paymentData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/bookings/${bookingId}/payment`,
        paymentData
      );
      setPaymentStatus(response.data.data?.paymentStatus);
      handleSuccess("Payment updated successfully!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update payment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/bookings/${bookingId}`);
      await getUserBookings(userId);
      handleSuccess("Booking cancelled successfully!");
      return response.data;
    } catch (err) {
      handleError(err, "Failed to cancel booking");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}`);
      setUserProfile(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch user profile");
      return null;
    }
  };

  const updateUserProfile = async (userId, profileData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/users/${userId}`, profileData);
      setUserProfile(response.data.data);
      handleSuccess("Profile updated successfully!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (userId, preferences) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/users/${userId}/preferences`,
        preferences
      );
      handleSuccess("Preferences updated!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update preferences");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserFavorites = async (userId) => {
    try {
      console.log("AppContext: Fetching favorites for userId:", userId);
      const response = await axiosInstance.get(`/users/${userId}/favorites`);
      console.log("AppContext: Got response:", response.data);
      setUserFavorites(response.data.data || []);

      // Sync favorites count to Clerk metadata
      try {
        await axiosInstance.post(`/users/${userId}/favorites/sync-clerk`);
        console.log("AppContext: Synced favorites count to Clerk");
      } catch (syncErr) {
        console.error("AppContext: Error syncing to Clerk:", syncErr.message);
        // Don't fail the whole operation if sync fails
      }

      return response.data.data;
    } catch (err) {
      console.error("AppContext: Error fetching favorites:", err);
      handleError(err, "Failed to fetch favorites");
      return [];
    }
  };

  const addToFavorites = async (userId, movieId) => {
    try {
      console.log("AppContext: Adding to favorites -", { userId, movieId });
      const response = await axiosInstance.post(`/users/${userId}/favorites`, {
        movieId,
      });
      console.log("AppContext: Added to favorites response:", response.data);
      await getUserFavorites(userId);
      handleSuccess("Added to favorites!");
      return response.data.data;
    } catch (err) {
      console.error("AppContext: Error adding to favorites:", err);
      handleError(err, "Failed to add to favorites");
      return null;
    }
  };

  const removeFromFavorites = async (userId, favoriteId) => {
    try {
      const response = await axiosInstance.delete(
        `/users/${userId}/favorites/${favoriteId}`
      );
      await getUserFavorites(userId);
      handleSuccess("Removed from favorites!");
      return response.data;
    } catch (err) {
      handleError(err, "Failed to remove from favorites");
      return null;
    }
  };

  const checkIsFavorite = async (userId, movieId) => {
    try {
      const response = await axiosInstance.get(`/users/favorite/check`, {
        params: { userId, movieId },
      });
      return response.data.data?.isFavorite || false;
    } catch (err) {
      console.error("Error checking favorite:", err);
      return false;
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/stats`);
      setUserStats(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch user statistics");
      return null;
    }
  };

  const fetchUserDashboard = async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/${userId}/dashboard`);
      setUserDashboard(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch user dashboard");
      return null;
    }
  };

  const updateNotificationSettings = async (userId, settings) => {
    try {
      const response = await axiosInstance.put(
        `/users/${userId}/notifications`,
        settings
      );
      handleSuccess("Notification settings updated!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update notification settings");
      return null;
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users/admin/dashboard");
      setAdminDashboard(response.data.data);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch admin dashboard");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createShow = async (showData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/admin/shows", showData);
      handleSuccess("Show created successfully!");
      await fetchAdminShows();
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to create show");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminShows = async () => {
    try {
      const response = await axiosInstance.get("/users/admin/shows");
      setAdminShows(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch shows");
      return [];
    }
  };

  const updateShow = async (showId, updates) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        `/users/admin/shows/${showId}`,
        updates
      );
      handleSuccess("Show updated successfully!");
      await fetchAdminShows();
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update show");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteShow = async (showId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/users/admin/shows/${showId}`
      );
      handleSuccess("Show deleted successfully!");
      await fetchAdminShows();
      return response.data;
    } catch (err) {
      handleError(err, "Failed to delete show");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminBookings = async () => {
    try {
      const response = await axiosInstance.get("/users/admin/bookings");
      setAdminBookings(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch bookings");
      return [];
    }
  };

  const getBookingAnalytics = async () => {
    try {
      const response = await axiosInstance.get(
        "/users/admin/bookings/analytics"
      );
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch booking analytics");
      return null;
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await axiosInstance.get("/users/admin/users");
      setAdminUsers(response.data.data || []);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch users");
      return [];
    }
  };

  const getAdminUserDetails = async (userId) => {
    try {
      const response = await axiosInstance.get(`/users/admin/users/${userId}`);
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch user details");
      return null;
    }
  };

  const getRevenueReport = async (startDate, endDate) => {
    try {
      const response = await axiosInstance.get("/users/admin/reports/revenue", {
        params: { startDate, endDate },
      });
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch revenue report");
      return null;
    }
  };

  const getOccupancyReport = async () => {
    try {
      const response = await axiosInstance.get(
        "/users/admin/reports/occupancy"
      );
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to fetch occupancy report");
      return null;
    }
  };

  const addSeat = (seatNumber) => {
    if (!selectedSeats.includes(seatNumber)) {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const removeSeat = (seatNumber) => {
    setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
  };

  const clearSeats = () => {
    setSelectedSeats([]);
  };

  const fetchAdminProfile = async () => {
    try {
      const response = await axiosInstance.get("/users/admin/profile");
      return response.data.data;
    } catch (err) {
      console.error("Error fetching admin profile:", err);
      return null;
    }
  };

  const updateAdminProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        "/users/admin/profile",
        profileData
      );
      handleSuccess("Admin profile updated!");
      return response.data.data;
    } catch (err) {
      handleError(err, "Failed to update admin profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminPermissions = async () => {
    try {
      const response = await axiosInstance.get("/users/admin/permissions");
      return response.data.data;
    } catch (err) {
      console.error("Error fetching admin permissions:", err);
      return null;
    }
  };

  const value = {
    isSignedIn,
    isLoaded,
    userId,
    clerkUser,
    loading,
    error,
    success,

    user,
    userProfile,
    userBookings,
    userFavorites,
    userStats,
    userDashboard,

    adminDashboard,
    adminShows,
    adminBookings,
    adminUsers,
    adminReports,

    movies,
    shows,
    selectedMovie,
    selectedShow,
    searchResults,

    selectedSeats,
    bookingDetails,
    paymentStatus,

    filterOptions,
    setFilterOptions,

    fetchAllMovies,
    searchMovies,
    getMoviesByGenre,
    getTopRatedMovies,
    getMovieById,

    fetchNowPlayingShows,
    fetchUpcomingShows,
    getShowsByMovieId,
    getShowsByDate,
    getShowDetails,
    getSeatAvailability,

    createBooking,
    getUserBookings,
    getActiveBookings,
    getPastBookings,
    getBookingDetails,
    getBookingSummary,
    updateBooking,
    updatePaymentStatus,
    cancelBooking,

    fetchUserProfile,
    updateUserProfile,
    updatePreferences,
    fetchUserStats,
    fetchUserDashboard,
    updateNotificationSettings,

    getUserFavorites,
    addToFavorites,
    removeFromFavorites,
    checkIsFavorite,

    fetchAdminDashboard,
    createShow,
    fetchAdminShows,
    updateShow,
    deleteShow,
    fetchAdminBookings,
    getBookingAnalytics,
    fetchAdminUsers,
    getAdminUserDetails,
    getRevenueReport,
    getOccupancyReport,

    addSeat,
    removeSeat,
    clearSeats,

    fetchAdminProfile,
    updateAdminProfile,
    fetchAdminPermissions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};
