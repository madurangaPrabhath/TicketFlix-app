import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronRight, MapPin, Search } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const buildSeatDetails = (totalSeats = 0) => {
  const safeTotal = Math.max(Number(totalSeats) || 0, 0);
  const vipSeats = Math.round(safeTotal * 0.15);
  const premiumSeats = Math.round(safeTotal * 0.35);
  const standardSeats = Math.max(safeTotal - vipSeats - premiumSeats, 0);

  return [
    { label: "VIP Seats", value: vipSeats },
    { label: "Premium Seats", value: premiumSeats },
    { label: "Standard Seats", value: standardSeats },
  ];
};

const SAMPLE_THEATERS = [
  {
    id: "sample-colombo-premier",
    name: "Colombo Premier Cinemas",
    city: "Colombo",
    location: "Liberty Plaza, Kollupitiya",
    formats: ["2D", "3D", "IMAX"],
    seatDetails: [
      { label: "VIP Seats", value: 48 },
      { label: "Premium Seats", value: 120 },
      { label: "Standard Seats", value: 180 },
    ],
  },
  {
    id: "sample-kandy-scope",
    name: "Kandy Scope Multiplex",
    city: "Kandy",
    location: "City Centre, Dalada Veediya",
    formats: ["2D", "3D"],
    seatDetails: [
      { label: "VIP Seats", value: 36 },
      { label: "Premium Seats", value: 96 },
      { label: "Standard Seats", value: 140 },
    ],
  },
  {
    id: "sample-kandy-cinex",
    name: "CineX Kandy",
    city: "Kandy",
    location: "Peradeniya Road",
    formats: ["2D"],
    seatDetails: [
      { label: "VIP Seats", value: 24 },
      { label: "Premium Seats", value: 70 },
      { label: "Standard Seats", value: 110 },
    ],
  },
  {
    id: "sample-kurunegala",
    name: "Kurunegala CineHub",
    city: "Kurunegala",
    location: "Kandy Road, Kurunegala",
    formats: ["2D", "3D"],
    seatDetails: [
      { label: "VIP Seats", value: 30 },
      { label: "Premium Seats", value: 80 },
      { label: "Standard Seats", value: 130 },
    ],
  },
  {
    id: "sample-gampaha",
    name: "Gampaha Silver Screen",
    city: "Gampaha",
    location: "Main Street, Gampaha",
    formats: ["2D", "3D"],
    seatDetails: [
      { label: "VIP Seats", value: 26 },
      { label: "Premium Seats", value: 76 },
      { label: "Standard Seats", value: 120 },
    ],
  },
  {
    id: "sample-anuradhapura",
    name: "Anuradhapura Regal",
    city: "Anuradhapura",
    location: "Stage II, New Town",
    formats: ["2D"],
    seatDetails: [
      { label: "VIP Seats", value: 20 },
      { label: "Premium Seats", value: 62 },
      { label: "Standard Seats", value: 98 },
    ],
  },
  {
    id: "sample-negombo",
    name: "Negombo Oceanview Cinemas",
    city: "Negombo",
    location: "Beach Road, Negombo",
    formats: ["2D", "3D"],
    seatDetails: [
      { label: "VIP Seats", value: 28 },
      { label: "Premium Seats", value: 84 },
      { label: "Standard Seats", value: 126 },
    ],
  },
  {
    id: "sample-galle",
    name: "Galle Fort Cineplex",
    city: "Galle",
    location: "Old Matara Road, Galle",
    formats: ["2D", "3D"],
    seatDetails: [
      { label: "VIP Seats", value: 32 },
      { label: "Premium Seats", value: 92 },
      { label: "Standard Seats", value: 136 },
    ],
  },
];

const buildTheaterCards = (shows = []) => {
  const groupedTheaters = new Map();

  shows.forEach((show) => {
    const theater = show?.theater;
    if (!theater?.name || !theater?.city) return;

    const key = `${theater.name}-${theater.city}-${theater.location || ""}`.toLowerCase();
    const showDate = show?.showDate ? new Date(show.showDate) : null;

    if (!groupedTheaters.has(key)) {
      groupedTheaters.set(key, {
        id: key,
        name: theater.name,
        city: theater.city,
        location: theater.location || "Location not provided",
        formats: new Set(),
        movies: new Set(),
        showCount: 0,
        nextShowDate: showDate,
        seatCapacity: Number(show?.seats?.total) || 150,
      });
    }

    const theaterEntry = groupedTheaters.get(key);

    theaterEntry.showCount += 1;
    if (show?.format) theaterEntry.formats.add(show.format);
    if (show?.movieDetails?.title) theaterEntry.movies.add(show.movieDetails.title);
    theaterEntry.seatCapacity = Math.max(
      theaterEntry.seatCapacity,
      Number(show?.seats?.total) || 0
    );

    if (
      showDate &&
      (!theaterEntry.nextShowDate || showDate < theaterEntry.nextShowDate)
    ) {
      theaterEntry.nextShowDate = showDate;
    }
  });

  return Array.from(groupedTheaters.values())
    .map((item) => ({
      ...item,
      formats: Array.from(item.formats),
      movieCount: item.movies.size,
      seatDetails: buildSeatDetails(item.seatCapacity),
    }))
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
};

const Theaters = () => {
  const { fetchUpcomingShows } = useAppContext();

  const [theaters, setTheaters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  useEffect(() => {
    let isMounted = true;

    const loadTheaters = async () => {
      try {
        setIsLoading(true);
        const upcomingShows = await fetchUpcomingShows();
        const generatedTheaters = buildTheaterCards(upcomingShows || []);
        if (isMounted) {
          setTheaters(
            generatedTheaters.length > 0 ? generatedTheaters : SAMPLE_THEATERS
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadTheaters();

    return () => {
      isMounted = false;
    };
  }, []);

  const cityOptions = useMemo(() => {
    return [
      "All Cities",
      ...new Set(theaters.map((theater) => theater.city).filter(Boolean)),
    ];
  }, [theaters]);

  const filteredTheaters = useMemo(() => {
    return theaters.filter((theater) => {
      const matchesSearch =
        theater.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theater.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theater.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity =
        selectedCity === "All Cities" || theater.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [theaters, searchQuery, selectedCity]);

  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-16 left-1/4 w-[26rem] h-[26rem] bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-24 w-[22rem] h-[22rem] bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 left-1/3 w-[24rem] h-[24rem] bg-red-700/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-36">
        <div className="mb-8 md:mb-10">
          <p className="text-red-500 uppercase tracking-[0.18em] text-xs md:text-sm font-semibold mb-3">
            Explore Venues
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Find Theaters Near You
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            Browse premium cinemas by city, check what is playing, and lock in
            your next movie night.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by theater, city, or location..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading theaters...</p>
            </div>
          </div>
        ) : filteredTheaters.length === 0 ? (
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-600/15 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No Theaters Found
            </h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-6">
              We could not find any theaters for your current filters. Try a
              different city or browse all available movies.
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Browse Movies
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-5">
              {filteredTheaters.length} theater
              {filteredTheaters.length === 1 ? "" : "s"} available
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {filteredTheaters.map((theater) => (
                <article
                  key={theater.id}
                  className="group rounded-2xl bg-linear-to-br from-neutral-900 to-black border border-neutral-800 hover:border-red-600/60 transition-all duration-300 p-5 md:p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                        {theater.name}
                      </h2>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{theater.location}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-red-600/15 text-red-400 text-xs font-semibold border border-red-600/25">
                      {theater.city}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5">
                    {(theater.seatDetails || []).map((detail) => (
                      <div
                        key={`${theater.id}-${detail.label}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500">{detail.label}</span>
                        <span className="text-white font-semibold">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {theater.formats.length > 0 ? (
                      theater.formats.map((format) => (
                        <span
                          key={format}
                          className="px-2.5 py-1 rounded-md bg-neutral-800 text-gray-300 text-xs border border-neutral-700"
                        >
                          {format}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">
                        Formats not available
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Theaters;
