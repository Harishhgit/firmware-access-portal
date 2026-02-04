import cors from "cors";
import adminRoutes from "./routes/admin.routes.js";
import dotenv from "dotenv";
import firmwareRoutes from "./routes/firmware.routes.js";
dotenv.config();
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // This tells the browser: "I accept requests from Hoppscotch!"
app.use(express.json());
app.use(express.static(path.join(__dirname, "../ui")));


console.log("🔥 App starting...");

await connectDB();

app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/admin", adminRoutes);
app.use("/firmware", firmwareRoutes);

app.get("/health", (req, res) => 
{
  res.send("API is runningggg");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
  console.log(`✅ Server running on port ${PORT}`);
});
