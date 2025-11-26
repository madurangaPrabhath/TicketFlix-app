import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  CreditCard,
  Lock,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const API_BASE_URL = "http://localhost:3000/api";

const PaymentForm = ({ bookingData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await axios.post(`${API_BASE_URL}/payments/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
          bookingId: bookingData.bookingId,
        });

        toast.success("Payment successful! Your booking is confirmed.");
        onSuccess(paymentIntent);
      } else {
        setErrorMessage("Payment was not successful. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage(error.response?.data?.message || "Payment failed");
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Payment Details</h3>
        </div>

        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card"],
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Lock className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${bookingData.totalPrice?.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();

  const [clientSecret, setClientSecret] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!location.state) {
      toast.error("No booking data found");
      navigate("/movies");
      return;
    }

    if (!userId) {
      toast.error("Please sign in to continue");
      navigate("/");
      return;
    }

    initializePayment();
  }, [location.state, userId]);

  const initializePayment = async () => {
    try {
      setLoading(true);

      const bookingInfo = location.state;
      console.log("Booking info:", bookingInfo);

      const res = await axios.post(
        `${API_BASE_URL}/payments/create-payment-intent`,
        {
          userId,
          movieId: bookingInfo.movie.id,
          showId: bookingInfo.showId,
          seats: bookingInfo.seats,
          seatTypes: bookingInfo.seats.map(() => "standard"),
          totalPrice: bookingInfo.totalPrice,
          showDate: bookingInfo.date,
          showTime: bookingInfo.time,
          movieDetails: {
            title: bookingInfo.movie.title,
            poster_path: bookingInfo.movie.poster_path,
            backdrop_path: bookingInfo.movie.backdrop_path,
          },
        }
      );

      if (res.data.success) {
        setClientSecret(res.data.clientSecret);
        setBookingData({
          ...bookingInfo,
          bookingId: res.data.bookingId,
          paymentIntentId: res.data.paymentIntentId,
        });
        setLoading(false);
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      toast.error(
        error.response?.data?.message || "Failed to initialize payment"
      );
      navigate(-1);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log("Payment succeeded:", paymentIntent);
    setPaymentSuccess(true);

    setTimeout(() => {
      navigate("/bookings", { replace: true });
    }, 2000);
  };

  const handleCancel = async () => {
    if (bookingData?.bookingId) {
      try {
        await axios.post(
          `${API_BASE_URL}/payments/cancel/${bookingData.bookingId}`
        );
        toast.success("Booking cancelled");
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    }
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your booking has been confirmed. Redirecting to your bookings...
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              <span className="text-green-400">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#10b981",
        colorBackground: "#171717",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Complete Your Payment
          </h1>
          <p className="text-gray-400 mt-2">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden sticky top-24">
              <div className="relative h-48">
                <img
                  src={`https://image.tmdb.org/t/p/w500${bookingData?.movie?.poster_path}`}
                  alt={bookingData?.movie?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">
                  {bookingData?.movie?.title}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Theater</p>
                      <p className="text-white font-medium">
                        {bookingData?.theater}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">
                        {new Date(bookingData?.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white font-medium">
                        {bookingData?.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-sm">Seats</p>
                      <p className="text-white font-medium">
                        {bookingData?.seats?.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-2xl font-bold text-green-400">
                      ${bookingData?.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {clientSecret && (
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                  bookingData={bookingData}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
