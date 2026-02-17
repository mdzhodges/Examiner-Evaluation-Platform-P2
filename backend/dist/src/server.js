import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";
import examinerRouter from "./routes/examiner.js";
// Resolve dirname (ESM-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Only load .env locally
 * Cloud Run injects env vars directly
 */
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
// Environment setup
const ENVIRONMENT = process.env.ENVIRONMENT ?? "local";
const PORT = Number(process.env.PORT) || 8080;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGINS = process.env.CORS_ORIGINS;
if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
}
// Mongo connection (do NOT block server startup)
async function connectMongo() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
// Express app
const app = express();
// ----- CORS CONFIG -----
const defaultAllowedOrigins = new Set([
    "http://localhost:3000",
    "http://localhost:5173",
    "https://mdzhodges.github.io"
]);
const allowedOrigins = new Set((CORS_ORIGINS ? CORS_ORIGINS.split(",") : [])
    .map(origin => origin.trim())
    .filter(Boolean));
if (allowedOrigins.size === 0) {
    for (const origin of defaultAllowedOrigins) {
        allowedOrigins.add(origin);
    }
}
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));
app.use(express.json());
// Routes
app.use("/examiner", examinerRouter);
// ----- START SERVER FIRST (Cloud Run requirement) -----
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${ENVIRONMENT})`);
    // Connect to Mongo AFTER server is listening
    connectMongo();
});
