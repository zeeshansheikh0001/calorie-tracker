import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, title, message } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }
    
    if (admin.apps.length === 0) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized. Check server logs.' },
        { status: 500 }
      );
    }

    const payload = {
      notification: {
        title: title || 'Calorie Tracker',
        body: message || 'Time to check in!',
        icon: '/favicon/android-chrome-192x192.png',
      },
    };

    const response = await admin.messaging().send({
      token: token,
      ...payload,
      webpush: {
        notification: {
          tag: 'calorie-tracker-reminder'
        },
        fcmOptions: {
            link: '/'
        }
      }
    });

    console.log('Successfully sent message:', response);
    return NextResponse.json({ success: true, response });

  } catch (error) {
    console.error('Error sending FCM message:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}