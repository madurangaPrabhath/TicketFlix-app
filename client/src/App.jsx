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
            <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <SignUp
                appearance={{
                  baseTheme: "dark",
                  elements: {
                    rootBox: "mx-auto w-full",
                    card: "bg-gray-900 shadow-2xl",
                    cardBox:
                      "bg-gray-900 border-2 border-red-600 rounded-xl shadow-xl",
                    headerTitle: "text-white text-3xl font-bold",
                    headerSubtitle: "text-gray-400 text-base mt-2",
                    socialButtonsBlockButton:
                      "bg-gray-800 border border-gray-700 hover:border-red-600 hover:bg-gray-750 text-white rounded-lg transition-all",
                    socialButtonsBlockButtonText: "text-white font-medium",
                    socialButtonsIconButton:
                      "border-gray-700 hover:border-red-600",
                    formButtonPrimary:
                      "bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all",
                    formFieldLabel: "text-gray-300 font-semibold text-sm mb-2",
                    formFieldInput:
                      "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600 rounded-lg",
                    footerActionLink:
                      "text-red-500 hover:text-red-400 font-semibold transition-colors",
                    footerActionText: "text-gray-400",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton:
                      "text-red-500 hover:text-red-400",
                    formFieldInputShowPasswordButton:
                      "text-gray-400 hover:text-red-500",
                    formResendCodeLink:
                      "text-red-500 hover:text-red-400 font-medium",
                    otpCodeFieldInput:
                      "bg-gray-800 border border-gray-700 text-white focus:border-red-600 focus:ring-2 focus:ring-red-600 rounded-lg",
                    formFieldErrorText: "text-red-400 text-sm",
                    formFieldSuccessText: "text-green-400 text-sm",
                    formFieldWarningText: "text-yellow-400 text-sm",
                    formFieldHintText: "text-gray-400 text-sm",
                    formFieldInfoText: "text-gray-400 text-sm",
                    alertText: "text-white",
                    dividerLine: "bg-gray-700",
                    dividerText: "text-gray-500 font-medium",
                    formHeaderTitle: "text-white text-2xl font-bold",
                    formHeaderSubtitle: "text-gray-400",
                  },
                  layout: {
                    socialButtonsPlacement: "top",
                    socialButtonsVariant: "blockButton",
                  },
                }}
                fallbackRedirectUrl="/"
                signInUrl="/sign-in"
                routing="path"
                path="/sign-up"
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
