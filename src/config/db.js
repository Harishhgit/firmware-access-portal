import sql from "mssql";
import dotenv from "dotenv";
// Only call config if variables aren't already there
if (!process.env.DB_SERVER) { dotenv.config(); }

import path from "path";
import { fileURLToPath } from "url";

// 1. Fix the Path: This ensures the app finds the .env file in your root folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "D:/firmware-access-portal/.env") });


// 2. Define the config AFTER dotenv has loaded the variables
const dbConfig = {
    server: process.env.DB_SERVER, 
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    options: {
        trustServerCertificate: true,
        encrypt: false,
    }
};

let pool;

export const connectDB = async () => {
    // 3. Diagnostic check: If this is undefined, the .env path is still wrong
    if (!dbConfig.server) {
        console.error("❌ ERROR: DB_SERVER is undefined. Check your .env file location.");
        return;
    }

    try {
        pool = await sql.connect(dbConfig);
        console.log("✅ SQL Server connected successfully!");
        return pool;
    } catch (err) {
        console.error("❌ SQL connection failed!");
        console.error("Message:", err.message);
    }
};

export const getPool = () => pool;