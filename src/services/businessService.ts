import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { Business } from '../types';

export const updateBusiness = async (businessId: string, updates: Partial<Business>) => {
  try {
    const businessRef = doc(db, 'businesses', businessId);
    await updateDoc(businessRef, {
      ...updates,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating business:', error);
    // If document doesn't exist, we might need to set it if it was from local/mock data
    try {
       const businessRef = doc(db, 'businesses', businessId);
       await setDoc(businessRef, {
         ...updates,
         id: businessId,
         updatedAt: Date.now()
       }, { merge: true });
       return true;
    } catch (innerError) {
       console.error('Error setting business document:', innerError);
       throw error;
    }
  }
};
