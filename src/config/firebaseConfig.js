import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
  apiKey: "AIzaSyDvMradefJPEFTXzIcCdjZdMO6V88B3SwQ",
  authDomain: "taara-628e5.firebaseapp.com",
  projectId: "taara-628e5",
  storageBucket: "taara-628e5.firebasestorage.app",
  messagingSenderId: "802339182269",
  appId: "1:802339182269:web:abc123def456"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;