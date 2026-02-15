import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { PatientData } from '../types';

/**
 * Saves patient data to Cloud Firestore.
 */
export const savePatientData = async (data: PatientData): Promise<void> => {
  try {
    const patientRef = doc(db, "patients", data.id);
    
    await setDoc(patientRef, {
        ...data,
        lastUpdated: Date.now()
    });
    
    console.log(`[Firebase] Document written with ID: ${data.id}`);
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to save to cloud database. Check internet connection.");
  }
};

/**
 * Retrieves patient data from Cloud Firestore (Direct Fetch).
 */
export const getPatientData = async (id: string): Promise<PatientData | null> => {
  try {
    const docRef = doc(db, "patients", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as PatientData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw new Error("Failed to fetch data.");
  }
};

/**
 * Background Sync: Listens to the entire patients collection.
 * This downloads data in the background so it's ready instantly when scanned.
 * Returns an unsubscribe function.
 */
export const subscribeToAllPatients = (
    onUpdate: (data: Record<string, PatientData>) => void
) => {
    const colRef = collection(db, "patients");
    
    // onSnapshot is a real-time listener. 
    // It fires immediately with current data, and again whenever data changes.
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
        const cache: Record<string, PatientData> = {};
        snapshot.forEach((doc) => {
            cache[doc.id] = doc.data() as PatientData;
        });
        console.log(`[Background Sync] Synced ${snapshot.size} patient records to local memory.`);
        onUpdate(cache);
    }, (error) => {
        console.error("Background sync failed:", error);
    });

    return unsubscribe;
};