import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

let server;
let isShuttingDown = false;

async function shutdown(signal, exitCode = 0) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log(`Received ${signal}. Shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
        console.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            });
            console.log("HTTP server closed");
        }

        await disconnectDB();
        console.log("MongoDB connection closed");
        clearTimeout(forceExitTimer);
        process.exit(exitCode);
    } catch (error) {
        console.error("Error during graceful shutdown:", error.message);
        clearTimeout(forceExitTimer);
        process.exit(1);
    }
}

async function startServer() {
    try {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`TestPilot server running on port ${PORT}`);
        });

        server.on("error", async (error) => {
            console.error("HTTP server error:", error.message);
            await shutdown("SERVER_ERROR", 1);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        await disconnectDB().catch(() => {});
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
