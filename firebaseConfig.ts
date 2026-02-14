import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: REPLACE THESE VALUES WITH YOUR OWN FROM FIREBASE CONSOLE
// Go to Project Settings -> General -> Your Apps -> Web SDK configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOC-YOUR-API-KEY-HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);