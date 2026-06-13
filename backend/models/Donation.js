const mongoose = require('mongoose');
 
const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  foodType: { type: String, required: true, enum: ['Cooked Meal', 'Raw Ingredients', 'Packaged Food', 'Fruits & Vegetables', 'Dairy', 'Bakery', 'Other'] },
  foodDescription: { type: String, required: true },
  quantity: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  image: { type: String },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: { type: String, enum: ['available', 'reserved', 'collected'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model('Donation', donationSchema);
 