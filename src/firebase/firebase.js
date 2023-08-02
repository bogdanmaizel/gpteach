import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: "AIzaSyDKNzhJTypT1_sSo9VVtejj9CsZ3Y5ujOE",
	authDomain: "edugpt-project.firebaseapp.com",
	projectId: "edugpt-project",
	storageBucket: "edugpt-project.appspot.com",
	messagingSenderId: "631547781434",
	appId: "1:631547781434:web:b84dc41646652926cc7003"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
