const mongoose = require('mongoose');
 
const orderSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverAddress: { type: String, required: true },
  pickupTime: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'collected', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
 
module.exports = mongoose.model('Order', orderSchema);
 