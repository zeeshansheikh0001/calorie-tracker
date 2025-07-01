import { createClient } from '@/utils/supabase/route-handler';
import { type NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID keys should be stored in environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

export async function POST(req: NextRequest) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return new NextResponse(JSON.stringify({ error: 'Server configuration error: VAPID keys not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get the request data (title, message, etc.)
    const { title, body, type } = await req.json();
    
    if (!title || !body) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Setup webpush with your VAPID keys
    webpush.setVapidDetails(
      'mailto:' + (process.env.VAPID_EMAIL || 'example@example.com'),
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get user's subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription_details')
      .eq('user_id', user.id);

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'No subscriptions found', success: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send notification to all of the user's registered devices
    const payload = JSON.stringify({
      title,
      body,
      type
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription_details, payload);
        return { success: true };
      } catch (err) {
        console.error('Error sending notification:', err);
        return { success: false, error: err };
      }
    });

    const results = await Promise.all(sendPromises);
    
    return new NextResponse(JSON.stringify({ 
      success: results.some(r => r.success),
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to send notification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 