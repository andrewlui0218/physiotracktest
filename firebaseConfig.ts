import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: REPLACE THESE VALUES WITH YOUR OWN FROM FIREBASE CONSOLE
// Go to Project Settings -> General -> Your Apps -> Web SDK configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPLzLLYp1nU_lY1v-tpTaYl3Tijdp6bj8",
  authDomain: "physiotracktest.firebaseapp.com",
  projectId: "physiotracktest",
  storageBucket: "physiotracktest.firebasestorage.app",
  messagingSenderId: "145457313602",
  appId: "1:145457313602:web:ea40f44454f9f453cdfadb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it
export const db = getFirestore(app);
