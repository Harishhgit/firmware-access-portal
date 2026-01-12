import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// 1. Construct the connection string using the pipe you found
// We use a Template Literal to make it clean
const pipe = `np:\\\\.\\pipe\\LOCALDB#3DFEE35D\\tsql\\query`;
const connectionString = `Driver={SQL Server};Server=${pipe};Database=${process.env.DB_NAME};Trusted_Connection=yes;TrustServerCertificate=yes;`;

let pool;

export const connectDB = async () => 
{
    try 
    {
        // 2. Connect using the STRING, not the object
        pool = await sql.connect(connectionString);
        console.log("✅ SQL Server connected via Pipe String!");
        return pool;
    } 
    catch (err) 
    {
        // If this fails, it will give us a much more specific error
        console.error("❌ SQL connection failed:", err.message);
    }
};

export const getPool = () => pool;
