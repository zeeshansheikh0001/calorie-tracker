
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth, type Auth } from 'firebase/auth'; // For when auth is implemented

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
// let auth: Auth; // For when auth is implemented

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
// auth = getAuth(app); // For when auth is implemented

export { db /*, auth */ };

// IMPORTANT: Add Firestore Security Rules to your Firebase project:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Allow read/write access only for authenticated users to their own data
//     match /users/{userId}/{document=**} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//     // For the "defaultUser" placeholder during development, allow if no auth.
//     // REMOVE THIS RULE or restrict it heavily before production if using defaultUser.
//     match /users/defaultUser/{document=**} {
//        allow read, write: if request.auth == null; // Or more specific rules
//     }
//   }
// }
//
// You'll need to replace "YOUR_FIREBASE_..." values in your .env file
// with your actual Firebase project configuration.
