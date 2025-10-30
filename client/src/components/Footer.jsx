import React from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { assets } from "../assets/assets";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-linear-to-b from-black to-neutral-950 text-gray-300 border-t border-neutral-800">
      <div className="px-6 md:px-12 lg:px-36 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-16">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 text-red-600 text-2xl font-extrabold transition-all duration-300 hover:scale-105 hover:text-red-500 mb-5"
                onClick={handleLinkClick}
              >
                <Film size={32} strokeWidth={2.5} />
                <span className="text-white tracking-tight">TicketFlix</span>
              </Link>

              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
                Your ultimate destination for booking movie tickets online.
                Experience cinema like never before with the best seats at the
                best prices.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <img
                  src={assets.googlePlay}
                  alt="Get it on Google Play"
                  className="h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
                />
                <img
                  src={assets.appStore}
                  alt="Download on App Store"
                  className="h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            <div className="sm:pl-6 lg:pl-0">
              <h3 className="text-white font-semibold text-lg mb-5">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    onClick={handleLinkClick}
                    className="text-sm text-gray-400 hover:text-red-600 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-125 transition-transform"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/movies"
                    onClick={handleLinkClick}
                    className="text-sm text-gray-400 hover:text-red-600 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-125 transition-transform"></span>
                    Movies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/theaters"
                    onClick={handleLinkClick}
                    className="text-sm text-gray-400 hover:text-red-600 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-125 transition-transform"></span>
                    Theaters
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking"
                    onClick={handleLinkClick}
                    className="text-sm text-gray-400 hover:text-red-600 transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-125 transition-transform"></span>
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>

            <div className="sm:pl-6 lg:pl-0">
              <h3 className="text-white font-semibold text-lg mb-5">
                Get in Touch
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400 font-medium">
                      +94 77 234 5678
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mon-Sun: 9AM - 9PM
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href="mailto:contact@ticketflix.com"
                      className="text-sm text-gray-400 hover:text-red-600 transition-colors duration-300 font-medium"
                    >
                      contact@ticketflix.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400 font-medium">
                      123 Cinema Street
                    </p>
                    <p className="text-sm text-gray-400">Colombo, Sri Lanka</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6">
                <h4 className="text-white font-semibold text-sm mb-3">
                  Follow Us
                </h4>
                <div className="flex items-center gap-3">
                  <a
                    href="#facebook"
                    className="w-9 h-9 bg-neutral-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#twitter"
                    className="w-9 h-9 bg-neutral-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#instagram"
                    className="w-9 h-9 bg-neutral-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="#youtube"
                    className="w-9 h-9 bg-neutral-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 bg-neutral-950/50">
        <div className="px-6 md:px-12 lg:px-36 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
                © {currentYear} TicketFlix. All rights reserved.
              </p>
              <p className="text-xs md:text-sm text-gray-400 text-center sm:text-right">
                Developed by{" "}
                <a
                  href="https://madurangaprabhath.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-500 font-semibold transition-colors duration-300"
                >
                  Maduranga Prabhath
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
