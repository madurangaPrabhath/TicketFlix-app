import express from "express";
import {
  getNowPlaingMovies,
  upcomingMovies,
  addShow,
} from "../controllers/showControllers.js";

const showRouter = express.Router();

showRouter.get("/now-playing", getNowPlaingMovies);
showRouter.post("/add", addShow);
showRouter.get("/upcoming", upcomingMovies);

export default showRouter;
