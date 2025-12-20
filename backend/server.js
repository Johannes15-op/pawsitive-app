require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});


const smsRoutes = require('./routes/smsRoutes');
app.use('/api/sms', smsRoutes);

// ADD THIS - Adoption routes
const adoptionRoutes = require('./routes/adoptionRoutes');
app.use('/api/adoptions', adoptionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TAARA Backend Server is running',
    timestamp: new Date().toISOString()
  });
});


app.get('/', (req, res) => {
  res.json({ 
    message: '🐾 TAARA Pet Adoption - SMS Service API',
    endpoints: {
      health: '/api/health',
      smsTest: '/api/sms/test',
      sendSMS: '/api/sms/adoption-notification',
      createAdoption: '/api/adoptions'  // ADD THIS
    }
  });
});


app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log('🐾 TAARA Pet Adoption - Backend Server');
  console.log('🚀 ========================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 SMS Test: http://localhost:${PORT}/api/sms/test`);
  console.log(`📝 Create Adoption: http://localhost:${PORT}/api/adoptions`);  // ADD THIS
  console.log('🚀 ========================================');
});