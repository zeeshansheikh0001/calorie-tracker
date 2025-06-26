
import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

// This endpoint is called by a cron job to send reminders to all users.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (admin.apps.length === 0) {
        return NextResponse.json(
          { error: 'Firebase Admin not initialized. Cannot send notifications.' },
          { status: 500 }
        );
      }
    
    const db = admin.firestore();
    const tokensSnapshot = await db.collection('fcmTokens').get();

    if (tokensSnapshot.empty) {
        return NextResponse.json({
            success: true,
            message: 'Cron job ran, but no user tokens found in the database.',
        });
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.id);

    const now = new Date();
    const currentHour = now.getHours();
    
    let notificationPayload;
    
    // Determine notification type based on time
    if (currentHour === 8) { // Morning hydration reminder (8 AM)
      notificationPayload = { title: 'Good Morning! ☀️', body: 'Start your day with a glass of water to stay hydrated.' };
    } else if (currentHour === 13) { // Lunch time reminder (1 PM)
      notificationPayload = { title: 'Lunch Time! 🥗', body: 'Don\'t forget to log your midday meal to stay on track.' };
    } else if (currentHour === 19) { // Evening meal reminder (7 PM)
      notificationPayload = { title: 'Dinner Time! 🍽️', body: 'Time to log your evening meal. How was your day?' };
    } else {
        return NextResponse.json({ success: true, message: `Cron job ran at hour ${currentHour}, no reminder scheduled.` });
    }
    
    const message = {
        notification: notificationPayload,
        tokens: tokens,
        webpush: {
            notification: {
              tag: `daily-reminder-${currentHour}`
            },
            fcmOptions: {
                link: '/'
            }
        }
    };
    
    const batchResponse = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`${batchResponse.successCount} messages were sent successfully`);

    // Clean up invalid tokens
    if (batchResponse.failureCount > 0) {
      const failedTokens: string[] = [];
      batchResponse.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // Check for errors indicating an invalid or unregistered token
          if (errorCode === 'messaging/registration-token-not-registered' ||
              errorCode === 'messaging/invalid-registration-token') {
            failedTokens.push(tokens[idx]);
          }
        }
      });
      
      if (failedTokens.length > 0) {
        console.log(`Cleaning up ${failedTokens.length} invalid tokens.`);
        const batch = db.batch();
        failedTokens.forEach(token => {
          const docRef = db.collection('fcmTokens').doc(token);
          batch.delete(docRef);
        });
        await batch.commit();
        console.log("Invalid tokens removed from Firestore.");
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Reminders processed for hour ${currentHour}. Sent: ${batchResponse.successCount}, Failed: ${batchResponse.failureCount}`,
    });
  } catch (error) {
    console.error('Error processing daily reminders:', error);
    return NextResponse.json(
      { error: 'Failed to process daily reminders' },
      { status: 500 }
    );
  }
}
