import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
const firebaseConfig = {
  apiKey: "AIzaSyBEXDxY2IuAH8ljuLFYUu4hucf2GtPmrEc",
  authDomain: "instaclone-bd9cd.firebaseapp.com",
  projectId: "instaclone-bd9cd",
  storageBucket: "instaclone-bd9cd.appspot.com",
  messagingSenderId: "408279385565",
  appId: "1:408279385565:web:e19d1a155a7167fd462234"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();

export { app, db, storage };