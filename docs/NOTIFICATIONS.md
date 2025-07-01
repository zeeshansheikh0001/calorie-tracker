# Notification System Setup

This document explains how to set up and use the notification system in the Calorie Tracker app.

## Overview

The app uses Web Push Notifications to send reminders to users. These notifications work even when the browser is closed.

The notification system has several components:
1. **Service Worker**: Handles background notifications
2. **Client-side code**: Subscribes users to notifications
3. **API Routes**: Sends notifications from the server
4. **Edge Functions**: Scheduled to send notifications at specific times

## Setup Instructions

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for sending web push notifications.

Run the following command to generate new VAPID keys:

```bash
node scripts/generate-vapid-keys.js
```

This will output public and private keys. Add them to your environment variables:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_EMAIL=your-email@example.com
```

### 2. Set Up the Service Worker

The service worker is already set up in `public/service-worker.js`. It handles incoming notifications and directs users to the appropriate page when they click on a notification.

### 3. Register Users for Notifications

Users need to grant permission for notifications. The app handles this process through:
- The `useNotificationService` hook in `src/lib/notification-service.ts`
- The permission request in the Reminders page

### 4. Testing Notifications

You can test notifications in several ways:

1. **Test Notification Button**: On the Reminders page, use the "Send Test Notification" button.

2. **Manual Test Script**: Once a user has subscribed, you can use their subscription details to test:
   ```bash
   node scripts/test-notification.js
   ```
   This requires a `subscription.json` file with the user's subscription details.

3. **API Testing**: You can call the notification API endpoint directly:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "body": "Test message", "type": "test"}'
   ```

## Notification Types

The system supports different notification types:
- `meal_reminder`: Reminds users to log their meals
- `water_reminder`: Reminds users to drink water
- `weigh_in_reminder`: Reminds users about weekly weigh-ins
- `reminder_confirmation`: Confirms when reminders are saved
- `test`: For testing purposes

## Scheduled Notifications

Notifications are sent based on the user's settings through:
1. The Edge Function at `supabase/functions/send-reminders/index.ts` which runs on a schedule
2. Immediate confirmation notifications when settings are saved

## Troubleshooting

1. **Notifications not appearing**:
   - Check if the browser permissions are granted
   - Verify the service worker is registered (check browser developer tools)
   - Confirm VAPID keys are correctly set

2. **Scheduled notifications not working**:
   - Ensure the Supabase Edge Function is deployed and scheduled correctly
   - Check the Supabase logs for any errors

3. **API errors**:
   - Confirm the subscription is valid and stored correctly
   - Verify VAPID keys are available to the API route 