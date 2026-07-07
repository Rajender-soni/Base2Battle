import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBeT0KBc5ic9Al8_Z8N4zd93uAWg6S27Y4",
  authDomain: "devdualnew.firebaseapp.com",
  projectId: "devdualnew",
  storageBucket: "devdualnew.firebasestorage.app",
  messagingSenderId: "139332946551",
  appId: "1:139332946551:web:0d0467eb4ea09e2dc81472"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
