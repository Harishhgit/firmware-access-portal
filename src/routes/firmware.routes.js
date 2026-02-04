import express from "express";
import sql from "mssql";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkAccessWindow } from "../middlewares/access.middleware.js";
import { getPool } from "../config/db.js";

const router = express.Router();

router.get("/download", verifyToken, checkAccessWindow, async (req, res) => {
    try {
      const pool = getPool();
      const userId = req.user.userId;
  
      await pool.request()
        .input("userId", sql.NVarChar, userId)
        .input("endpoint", sql.NVarChar, "/firmware/download")
        .input("status", sql.NVarChar, "ALLOWED")
        .query(`
          INSERT INTO ApiAccessLogs (UserId, Endpoint, Status)
          VALUES (@userId, @endpoint, @status)
        `);
  
      res.json({ message: "Firmware download allowed" });
  
    } catch (err) {
      console.error("Firmware access log error:", err);
      res.status(500).json({ message: "Logging failed" });
    }
  });

export default router;
