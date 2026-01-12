import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/admin-only", authenticate, authorize("ADMIN"), (req, res) => {
  res.json({ message: "Welcome ADMIN" });
});

router.get("/user-only", authenticate, authorize("USER"), (req, res) => {
  res.json({ message: "Welcome USER" });
});

export default router;
