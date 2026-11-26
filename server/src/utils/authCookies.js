import crypto from "node:crypto";

export const AUTH_COOKIE_NAME = "tp_token";
export const CSRF_COOKIE_NAME = "tp_csrf";

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CSRF_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CSRF_TOKEN_REGEX = /^[a-f0-9]{64}$/i;

function isProduction() {
    return process.env.NODE_ENV === "production";
}

function getSameSitePolicy() {
    const configured = process.env.COOKIE_SAME_SITE?.toLowerCase();
    if (configured === "strict" || configured === "lax" || configured === "none") {
        return configured;
    }
    return "lax";
}

export function parseDurationMs(expiresIn = "7d") {
    if (typeof expiresIn === "number" && Number.isFinite(expiresIn)) {
        return expiresIn * 1000;
    }

    const match = /^(\d+)([smhd])$/i.exec(String(expiresIn).trim());
    if (!match) {
        return DEFAULT_MAX_AGE_MS;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}

function getBaseCookieOptions() {
    const sameSite = getSameSitePolicy();
    return {
        httpOnly: true,
        secure: isProduction() || sameSite === "none",
        sameSite,
        path: "/",
    };
}

export function setAuthCookie(res, token) {
    res.cookie(AUTH_COOKIE_NAME, token, {
        ...getBaseCookieOptions(),
        maxAge: parseDurationMs(process.env.JWT_EXPIRES_IN || "7d"),
    });
}

export function clearAuthCookie(res) {
    res.clearCookie(AUTH_COOKIE_NAME, getBaseCookieOptions());
}

/**
 * Issues or reuses an HttpOnly CSRF cookie and returns the raw token for memory storage.
 */
export function issueCsrfToken(req, res, forceRotate = false) {
    const existing = req.cookies?.[CSRF_COOKIE_NAME];
    const token =
        !forceRotate && typeof existing === "string" && CSRF_TOKEN_REGEX.test(existing)
            ? existing
            : crypto.randomBytes(32).toString("hex");

    res.cookie(CSRF_COOKIE_NAME, token, {
        ...getBaseCookieOptions(),
        maxAge: CSRF_MAX_AGE_MS,
    });

    return token;
}

export function clearCsrfCookie(res) {
    res.clearCookie(CSRF_COOKIE_NAME, getBaseCookieOptions());
}

