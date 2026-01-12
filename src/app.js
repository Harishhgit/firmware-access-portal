import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";

const app = express();
app.use(express.json());

console.log("🔥 App starting...");

await connectDB();

app.use("/auth", authRoutes);
app.use("/test", testRoutes);

app.get("/health", (req, res) => 
{
  res.send("API is runningggg");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
{
  console.log(`✅ Server running on port ${PORT}`);
});
