import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBk3jVmeG97VsrfwJBGkr6ad22ao-GpDX8",
  authDomain: "amaznclone-v1.firebaseapp.com",
  projectId: "amaznclone-v1",
  storageBucket: "amaznclone-v1.appspot.com",
  messagingSenderId: "271279434053",
  appId: "1:271279434053:web:da06abdd2b4c11403e362c",
  measurementId: "G-41JSRQJFDW",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };





// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDEJHpwLIFri_3vqOQyBA-C6WgbL7BjwNU",
//   authDomain: "ecommerce-clone-dc.firebaseapp.com",
//   projectId: "ecommerce-clone-dc",
//   storageBucket: "ecommerce-clone-dc.firebasestorage.app",
//   messagingSenderId: "610887915093",
//   appId: "1:610887915093:web:3afdc8ee4d66bb53f266dc"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);