# Testing Time-Specific Reminders

This guide explains how to test reminders to ensure they trigger notifications at specific times.

## Prerequisites

Before testing, ensure you have:

1. Set up VAPID keys (see [NOTIFICATIONS.md](./NOTIFICATIONS.md))
2. Enabled notifications in your browser
3. Created reminder settings in the app
4. Node.js installed to run the test scripts

## Testing Methods

There are several ways to test reminders at specific times:

### Method 1: Using the Test Script (Recommended)

The easiest way to test time-specific notifications is to use the included test script that simulates specific times.

#### Option A: Using Environment Variables (Recommended)

1. Create a `.env.local` file in the project root:
   ```
   # Copy the template
   cp .env.local.template .env.local
   ```

2. Fill in the values in `.env.local` with your actual credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SECRET_KEY=your-secret-key-here
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
   VAPID_PRIVATE_KEY=your-vapid-private-key
   VAPID_EMAIL=your-email@example.com
   ```

3. Run the test script with a specific time:
   ```bash
   node scripts/test-time-specific-notification.js 19:30
   ```
   This will simulate notifications for 7:30 PM.

4. To test for a specific user, add the user ID:
   ```bash
   node scripts/test-time-specific-notification.js 19:30 3ba6e6be-6786-4a2f-b2cc-1e9062cb7ad1
   ```

#### Option B: Using Command Line Arguments

If you don't want to create a `.env.local` file, you can pass all parameters directly on the command line:

```bash
node scripts/test-time-specific-notification.js 19:30 3ba6e6be-6786-4a2f-b2cc-1e9062cb7ad1 https://your-project-id.supabase.co your-anon-key your-vapid-public-key your-vapid-private-key
```

The parameters must be in this exact order:
1. Time in HH:MM format
2. User ID (optional)
3. Supabase URL
4. Supabase Key (anon key or secret key)
5. VAPID Public Key
6. VAPID Private Key
7. VAPID Email (defaults to test@example.com if omitted)

### Method 2: Testing in the Application

1. Set a reminder time that is just 1-2 minutes in the future
2. Wait until that specific time
3. The notification should appear automatically

### Method 3: Testing the Supabase Edge Function Locally

To test the actual Edge Function that will run in production:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Serve the Edge Function locally:
   ```bash
   supabase functions serve send-reminders
   ```

3. Create a test file (`test-edge-function.js`) to invoke the function:
   ```javascript
   fetch('http://localhost:54321/functions/v1/send-reminders', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
     }
   })
   .then(response => response.json())
   .then(data => console.log(data))
   .catch(error => console.error('Error:', error));
   ```

4. Run the test:
   ```bash
   node test-edge-function.js
   ```

## Debugging Reminders

If notifications aren't appearing at the expected time:

1. **Check Browser Console**: Open DevTools and look for any errors

2. **Review Log Output**: The test script provides detailed logs about:
   - Which reminders were found
   - Whether the simulated time matched any reminder times
   - If notifications were sent successfully

3. **Verify Service Worker**: Make sure the service worker is registered:
   ```javascript
   navigator.serviceWorker.getRegistrations()
     .then(registrations => console.log(registrations));
   ```

4. **Test Subscription**: Verify your subscription is stored correctly in the database

## Common Issues

1. **Time Zone Differences**: The server might be in a different time zone than your local time. The Edge Function uses UTC time.

2. **Notification Permissions**: Browser permissions might have been denied or reset.

3. **Expired Subscriptions**: Push subscriptions can expire. Try re-subscribing to notifications.

4. **Service Worker Issues**: If the service worker isn't working, try unregistering and re-registering it:
   ```javascript
   navigator.serviceWorker.getRegistrations()
     .then(registrations => {
       for(let registration of registrations) {
         registration.unregister();
       }
     });
   ```

## Manual Testing with curl

You can also test the API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Reminder", "body": "This is a test reminder notification", "type": "meal_reminder"}'
```

Make sure you're authenticated when making this request. 