import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDEJHpwLIFri_3vqOQyBA-C6WgbL7BjwNU",
  authDomain: "ecommerce-clone-dc.firebaseapp.com",
  projectId: "ecommerce-clone-dc",
  storageBucket: "ecommerce-clone-dc.appspot.com",
  messagingSenderId: "610887915093",
  appId: "1:610887915093:web:3afdc8ee4d66bb53f266dc"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };
