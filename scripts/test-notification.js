// Run this script to test sending a notification manually

const webpush = require('web-push');
const fs = require('fs');
require('dotenv').config();

// Use environment variables for VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL || 'test@example.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys not found in environment variables!');
  console.error('Create .env.local file with NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
  process.exit(1);
}

// Set VAPID details
webpush.setVapidDetails(
  `mailto:${email}`,
  vapidPublicKey,
  vapidPrivateKey
);

// Read subscription from a file
// You'll need to export your subscription details from browser and save to subscription.json
try {
  if (!fs.existsSync('./subscription.json')) {
    console.error('subscription.json file not found!');
    console.error('Create a file named subscription.json with your subscription details.');
    console.error('You can export this from the browser after enabling notifications.');
    process.exit(1);
  }

  const subscriptionJSON = fs.readFileSync('./subscription.json');
  const subscription = JSON.parse(subscriptionJSON);

  // Send notification
  webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test notification from the command line!',
      type: 'test'
    })
  )
  .then(() => {
    console.log('Notification sent successfully!');
  })
  .catch(err => {
    console.error('Error sending notification:', err);
  });
} catch (error) {
  console.error('Error:', error);
} 