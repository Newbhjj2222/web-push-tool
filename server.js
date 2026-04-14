<<<<<<< HEAD
const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// VAPID keys
const PUBLIC_KEY = "BHJI8eiwtKURDvHYBUqXSyi-uaZfrY5VNGFN7Gt9rVPudUiufN7_xJoOTEfUkTAHkGmgniaUv31r6th2imHbqB0";
const PRIVATE_KEY = "6G2CkQaZotKyNyow5JqSCmJPliXUNKOpbyubZnxb0TM";

webpush.setVapidDetails(
  'mailto:admin@newtalentsg.co.rw',
=======
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

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// ======================
// DATABASE FILE
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
// VAPID KEYS (YOUR ONES)
// ======================
const PUBLIC_KEY =
"BLyrdkOmlQ0yUOiLixg1Goq0nYwquDuldClt313RfYL9bBn6YSPzGrsLvATLruOP4MGG5GYSPWjO7Jx7dMYjBFE";

const PRIVATE_KEY =
"oM2faYkXPMbQMe-j1t50bAp4zbkb6F-XMwW4";

webpush.setVapidDetails(
  "mailto:admin@example.com",
>>>>>>> caa5013 (Update project files)
  PUBLIC_KEY,
  PRIVATE_KEY
);

<<<<<<< HEAD
// Temporary storage (use DB in real life… yes, I said it)
let subscriptions = [];

// 🏠 Home route (fix ya "Cannot GET /")
app.get('/', (req, res) => {
  res.send("Web Push API yawe irakora neza 🚀");
});

// 📥 Subscribe endpoint
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // prevent duplicates (basic)
  const exists = subscriptions.find(sub => 
    sub.endpoint === subscription.endpoint
  );

  if (!exists) {
    subscriptions.push(subscription);
    console.log("New subscriber added");
  }

  res.status(201).json({ message: "Subscribed successfully" });
});

// 📤 Send notification
app.post('/send', async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" });
  }

  const payload = JSON.stringify({ title, body });

  let success = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload)
        .then(() => success++)
        .catch(err => {
          failed++;
          console.log("Error:", err.statusCode);
        })
    )
  );

  res.json({
    message: "Notifications processed",
    success,
    failed
  });
});

// 🚀 Start server
const PORT = 3000;
=======
// ======================
// HOME ROUTE (fix Cannot GET /)
// ======================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// SUBSCRIBE API
// ======================
app.post("/subscribe", (req, res) => {
  try {
    const db = loadDB();

    const exists = db.subscriptions.find(
      (s) => s.endpoint === req.body.endpoint
    );

    if (!exists) {
      db.subscriptions.push(req.body);
      saveDB(db);
    }

    res.json({ message: "Subscribed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Subscription failed" });
  }
});

// ======================
// SEND NOTIFICATIONS API
// ======================
app.post("/send", async (req, res) => {
  try {
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
          .catch((err) => {
            failed++;
            console.log("Push error:", err.statusCode);
          })
      )
    );

    res.json({ success, failed });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Send failed" });
  }
});

// ======================
// START SERVER
// ======================
const PORT = 3000;

>>>>>>> caa5013 (Update project files)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
