import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const petService = {
  
  getAllPets: async () => {
    try {
      const petsRef = collection(db, 'pets');
      const querySnapshot = await getDocs(petsRef);
      
      const pets = [];
      querySnapshot.forEach((doc) => {
        const petData = { id: doc.id, ...doc.data() };
        
        if (petData.name) {
          pets.push(petData);
        }
      });
      

      pets.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      return { success: true, data: pets };
    } catch (error) {
      console.error('Error getting all pets:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

 
  getPetsCountByStatus: async () => {
    try {
      console.log('📊 Getting pets count by status...');
      
      const petsRef = collection(db, 'pets');
      const querySnapshot = await getDocs(petsRef);
      
      const counts = {
        total: 0,
        available: 0,
        pending: 0,
        adopted: 0
      };
      
      querySnapshot.forEach((doc) => {
        const pet = doc.data();
        
   
        if (pet.name && pet.name.trim() !== '') {
          counts.total++;
          
          const status = pet.status?.toString().toLowerCase().trim();
          
          if (status === 'available') {
            counts.available++;
          } else if (status === 'pending') {
            counts.pending++;
          } else if (status === 'adopted') {
            counts.adopted++;
          }
        }
      });
      
      console.log('✅ Pets count:', counts);
      
      return {
        success: true,
        data: counts
      };
    } catch (error) {
      console.error('❌ Error getting pets count:', error);
      return {
        success: false,
        error: error.message,
        data: { total: 0, available: 0, pending: 0, adopted: 0 }
      };
    }
  },

  getPetById: async (petId) => {
    try {
      const petDoc = await getDoc(doc(db, 'pets', petId));
      
      if (petDoc.exists()) {
        return { 
          success: true, 
          data: { id: petDoc.id, ...petDoc.data() } 
        };
      }
      
      return { success: false, error: 'Pet not found', data: null };
    } catch (error) {
      console.error('Error getting pet by ID:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  addPet: async (petData) => {
    try {
      const docRef = await addDoc(collection(db, 'pets'), {
        ...petData,
        status: petData.status || 'available',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        id: docRef.id,
        message: 'Pet added successfully!' 
      };
    } catch (error) {
      console.error('Error adding pet:', error);
      return { success: false, error: error.message };
    }
  },

  updatePet: async (petId, updates) => {
    try {
      await updateDoc(doc(db, 'pets', petId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        message: 'Pet updated successfully!' 
      };
    } catch (error) {
      console.error('Error updating pet:', error);
      return { success: false, error: error.message };
    }
  },

  deletePet: async (petId) => {
    try {
      await deleteDoc(doc(db, 'pets', petId));
      
      return { 
        success: true, 
        message: 'Pet deleted successfully!' 
      };
    } catch (error) {
      console.error('Error deleting pet:', error);
      return { success: false, error: error.message };
    }
  },

  updatePetStatus: async (petId, status) => {
    try {
      console.log('🔄 Updating pet status:', { petId, status });
      
      await updateDoc(doc(db, 'pets', petId), {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Pet status updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating pet status:', error);
      return { success: false, error: error.message };
    }
  },

  getPetsByType: async (type) => {
    try {
      const petsRef = collection(db, 'pets');
      const q = query(petsRef, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      const pets = [];
      querySnapshot.forEach((doc) => {
        const petData = { id: doc.id, ...doc.data() };
        if (petData.name) {
          pets.push(petData);
        }
      });
      
     
      const availablePets = pets
        .filter(pet => {
          const status = pet.status?.toString().toLowerCase().trim();
          return status === 'available';
        })
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      
      return { success: true, data: availablePets };
    } catch (error) {
      console.error('Error getting pets by type:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  filterPets: async (filters = {}) => {
    try {
      const petsRef = collection(db, 'pets');
      let q = query(petsRef);
      
      const querySnapshot = await getDocs(q);
      let pets = [];
      querySnapshot.forEach((doc) => {
        const petData = { id: doc.id, ...doc.data() };
        if (petData.name) {
          pets.push(petData);
        }
      });
      
      if (filters.status) {
        pets = pets.filter(pet => {
          const status = pet.status?.toString().toLowerCase().trim();
          const filterStatus = filters.status.toLowerCase().trim();
          return status === filterStatus;
        });
      }
      
      if (filters.type && filters.type !== 'all') {
        pets = pets.filter(pet => pet.type === filters.type);
      }
      
      if (filters.age && filters.age !== 'all') {
        pets = pets.filter(pet => pet.age === filters.age);
      }
      
      if (filters.gender && filters.gender !== 'all') {
        pets = pets.filter(pet => pet.gender === filters.gender);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        pets = pets.filter(pet => 
          pet.name?.toLowerCase().includes(searchLower) ||
          pet.breed?.toLowerCase().includes(searchLower) ||
          pet.description?.toLowerCase().includes(searchLower)
        );
      }
      
      pets.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      return { success: true, data: pets };
    } catch (error) {
      console.error('Error filtering pets:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getAvailablePets: async () => {
    try {
      console.log('📋 Fetching available pets...');
      
      const petsRef = collection(db, 'pets');
      const querySnapshot = await getDocs(petsRef);
      
      const pets = [];
      querySnapshot.forEach((doc) => {
        const petData = { id: doc.id, ...doc.data() };
        

        const status = petData.status?.toString().toLowerCase().trim();
        const hasName = petData.name && petData.name.trim() !== '';
        
        console.log('🔍 Checking pet:', doc.id, {
          name: petData.name,
          rawStatus: petData.status,
          normalizedStatus: status,
          hasName: hasName,
          statusType: typeof petData.status
        });
        
 
        if (hasName && status && status.includes('available')) {
          pets.push(petData);
          console.log('✅ Valid pet:', petData.name);
        } else {
          console.log('⚠️ Skipping pet:', doc.id, { 
            status: petData.status,
            normalizedStatus: status,
            name: petData.name,
            reason: !hasName ? 'no name' : 
                    !status ? 'no status' : 
                    `status is "${status}", not "available"`
          });
        }
      });
      
      
      pets.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      console.log(`✅ Found ${pets.length} valid available pets`);
      console.log('Valid pet names:', pets.map(p => p.name).join(', '));
      
      return { success: true, data: pets };
    } catch (error) {
      console.error('Error getting available pets:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};

export default petService;