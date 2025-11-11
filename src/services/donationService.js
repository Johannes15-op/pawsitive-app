import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const donationService = {
 
  createDonation: async (donationData) => {
    try {
      console.log('💰 Creating donation:', donationData);
      
      const donationsRef = collection(db, 'donations');
      
      const docRef = await addDoc(donationsRef, {
        userId: donationData.userId,
        userEmail: donationData.userEmail,
        userName: donationData.userName,
        donorName: donationData.userName,
        amount: parseFloat(donationData.amount),
        paymentMethod: donationData.paymentMethod || 'GCash',
        message: donationData.message || '',
        phoneNumber: donationData.phoneNumber || '',
        receiptUrl: donationData.receiptUrl || null,
        status: 'pending', 
        isRead: false, 
        timestamp: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('✅ Donation created successfully with ID:', docRef.id);
      
      return {
        success: true,
        donationId: docRef.id,
        message: 'Thank you for your donation! Your contribution has been recorded and is pending review.'
      };
    } catch (error) {
      console.error('❌ Error creating donation:', error);
      return {
        success: false,
        error: error.message || 'Failed to create donation'
      };
    }
  },

 
  getAllDonations: async () => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return {
        success: true,
        data: snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      };
    } catch (error) {
      console.error('Error fetching donations:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

 
  getPendingDonationsCount: async () => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      
      return { 
        success: true,
        count: snapshot.size
      };
    } catch (error) {
      console.error('Error getting pending donations count:', error);
      return {
        success: false,
        count: 0
      };
    }
  },

 
  getUserDonations: async (userId) => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return {
        success: true,
        data: snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      };
    } catch (error) {
      console.error('Error fetching user donations:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

 
  getTotalDonations: async () => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, where('status', '==', 'confirmed'));
      const snapshot = await getDocs(q);
      
      let total = 0;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        total += data.amount || 0;
      });
      
      return {
        success: true,
        total: total,
        count: snapshot.size
      };
    } catch (error) {
      console.error('Error calculating total donations:', error);
      return {
        success: false,
        total: 0,
        count: 0
      };
    }
  }
};

export default donationService;