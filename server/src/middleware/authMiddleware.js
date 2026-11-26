import { AUTH_COOKIE_NAME } from "../utils/authCookies.js";
import { verifyAuthToken } from "../service/authService.js";
import { AppError } from "../utils/errors.js";

/**
 * Verifies the HttpOnly JWT cookie and attaches the safe user profile to req.user.
 */
export async function authenticate(req, res, next) {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
        return next(new AppError(401, "Authentication required"));
    }

    try {
        const { user, tokenPayload } = await verifyAuthToken(token);
        req.user = user;
        req.auth = tokenPayload;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError(401, "Session expired. Please sign in again."));
        }
        if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
            return next(new AppError(401, "Invalid authentication token"));
        }
        return next(error);
    }
}

