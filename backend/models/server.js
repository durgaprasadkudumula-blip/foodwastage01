const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { setFallbackEnabled } = require('./dbFallback');
require('dotenv').config();
 
const app = express();
 
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
 
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/orders', require('./routes/orders'));
 
// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_wastage_prevention';
const connectionType = process.env.MONGO_URI ? 'remote MongoDB' : 'local MongoDB';

setFallbackEnabled(true);

if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUri)
    .then(() => {
      setFallbackEnabled(false);
      console.log(`✅ ${connectionType} connected`);
    })
    .catch(err => {
      setFallbackEnabled(true);
      console.error('❌ MongoDB error:', err.message);
      console.warn('⚠️ Using in-memory fallback for auth and donation data until MongoDB is reachable');
    });
}
 
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;