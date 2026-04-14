const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PUBLIC_KEY = "BHJI8eiwtKURDvHYBUqXSyi-uaZfrY5VNGFN7Gt9rVPudUiufN7_xJoOTEfUkTAHkGmgniaUv31r6th2imHbqB0";
const PRIVATE_KEY = "6G2CkQaZotKyNyow5JqSCmJPliXUNKOpbyubZnxb0TM";

webpush.setVapidDetails(
  'mailto:you@example.com',
  PUBLIC_KEY,
  PRIVATE_KEY
);

// kubika subscriptions (temporary)
let subscriptions = [];

// subscribe endpoint
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// send notification
app.post('/send', async (req, res) => {
  const { title, body } = req.body;
  
  const payload = JSON.stringify({ title, body });
  
  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, payload)
      .catch(err => console.log(err));
  });
  
  res.send("Notifications sent");
});

app.listen(3000, () => console.log("Server running on port 3000"));
