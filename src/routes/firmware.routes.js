import express from "express";
import sql from "mssql";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkAccessWindow } from "../middlewares/access.middleware.js";
import { getPool } from "../config/db.js";

const router = express.Router();

router.get("/download", verifyToken, checkAccessWindow, async (req, res) => 
{
    try 
    {
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
  
    } 
    catch (err) 
    {
      console.error("Firmware access log error:", err);
      res.status(500).json({ message: "Logging failed" });
    }
});
    

router.get("/logs", verifyToken, async (req, res) => 
{
    try 
    {
      const pool = getPool();
  
      const result = await pool.request()
        .query(`
          SELECT TOP 50
            UserId,
            Endpoint,
            AccessTime,
            Status
          FROM ApiAccessLogs
          ORDER BY AccessTime DESC
        `);
  
      res.json(result.recordset);
  
    } 
    catch (err) 
    {
      console.error("Fetch logs error:", err);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
});

export default router;