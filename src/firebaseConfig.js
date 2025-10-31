import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
   apiKey: "AIzaSyBg8l8Gm-_eAdbtMvLI8N8ANoTh3P37rl8",
  authDomain: "mechanicaccuratebox.firebaseapp.com",
  projectId: "mechanicaccuratebox",
  storageBucket: "mechanicaccuratebox.firebasestorage.app",
  messagingSenderId: "65586264307",
  appId: "1:65586264307:web:ed4faba8bb4bce28021f86"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage(firebaseApp);

export { auth, db, storage };
