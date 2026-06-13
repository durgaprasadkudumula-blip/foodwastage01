import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useAuth } from '../AuthContext';
 
const OrderPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const donation = state?.donation;
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [loading, setLoading] = useState(false);
 
  const [form, setForm] = useState({
    receiverName: user?.name || '',
    receiverPhone: user?.phone || '',
    receiverAddress: user?.address || '',
    pickupTime: '',
    notes: '',
  });
 
  if (!donation) {
    return (
      <div>
        <Navbar />
        <div className="page-container">
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <p>Donation not found.</p>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>← Back to Map</button>
          </div>
        </div>
      </div>
    );
  }
 
  const daysLeft = Math.ceil((new Date(donation.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/orders', { donationId: id, ...form });
      toast.success('🎉 Order placed! The donor will be notified.');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="page-title">
            <h2>📦 Request Food</h2>
            <p>Complete your details to request this donation</p>
          </div>
        </div>
 
        {/* Donation Summary */}
        <div className="card">
          <div className="card-title">🍱 Donation Summary</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            {donation.image && (
              <img
                src={`${API_BASE_URL}${donation.image}`}
                alt="food"
                className="food-image-thumb"
                style={{ width: '100px', height: '100px', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div className="order-summary">
                <div className="order-summary-row">
                  <span className="key">Food</span>
                  <span className="val">{donation.foodDescription}</span>
                </div>
                <div className="order-summary-row">
                  <span className="key">Type</span>
                  <span className="val">{donation.foodType}</span>
                </div>
                <div className="order-summary-row">
                  <span className="key">Quantity</span>
                  <span className="val">{donation.quantity}</span>
                </div>
                <div className="order-summary-row">
                  <span className="key">Donor</span>
                  <span className="val">{donation.donorName} · {donation.donorPhone}</span>
                </div>
                <div className="order-summary-row">
                  <span className="key">Location</span>
                  <span className="val">{donation.address}</span>
                </div>
                <div className="order-summary-row">
                  <span className="key">Expires</span>
                  <span className="val" style={{ color: daysLeft <= 1 ? 'var(--danger)' : daysLeft <= 3 ? 'var(--warning)' : 'var(--green)' }}>
                    {new Date(donation.expiryDate).toLocaleString()} ({daysLeft}d left)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Receiver Details */}
        <div className="card">
          <div className="card-title">👤 Your Details</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  placeholder="Your name"
                  value={form.receiverName}
                  onChange={e => setForm({ ...form, receiverName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  placeholder="+91 98765 43210"
                  value={form.receiverPhone}
                  onChange={e => setForm({ ...form, receiverPhone: e.target.value })}
                  required
                />
              </div>
            </div>
 
            <div className="form-group">
              <label>Your Address</label>
              <input
                placeholder="Where are you coming from? (reference)"
                value={form.receiverAddress}
                onChange={e => setForm({ ...form, receiverAddress: e.target.value })}
                required
              />
            </div>
 
            <div className="form-group">
              <label>Preferred Pickup Time</label>
              <input
                type="datetime-local"
                value={form.pickupTime}
                onChange={e => setForm({ ...form, pickupTime: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
 
            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                placeholder="Any special requests or information for the donor..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
 
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Placing order...' : '✅ Confirm Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
 
export default OrderPage;