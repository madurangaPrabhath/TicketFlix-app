import Movie from "../models/Movie.js";
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
      },
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "TMDB API Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const tmdbData = await fetchFromTMDB("/movie/now_playing", {
      page: 1,
    });

    const movies = tmdbData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: `${IMAGE_BASE_URL}${movie.poster_path}`,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
    }));

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching movies from TMDB",
      error: error.message,
      details: error.response?.data,
      tmdbKeyExists: !!TMDB_API_KEY,
    });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;

    const isNumeric = /^\d+$/.test(movieId);

    if (isNumeric) {
      const movieData = await fetchFromTMDB(`/movie/${movieId}`);
      return res.status(200).json({
        success: true,
        data: {
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          genres: movieData.genres.map((g) => g.name),
          vote_average: movieData.vote_average,
          release_date: movieData.release_date,
          poster_path: `${IMAGE_BASE_URL}${movieData.poster_path}`,
          backdrop_path: `${IMAGE_BASE_URL}${movieData.backdrop_path}`,
          runtime: movieData.runtime,
        },
      });
    } else {
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({
          success: false,
          message: "Movie not found",
        });
      }
      return res.status(200).json({
        success: true,
        data: movie,
      });
    }
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

    const tmdbData = await fetchFromTMDB("/search/movie", {
      query: q,
      page: 1,
    });

    const movies = tmdbData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
        : null,
    }));

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

    const genresData = await fetchFromTMDB("/genre/movie/list");
    const genreObj = genresData.genres.find(
      (g) => g.name.toLowerCase() === genre.toLowerCase()
    );

    if (!genreObj) {
      return res.status(404).json({
        success: false,
        message: "Genre not found",
      });
    }

    const tmdbData = await fetchFromTMDB("/discover/movie", {
      with_genres: genreObj.id,
      sort_by: "vote_average.desc",
      page: 1,
    });

    const movies = tmdbData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: `${IMAGE_BASE_URL}${movie.poster_path}`,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
    }));

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
    const tmdbData = await fetchFromTMDB("/movie/top_rated", {
      page: 1,
    });

    const movies = tmdbData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: `${IMAGE_BASE_URL}${movie.poster_path}`,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
    }));

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

    let endpoint;
    if (status === "released") {
      endpoint = "/movie/now_playing";
    } else if (status === "upcoming") {
      endpoint = "/movie/upcoming";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'released' or 'upcoming'",
      });
    }

    const tmdbData = await fetchFromTMDB(endpoint, {
      page: 1,
    });

    const movies = tmdbData.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      poster_path: `${IMAGE_BASE_URL}${movie.poster_path}`,
      backdrop_path: `${IMAGE_BASE_URL}${movie.backdrop_path}`,
      status: status,
    }));

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

    if (!movieId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID format. Use MongoDB ObjectId",
      });
    }

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

    if (!movieId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID format. Use MongoDB ObjectId",
      });
    }

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
