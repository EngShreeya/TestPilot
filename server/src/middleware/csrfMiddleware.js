import crypto from "node:crypto";
import { CSRF_COOKIE_NAME } from "../utils/authCookies.js";
import { AppError } from "../utils/errors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function getAllowedOrigins() {
    const rawOrigin = process.env.CLIENT_ORIGIN;
    if (!rawOrigin) {
        return [];
    }
    return rawOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

function validateOrigin(req) {
    const secFetchSite = req.get("sec-fetch-site");
    if (secFetchSite === "cross-site") {
        throw new AppError(403, "Cross-site requests are not allowed");
    }

    const originHeader = req.get("origin");
    const refererHeader = req.get("referer");
    const allowedOrigins = getAllowedOrigins();

    if (originHeader) {
        if (!allowedOrigins.includes(originHeader)) {
            throw new AppError(403, "Origin not allowed");
        }
        return;
    }

    if (refererHeader) {
        try {
            const refererOrigin = new URL(refererHeader).origin;
            if (!allowedOrigins.includes(refererOrigin)) {
                throw new AppError(403, "Referer origin not allowed");
            }
        } catch {
            throw new AppError(403, "Invalid referer header");
        }
    }
}

function tokensMatch(cookieToken, headerToken) {
    if (typeof cookieToken !== "string" || typeof headerToken !== "string") {
        return false;
    }
    const cookieBuf = Buffer.from(cookieToken, "utf8");
    const headerBuf = Buffer.from(headerToken, "utf8");
    if (cookieBuf.length === 0 || cookieBuf.length !== headerBuf.length) {
        return false;
    }
    return crypto.timingSafeEqual(cookieBuf, headerBuf);
}

/**
 * Enforces Origin/Fetch-Metadata checks and double-submit CSRF token validation.
 */
export function verifyCsrf(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    try {
        validateOrigin(req);

        const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
        const headerToken = req.get("x-csrf-token");

        if (!tokensMatch(cookieToken, headerToken)) {
            throw new AppError(403, "Invalid or missing CSRF token");
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

/**
 * Validates Origin/Fetch-Metadata on login/register and enforces CSRF token when a browser/CSRF cookie session exists.
 */
export function verifyAuthEntryCsrf(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    try {
        validateOrigin(req);

        const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
        const hasBrowserOrigin = Boolean(req.get("origin") || req.get("referer"));
        if (cookieToken || hasBrowserOrigin) {
            const headerToken = req.get("x-csrf-token");
            if (!tokensMatch(cookieToken, headerToken)) {
                throw new AppError(403, "Invalid or missing CSRF token");
            }
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

