import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';


const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadProfilePicture = async (userId, file) => {
  try {
    console.log('Starting upload for user:', userId);
    
    
    const base64Image = await fileToBase64(file);
    console.log('Image converted to base64');
    
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: base64Image,
      updatedAt: new Date()
    });
    console.log('Firestore updated successfully');
    
    return { success: true, url: base64Image };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProfilePicture = async (userId) => {
  try {
    console.log('Deleting profile picture for user:', userId);
    
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: null,
      updatedAt: new Date()
    });
    console.log('Firestore updated - photo removed');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return { success: false, error: error.message };
  }
};


export const getProfilePictureURL = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().photoURL || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
};