// TODO: Uncomment when Supabase auth is fully implemented
/*
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push';

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SECRET_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const vapidPublicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'noreply@calorietracker.in'

webpush.setVapidDetails(
  `mailto:${vapidEmail}`,
  vapidPublicKey,
  vapidPrivateKey
)

async function sendReminders() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

  const { data: userReminders, error: remindersError } = await supabase
    .from('user_reminders')
    .select('*');

  if (remindersError) {
    console.error('Error fetching user reminders:', remindersError);
    return;
  }

  for (const reminder of userReminders) {
    const { user_id, log_meals, log_meals_time, drink_water, drink_water_frequency, weigh_in, weigh_in_day, weigh_in_time } = reminder;

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription_details')
      .eq('user_id', user_id);

    if (subsError) {
      console.error(`Error fetching subscriptions for user ${user_id}:`, subsError);
      continue;
    }

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${user_id}. Skipping reminders.`);
      continue;
    }

    let payload = null;

    // Log Meals Reminder
    if (log_meals && log_meals_time) {
      const [mealHour, mealMinute] = log_meals_time.split(':').map(Number);
      if (currentHour === mealHour && currentMinute === mealMinute) {
        payload = JSON.stringify({
          title: '🍽️ Time to log your meal!',
          body: 'Don\'t forget to log your meal for today to stay on track.',
          type: 'meal_reminder'
        });
      }
    }

    // Drink Water Reminder - Enhanced with better scheduling
    if (drink_water && drink_water_frequency) {
      const frequencyHours = parseInt(drink_water_frequency.replace('every_', '').replace('_hours', ''));
      
      // Only send during waking hours (7 AM to 10 PM)
      if (currentHour >= 7 && currentHour <= 22) {
        if (currentMinute === 0 && currentHour % frequencyHours === 0) {
          payload = JSON.stringify({
            title: '💧 Stay Hydrated!',
            body: 'Time to drink some water and keep your body refreshed.',
            type: 'water_reminder'
          });
        }
      }
    }

    // Weigh-In Reminder
    if (weigh_in && weigh_in_day && weigh_in_time) {
      const [weighInHour, weighInMinute] = weigh_in_time.split(':').map(Number);
      if (currentDay === weigh_in_day && currentHour === weighInHour && currentMinute === weighInMinute) {
        payload = JSON.stringify({
          title: '⚖️ Weekly Weigh-In Reminder!',
          body: 'Time to track your progress and see how far you\'ve come.',
          type: 'weigh_in_reminder'
        });
      }
    }

    if (payload) {
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(subscription.subscription_details, payload);
          console.log(`Notification sent to user ${user_id}`);
        } catch (err) {
          console.error(`Error sending notification to user ${user_id}:`, err);
        }
      }
    }
  }
}

// HTTP handler for the edge function
Deno.serve(async (req) => {
  try {
    await sendReminders();
    return new Response(
      JSON.stringify({ success: true, message: 'Reminders processed successfully' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-reminders function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
*/

// Temporary placeholder for development
// @ts-ignore - Deno types not available in this environment
Deno.serve(async (req: any) => {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'Supabase Edge Function is disabled - auth not fully implemented' 
    }),
    { 
      headers: { 'Content-Type': 'application/json' },
      status: 503 
    }
  );
});
