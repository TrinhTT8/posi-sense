import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import AquariumItem from "./models/AquariumItem.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Example GET route
app.get("/api/aquarium", async (req, res) => {
  const items = await AquariumItem.find();
  res.json(items);
});

// Example POST route
app.post("/api/aquarium", async (req, res) => {
  const item = new AquariumItem(req.body);
  await item.save();
  res.status(201).json(item);
});

// Registration endpoint
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  // Check if user exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(409).json({ error: "Username or email already in use." });
  }
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create user
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "User registered successfully." });
});

app.get("/", (req, res) => {
  res.send("PosiSense backend running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
