import sql from "mssql";
import { getPool } from "../config/db.js";


export const checkAccessWindow = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const pool = getPool();

    const result = await pool.request()
      .input("userId", sql.NVarChar, userId)
      .query(`
        SELECT IsActive, AccessExpiresAt
        FROM Users
        WHERE UserId = @userId
      `);

    // User not found
    if (result.recordset.length === 0) 
    {
      await logAccess(pool, userId, "DENIED", "User not found");
      return res.status(403).json({ message: "User not found" });
    }

    const { IsActive, AccessExpiresAt } = result.recordset[0];

    // User inactive
    if (!IsActive) 
    {
      await logAccess(pool, userId, "DENIED", "User inactive");
      return res.status(403).json({ message: "User inactive" });
    }

    // Access never granted
    if (!AccessExpiresAt) 
    {
      await logAccess(pool, userId, "DENIED", "Access not granted");
      return res.status(403).json({ message: "Access not granted" });
    }

    // Access expired
    if (new Date() > new Date(AccessExpiresAt)) 
    {
      await logAccess(pool, userId, "DENIED", "Access expired");
      return res.status(403).json({ message: "Access expired" });
    }

    // All checks passed → allow access
    next();

  } 
  catch (err) 
  {
    console.error("Access window middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  Helper function to log access attempts
*/
const logAccess = async (pool, userId, status, reason) => 
{
  try {
    await pool.request()
      .input("userId", sql.NVarChar, userId)
      .input("endpoint", sql.NVarChar, "/firmware/download")
      .input("status", sql.NVarChar, status)
      .input("reason", sql.NVarChar, reason)
      .query(`
        INSERT INTO ApiAccessLogs (UserId, Endpoint, Status, Reason)
        VALUES (@userId, @endpoint, @status, @reason)
      `);
  } catch (err) {
    console.error("Failed to log access attempt:", err);
  }
};
