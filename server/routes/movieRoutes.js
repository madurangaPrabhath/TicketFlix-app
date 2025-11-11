import express from "express";
import {
  getAllMovies,
  getMovieById,
  searchMovies,
  filterByGenre,
  getTopRatedMovies,
  getMoviesByStatus,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieControllers.js";

const movieRouter = express.Router();

// Public routes
movieRouter.get("/", getAllMovies);
movieRouter.get("/search", searchMovies);
movieRouter.get("/genre", filterByGenre);
movieRouter.get("/top-rated", getTopRatedMovies);
movieRouter.get("/status/:status", getMoviesByStatus);
movieRouter.get("/:movieId", getMovieById);

// Admin routes
movieRouter.post("/", createMovie);
movieRouter.put("/:movieId", updateMovie);
movieRouter.delete("/:movieId", deleteMovie);

export default movieRouter;
