import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Enable Offline Persistence
// This allows the app to work offline and load data instantly from the device cache
// if it has been downloaded previously.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a a time.
      console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn("Firestore persistence not supported in this browser");
  }
});
