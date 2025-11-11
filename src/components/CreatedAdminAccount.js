import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { ArrowLeft } from 'lucide-react';

const CreateAdminAccount = ({ setCurrentScreen }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createAdmin = async () => {
    setLoading(true);
    setMessage('');

    const adminData = {
      email: 'ednalyncristo84@gmail.com',
      password: 'admin123',
      fullName: 'TAARA admin',
      role: 'Admin',
      phoneNumber: '+639928129654',
      address: 'P3 Burak Street Tabaco City'
    };

    try {

      console.log('Creating authentication account...');
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      
      const user = userCredential.user;
      console.log('Auth account created with UID:', user.uid);


      console.log('Creating Firestore document...');
      await setDoc(doc(db, 'users', user.uid), {
        email: adminData.email,
        fullName: adminData.fullName,
        role: adminData.role,
        phoneNumber: adminData.phoneNumber,
        address: adminData.address,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Admin account created successfully!');
      setMessage('✅ Admin account created successfully! You can now login.');
      

      setTimeout(() => {
        setCurrentScreen('login');
      }, 2000);

    } catch (error) {
      console.error('Error creating admin:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setMessage('⚠️ Admin account already exists! Try logging in instead.');
      } else if (error.code === 'auth/weak-password') {
        setMessage('❌ Password is too weak. Use a stronger password.');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <button 
        onClick={() => setCurrentScreen('login')}
        className="mb-4 flex items-center space-x-2 text-pink-500"
      >
        <ArrowLeft size={20} />
        <span>Back to Login</span>
      </button>

      <div className="bg-white rounded-2xl p-6 max-w-md mx-auto shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Create Admin Account
          </h1>
          <p className="text-gray-600 text-sm">
            This will create the admin account for TAARA
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-700' :
            message.includes('⚠️') ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">
            Admin Credentials:
          </p>
          <div className="text-sm space-y-1 text-blue-700">
            <p>📧 Email: <strong>ednalyncristo84@gmail.com</strong></p>
            <p>🔒 Password: <strong>admin123</strong></p>
            <p>👤 Name: </p>
            <p>📱 Phone: +639928129654</p>
          </div>
        </div>

        <button
          onClick={createAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Admin Account...' : '✨ Create Admin Account'}
        </button>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> This is a one-time setup. After creating the admin account, 
            you can use the credentials above to login to the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminAccount;