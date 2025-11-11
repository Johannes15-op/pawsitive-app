import React, { useState } from 'react';
import smsService from '../services/smsService.client';

const TestSMS = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    petName: 'Test Pet',
    adopterName: 'Test Adopter',
    adopterPhone: '09054245457',
    adoptionId: 'TEST123'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing SMS with data:', formData);
      
      const response = await smsService.sendAdoptionNotification({
        petName: formData.petName,
        adopterName: formData.adopterName,
        adopterPhone: formData.adopterPhone,
        adopterContact: formData.adopterPhone,
        adoptionId: formData.adoptionId
      });

      console.log('📱 SMS Response:', response);
      setResult(response);
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        🧪 SMS Service Test
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Pet Name:
        </label>
        <input
          type="text"
          name="petName"
          value={formData.petName}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Adopter Name:
        </label>
        <input
          type="text"
          name="adopterName"
          value={formData.adopterName}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Phone Number:
        </label>
        <input
          type="text"
          name="adopterPhone"
          value={formData.adopterPhone}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Adoption ID:
        </label>
        <input
          type="text"
          name="adoptionId"
          value={formData.adoptionId}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {loading ? '📱 Sending SMS...' : '🧪 Send Test SMS'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {result.success ? '✅ Success!' : '❌ Failed'}
          </h3>
          <pre style={{
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '10px',
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestSMS;