// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Ensure you have these in your .env file
const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          // Replace escaped newlines
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error: any) {
      console.error('Firebase admin initialization error:', error.stack);
    }
  } else {
    console.warn('Firebase Admin credentials not set. Push notifications from server will fail.');
  }
}

export default admin;
