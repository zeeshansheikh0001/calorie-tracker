
// import { NextRequest, NextResponse } from 'next/server';
// import admin from '@/lib/firebase-admin';

// // This endpoint now saves the token to Firestore
// export async function POST(request: NextRequest) {
//   try {
//     const { token } = await request.json();

//     if (!token) {
//         return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
//     }
    
//     if (admin.apps.length === 0) {
//       return NextResponse.json(
//         { error: 'Firebase Admin not initialized. Check server logs.' },
//         { status: 500 }
//       );
//     }
    
//     const db = admin.firestore();
//     // Use the token as the document ID to prevent duplicates
//     await db.collection('fcmTokens').doc(token).set({
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//     });
    
//     console.log('Saved FCM token to Firestore:', token);
    
//     return NextResponse.json({ 
//       success: true, 
//       message: 'Subscription token saved successfully' 
//     });
//   } catch (error) {
//     console.error('Error saving subscription token:', error);
//     return NextResponse.json(
//       { error: 'Failed to save subscription token' },
//       { status: 500 }
//     );
//   }
// }

// // This endpoint now removes the token from Firestore
// export async function DELETE(request: NextRequest) {
//     try {
//       const { token } = await request.json();
      
//       if (!token) {
//         return NextResponse.json(
//           { error: 'FCM token is required' },
//           { status: 400 }
//         );
//       }
      
//       if (admin.apps.length === 0) {
//         return NextResponse.json(
//           { error: 'Firebase Admin not initialized. Check server logs.' },
//           { status: 500 }
//         );
//       }
      
//       const db = admin.firestore();
//       // Delete the document with the given token as its ID
//       await db.collection('fcmTokens').doc(token).delete();

//       console.log('Removed FCM token from Firestore:', token);

//       return NextResponse.json({ 
//         success: true, 
//         message: 'Subscription removed successfully' 
//       });
//     } catch (error) {
//       console.error('Error removing subscription:', error);
//       return NextResponse.json(
//         { error: 'Failed to remove subscription' },
//         { status: 500 }
//       );
//     }
// }
