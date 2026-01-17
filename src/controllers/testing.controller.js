import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { getPool } from "../config/db.js";


export const login = async (req, res) => 
{
    console.log("🚩 Hit: Inside Login Controller"); // <--- BREAKPOINT HERE
    const { UserId, Password } = req.body;
  
    if (!UserId || !Password) 
    {
      return res.status(400).json({ message: "UserId and Password required" });
    }
  
        try 
        {
          const pool = getPool();
          console.log("Attempting SQL Query...");
          const result = await pool.request()
              .input("uId", sql.NVarChar, UserId)
              .query("SELECT * FROM Users WHERE UserId = @uId AND IsActive = 1");

          console.log("✅ Query finished. Rows found:", result.recordset.length);

          if (result.recordset.length === 0) 
          {
              return res.status(401).json({ message: "User not found or Inactive" });
          }    
      
          const user = result.recordset[0];
      
          // MATCH THE DATABASE COLUMN NAME: user.PasswordHash
          const isMatch = await bcrypt.compare(Password, user.PasswordHash);
          if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
          }
      
          // MATCH THE DATABASE COLUMN NAMES: UserId and Role
          const token = jwt.sign(
            {
              userId: user.UserId, // Capital 'I' to match database
              role: user.Role      // Capital 'R' to match database
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
          res.status(500).json({ message: "Server error", details: err.message });
        }

};