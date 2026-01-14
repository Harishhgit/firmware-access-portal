import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
    server: process.env.DB_SERVER, 
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,      // Add this
    password: process.env.DB_PASSWORD, // Add this
    options: {
        trustServerCertificate: true,
        encrypt: false,
    }
};

let pool;

export const connectDB = async () => {
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