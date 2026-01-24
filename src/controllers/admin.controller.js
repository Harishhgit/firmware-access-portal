import bcrypt from "bcryptjs";
import sql from "mssql";
import { getPool } from "../config/db.js";

/*
  1. CREATE USER (ADMIN or USER)
*/
export const createUser = async (req, res) => {
  const { userId, userName, password, role } = req.body;

  if (!userId || !userName || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!["ADMIN", "USER"].includes(role)) {
    return res.status(400).json({ message: "Role must be ADMIN or USER" });
  }

  try {
    const pool = getPool();

    // Check if user already exists
    const checkUser = await pool.request()
      .input("userId", sql.NVarChar, userId)
      .query(`SELECT * FROM Users WHERE UserId = @userId`);

    if (checkUser.recordset.length > 0) 
    {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.request()
      .input("userId", sql.NVarChar, userId)
      .input("userName", sql.NVarChar, userName)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .input("role", sql.NVarChar, role)
      .query(`
        INSERT INTO Users 
        (UserId, UserName, PasswordHash, Role, IsActive, CreatedAt)
        VALUES
        (@userId, @userName, @passwordHash, @role, 1, GETDATE())
      `);

    res.json({
      message: "User created successfully",
      userId,
      role
    });

  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/*
  2. GRANT ACCESS FOR 48 HOURS
*/
export const grantAccess = async (req, res) => 
{
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const pool = getPool();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const result = await pool.request()
      .input("userId", sql.NVarChar, userId)
      .input("grantedAt", sql.DateTime, now)
      .input("expiresAt", sql.DateTime, expiresAt)
      .query(`
        UPDATE Users
        SET 
          AccessGrantedAt = @grantedAt,
          AccessExpiresAt = @expiresAt
        WHERE UserId = @userId AND IsActive = 1
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "User not found or inactive" });
    }

    res.json({
      message: "Access granted successfully",
      userId,
      AccessGrantedAt: now,
      AccessExpiresAt: expiresAt
    });

  } 
  catch (err) 
  {
    console.error("Grant access error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
