import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJPGh9ll6OVx4t1klMC-hqNKAgYTOl3rY",
  authDomain: "muslim-neemah-wedding.firebaseapp.com",
  projectId: "muslim-neemah-wedding",
  storageBucket: "muslim-neemah-wedding.firebasestorage.app",
  messagingSenderId: "154732955385",
  appId: "1:154732955385:web:c7ed018c61ffd85a590428",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Lookup bridesmaid by phone number
export async function getBridesmaidByPhone(phone) {
  const normalized = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
  const docRef = doc(db, "bridesmaid", normalized);
  const docSnap = await getDoc(docRef);
  console.log("Looking up:", normalized);
  console.log("Exists:", docSnap.exists());
  console.log("Data:", docSnap.data());
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}