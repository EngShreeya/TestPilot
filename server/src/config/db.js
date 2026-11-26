import mongoose from "mongoose";

const DB_STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
};

let listenersRegistered = false;

/**
 * Redacts embedded credentials from MongoDB error messages if present.
 */
function sanitizeErrorMessage(error) {
    const message = error?.message || "Unknown database error";
    return message.replace(/(mongodb(?:\+srv)?:\/\/)([^@\s]+@)/gi, "$1***:***@");
}

function registerConnectionListeners() {
    if (listenersRegistered) {
        return;
    }
    listenersRegistered = true;

    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", sanitizeErrorMessage(error));
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });
}

/**
 * Establishes or reuses the Mongoose connection to MongoDB Atlas.
 */
export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
        return mongoose.connection.asPromise();
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || !mongoUri.trim()) {
        throw new Error("MONGODB_URI environment variable is not defined");
    }

    registerConnectionListeners();

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(
            `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
        );
        return conn.connection;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${sanitizeErrorMessage(error)}`);
    }
}

/**
 * Closes the active Mongoose connection if open.
 */
export async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}

/**
 * Returns the current Mongoose connection status without exposing credentials.
 */
export function getDBStatus() {
    const readyState = mongoose.connection.readyState;
    return {
        status: DB_STATES[readyState] || "unknown",
        readyState,
    };
}

export default connectDB;

