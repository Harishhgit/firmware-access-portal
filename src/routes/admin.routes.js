import express from "express";
import { createUser, grantAccess } from "../controllers/admin.controller.js";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";
import { revokeAccess } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/create-user", verifyToken, requireRole("ADMIN"), createUser);
router.post("/grant-access", verifyToken, requireRole("ADMIN"), grantAccess);
router.get("/users", verifyToken, requireRole("ADMIN"), getAllUsers);
router.post("/revoke-access", verifyToken, requireRole("ADMIN"), revokeAccess);

export default router;
