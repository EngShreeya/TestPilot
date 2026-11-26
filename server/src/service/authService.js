import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import RevokedToken from "../model/RevokedToken.js";
import { AppError } from "../utils/errors.js";

const BCRYPT_SALT_ROUNDS = 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Precomputed valid bcrypt hash used to equalize timing when a user is not found.
const DUMMY_PASSWORD_HASH =
    "$2b$12$CwTycUXWue0Thq9StjUM0uJ8hY4x5G9K5f6b9E8M0l1N2O3P4Q5R6";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.trim().length < 16) {
        throw new AppError(500, "Server authentication configuration is incomplete");
    }
    return secret;
}

function getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "7d";
}

export function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validateRegisterInput({ name, email, password }) {
    const errors = {};
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = normalizeEmail(email);

    if (!cleanName) {
        errors.name = "Name is required";
    } else if (cleanName.length < 2 || cleanName.length > 80) {
        errors.name = "Name must be between 2 and 80 characters";
    }

    if (!cleanEmail) {
        errors.email = "Email is required";
    } else if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
        errors.email = "Please provide a valid email address";
    }

    if (typeof password !== "string" || password.length === 0) {
        errors.password = "Password is required";
    } else if (password.length < 8 || password.length > 128) {
        errors.password = "Password must be between 8 and 128 characters";
    } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        errors.password = "Password must include at least one letter and one number";
    }

    if (Object.keys(errors).length > 0) {
        const firstMessage = Object.values(errors)[0];
        throw new AppError(400, firstMessage, errors);
    }

    return {
        name: cleanName,
        email: cleanEmail,
        password,
    };
}

export function validateLoginInput({ email, password }) {
    const errors = {};
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
        errors.email = "Email is required";
    } else if (cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
        errors.email = "Please provide a valid email address";
    }

    if (typeof password !== "string" || password.length === 0) {
        errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
        const firstMessage = Object.values(errors)[0];
        throw new AppError(400, firstMessage, errors);
    }

    return {
        email: cleanEmail,
        password,
    };
}

export function signAuthToken(user) {
    const jti = crypto.randomUUID();
    return jwt.sign(
        {
            sub: user._id.toString(),
            jti,
        },
        getJwtSecret(),
        {
            algorithm: "HS256",
            expiresIn: getJwtExpiresIn(),
        }
    );
}

export async function registerUser(rawInput) {
    const { name, email, password } = validateRegisterInput(rawInput || {});

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
        throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    try {
        const user = await User.create({
            name,
            email,
            passwordHash,
        });

        const token = signAuthToken(user);
        return {
            user: user.toSafeProfile(),
            token,
        };
    } catch (error) {
        if (error?.code === 11000) {
            throw new AppError(409, "An account with this email already exists");
        }
        throw error;
    }
}

export async function loginUser(rawInput) {
    const { email, password } = validateLoginInput(rawInput || {});

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
        await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
        throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AppError(401, "Invalid email or password");
    }

    const token = signAuthToken(user);
    return {
        user: user.toSafeProfile(),
        token,
    };
}

export async function verifyAuthToken(token) {
    const decoded = jwt.verify(token, getJwtSecret(), {
        algorithms: ["HS256"],
    });

    if (!decoded?.sub || !decoded?.jti) {
        throw new AppError(401, "Invalid authentication token");
    }

    const isRevoked = await RevokedToken.exists({ jti: decoded.jti });
    if (isRevoked) {
        throw new AppError(401, "Session has been invalidated");
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
        throw new AppError(401, "Authentication required");
    }

    return {
        user: user.toSafeProfile(),
        tokenPayload: decoded,
    };
}

export async function revokeAuthToken(token) {
    if (!token) {
        return;
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret(), {
            algorithms: ["HS256"],
            ignoreExpiration: true,
        });

        if (decoded?.jti && decoded?.exp) {
            await RevokedToken.updateOne(
                { jti: decoded.jti },
                {
                    $setOnInsert: {
                        jti: decoded.jti,
                        expiresAt: new Date(decoded.exp * 1000),
                    },
                },
                { upsert: true }
            );
        }
    } catch {
        // Ignore invalid/tampered tokens during logout while still clearing cookies.
    }
}

