import Movie from "../models/Movie.js";

export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ release_date: -1 });

    if (!movies || movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found",
      });
    }

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching movies",
      error: error.message,
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching movie",
      error: error.message,
    });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const movies = await Movie.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { overview: { $regex: q, $options: "i" } },
        { genres: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching movies",
      error: error.message,
    });
  }
};

export const filterByGenre = async (req, res) => {
  try {
    const { genre } = req.query;

    if (!genre) {
      return res.status(400).json({
        success: false,
        message: "Genre is required",
      });
    }

    const movies = await Movie.find({
      genres: { $regex: genre, $options: "i" },
    }).sort({ vote_average: -1 });

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error filtering movies by genre",
      error: error.message,
    });
  }
};

export const getTopRatedMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ vote_average: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching top rated movies",
      error: error.message,
    });
  }
};

export const getMoviesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!["released", "upcoming"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'released' or 'upcoming'",
      });
    }

    const movies = await Movie.find({ status }).sort({ release_date: -1 });

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching movies by status",
      error: error.message,
    });
  }
};

export const createMovie = async (req, res) => {
  try {
    const {
      title,
      overview,
      genres,
      vote_average,
      release_date,
      poster_path,
      backdrop_path,
      trailer_url,
      director,
      cast,
      runtime,
      language,
      status,
    } = req.body;

    if (!title || !overview || !genres || !release_date || !poster_path) {
      return res.status(400).json({
        success: false,
        message:
          "Title, overview, genres, release_date, and poster_path are required",
      });
    }

    const newMovie = new Movie({
      title,
      overview,
      genres,
      vote_average: vote_average || 0,
      release_date,
      poster_path,
      backdrop_path: backdrop_path || "",
      trailer_url: trailer_url || "",
      director: director || "",
      cast: cast || [],
      runtime: runtime || 0,
      language: language || "English",
      status: status || "released",
    });

    const savedMovie = await newMovie.save();

    res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: savedMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating movie",
      error: error.message,
    });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const updateData = req.body;

    const updatedMovie = await Movie.findByIdAndUpdate(movieId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      data: updatedMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating movie",
      error: error.message,
    });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const deletedMovie = await Movie.findByIdAndDelete(movieId);

    if (!deletedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      data: deletedMovie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting movie",
      error: error.message,
    });
  }
};
