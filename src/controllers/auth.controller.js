import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { getPool } from "../config/db.js";

export const login = async (req, res) => 
{
  const { userId, password } = req.body;

  if (!userId || !password) 
  {
    return res.status(400).json({ message: "UserId and password required" });
  }

  try
  {

    const pool = getPool();
    if (!pool) 
    {
      return res.status(500).json({ message: "Database not connected" });
    }

    const result = await pool.request()
                    .input("userId", sql.NVarChar, userId)
                    .query(`
                      SELECT * FROM Users
                      WHERE UserId = @userId AND IsActive = 1
                    `);

    /*const result = await sql.query`
      SELECT * FROM Users 
      WHERE UserId = ${userId} AND IsActive = 1
    `; */

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user.UserId,
        role: user.Role
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      role: user.Role,
      accessExpiresAt: user.AccessExpiresAt
    });

  } 
  catch (err) 
  {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
