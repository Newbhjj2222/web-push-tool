const express = require("express");
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================
// DB SETUP
// ======================
const DB_FILE = path.join(__dirname, "db.json");

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ subscriptions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ======================
// VAPID KEYS
// ======================
const PUBLIC_KEY =
"BLyrdkOmlQ0yUOiLixg1Goq0nYwquDuldClt313RfYL9bBn6YSPzGrsLvATLruOP4MGG5GYSPWjO7Jx7dMYjBFE";

const PRIVATE_KEY =
"oM2faYkXPMbQMe-j1t50bAp4zbkb6F-XMwW4";

webpush.setVapidDetails(
  "mailto:admin@newtalentsg.co.rw",
  PUBLIC_KEY,
  PRIVATE_KEY
);

// ======================
// ROUTES
// ======================

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Subscribe
app.post("/subscribe", (req, res) => {
  const db = loadDB();

  const exists = db.subscriptions.find(
    (s) => s.endpoint === req.body.endpoint
  );

  if (!exists) {
    db.subscriptions.push(req.body);
    saveDB(db);
  }

  res.json({ message: "Subscribed successfully" });
});

// Send notification
app.post("/send", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" });
  }

  const db = loadDB();

  const payload = JSON.stringify({ title, body });

  let success = 0;
  let failed = 0;

  await Promise.all(
    db.subscriptions.map((sub) =>
      webpush
        .sendNotification(sub, payload)
        .then(() => success++)
        .catch(() => failed++)
    )
  );

  res.json({ success, failed });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
