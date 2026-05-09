/**
 * BACKEND TESTS — server.js
 * Stack: Jest + Supertest + mongodb-memory-server
 *
 * SETUP INSTRUCTIONS:
 *   npm install --save-dev jest supertest mongodb-memory-server @types/jest
 *   Add to package.json scripts: "test": "jest --testEnvironment node"
 *
 * Run tests: npm test
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// ── env vars used by server ──────────────────────────────────────────────────
process.env.JWT_SECRET = "test_jwt_secret";
process.env.REFRESH_SECRET = "test_refresh_secret";
process.env.MONGO_URI = "placeholder"; // overridden in beforeAll

// ── import models & middleware (adjust paths if needed) ──────────────────────
const User = require("./models/User");
const Note = require("./models/Note");
const Meal = require("./models/Meal");
const Order = require("./models/Order");
const auth = require("./middleware/auth");

// ── build a minimal express app (mirrors server.js without app.listen) ───────
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(morgan("silent"));
app.use(cookieParser());

// paste all your routes here, or require them from server.js if you export `app`
// For now we re-declare the minimal set needed for testing:

app.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 12);
    const user = new User({ email: req.body.email, password: hashed });
    await user.save();
    res.json({ message: "User created" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "User not found" });
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ message: "Wrong password" });
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict" });
  res.json({ accessToken, user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
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

app.post("/meals", async (req, res) => {
  try {
    const meal = new Meal({ mealName: req.body.mealName, price: req.body.price, description: req.body.description, image: req.body.image });
    await meal.save();
    res.json({ message: "Meal created" });
  } catch (e) {
    res.status(400).json({ message: e.message });
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

app.get("/bag", auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate("bag.meal");
  res.json(user.bag);
});

app.post("/bag", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const duplicate = user.bag.find(x => x.meal.toString() === req.body.mealId);
  if (duplicate) {
    duplicate.quantity += 1;
  } else {
    user.bag.push({ meal: req.body.mealId, quantity: 1 });
  }
  await user.save();
  res.json(user.bag);
});

app.delete("/bag/:id", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id,
    { $pull: { bag: { _id: req.params.id } } }
  );
  res.json(user.bag);
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

app.get("/orders", async (req, res) => {
  const orders = await Order.find().populate("meals.meal");
  res.json(orders);
});

// ── test helpers ─────────────────────────────────────────────────────────────
let mongoServer;

/** Register + login a user and return { token, userId } */
async function createAndLoginUser(email = "test@example.com", password = "Password123!") {
  await request(app).post("/register").send({ email, password });
  const res = await request(app).post("/login").send({ email, password });
  return { token: res.body.accessToken, userId: res.body.user.id, loginRes: res };
}

/** Return an Authorization header object */
const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// ── lifecycle ─────────────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // wipe all collections between tests
  await Promise.all(Object.values(mongoose.connection.collections).map(c => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ═════════════════════════════════════════════════════════════════════════════
// AUTH TESTS
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /register", () => {
  test("creates a new user successfully", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "user@test.com", password: "Secret123!" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User created");
  });

  test("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/register")
      .send({ password: "Secret123!" });

    expect(res.status).toBe(400);
  });

  test("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(400);
  });

  test("does not store plaintext password in DB", async () => {
    await request(app).post("/register").send({ email: "user@test.com", password: "Secret123!" });
    const dbUser = await User.findOne({ email: "user@test.com" });
    expect(dbUser.password).not.toBe("Secret123!");
    expect(dbUser.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
  });
});

describe("POST /login", () => {
  test("returns accessToken and user info on valid credentials", async () => {
    const { loginRes } = await createAndLoginUser();
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
    expect(loginRes.body.user.email).toBe("test@example.com");
  });

  test("sets httpOnly refreshToken cookie on login", async () => {
    const { loginRes } = await createAndLoginUser();
    const cookies = loginRes.headers["set-cookie"] || [];
    expect(cookies.some(c => c.startsWith("refreshToken="))).toBe(true);
    expect(cookies.some(c => c.includes("HttpOnly"))).toBe(true);
  });

  test("returns 400 for unknown email", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "nobody@test.com", password: "whatever" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User not found");
  });

  test("returns 400 for wrong password", async () => {
    await request(app).post("/register").send({ email: "u@test.com", password: "correct" });
    const res = await request(app)
      .post("/login")
      .send({ email: "u@test.com", password: "wrong" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Wrong password");
  });
});

describe("POST /refresh", () => {
  test("returns new accessToken when refresh cookie is valid", async () => {
    const { loginRes } = await createAndLoginUser();
    const cookie = loginRes.headers["set-cookie"].find(c => c.startsWith("refreshToken="));

    const res = await request(app)
      .post("/refresh")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test("returns 401 when no refresh cookie is sent", async () => {
    const res = await request(app).post("/refresh");
    expect(res.status).toBe(401);
  });

  test("returns 403 for a tampered/invalid refresh token", async () => {
    const res = await request(app)
      .post("/refresh")
      .set("Cookie", "refreshToken=totallyinvalidtoken");

    expect(res.status).toBe(403);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// MEALS TESTS
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /meals", () => {
  test("creates a meal with valid data", async () => {
    const res = await request(app).post("/meals").send({
      mealName: "Pasta",
      price: 12.99,
      description: "Delicious pasta",
      image: "pasta.jpg",
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Meal created");
  });

  test("does NOT require auth (public endpoint)", async () => {
    const res = await request(app).post("/meals").send({ mealName: "Pizza", price: 9.99 });
    expect(res.status).toBe(200);
  });
});

describe("GET /meals", () => {
  test("returns list of meals for authenticated user", async () => {
    const { token } = await createAndLoginUser();
    await request(app).post("/meals").send({ mealName: "Burger", price: 8.5 });

    const res = await request(app)
      .get("/meals")
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].mealName).toBe("Burger");
  });

  test("returns 401 for unauthenticated request", async () => {
    const res = await request(app).get("/meals");
    expect(res.status).toBe(401);
  });
});

describe("DELETE /meals/:id", () => {
  test("deletes a meal by id", async () => {
    const { token } = await createAndLoginUser();
    await request(app).post("/meals").send({ mealName: "Salad", price: 7 });
    const meals = await Meal.find();
    const mealId = meals[0]._id;

    const res = await request(app)
      .delete(`/meals/${mealId}`)
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deleted");

    const remaining = await Meal.findById(mealId);
    expect(remaining).toBeNull();
  });

  test("returns 401 without auth", async () => {
    const res = await request(app).delete("/meals/someid");
    expect(res.status).toBe(401);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BAG TESTS
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /bag", () => {
  test("adds a new meal to the bag", async () => {
    const { token } = await createAndLoginUser();
    await request(app).post("/meals").send({ mealName: "Wrap", price: 6 });
    const meal = await Meal.findOne();

    const res = await request(app)
      .post("/bag")
      .set(bearer(token))
      .send({ mealId: meal._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].quantity).toBe(1);
  });

  test("increments quantity if same meal added twice", async () => {
    const { token } = await createAndLoginUser();
    await request(app).post("/meals").send({ mealName: "Wrap", price: 6 });
    const meal = await Meal.findOne();

    await request(app).post("/bag").set(bearer(token)).send({ mealId: meal._id.toString() });
    const res = await request(app).post("/bag").set(bearer(token)).send({ mealId: meal._id.toString() });

    expect(res.body[0].quantity).toBe(2);
  });

  test("returns 401 without auth", async () => {
    const res = await request(app).post("/bag").send({ mealId: "someid" });
    expect(res.status).toBe(401);
  });
});

describe("GET /bag", () => {
  test("returns the user's bag", async () => {
    const { token } = await createAndLoginUser();
    const res = await request(app).get("/bag").set(bearer(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("DELETE /bag/:id", () => {
  test("removes an item from the bag", async () => {
    const { token } = await createAndLoginUser();
    await request(app).post("/meals").send({ mealName: "Soup", price: 5 });
    const meal = await Meal.findOne();
    await request(app).post("/bag").set(bearer(token)).send({ mealId: meal._id.toString() });

    const bagRes = await request(app).get("/bag").set(bearer(token));
    const bagItemId = bagRes.body[0]._id;

    const deleteRes = await request(app)
      .delete(`/bag/${bagItemId}`)
      .set(bearer(token));

    expect(deleteRes.status).toBe(200);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// NOTES TESTS
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /notes", () => {
  test("creates a note for authenticated user", async () => {
    const { token } = await createAndLoginUser();
    const res = await request(app)
      .post("/notes")
      .set(bearer(token))
      .send({ text: "Remember to deliver by 5pm" });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Remember to deliver by 5pm");
  });

  test("returns 401 without auth", async () => {
    const res = await request(app).post("/notes").send({ text: "hello" });
    expect(res.status).toBe(401);
  });
});

describe("GET /notes", () => {
  test("returns only notes belonging to the current user", async () => {
    const { token: tokenA } = await createAndLoginUser("a@test.com", "pass");
    const { token: tokenB } = await createAndLoginUser("b@test.com", "pass");

    await request(app).post("/notes").set(bearer(tokenA)).send({ text: "Note A" });
    await request(app).post("/notes").set(bearer(tokenB)).send({ text: "Note B" });

    const res = await request(app).get("/notes").set(bearer(tokenA));
    expect(res.body.length).toBe(1);
    expect(res.body[0].text).toBe("Note A");
  });
});

describe("PUT /notes/:id", () => {
  test("updates a note's text", async () => {
    const { token } = await createAndLoginUser();
    const createRes = await request(app)
      .post("/notes")
      .set(bearer(token))
      .send({ text: "Original text" });

    const noteId = createRes.body._id;
    const updateRes = await request(app)
      .put(`/notes/${noteId}`)
      .set(bearer(token))
      .send({ text: "Updated text" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.text).toBe("Updated text");
  });
});

describe("DELETE /notes/:id", () => {
  test("deletes a note by id", async () => {
    const { token } = await createAndLoginUser();
    const createRes = await request(app)
      .post("/notes")
      .set(bearer(token))
      .send({ text: "To delete" });

    const noteId = createRes.body._id;
    const deleteRes = await request(app)
      .delete(`/notes/${noteId}`)
      .set(bearer(token));

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe("Deleted");

    const note = await Note.findById(noteId);
    expect(note).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ORDERS TESTS
// ═════════════════════════════════════════════════════════════════════════════
describe("GET /orders", () => {
  test("returns all orders (public endpoint)", async () => {
    const res = await request(app).get("/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
