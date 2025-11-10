import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import axios from "axios";

export const getShowsByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;

    const shows = await Show.find({ movieId })
      .populate("movieId", "title poster_path backdrop_path")
      .sort({ showDate: 1, showTime: 1 });

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows found for this movie",
      });
    }

    res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shows",
      error: error.message,
    });
  }
};

export const getShowsByDate = async (req, res) => {
  try {
    const { movieId, date } = req.params;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const shows = await Show.find({
      movieId,
      showDate: { $gte: startDate, $lte: endDate },
      status: "active",
    })
      .populate("movieId", "title poster_path")
      .sort({ showTime: 1 });

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows available for this date",
      });
    }

    res.status(200).json({
      success: true,
      date: date,
      data: shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shows by date",
      error: error.message,
    });
  }
};

export const getShowById = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId).populate(
      "movieId",
      "title poster_path backdrop_path runtime director cast"
    );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching show",
      error: error.message,
    });
  }
};

export const getSeatAvailability = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const { rows, seatsPerRow } = show.seats.layout;
    const allSeats = [];

    rows.forEach((row) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        allSeats.push({
          seatId,
          isBooked: show.seats.booked.includes(seatId),
          type: determineSeatType(row),
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        showId: show._id,
        totalSeats: show.seats.total,
        availableSeats: show.seats.available,
        bookedSeats: show.seats.booked,
        seats: allSeats,
        pricing: show.pricing,
        layout: show.seats.layout,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching seat availability",
      error: error.message,
    });
  }
};

export const bookSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats provided",
      });
    }

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    const alreadyBooked = seats.filter((seat) =>
      show.seats.booked.includes(seat)
    );
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${alreadyBooked.join(", ")}`,
      });
    }

    if (show.seats.available < seats.length) {
      return res.status(400).json({
        success: false,
        message: `Only ${show.seats.available} seats available`,
      });
    }

    show.seats.booked.push(...seats);
    show.seats.available -= seats.length;
    await show.save();

    res.status(200).json({
      success: true,
      message: "Seats booked successfully",
      data: {
        showId: show._id,
        bookedSeats: seats,
        availableSeats: show.seats.available,
        totalBooked: show.seats.booked.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error booking seats",
      error: error.message,
    });
  }
};

export const releaseSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seats } = req.body;

    if (!seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No seats provided",
      });
    }

    const show = await Show.findById(showId);

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    show.seats.booked = show.seats.booked.filter(
      (seat) => !seats.includes(seat)
    );
    show.seats.available = show.seats.total - show.seats.booked.length;
    await show.save();

    res.status(200).json({
      success: true,
      message: "Seats released successfully",
      data: {
        releasedSeats: seats,
        availableSeats: show.seats.available,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error releasing seats",
      error: error.message,
    });
  }
};

export const getNowPlayingMovies = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shows = await Show.find({
      showDate: { $gte: today },
      status: "active",
    })
      .populate("movieId")
      .sort({ showDate: 1 });

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows available now",
      });
    }

    // Get unique movies from shows
    const movieIds = [
      ...new Set(shows.map((show) => show.movieId._id.toString())),
    ];
    const movies = await Movie.find({ _id: { $in: movieIds } });

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies playing now",
      });
    }

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching now playing movies",
      error: error.message,
    });
  }
};

export const addShow = async (req, res) => {
  try {
    const { movieId, showInput, showPrice } = req.body;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }

    let movie = await Movie.findById(movieId).catch(() => null);

    if (!movie) {
      movie = await Movie.create({
        title: "New Movie",
        overview: "Movie Description",
        genres: ["Action"],
        vote_average: 0,
        release_date: new Date().toISOString().split("T")[0],
        poster_path: "https://via.placeholder.com/300x450?text=Movie+Poster",
        backdrop_path:
          "https://via.placeholder.com/1280x720?text=Movie+Backdrop",
        trailer_url: "",
        status: "upcoming",
      });
    }

    if (!showInput || !Array.isArray(showInput) || showInput.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Show input array is required",
      });
    }

    const showToCreate = [];

    showInput.forEach((show) => {
      const showDate = show.date;
      const theater = show.theater;

      if (!showDate || !theater) {
        throw new Error("Each show must have date and theater information");
      }

      show.time.forEach((time) => {
        let timeStr = time;
        if (time.includes("AM") || time.includes("PM")) {
          const timeParts = time.replace(/AM|PM/g, "").trim().split(":");
          let hours = parseInt(timeParts[0]);
          const minutes = timeParts[1];
          const isPM = time.includes("PM");

          if (isPM && hours !== 12) {
            hours += 12;
          } else if (!isPM && hours === 12) {
            hours = 0;
          }

          timeStr = `${String(hours).padStart(2, "0")}:${minutes}`;
        }
        const dateTimeString = `${showDate}T${timeStr}:00`;

        showToCreate.push({
          movieId: movie._id,
          showDate: new Date(dateTimeString),
          showTime: time,
          theater: {
            name: theater.name || "Unknown Theater",
            location: theater.location || "Unknown Location",
            city: theater.city || "Unknown City",
          },
          language: "English",
          format: "2D",
          seats: {
            total: 150,
            available: 150,
            booked: [],
            layout: {
              rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
              seatsPerRow: 15,
            },
          },
          pricing: showPrice || {
            standard: 250,
            premium: 350,
            vip: 500,
          },
          status: "active",
        });
      });
    });

    if (showToCreate.length > 0) {
      const createdShows = await Show.insertMany(showToCreate);
      return res.status(200).json({
        success: true,
        message: "Shows added successfully",
        data: createdShows,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No shows to create",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding show",
      error: error.message,
    });
  }
};

export const upcomingMovies = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const movies = await Movie.find({
      status: "upcoming",
      release_date: { $gte: tomorrow.toISOString().split("T")[0] },
    }).sort({ release_date: 1 });

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No upcoming movies",
      });
    }

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming movies",
      error: error.message,
    });
  }
};

const determineSeatType = (row) => {
  const vipRows = ["I", "J"];
  const premiumRows = ["E", "F", "G", "H"];

  if (vipRows.includes(row)) return "vip";
  if (premiumRows.includes(row)) return "premium";
  return "standard";
};

export const getNowPlaingMovies = getNowPlayingMovies;
