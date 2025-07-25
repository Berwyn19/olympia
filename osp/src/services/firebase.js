// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa6FSNhhnZVUIZxsIWY12jvn31aoO29yU",
  authDomain: "ospfisika.firebaseapp.com",
  projectId: "ospfisika",
  storageBucket: "ospfisika.firebasestorage.app",
  messagingSenderId: "537039428526",
  appId: "1:537039428526:web:8115a2f1d7c680332c863f",
  measurementId: "G-9ST1YQVK81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { auth, db, storage }