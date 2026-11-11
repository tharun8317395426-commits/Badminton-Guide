const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const PORT = process.env.PORT || 3000;
// 127.0.0.1 instead of "localhost": newer Node versions resolve "localhost" to IPv6 (::1),
// which MongoDB often doesn't listen on, causing connection errors.
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = "26csel01";
const PUBLIC_DIR = path.join(__dirname, "public");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => res.redirect("/login.html"));

// ---------- MongoDB (keeps retrying, never crashes the server) ----------
let db = null;

async function connectDB() {
  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");
  } catch (err) {
    db = null;
    console.error("MongoDB is not running / not reachable. Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// ---------- helpers ----------
function alertAndGo(res, message, url) {
  res.send(
    "<script>alert(" + JSON.stringify(message) + "); window.location.href=" +
    JSON.stringify(url) + ";</script>"
  );
}

// ---------- routes ----------
app.post("/register", async (req, res) => {
  const first_name = (req.body.first_name || "").trim();
  const last_name = (req.body.last_name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!first_name || !last_name || !email || !password) {
    return alertAndGo(res, "All fields are required", "/register.html");
  }
  if (password.length < 3 || password.length > 12) {
    return alertAndGo(res, "Password must be 3-12 characters long", "/register.html");
  }
  if (!db) {
    return alertAndGo(res, "Database is not running. Please start MongoDB and try again.", "/register.html");
  }

  try {
    const users = db.collection("users");
    if (await users.findOne({ email })) {
      return alertAndGo(res, "This email is already registered. Please log in.", "/login.html");
    }
    await users.insertOne({ first_name, last_name, email, password, createdAt: new Date() });
    res.redirect("/login.html");
  } catch (err) {
    console.error(err);
    alertAndGo(res, "Error saving user. Please try again.", "/register.html");
  }
});

app.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!db) {
    return alertAndGo(res, "Database is not running. Please start MongoDB and try again.", "/login.html");
  }

  try {
    const user = await db.collection("users").findOne({ email, password });
    if (!user) {
      return alertAndGo(res, "Invalid email or password", "/login.html");
    }

    // The inner pages (common.js) check localStorage key "badmintonUser", so set it here.
    const saved = JSON.stringify({
      name: user.first_name + " " + user.last_name,
      email: user.email
    }).replace(/</g, "\\u003c");
    res.send(
      "<script>localStorage.setItem('badmintonUser', JSON.stringify(" + saved + ")); " +
      "window.location.href='/dashboard.html';</script>"
    );
  } catch (err) {
    console.error(err);
    alertAndGo(res, "Login error. Please try again.", "/login.html");
  }
});

app.listen(PORT, () => {
  console.log("Serving files from:", PUBLIC_DIR);
  console.log("Server running on http://localhost:" + PORT);
});
