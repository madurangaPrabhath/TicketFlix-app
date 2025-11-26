import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import movieRouter from "./routes/movieRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import userRouter from "./routes/userRoutes.js";
import settingsRouter from "./routes/settingsRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

const app = express();
const port = 3000;

await connectDB();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/shows", showRouter);
app.use("/api/movies", movieRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/users", userRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/payments", paymentRouter);

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
