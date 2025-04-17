// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCq5L4xYNbEyDYhRJKj0OXkqxTuXXSHIIE",
    authDomain: "roundrobin-clean.firebaseapp.com",
    projectId: "roundrobin-clean",
    storageBucket: "roundrobin-clean.firebasestorage.app",
    messagingSenderId: "337655181484",
    appId: "1:337655181484:web:19796032c98b3df2c3af09"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
