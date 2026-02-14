
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAZTM_KPLD4QQu51ptdpyIzftZvMU7bDSE",
  authDomain: "nod-mcu-72dcf.firebaseapp.com",
  databaseURL: "https://nod-mcu-72dcf-default-rtdb.firebaseio.com",
  projectId: "nod-mcu-72dcf",
  storageBucket: "nod-mcu-72dcf.firebasestorage.app",
  messagingSenderId: "336415679934",
  appId: "1:336415679934:web:e35e6d49d7dd2e609785ef",
  measurementId: "G-2QEJ0T556C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, off };
