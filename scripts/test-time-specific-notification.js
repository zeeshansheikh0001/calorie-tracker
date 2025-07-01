// Script to test time-specific notifications by simulating a specific time
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check for environment variables first, then look for command line arguments
const getParam = (envVar, argIndex, argName) => {
  // Try to get from environment first
  if (process.env[envVar]) {
    return process.env[envVar];
  }
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.length > argIndex && !args[argIndex].includes(':')) {
    return args[argIndex];
  }
  
  // Return null if not found
  console.error(`Missing ${argName}. Provide in environment or as argument.`);
  return null;
};

// Get parameters - environment variables or command line arguments
// Format: node test-time-specific-notification.js HH:MM [userId] [supabaseUrl] [supabaseKey] [vapidPublicKey] [vapidPrivateKey]
const supabaseUrl = getParam('NEXT_PUBLIC_SUPABASE_URL', 2, 'Supabase URL');
const supabaseKey = getParam('SUPABASE_SECRET_KEY', 3, 'Supabase key') || 
                   getParam('NEXT_PUBLIC_SUPABASE_ANON_KEY', 3, 'Supabase key');
const vapidPublicKey = getParam('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 4, 'VAPID public key');
const vapidPrivateKey = getParam('VAPID_PRIVATE_KEY', 5, 'VAPID private key');
const email = getParam('VAPID_EMAIL', 6, 'Email') || 'test@example.com';

// Display usage if missing required parameters
if (!supabaseUrl || !supabaseKey || !vapidPublicKey || !vapidPrivateKey) {
  console.log('\nUsage:');
  console.log('node test-time-specific-notification.js HH:MM [userId] [supabaseUrl] [supabaseKey] [vapidPublicKey] [vapidPrivateKey]');
  console.log('\nExample:');
  console.log('node test-time-specific-notification.js 08:30 3ba6e6be-6786-4a2f-b2cc-1e9062cb7ad1 https://xyz.supabase.co eyJhbGciOiJI... eyJhbGciOiJI... hkU3ViYWN...');
  console.log('\nOr create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...');
  console.log('SUPABASE_SECRET_KEY=eyJhbG...');
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLK0...');
  console.log('VAPID_PRIVATE_KEY=oPn5...');
  console.log('VAPID_EMAIL=your-email@example.com');
  process.exit(1);
}

// Set up VAPID details
webpush.setVapidDetails(
  `mailto:${email}`,
  vapidPublicKey,
  vapidPrivateKey
);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(`Connected to Supabase at ${supabaseUrl}`);

// Function to simulate the send-reminders functionality
async function simulateTimeSpecificNotification() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Allow user to specify time to simulate or use current time
  let simulatedTime;
  let userId;
  
  if (args.length > 0) {
    // First arg is the time in format "HH:MM"
    const timeArg = args[0];
    if (/^\d{1,2}:\d{2}$/.test(timeArg)) {
      const [hours, minutes] = timeArg.split(':').map(Number);
      simulatedTime = new Date();
      simulatedTime.setHours(hours, minutes, 0, 0);
    } else {
      console.error('Invalid time format. Use HH:MM (e.g., 19:30)');
      process.exit(1);
    }

    // Second arg is the optional user ID
    if (args.length > 1 && args[1].includes('-')) {
      userId = args[1];
    }
  } else {
    simulatedTime = new Date();
  }

  console.log(`Simulating notifications for time: ${simulatedTime.toLocaleTimeString()}`);
  if (userId) {
    console.log(`Filtering for user ID: ${userId}`);
  }

  // Extract hour, minute and day of week
  const currentHour = simulatedTime.getHours();
  const currentMinute = simulatedTime.getMinutes();
  const currentDay = simulatedTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  console.log(`Time details: ${currentHour}:${currentMinute} on ${currentDay}`);

  // Query user reminders, optionally filtering by user ID
  let query = supabase.from('user_reminders').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data: userReminders, error: remindersError } = await query;

  if (remindersError) {
    console.error('Error fetching user reminders:', remindersError);
    return;
  }

  if (!userReminders || userReminders.length === 0) {
    console.log('No user reminders found.');
    return;
  }

  console.log(`Found ${userReminders.length} user reminder settings.`);

  // Process each user's reminders
  for (const reminder of userReminders) {
    const { 
      user_id, 
      log_meals, 
      log_meals_time, 
      drink_water, 
      drink_water_frequency, 
      weigh_in, 
      weigh_in_day, 
      weigh_in_time 
    } = reminder;

    console.log(`\nChecking reminders for user ${user_id}:`);
    console.log(JSON.stringify(reminder, null, 2));

    // Get user's subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription_details')
      .eq('user_id', user_id);

    if (subsError) {
      console.error(`Error fetching subscriptions for user ${user_id}:`, subsError);
      continue;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${user_id}.`);
      continue;
    }

    console.log(`Found ${subscriptions.length} subscriptions for user ${user_id}.`);
    
    let notificationSent = false;
    let payload = null;
    let notificationType = '';

    // Check for meal reminder
    if (log_meals && log_meals_time) {
      const [mealHour, mealMinute] = log_meals_time.split(':').map(Number);
      console.log(`Meal reminder set for ${mealHour}:${mealMinute}`);
      
      if (currentHour === mealHour && currentMinute === mealMinute) {
        console.log('✅ Meal reminder time matches current time!');
        payload = JSON.stringify({
          title: 'Time to log your meal!',
          body: 'Don\'t forget to log your meal for today.',
          type: 'meal_reminder'
        });
        notificationType = 'meal_reminder';
      }
    }

    // Check for water reminder
    if (drink_water && drink_water_frequency && !payload) {
      const frequencyHours = parseInt(drink_water_frequency.replace('every_', '').replace('_hours', ''));
      console.log(`Water reminder set for every ${frequencyHours} hours`);
      
      // Simplified check - in real implementation you'd need more logic
      if (currentMinute === 0 && currentHour % frequencyHours === 0) {
        console.log('✅ Water reminder time matches current time!');
        payload = JSON.stringify({
          title: 'Stay Hydrated!',
          body: 'Time to drink some water.',
          type: 'water_reminder'
        });
        notificationType = 'water_reminder';
      }
    }

    // Check for weigh-in reminder
    if (weigh_in && weigh_in_day && weigh_in_time && !payload) {
      const [weighInHour, weighInMinute] = weigh_in_time.split(':').map(Number);
      console.log(`Weigh-in reminder set for ${weigh_in_day} at ${weighInHour}:${weighInMinute}`);
      
      if (currentDay === weigh_in_day && currentHour === weighInHour && currentMinute === weighInMinute) {
        console.log('✅ Weigh-in reminder time matches current time!');
        payload = JSON.stringify({
          title: 'Weekly Weigh-In Reminder!',
          body: 'Time to track your progress.',
          type: 'weigh_in_reminder'
        });
        notificationType = 'weigh_in_reminder';
      }
    }

    // Send notification if any condition matched
    if (payload) {
      console.log(`Sending ${notificationType} notification to user ${user_id}...`);
      
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(subscription.subscription_details, payload);
          console.log('✅ Notification sent successfully!');
          notificationSent = true;
        } catch (err) {
          console.error('❌ Error sending notification:', err);
        }
      }
    } else {
      console.log('No matching reminder time for current time.');
    }

    if (!notificationSent) {
      console.log('No notifications were sent for this user.');
    }
  }
}

// Run the simulation
simulateTimeSpecificNotification()
  .then(() => console.log('Simulation complete'))
  .catch(err => console.error('Error during simulation:', err)); 