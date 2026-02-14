import { PatientData } from '../types';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Saves patient data to Firebase Cloud Firestore.
 * This overwrites the existing document for the specific Patient ID.
 */
export const savePatientData = async (data: PatientData): Promise<void> => {
  try {
    // We use the Patient ID (e.g., PHYA123...) as the document ID
    // Collection name is 'patients'
    const patientRef = doc(db, "patients", data.id);
    
    // Add the current timestamp
    const dataToSave = {
        ...data,
        lastUpdated: Date.now()
    };

    await setDoc(patientRef, dataToSave);
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert("Failed to save data. Check internet connection.");
    throw error;
  }
};

/**
 * Retrieves patient data from Firebase Cloud Firestore.
 */
export const getPatientData = async (id: string): Promise<PatientData | null> => {
  try {
    const patientRef = doc(db, "patients", id);
    const docSnap = await getDoc(patientRef);

    if (docSnap.exists()) {
      return docSnap.data() as PatientData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching from Firebase:", error);
    alert("Failed to retrieve data. Check internet connection.");
    return null;
  }
};