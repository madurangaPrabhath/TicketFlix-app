import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  CreditCard,
  Lock,
  Smartphone,
  Landmark,
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
import { useAppContext } from "../context/AppContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const API_BASE_URL = "http://localhost:3000/api";

const methodOrderBySelection = {
  card: [
    "card",
    "link",
    "apple_pay",
    "google_pay",
    "paypal",
    "klarna",
    "affirm",
    "afterpay_clearpay",
    "sepa_debit",
    "ideal",
  ],
  wallets: [
    "link",
    "apple_pay",
    "google_pay",
    "card",
    "paypal",
    "klarna",
    "affirm",
    "afterpay_clearpay",
    "sepa_debit",
    "ideal",
  ],
  bank: [
    "sepa_debit",
    "ideal",
    "card",
    "link",
    "apple_pay",
    "google_pay",
    "paypal",
    "klarna",
    "affirm",
    "afterpay_clearpay",
  ],
};

const paymentMethodHighlights = [
  {
    id: "card",
    label: "Cards",
    description: "Visa, Mastercard, Amex",
    icon: CreditCard,
  },
  {
    id: "wallets",
    label: "Wallets",
    description: "Apple Pay, Google Pay, Link",
    icon: Smartphone,
  },
  {
    id: "bank",
    label: "Bank / Local",
    description: "Supported local payment rails",
    icon: Landmark,
  },
];

const walletDetails = [
  {
    id: "apple-pay",
    title: "Apple Pay",
    description: "Fast checkout on Safari/iPhone/Mac with an eligible saved card.",
    supportHint: "Requires Apple Pay enabled device and Stripe domain verification.",
  },
  {
    id: "google-pay",
    title: "Google Pay",
    description: "One-tap checkout on Chrome/Android with supported cards.",
    supportHint: "Works best on secure origins (https) or localhost in development.",
  },
  {
    id: "link",
    title: "Link",
    description: "Stripe Link autofills payment details for faster repeat checkout.",
    supportHint: "Available when Link is enabled for your Stripe account and region.",
  },
];

const transferAccountDetails = {
  accountName: "TicketFlix Private Limited",
  bankName: "Commercial Bank",
  branch: "Colombo Main",
  accountNumber: "842991001237",
  swiftCode: "CCEYLKLX",
};

const PaymentForm = ({
  bookingData,
  userId,
  onSuccess,
  onBankSubmitted,
  onCancel,
  formatPrice,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [bankTransferRef, setBankTransferRef] = useState("");

  const autoCancelFailedBooking = async () => {
    if (!bookingData?.bookingId) {
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/payments/cancel/${bookingData.bookingId}`);
    } catch (cancelError) {
      console.error("Error auto-cancelling failed booking:", cancelError);
    }
  };

  const isLikelyApplePayReady =
    typeof window !== "undefined" &&
    typeof window.ApplePaySession !== "undefined" &&
    window.ApplePaySession.canMakePayments();

  const isLikelyGooglePayReady =
    typeof window !== "undefined" &&
    /Chrome|CriOS/i.test(window.navigator.userAgent || "") &&
    (window.location.protocol === "https:" || window.location.hostname === "localhost");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const paymentResult = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      const error = paymentResult.error;
      const paymentIntent = paymentResult.paymentIntent;

      if (error) {
        await autoCancelFailedBooking();
        setErrorMessage(error.message);
        toast.error(`${error.message}. Booking cancelled automatically.`);
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
        await autoCancelFailedBooking();
        setErrorMessage("Payment was not successful. Please try again.");
        toast.error("Payment was not successful. Booking cancelled automatically.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      await autoCancelFailedBooking();
      setErrorMessage(error.response?.data?.message || "Payment failed");
      toast.error("Payment failed. Booking cancelled automatically.");
      setIsProcessing(false);
    }
  };

  const handleWalletConfirm = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const paymentResult = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      const error = paymentResult.error;
      const paymentIntent = paymentResult.paymentIntent;

      if (error) {
        await autoCancelFailedBooking();
        setErrorMessage(error.message || "Wallet payment failed");
        toast.error(
          `${error.message || "Wallet payment failed"}. Booking cancelled automatically.`
        );
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await axios.post(`${API_BASE_URL}/payments/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
          bookingId: bookingData.bookingId,
        });

        toast.success("Payment successful! Your booking is confirmed.");
        onSuccess(paymentIntent);
        return;
      }

      await autoCancelFailedBooking();
      setErrorMessage("Payment was not successful. Please try again.");
      toast.error("Payment was not successful. Booking cancelled automatically.");
      setIsProcessing(false);
    } catch (error) {
      console.error("Wallet payment error:", error);
      await autoCancelFailedBooking();
      setErrorMessage(error.response?.data?.message || "Wallet payment failed");
      toast.error("Wallet payment failed. Booking cancelled automatically.");
      setIsProcessing(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    if (!bankTransferRef.trim()) {
      toast.error("Please enter transaction/reference number");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage("");

      const res = await axios.post(`${API_BASE_URL}/payments/bank-transfer/submit`, {
        bookingId: bookingData.bookingId,
        userId,
        referenceNumber: bankTransferRef,
        bankMethod: "bank_transfer",
      });

      if (res.data?.success) {
        toast.success("Bank transfer reference submitted. We will verify shortly.");
        onBankSubmitted?.();
        return;
      }

      toast.error("Failed to submit transfer reference");
      setIsProcessing(false);
    } catch (error) {
      console.error("Error submitting bank transfer reference:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to submit transfer reference"
      );
      toast.error(error.response?.data?.message || "Failed to submit transfer reference");
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {paymentMethodHighlights.map((method) => {
            const Icon = method.icon;
            const isActive = selectedMethod === method.id;

            return (
              <button
                type="button"
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-neutral-700 bg-neutral-950/60 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm text-white font-medium">{method.label}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{method.description}</p>
              </button>
            );
          })}
        </div>

        {selectedMethod === "wallets" ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-3">
              <p className="text-sm text-white font-medium mb-1">Wallet Checkout</p>
              <p className="text-xs text-gray-400">
                Only wallet methods are shown below. Use Apple Pay, Google Pay,
                Link, or other available wallet options.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-3">
              <ExpressCheckoutElement
                onConfirm={handleWalletConfirm}
                options={{
                  paymentMethods: {
                    applePay: "always",
                    googlePay: "always",
                    link: "auto",
                    paypal: "auto",
                  },
                  buttonTheme: {
                    applePay: "white-outline",
                    googlePay: "black",
                    paypal: "gold",
                    link: "default",
                  },
                  buttonType: {
                    applePay: "buy",
                    googlePay: "buy",
                    paypal: "checkout",
                  },
                }}
              />
            </div>
          </div>
        ) : selectedMethod === "bank" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-4 space-y-3">
              <p className="text-sm font-semibold text-white">Transfer Account Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Account Name</p>
                  <p className="text-white">{transferAccountDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Bank Name</p>
                  <p className="text-white">{transferAccountDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Branch</p>
                  <p className="text-white">{transferAccountDetails.branch}</p>
                </div>
                <div>
                  <p className="text-gray-400">SWIFT Code</p>
                  <p className="text-white">{transferAccountDetails.swiftCode}</p>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-700/40 bg-emerald-500/10 px-3 py-2">
                <p className="text-xs text-emerald-300">Account Number</p>
                <p className="text-lg font-bold tracking-wide text-emerald-200">
                  {transferAccountDetails.accountNumber}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-4 space-y-3">
              <p className="text-sm font-semibold text-white">Submit Transfer Reference</p>

              <div>
                <p className="text-xs text-gray-400 mb-1">Transaction / Reference Number</p>
                <input
                  type="text"
                  value={bankTransferRef}
                  onChange={(e) => setBankTransferRef(e.target.value)}
                  placeholder="e.g. TXN45820319"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleBankTransferSubmit}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
              >
                Submit Reference for Verification
              </button>
            </div>
          </div>
        ) : (
          <PaymentElement
            key={selectedMethod}
            options={{
              layout: "tabs",
              paymentMethodOrder:
                methodOrderBySelection[selectedMethod] || methodOrderBySelection.card,
            }}
          />
        )}

        {selectedMethod === "wallets" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {walletDetails.map((wallet) => {
              const isApplePay = wallet.id === "apple-pay";
              const isGooglePay = wallet.id === "google-pay";

              const readinessText = isApplePay
                ? isLikelyApplePayReady
                  ? "Likely available on this device"
                  : "May not be available on this device/browser"
                : isGooglePay
                ? isLikelyGooglePayReady
                  ? "Likely available on this browser"
                  : "May require Chrome/Android or secure origin"
                : "Availability depends on Stripe account setup";

              return (
                <div
                  key={wallet.id}
                  className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-3"
                >
                  <p className="text-sm font-semibold text-white">{wallet.title}</p>
                  <p className="text-xs text-gray-300 mt-1">{wallet.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{wallet.supportHint}</p>
                  <p className="text-xs text-emerald-400 mt-2">{readinessText}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Available methods depend on your country, currency, and Stripe account
        settings.
      </p>

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
        {selectedMethod !== "wallets" && selectedMethod !== "bank" ? (
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
                {selectedMethod === "card" ? "Pay with Card" : "Continue Payment"} {formatPrice(bookingData.totalPrice)}
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 px-4 py-3 rounded-lg border border-emerald-700/50 bg-emerald-500/10 text-emerald-300 text-sm flex items-center justify-center">
            {selectedMethod === "wallets"
              ? "Use wallet button above to complete payment"
              : "Use bank/local section above to submit transfer reference"}
          </div>
        )}
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const { formatPrice } = useAppContext();

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

    const { movie, showId, seats, totalPrice, date, time } = location.state;
    if (
      !movie?.id ||
      !showId ||
      !seats?.length ||
      !totalPrice ||
      !date ||
      !time
    ) {
      toast.error("Incomplete booking information");
      navigate(-1);
      return;
    }

    initializePayment();
  }, [location.state, userId]);

  const initializePayment = async () => {
    try {
      setLoading(true);

      const bookingInfo = location.state;
      console.log("Booking info:", bookingInfo);

      const payload = {
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
      };

      console.log("Payment payload:", payload);

      const res = await axios.post(
        `${API_BASE_URL}/payments/create-payment-intent`,
        payload
      );

      console.log("Payment response:", res.data);

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
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Error creating payment intent"
      );
      navigate(-1);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log("Payment succeeded:", paymentIntent);
    setPaymentSuccess(true);

    toast.success("Payment successful! Booking confirmed.", {
      duration: 4000,
    });

    setTimeout(() => {
      navigate("/booking", { replace: true });
    }, 2500);
  };

  const handleBankSubmitted = () => {
    setTimeout(() => {
      navigate("/booking", { replace: true });
    }, 900);
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
                        {typeof bookingData?.theater === "object"
                          ? `${bookingData.theater.name}, ${bookingData.theater.city}`
                          : bookingData?.theater || "Theater Information"}
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
                      {formatPrice(bookingData?.totalPrice)}
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
                  userId={userId}
                  onSuccess={handlePaymentSuccess}
                  onBankSubmitted={handleBankSubmitted}
                  onCancel={handleCancel}
                  formatPrice={formatPrice}
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
