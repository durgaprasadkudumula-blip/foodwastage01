import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
 
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/orders/my');
        setOrders(data);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
 
  const statusColor = {
    pending: 'var(--warning)',
    confirmed: 'var(--green)',
    collected: 'var(--text-muted)',
    cancelled: 'var(--danger)',
  };
 
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="page-title">
            <h2>📦 My Orders</h2>
            <p>Food you've requested from donors</p>
          </div>
        </div>
 
        {loading ? (
          <div className="loading-screen" style={{ height: '300px' }}><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>You haven't requested any food yet.</p>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>
              Browse Donations
            </button>
          </div>
        ) : (
          <div className="list-grid">
            {orders.map(order => (
              <div className="list-card" key={order._id}>
                <div className="list-card-header">
                  <div>
                    <div className="list-card-title">
                      {order.donation?.foodDescription || 'Food Item'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Donor: {order.donation?.donorName}
                    </div>
                  </div>
                  <span style={{ color: statusColor[order.status], fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                    ● {order.status}
                  </span>
                </div>
 
                {order.donation?.image && (
                  <img
                    src={`${API_BASE_URL}${order.donation.image}`}
                    alt="food"
                    className="image-preview"
                    style={{ marginBottom: '14px', maxHeight: '140px' }}
                  />
                )}
 
                <div className="list-card-meta">
                  <div className="meta-item">
                    Food Type
                    <span>{order.donation?.foodType}</span>
                  </div>
                  <div className="meta-item">
                    Quantity
                    <span>{order.donation?.quantity}</span>
                  </div>
                  <div className="meta-item">
                    Pickup Time
                    <span>{order.pickupTime ? new Date(order.pickupTime).toLocaleString() : 'Not specified'}</span>
                  </div>
                  <div className="meta-item">
                    Ordered On
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
 
                {order.donation?.address && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📍 {order.donation.address}
                  </div>
                )}
 
                {order.notes && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    Note: {order.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default MyOrders;