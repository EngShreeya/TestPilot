import { Router } from "express";
import {
    getCsrfToken,
    getCurrentUser,
    login,
    logout,
    register,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    verifyAuthEntryCsrf,
    verifyCsrf,
} from "../middleware/csrfMiddleware.js";
import {
    authMutationLimiter,
    authSessionLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.get("/csrf-token", authSessionLimiter, getCsrfToken);
router.post("/register", authMutationLimiter, verifyAuthEntryCsrf, register);
router.post("/login", authMutationLimiter, verifyAuthEntryCsrf, login);
router.get("/me", authSessionLimiter, authenticate, getCurrentUser);
router.post("/logout", authSessionLimiter, verifyCsrf, logout);

export default router;

