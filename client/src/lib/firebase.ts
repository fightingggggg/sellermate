import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: "smartstoreseo.firebaseapp.com",
  projectId: "smartstoreseo",
  storageBucket:  "smartstoreseo.firebasestorage.app",
  appId: process.env.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
