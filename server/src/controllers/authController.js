import {
    AUTH_COOKIE_NAME,
    clearAuthCookie,
    clearCsrfCookie,
    issueCsrfToken,
    setAuthCookie,
} from "../utils/authCookies.js";
import {
    loginUser,
    registerUser,
    revokeAuthToken,
} from "../service/authService.js";

export function getCsrfToken(req, res) {
    const csrfToken = issueCsrfToken(req, res);
    res.status(200).json({
        success: true,
        csrfToken,
    });
}

export async function register(req, res) {
    const { user, token } = await registerUser(req.body);

    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(req, res, true);

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        user,
        csrfToken,
    });
}

export async function login(req, res) {
    const { user, token } = await loginUser(req.body);

    setAuthCookie(res, token);
    const csrfToken = issueCsrfToken(req, res, true);

    res.status(200).json({
        success: true,
        message: "Signed in successfully",
        user,
        csrfToken,
    });
}

export function getCurrentUser(req, res) {
    const csrfToken = issueCsrfToken(req, res);

    res.status(200).json({
        success: true,
        user: req.user,
        csrfToken,
    });
}

export async function logout(req, res) {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    await revokeAuthToken(token);

    clearAuthCookie(res);
    clearCsrfCookie(res);

    res.status(200).json({
        success: true,
        message: "Signed out successfully",
    });
}

