import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore
} from "firebase/firestore";
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

// Initialize Firestore with settings for better offline support
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.log('Persistence not supported by browser');
  }
});

const COLLECTION_NAME = 'shifts';
const DOCUMENT_ID = 'shiftTables';
const AGENTS_COLLECTION = 'agents';
const AGENTS_DOCUMENT = 'agentsList';

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
      console.log('No such document exists!');
      return null;
    }
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    throw error;
  }
}

export async function saveAgents(agents: Record<string, string[]>) {
  try {
    await saveToFirestore({ agents }, AGENTS_COLLECTION, AGENTS_DOCUMENT);
    console.log('✅ Agents saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving agents:', error);
    throw error;
  }
}

export async function loadAgents(): Promise<Record<string, string[]>> {
  try {
    const data = await loadFromFirestore(AGENTS_COLLECTION, AGENTS_DOCUMENT);
    return data?.agents || { Egypt: [], Morocco: [] };
  } catch (error) {
    console.error('Error loading agents:', error);
    return { Egypt: [], Morocco: [] };
  }
}

export async function saveShiftTables(tables: ShiftTable[]) {
  try {
    await saveToFirestore({ tables }, COLLECTION_NAME, DOCUMENT_ID);
    console.log('✅ Shift tables saved successfully to Firestore');
  } catch (error) {
    console.error('Error saving shift tables:', error);
    throw error;
  }
}

export async function loadShiftTables(): Promise<ShiftTable[]> {
  try {
    const data = await loadFromFirestore(COLLECTION_NAME, DOCUMENT_ID);
    return data?.tables || [];
  } catch (error) {
    console.error('Error loading shift tables:', error);
    return [];
  }
}
