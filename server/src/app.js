import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { getDBStatus } from "./config/db.js";
import authRoutes from "./route/authRoutes.js";
import websiteRoutes from "./route/websiteRoutes.js";

const app = express();

app.use(helmet());

const rawOrigin = process.env.CLIENT_ORIGIN;
const allowedOrigins = rawOrigin
    ? rawOrigin.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

app.use(
    cors({
        origin:
            allowedOrigins.length <= 1
                ? allowedOrigins[0] || false
                : allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/api/health", (req, res) => {
    const database = getDBStatus();
    const isHealthy = database.readyState === 1;

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: "TestPilot API is running!",
        status: isHealthy ? "healthy" : "degraded",
        uptime: Math.floor(process.uptime()),
        database,
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/websites", websiteRoutes);

app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";
    const details = err.details || undefined;

    if (err instanceof SyntaxError && statusCode === 400 && "body" in err) {
        message = "Invalid JSON payload";
    } else if (err.code === 11000) {
        statusCode = 409;
        message = "Resource already exists";
    } else if (err.name === "ValidationError") {
        statusCode = 400;
        const firstError = Object.values(err.errors || {})[0];
        if (firstError?.message) {
            message = firstError.message;
        }
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (statusCode >= 500) {
        console.error("Unhandled server error:", message);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(details && { errors: details }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

export default app;
