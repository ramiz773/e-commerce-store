import express from "express";
import dotenv from "dotenv";
import authRoutes from "../backend/routes/auth.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
   res.send("it home route");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
   console.log(`server running on http://localhost:${PORT}`);
   connectDB();
});
