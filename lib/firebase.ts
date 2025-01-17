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
  initializeFirestore,
  runTransaction,
  serverTimestamp
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
const DELETED_BACKUP_COLLECTION = 'deletedBackup';

// Helper function to merge data intelligently
function mergeData(currentData: any, newData: any) {
  if (!currentData.tables || !newData.tables) {
    return newData;
  }

  const currentTables = new Map(
    currentData.tables.map((table: any) => [table.id, table])
  );
  const newTables = new Map(
    newData.tables.map((table: any) => [table.id, table])
  );

  // Merge strategy: Keep the new tables, as they are the latest
  return {
    ...newData,
    tables: Array.from(newTables.values())
  };
}

export async function saveToFirestore(data: any, collectionName: string, documentId: string) {
  try {
    const docRef = doc(db, collectionName, documentId);
    
    // Use transactions for all collections including shift tables
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);
      
      if (!docSnap.exists()) {
        // If document doesn't exist, create it
        transaction.set(docRef, {
          ...data,
          lastModified: serverTimestamp(),
          lastRead: serverTimestamp()
        });
      } else {
        const currentData = docSnap.data();
        
        // Special handling for shift tables
        if (collectionName === COLLECTION_NAME) {
          // Create maps of current and new tables using table IDs as keys
          const currentTables = new Map(
            (currentData.tables || []).map((table: any) => [table.id, table])
          );
          const newTables = new Map(
            (data.tables || []).map((table: any) => [table.id, table])
          );
          
          // Merge tables: For each table in the new data, update or add it
          newTables.forEach((table, id) => {
            currentTables.set(id, table);
          });
          
          // Convert back to array and update
          transaction.set(docRef, {
            tables: Array.from(currentTables.values()),
            lastModified: serverTimestamp(),
            lastRead: currentData.lastModified || serverTimestamp()
          });
        } else {
          // For other collections, use the existing merge strategy
          const mergedData = mergeData(currentData, data);
          transaction.set(docRef, {
            ...mergedData,
            lastModified: serverTimestamp(),
            lastRead: currentData.lastModified || serverTimestamp()
          });
        }
      }
    });

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
      const data = docSnap.data();
      // Remove internal fields before returning
      const { lastModified, lastRead, ...cleanData } = data;
      return cleanData;
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
    // Filter out deleted tables when loading, but keep them in Firebase
    return data?.tables.filter((table: ShiftTable) => !table.isDeleted) || [];
  } catch (error) {
    console.error('Error loading shift tables:', error);
    throw error;
  }
}

export async function saveDeletedTable(table: ShiftTable) {
  try {
    const docRef = doc(db, DELETED_BACKUP_COLLECTION, table.id);
    await setDoc(docRef, { 
      ...table, 
      deletedAt: new Date().toISOString() 
    });
    console.log('✅ Deleted table backed up successfully');
  } catch (error) {
    console.error('Error backing up deleted table:', error);
  }
}
