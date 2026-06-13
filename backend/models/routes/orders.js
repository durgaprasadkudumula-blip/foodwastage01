const express = require('express');
const router = express.Router();
const Order = require('../Order');
const Donation = require('../Donation');
const { protect } = require('../middleware/auth');
const { isFallbackMode, createOrder, getMyOrders, getDonationById } = require('../dbFallback');
 
// @POST /api/orders - Create an order
router.post('/', protect, async (req, res) => {
  try {
    const { donationId, receiverName, receiverPhone, receiverAddress, pickupTime, notes } = req.body;

    if (isFallbackMode()) {
      const donation = getDonationById(donationId);
      if (!donation || donation.status !== 'available') {
        return res.status(400).json({ message: 'Donation not available' });
      }

      const order = createOrder({
        donationId,
        receiver: req.user._id,
        receiverName,
        receiverPhone,
        receiverAddress,
        pickupTime,
        notes
      });

      donation.status = 'reserved';
      return res.status(201).json(order);
    }
 
    const donation = await Donation.findById(donationId);
    if (!donation || donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation not available' });
    }
 
    const order = await Order.create({
      donation: donationId,
      receiver: req.user._id,
      receiverName,
      receiverPhone,
      receiverAddress,
      pickupTime,
      notes
    });
 
    // Mark donation as reserved
    donation.status = 'reserved';
    await donation.save();
 
    return res.status(201).json(order);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
// @GET /api/orders/my - Get my orders
router.get('/my', protect, async (req, res) => {
  try {
    if (isFallbackMode()) {
      return res.json(getMyOrders(req.user._id));
    }

    const orders = await Order.find({ receiver: req.user._id })
      .populate({ path: 'donation', populate: { path: 'donor', select: 'name email' } })
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;