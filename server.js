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
  PUBLIC_KEY,
  PRIVATE_KEY
);

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
