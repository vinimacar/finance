import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Substitua com suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBbOQADmegS8loycHnJiqx-zDQfL8Mq2c0",
  authDomain: "majestic-lodge-468812-i8.firebaseapp.com",
  projectId: "majestic-lodge-468812-i8",
  storageBucket: "majestic-lodge-468812-i8.firebasestorage.app",
  messagingSenderId: "557312876581",
  appId: "1:557312876581:web:1d5ef254daa9be8d2d5fcc",
  measurementId: "G-GN7SNBFLDF"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
