import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import memberRoutes from "./routes/memberRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

import { connectDB } from "./config/db.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/members", memberRoutes);
app.use("/payments", paymentRoutes);

// test route
app.get("/", (req, res) => {
  res.status(200).json({ message: "FitTrack Backend Running " });
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
});
