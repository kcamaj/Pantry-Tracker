import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "REVOKED",
    authDomain: "pantry-tracker-9f38b.firebaseapp.com",
    projectId: "pantry-tracker-9f38b",
    storageBucket: "pantry-tracker-9f38b.appspot.com",
    messagingSenderId: "326541775348",
    appId: "1:326541775348:web:c8d011a4a3c4ff430369a1",
    measurementId: "G-N3TSRJYG78"
  };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
