const express = require('express');
const fs = require('fs');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Donation = require('../Donation');
const { protect } = require('../middleware/auth');
const { isFallbackMode, createDonation, getAvailableDonations, getMyDonations, updateDonationStatus } = require('../dbFallback');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
 
// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});
 
// @GET /api/donations - Get all available donations
router.get('/', protect, async (req, res) => {
  try {
    if (isFallbackMode()) {
      return res.json(getAvailableDonations());
    }

    const donations = await Donation.find({ status: 'available' })
      .populate('donor', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
// @GET /api/donations/my - Get my donations
router.get('/my', protect, async (req, res) => {
  try {
    if (isFallbackMode()) {
      return res.json(getMyDonations(req.user._id));
    }

    const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    return res.json(donations);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
// @POST /api/donations - Create donation
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { foodType, foodDescription, quantity, expiryDate, address, lat, lng, donorPhone } = req.body;

    if (isFallbackMode()) {
      const donation = createDonation({
        donor: req.user._id,
        donorName: req.user.name,
        donorPhone: donorPhone || req.user.phone || '',
        foodType,
        foodDescription,
        quantity,
        expiryDate,
        address,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        image: req.file ? `/uploads/${req.file.filename}` : null
      });
      return res.status(201).json(donation);
    }

    const donation = await Donation.create({
      donor: req.user._id,
      donorName: req.user.name,
      donorPhone,
      foodType,
      foodDescription,
      quantity,
      expiryDate,
      address,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
    return res.status(201).json(donation);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
// @PUT /api/donations/:id/status - Update donation status
router.put('/:id/status', protect, async (req, res) => {
  try {
    if (isFallbackMode()) {
      const donation = updateDonationStatus(req.params.id, req.body.status);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      return res.json(donation);
    }

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    return res.json(donation);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;