import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import axios from "axios";

export const getShowsByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;

    console.log("Server: getShowsByMovieId called -", { movieId });

    // Try to find by ObjectId first (if it's a valid MongoDB ID)
    let shows = [];
    try {
      shows = await Show.find({ movieId })
        .populate("movieId", "title poster_path backdrop_path")
        .sort({ showDate: 1, showTime: 1 });
    } catch (err) {
      console.log(
        "Server: movieId is not a valid ObjectId (likely TMDB ID), returning empty shows"
      );
      shows = [];
    }

    // Return empty array if no shows found (don't error out)
    res.status(200).json({
      success: true,
      data: shows,
      message:
        shows.length > 0 ? "Shows found" : "No shows available for this movie",
    });
  } catch (error) {
    console.error("Server: Error fetching shows:", error);
    res.status(200).json({
      success: true,
      data: [],
      message: "No shows available for this movie",
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

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .populate("movieId", "title poster_path backdrop_path")
      .sort({ showDate: 1, showTime: 1 });

    if (!shows || shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows found",
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

export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    const show = await Show.findById(movieId).populate(
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

export const getNowPlaingMovies = getNowPlayingMovies;
