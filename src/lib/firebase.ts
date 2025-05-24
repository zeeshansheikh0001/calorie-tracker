
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// IMPORTANT: Log the projectId to help debug configuration issues.
// This log will only appear in the browser's developer console.
if (typeof window !== 'undefined') { 
    console.log("Firebase Initializing with Project ID:", firebaseConfig.projectId);
    if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_FIREBASE_PROJECT_ID" || firebaseConfig.projectId.includes("YOUR_") ) {
        console.error("🛑 CRITICAL ERROR: Firebase projectId is not configured correctly or is using placeholder values! Please update your .env file with your actual Firebase project credentials. This is likely the cause of the 400 Bad Request error from Firestore.");
        alert("Firebase Project ID is not configured correctly. Please check your .env file and the browser console for details. Firestore functionality will likely fail.");
    }
}


// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);

export { app, db };
