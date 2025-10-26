import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDEJHpwLIFri_3vqOQyBA-C6WgbL7BjwNU",
  authDomain: "ecommerce-clone-dc.firebaseapp.com",
  projectId: "ecommerce-clone-dc",
  storageBucket: "ecommerce-clone-dc.firebasestorage.app",
  messagingSenderId: "610887915093",
  appId: "1:610887915093:web:3afdc8ee4d66bb53f266dc"
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