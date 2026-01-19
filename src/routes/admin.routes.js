import express from "express";
import { createUser, grantAccess } from "../controllers/admin.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create-user", verifyToken, requireRole("ADMIN"), createUser);
router.post("/grant-access", verifyToken, requireRole("ADMIN"), grantAccess);

export default router;
