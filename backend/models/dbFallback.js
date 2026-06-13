const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const fallbackPath = path.join(__dirname, '..', 'fallback-data.json');

const createDefaultStore = () => ({
  users: [],
  donations: [],
  orders: [],
  nextIds: {
    user: 1,
    donation: 1,
    order: 1
  }
});

const loadStore = () => {
  try {
    const raw = fs.readFileSync(fallbackPath, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      donations: Array.isArray(parsed.donations) ? parsed.donations : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      nextIds: parsed.nextIds && typeof parsed.nextIds === 'object' ? parsed.nextIds : createDefaultStore().nextIds
    };
  } catch (err) {
    return createDefaultStore();
  }
};

const store = loadStore();

const persistStore = () => {
  fs.writeFileSync(fallbackPath, JSON.stringify(store, null, 2), 'utf8');
};

let fallbackEnabled = false;

const setFallbackEnabled = (enabled) => {
  fallbackEnabled = Boolean(enabled);
};

const isFallbackMode = () => fallbackEnabled;

const sanitizeUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  role: user.role || 'both',
  createdAt: user.createdAt
});

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

const computeNextId = (type) => {
  store.nextIds[type] = (store.nextIds[type] || 1) + 1;
  persistStore();
  return store.nextIds[type] - 1;
};

const createUserRecord = async ({ name, email, password, phone = '', address = '', role = 'both' }) => {
  const passwordHash = await hashPassword(password);
  const user = {
    _id: String(computeNextId('user')),
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone,
    address,
    role,
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  persistStore();
  return sanitizeUser(user);
};

const findUserByEmail = (email) => {
  const normalizedEmail = String(email || '').toLowerCase();
  return store.users.find((user) => user.email === normalizedEmail) || null;
};

const findUserById = (id) => {
  const user = store.users.find((item) => String(item._id) === String(id));
  return user ? sanitizeUser(user) : null;
};

const registerUser = async (userData) => {
  const existing = findUserByEmail(userData.email);
  if (existing) {
    throw new Error('User already exists');
  }

  return createUserRecord(userData);
};

const loginUser = async (email, password) => {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return null;
  }

  return sanitizeUser(user);
};

const createDonation = ({ donor, donorName, donorPhone, foodType, foodDescription, quantity, expiryDate, address, location, image = null }) => {
  const donation = {
    _id: String(computeNextId('donation')),
    donor,
    donorName,
    donorPhone,
    foodType,
    foodDescription,
    quantity,
    expiryDate,
    image,
    address,
    location,
    status: 'available',
    createdAt: new Date().toISOString()
  };

  store.donations.push(donation);
  persistStore();
  return donation;
};

const getAvailableDonations = () => {
  return store.donations
    .filter((donation) => donation.status === 'available')
    .map((donation) => ({
      ...donation,
      donor: findUserById(donation.donor)
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getMyDonations = (userId) => {
  return store.donations
    .filter((donation) => String(donation.donor) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getDonationById = (id) => {
  return store.donations.find((donation) => String(donation._id) === String(id)) || null;
};

const updateDonationStatus = (id, status) => {
  const donation = getDonationById(id);
  if (!donation) {
    return null;
  }

  donation.status = status;
  persistStore();
  return donation;
};

const createOrder = ({ donationId, receiver, receiverName, receiverPhone, receiverAddress, pickupTime, notes }) => {
  const order = {
    _id: String(computeNextId('order')),
    donation: donationId,
    receiver,
    receiverName,
    receiverPhone,
    receiverAddress,
    pickupTime,
    notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  store.orders.push(order);
  persistStore();
  return order;
};

const getMyOrders = (receiverId) => {
  return store.orders
    .filter((order) => String(order.receiver) === String(receiverId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
  setFallbackEnabled,
  isFallbackMode,
  registerUser,
  loginUser,
  findUserByEmail,
  findUserById,
  createDonation,
  getAvailableDonations,
  getMyDonations,
  getDonationById,
  updateDonationStatus,
  createOrder,
  getMyOrders
};
