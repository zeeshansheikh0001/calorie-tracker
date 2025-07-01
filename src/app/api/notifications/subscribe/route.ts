import { createClient } from '@/utils/supabase/route-handler';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const subscription = await req.json();

    const { error } = await supabase.from('push_subscriptions').insert([
      { user_id: user.id, subscription_details: subscription },
    ]);

    if (error) {
      console.error('Error saving push subscription:', error);
      return new NextResponse(JSON.stringify({ error: 'Failed to save subscription' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(JSON.stringify({ message: 'Subscription saved' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error parsing request body:', error);
    return new NextResponse(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
