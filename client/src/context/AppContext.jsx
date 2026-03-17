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

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [themeMode, setThemeMode] = useState(() => {
    const stored = localStorage.getItem("ticketflix-theme-mode");
    return stored === "light" || stored === "dark" ? stored : "dark";
  });

  const [pricingSettings, setPricingSettings] = useState({
    currency: "INR",
    taxPercentage: 18,
    convenienceFee: 0,
  });

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

  useEffect(() => {
    const mode = themeMode === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
    localStorage.setItem("ticketflix-theme-mode", mode);
  }, [themeMode]);

  useEffect(() => {
    fetchPublicPricingSettings();
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

  const formatPrice = (amount, options = {}) => {
    const numeric = Number(amount || 0);
    const normalized = Number.isFinite(numeric) ? numeric : 0;
    const currencyCode = (pricingSettings?.currency || "INR").toUpperCase();

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
      }).format(normalized);
    } catch (error) {
      return `${currencyCode} ${normalized.toFixed(2)}`;
    }
  };

  const fetchPublicPricingSettings = async () => {
    try {
      const response = await axiosInstance.get("/settings/public/pricing");
      const data = response.data?.data;

      if (data) {
        setPricingSettings({
          currency: data.currency || "INR",
          taxPercentage: Number(data.taxPercentage ?? 18),
          convenienceFee: Number(data.convenienceFee ?? 0),
        });
      }

      return data || null;
    } catch (err) {
      console.error("Failed to fetch public pricing settings", err);
      return null;
    }
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

  const fetchNotifications = async (
    targetUserId = userId,
    options = { limit: 20, skip: 0 }
  ) => {
    try {
      if (!targetUserId) {
        return { data: [], stats: { unread: 0, total: 0 } };
      }

      setNotificationsLoading(true);

      const response = await axiosInstance.get(
        `/settings/notifications/${targetUserId}`,
        {
          params: {
            limit: options.limit ?? 20,
            skip: options.skip ?? 0,
          },
        }
      );

      const nextNotifications = response.data?.data || [];
      const unreadCount =
        response.data?.stats?.unread ??
        nextNotifications.filter((notification) => !notification.read).length;

      if ((options.skip ?? 0) > 0) {
        setNotifications((prev) => {
          const merged = [...prev, ...nextNotifications];
          const uniqueById = new Map(
            merged.map((notification) => [notification._id, notification])
          );
          return Array.from(uniqueById.values());
        });
      } else {
        setNotifications(nextNotifications);
      }

      setUnreadNotificationCount(unreadCount);
      return response.data;
    } catch (err) {
      handleError(err, "Failed to fetch notifications");
      return { data: [], stats: { unread: 0, total: 0 } };
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchUnreadNotifications = async (targetUserId = userId) => {
    try {
      if (!targetUserId) {
        return [];
      }

      const response = await axiosInstance.get(
        `/settings/notifications/${targetUserId}/unread`
      );

      const unread = response.data?.data || [];
      setUnreadNotificationCount(response.data?.count ?? unread.length);
      return unread;
    } catch (err) {
      handleError(err, "Failed to fetch unread notifications");
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      if (!notificationId) {
        return null;
      }

      const response = await axiosInstance.put(
        `/settings/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));

      return response.data?.data;
    } catch (err) {
      handleError(err, "Failed to mark notification as read");
      return null;
    }
  };

  const markAllNotificationsAsRead = async (targetUserId = userId) => {
    try {
      if (!targetUserId) {
        return null;
      }

      const response = await axiosInstance.put(
        `/settings/notifications/${targetUserId}/read-all`
      );

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadNotificationCount(0);

      return response.data;
    } catch (err) {
      handleError(err, "Failed to mark all notifications as read");
      return null;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (!notificationId) {
        return null;
      }

      await axiosInstance.delete(`/settings/notifications/${notificationId}`);

      setNotifications((prev) => {
        const target = prev.find(
          (notification) => notification._id === notificationId
        );
        if (target && !target.read) {
          setUnreadNotificationCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((notification) => notification._id !== notificationId);
      });

      return true;
    } catch (err) {
      handleError(err, "Failed to delete notification");
      return null;
    }
  };

  const deleteAllNotifications = async (targetUserId = userId) => {
    try {
      if (!targetUserId) {
        return null;
      }

      const response = await axiosInstance.delete(
        `/settings/notifications/${targetUserId}/all`
      );

      setNotifications([]);
      setUnreadNotificationCount(0);

      return response.data;
    } catch (err) {
      handleError(err, "Failed to delete all notifications");
      return null;
    }
  };

  const createNotification = async (payload) => {
    try {
      const response = await axiosInstance.post("/settings/notifications", payload);
      const newNotification = response.data?.data;

      if (newNotification && newNotification.userId === userId) {
        setNotifications((prev) => [newNotification, ...prev]);
        if (!newNotification.read) {
          setUnreadNotificationCount((count) => count + 1);
        }
      }

      return newNotification;
    } catch (err) {
      handleError(err, "Failed to create notification");
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

  const fetchAdminSettings = async (targetUserId = userId) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.get(`/settings/admin/${targetUserId}`);
      const settings = response.data?.data || null;
      if (settings?.theme?.mode) {
        setThemeMode(settings.theme.mode === "light" ? "light" : "dark");
      }
      if (settings?.pricing) {
        setPricingSettings({
          currency: settings.pricing.currency || "INR",
          taxPercentage: Number(settings.pricing.taxPercentage ?? 18),
          convenienceFee: Number(settings.pricing.convenienceFee ?? 0),
        });
      }
      return settings;
    } catch (err) {
      handleError(err, "Failed to fetch admin settings");
      return null;
    }
  };

  const updateAdminSettings = async (settings, targetUserId = userId) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}`,
        settings
      );
      handleSuccess("Admin settings updated");
      return response.data?.data || null;
    } catch (err) {
      handleError(err, "Failed to update admin settings");
      return null;
    }
  };

  const updateAdminThemeSettings = async (themeData, targetUserId = userId) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/theme`,
        themeData
      );
      handleSuccess("Theme settings updated");
      const updatedTheme = response.data?.data || null;
      if (updatedTheme?.mode) {
        setThemeMode(updatedTheme.mode === "light" ? "light" : "dark");
      }
      return updatedTheme;
    } catch (err) {
      handleError(err, "Failed to update theme settings");
      return null;
    }
  };

  const updateAdminDashboardSettings = async (
    dashboardData,
    targetUserId = userId
  ) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/dashboard`,
        dashboardData
      );
      handleSuccess("Dashboard settings updated");
      return response.data?.data || null;
    } catch (err) {
      handleError(err, "Failed to update dashboard settings");
      return null;
    }
  };

  const updateAdminTheaterSettings = async (
    theaterData,
    targetUserId = userId
  ) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/theater`,
        theaterData
      );
      handleSuccess("Theater settings updated");
      return response.data?.data || null;
    } catch (err) {
      handleError(err, "Failed to update theater settings");
      return null;
    }
  };

  const updateAdminPricingSettings = async (
    pricingData,
    targetUserId = userId
  ) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/pricing`,
        pricingData
      );
      handleSuccess("Pricing settings updated");
      const nextPricing = response.data?.data || null;
      if (nextPricing) {
        setPricingSettings({
          currency: nextPricing.currency || "INR",
          taxPercentage: Number(nextPricing.taxPercentage ?? 18),
          convenienceFee: Number(nextPricing.convenienceFee ?? 0),
        });
      }
      return nextPricing;
    } catch (err) {
      handleError(err, "Failed to update pricing settings");
      return null;
    }
  };

  const updateAdminNotificationSettings = async (
    notificationData,
    targetUserId = userId
  ) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/notification-settings`,
        notificationData
      );
      handleSuccess("Notification settings updated");
      return response.data?.data || null;
    } catch (err) {
      handleError(err, "Failed to update notification settings");
      return null;
    }
  };

  const updateAdminSecuritySettings = async (
    securityData,
    targetUserId = userId
  ) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.put(
        `/settings/admin/${targetUserId}/security`,
        securityData
      );
      handleSuccess("Security settings updated");
      return response.data?.data || null;
    } catch (err) {
      handleError(err, "Failed to update security settings");
      return null;
    }
  };

  const resetAdminSettings = async (targetUserId = userId) => {
    try {
      if (!targetUserId) return null;
      const response = await axiosInstance.post(
        `/settings/admin/${targetUserId}/reset`
      );
      handleSuccess("Settings reset to defaults");
      const nextSettings = response.data?.data || null;
      if (nextSettings?.theme?.mode) {
        setThemeMode(nextSettings.theme.mode === "light" ? "light" : "dark");
      }
      if (nextSettings?.pricing) {
        setPricingSettings({
          currency: nextSettings.pricing.currency || "INR",
          taxPercentage: Number(nextSettings.pricing.taxPercentage ?? 18),
          convenienceFee: Number(nextSettings.pricing.convenienceFee ?? 0),
        });
      }
      return nextSettings;
    } catch (err) {
      handleError(err, "Failed to reset settings");
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
    themeMode,
    setThemeMode,
    pricingSettings,
    formatPrice,

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

    notifications,
    unreadNotificationCount,
    notificationsLoading,

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

    fetchNotifications,
    fetchUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,

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
    fetchPublicPricingSettings,
    fetchAdminSettings,
    updateAdminSettings,
    updateAdminThemeSettings,
    updateAdminDashboardSettings,
    updateAdminTheaterSettings,
    updateAdminPricingSettings,
    updateAdminNotificationSettings,
    updateAdminSecuritySettings,
    resetAdminSettings,
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
