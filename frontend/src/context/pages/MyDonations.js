import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
 
const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/donations/my');
        setDonations(data);
      } catch {
        toast.error('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
 
  const statusColor = {
    available: 'var(--green)',
    reserved: 'var(--warning)',
    collected: 'var(--text-muted)',
  };
 
  const markCollected = async (id) => {
    try {
      await axios.put(`/api/donations/${id}/status`, { status: 'collected' });
      setDonations(prev => prev.map(d => d._id === id ? { ...d, status: 'collected' } : d));
      toast.success('Marked as collected');
    } catch {
      toast.error('Failed to update status');
    }
  };
 
  const getDaysLeft = (date) => {
    const d = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return d;
  };
 
  return (
    <div>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="page-title">
            <h2>🍱 My Donations</h2>
            <p>Food you've shared with the community</p>
          </div>
        </div>
 
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/donate')}>
            + Add Donation
          </button>
        </div>
 
        {loading ? (
          <div className="loading-screen" style={{ height: '300px' }}><div className="spinner" /></div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍱</div>
            <p>You haven't donated anything yet. Start making a difference!</p>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/donate')}>
              Donate Food
            </button>
          </div>
        ) : (
          <div className="list-grid">
            {donations.map(donation => {
              const days = getDaysLeft(donation.expiryDate);
              return (
                <div className="list-card" key={donation._id}>
                  <div className="list-card-header">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      {donation.image && (
                        <img src={`${API_BASE_URL}${donation.image}`} alt="food" className="food-image-thumb" />
                      )}
                      <div>
                        <div className="list-card-title">{donation.foodDescription}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {donation.foodType} · {donation.quantity}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: statusColor[donation.status], fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize', flexShrink: 0 }}>
                      ● {donation.status}
                    </span>
                  </div>
 
                  <div className="list-card-meta" style={{ marginTop: '12px' }}>
                    <div className="meta-item">
                      Expires
                      <span style={{ color: days <= 0 ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : 'var(--green)' }}>
                        {days <= 0 ? 'Expired' : `${days} day${days !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                    <div className="meta-item">
                      Posted
                      <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item" style={{ gridColumn: '1 / -1' }}>
                      Location
                      <span>{donation.address}</span>
                    </div>
                  </div>
 
                  {donation.status === 'reserved' && (
                    <div style={{ marginTop: '14px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                        onClick={() => markCollected(donation._id)}
                      >
                        ✅ Mark as Collected
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default MyDonations;