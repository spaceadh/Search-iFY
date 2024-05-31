import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDJpHvEXNYKtMRxn5BPhlmlfjWKw-AhlgM",
  authDomain: "realtimechat-ish.firebaseapp.com",
  databaseURL: "https://realtimechat-ish-default-rtdb.firebaseio.com",
  projectId: "realtimechat-ish",
  storageBucket: "realtimechat-ish.appspot.com",
  messagingSenderId: "253636765697",
  appId: "1:253636765697:web:ae102f889fc2d61def7800",
  measurementId: "G-G2HJ8DC3BF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, app,storage };  // Export the 'app' object for reference if needed