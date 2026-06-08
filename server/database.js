const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, writeBatch } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDe-hF_71N2OD4bs37y_kDPU-v6lZVzdOg",
    authDomain: "academic-manager-f2bcf.firebaseapp.com",
    projectId: "academic-manager-f2bcf",
    storageBucket: "academic-manager-f2bcf.firebasestorage.app",
    messagingSenderId: "1091242289947",
    appId: "1:1091242289947:web:5d8b4bb5938a12b7a7c1be",
    measurementId: "G-FCDYLDMFV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase Firestore initialized successfully.");

module.exports = { db, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy, updateDoc, writeBatch };
