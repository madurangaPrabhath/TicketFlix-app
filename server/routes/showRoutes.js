import express from "express";
import {
  getNowPlaingMovies,
  upcomingMovies,
  getShows,
  getShow,
  getShowsByMovieId,
  getShowsByDate,
  getShowById,
  getSeatAvailability,
  bookSeats,
  releaseSeats,
} from "../controllers/showControllers.js";

const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlaingMovies);
showRouter.get("/upcoming", upcomingMovies);
showRouter.get("/all", getShows);
showRouter.get("/:movieId", getShow);

showRouter.get("/movie/:movieId", getShowsByMovieId);
showRouter.get("/movie/:movieId/date/:date", getShowsByDate);
showRouter.get("/details/:showId", getShowById);

showRouter.get("/seats/:showId", getSeatAvailability);
showRouter.post("/book/:showId", bookSeats);
showRouter.post("/release/:showId", releaseSeats);

export default showRouter;
