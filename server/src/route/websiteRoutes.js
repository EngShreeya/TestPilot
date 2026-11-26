import { Router } from "express";
import {
    create,
    getOne,
    list,
    remove,
    update,
} from "../controllers/websiteController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { verifyCsrf } from "../middleware/csrfMiddleware.js";
import { websiteApiLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.use(websiteApiLimiter);
router.use(authenticate);

router.get("/", list);
router.post("/", verifyCsrf, create);
router.get("/:id", getOne);
router.put("/:id", verifyCsrf, update);
router.patch("/:id", verifyCsrf, update);
router.delete("/:id", verifyCsrf, remove);

export default router;

