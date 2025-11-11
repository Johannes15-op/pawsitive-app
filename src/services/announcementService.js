import { 
  collection, 
  addDoc, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const getAllAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: announcements };
  } catch (error) {
    console.error('Error getting announcements:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const addAnnouncement = async (announcementData) => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true,
      data: {
        id: docRef.id
      },
      message: 'Announcement created successfully!' 
    };
  } catch (error) {
    console.error('Error adding announcement:', error);
    return { success: false, error: error.message };
  }
};

export const updateAnnouncement = async (announcementId, updates) => {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Announcement updated successfully!' 
    };
  } catch (error) {
    console.error('Error updating announcement:', error);
    return { success: false, error: error.message };
  }
};

export const toggleActive = async (announcementId, isActive) => {
  try {
    await updateDoc(doc(db, 'announcements', announcementId), {
      isActive: isActive,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling announcement:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
    
    return { 
      success: true, 
      message: 'Announcement deleted successfully!' 
    };
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return { success: false, error: error.message };
  }
};

const announcementService = {
  getAllAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  toggleActive,
  deleteAnnouncement
};

export default announcementService;