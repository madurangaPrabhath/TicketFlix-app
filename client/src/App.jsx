import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import Booking from "./pages/Bookings";
import Favorite from "./pages/Favorite";
import PaymentPage from "./pages/PaymentPage";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useUser, SignIn, SignUp } from "@clerk/clerk-react";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movie/:id/:date" element={<SeatLayout />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route
          path="/sign-in"
          element={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <SignIn
                appearance={{
                  baseTheme: "dark",
                  elements: {
                    cardBox: "bg-gray-900 border border-red-600",
                    formButtonPrimary: "bg-red-600 hover:bg-red-700",
                  },
                }}
                fallbackRedirectUrl="/"
                signUpUrl="/sign-up"
              />
            </div>
          }
        />
        <Route
          path="/sign-up"
          element={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <SignUp
                appearance={{
                  baseTheme: "dark",
                  elements: {
                    cardBox: "bg-gray-900 border border-red-600",
                    formButtonPrimary: "bg-red-600 hover:bg-red-700",
                  },
                }}
                fallbackRedirectUrl="/"
                signInUrl="/sign-in"
              />
            </div>
          }
        />
        <Route
          path="/admin/*"
          element={
            isSignedIn ? (
              <Layout />
            ) : (
              <div className="min-h-screen bg-black flex items-center justify-center">
                <SignIn
                  appearance={{
                    baseTheme: "dark",
                    elements: {
                      cardBox: "bg-gray-900 border border-red-600",
                      formButtonPrimary: "bg-red-600 hover:bg-red-700",
                    },
                  }}
                  fallbackRedirectUrl="/admin"
                />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
