import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import type { ShiftTable } from "@/types/types";

const firebaseConfig = {
  apiKey: "AIzaSyCkZ4bkcG0_3zc2H5WYelYyMgBWxcwVM74",
  authDomain: "shiftsmaker.firebaseapp.com",
  projectId: "shiftsmaker",
  storageBucket: "shiftsmaker.firebasestorage.app",
  messagingSenderId: "53828147940",
  appId: "1:53828147940:web:5e15d67b613567b1dfaaf1",
  measurementId: "G-QF8D8ZX77M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION_NAME = 'shifts';
const DOCUMENT_ID = 'shiftTables';

export async function saveToFirestore(data: any, collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
    console.log('✅ Data saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

export async function loadFromFirestore(collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document exists!");
      return null;
    }
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    throw error;
  }
}

export async function saveShiftTables(tables: ShiftTable[]) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    await setDoc(docRef, { tables });
    console.log('✅ Data saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

export async function loadShiftTables(): Promise<ShiftTable[]> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.tables || [];
    } else {
      console.log("No shift tables found, returning empty array");
      return [];
    }
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    throw error;
  }
}
