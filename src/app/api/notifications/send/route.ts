// import { NextRequest, NextResponse } from 'next/server';
// import admin from '@/lib/firebase-admin';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { token, title, message } = body;

//     if (!token) {
//       return NextResponse.json(
//         { error: 'FCM token is required' },
//         { status: 400 }
//       );
//     }

//     if (admin.apps.length === 0) {
//       return NextResponse.json(
//         { error: 'Firebase Admin not initialized. Check server logs.' },
//         { status: 500 }
//       );
//     }

//     // Build the FCM message payload only once
//     const fcmMessage = {
//       token: token,
//       webpush: {
//         notification: {
//           icon: '/favicon/android-chrome-192x192.png',
//           tag: 'calorie-tracker-reminder'
//         },
//         fcmOptions: {
//           link: '/'
//         }
//       },
//       notification: {
//         title: title || 'Calorie Tracker',
//         body: message || 'Time to check in!'
//       }
//     };

//     console.log('Sending FCM message with payload:', JSON.stringify(fcmMessage, null, 2));
//     try {
//       const response = await admin.messaging().send(fcmMessage);
//       console.log('Successfully sent message:', response);
//       return NextResponse.json({ success: true, response });
//     } catch (error) {
//       console.error('Error sending FCM message:', error);
//       return NextResponse.json(
//         { error: 'Failed to send notification', details: error },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error('Error in notification API:', error);
//     return NextResponse.json(
//       { error: 'Failed to process notification request', details: error },
//       { status: 500 }
//     );
//   }
// }
