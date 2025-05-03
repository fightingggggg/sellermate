import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxZ0lTXab1JALiNnHKAx2_N7hlr84YSN0",
  authDomain: "smartstoreseo.firebaseapp.com",
  projectId: "smartstoreseo",
  storageBucket:  "smartstoreseo.firebasestorage.app",
  appId:"1:1034657335294:web:c3d36cc05995a9f078e2af",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
