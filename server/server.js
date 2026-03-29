
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Note = require("./models/Note");
const auth = require("./middleware/auth");
const Meal = require("./models/Meal");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 12);
  const user = new User({ email: req.body.email, password: hashed });
  await user.save();
  res.json({ message: "User created" });
});

app.post("/meals", async (req, res) => {

  try {
    const meal = new Meal({ mealName: req.body.mealName, price: req.body.price, description: req.body.description, image: req.body.image });
    await meal.save();
    res.json({ message: "Meal created" });
  
  }catch(e){
    console.error("New meal error", e)
  }
  
});

app.get("/meals", auth, async (req, res) => {
  const meals = await Meal.find();
  res.json(meals);
});

app.delete("/meals/:id", auth, async (req, res) => {
  await Meal.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ message: "Wrong password" });

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict" });
  res.json({ accessToken });
});

app.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const verified = jwt.verify(token, process.env.REFRESH_SECRET);
    const accessToken = jwt.sign({ id: verified.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

app.get("/notes", auth, async (req, res) => {
  const notes = await Note.find({ userId: req.user.id });
  res.json(notes);
});

app.post("/notes", auth, async (req, res) => {
  const note = new Note({ text: req.body.text, userId: req.user.id });
  await note.save();
  res.json(note);
});

app.put("/notes/:id", auth, async (req, res) => {
  const updated = await Note.findByIdAndUpdate(req.params.id, { text: req.body.text }, { new: true });
  res.json(updated);
});

app.delete("/notes/:id", auth, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Meals CRUD


app.listen(5000, () => console.log("Server running on port 5000"));
