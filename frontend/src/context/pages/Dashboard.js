import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
 
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a120a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a120a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7a9a7a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111811' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a3a2a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#051205' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d1f0d' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111811' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2a1a' }] },
];
 
const Dashboard = () => {
  const [donations, setDonations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [center, setCenter] = useState({ lat: 17.385, lng: 78.4867 }); // Hyderabad default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
 
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });
 
  useEffect(() => {
    fetchDonations();
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // keep default center on error
      );
    }
  }, []);
 
  const fetchDonations = async () => {
    try {
      const { data } = await axios.get('/api/donations');
      setDonations(data);
    } catch (err) {
      toast.error('Failed to load donations');
    }
  };
 
const foodTypes = ['All', 'Cooked Meal', 'Raw Ingredients', 'Packaged Food', 'Fruits & Vegetables', 'Dairy', 'Bakery', 'Other'];
 
  const filteredDonations = filter === 'All'
    ? donations
    : donations.filter(d => d.foodType === filter);
 
  const getDaysUntilExpiry = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
 
  const getExpiryTag = (date) => {
    const days = getDaysUntilExpiry(date);
    if (days <= 0) return { label: 'Expired', cls: 'tag-danger' };
    if (days <= 1) return { label: 'Expires Today', cls: 'tag-warning' };
    if (days <= 3) return { label: `${days}d left`, cls: 'tag-warning' };
    return { label: `${days}d left`, cls: 'tag-green' };
  };
 
  if (!isLoaded) return (
    <div>
      <Navbar />
      <div className="loading-screen"><div className="spinner" /></div>
    </div>
  );
 
  return (
    <div>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Available Donations <span>Near You</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="header-actions">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '10px 14px', borderRadius: '10px',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', cursor: 'pointer'
              }}
            >
              {foodTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => navigate('/donate')} style={{ width: 'auto' }}>
              + Donate Food
            </button>
          </div>
        </div>
 
        <div className="map-section">
          <GoogleMap
            mapContainerClassName="map-wrapper"
            center={center}
            zoom={13}
            options={{ styles: mapStyles, disableDefaultUI: false, zoomControl: true }}
          >
            {/* User location marker */}
            <Marker
              position={center}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 9,
                fillColor: '#2ECC71',
                fillOpacity: 1,
                strokeColor: '#0a0f0a',
                strokeWeight: 2,
              }}
              title="Your Location"
            />
 
            {/* Donation markers */}
            {filteredDonations.map(donation => {
              const days = getDaysUntilExpiry(donation.expiryDate);
              const color = days <= 1 ? '#E74C3C' : days <= 3 ? '#F39C12' : '#2ECC71';
              return (
                <Marker
                  key={donation._id}
                  position={{ lat: donation.location.lat, lng: donation.location.lng }}
                  onClick={() => setSelected(donation)}
                  icon={{
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                        <path fill="${color}" d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z"/>
                        <text x="20" y="25" text-anchor="middle" fill="white" font-size="16">🍱</text>
                      </svg>
                    `)}`,
                    scaledSize: new window.google.maps.Size(40, 50),
                    anchor: new window.google.maps.Point(20, 50),
                  }}
                />
              );
            })}
 
            {/* Info Window */}
            {selected && (
              <InfoWindow
                position={{ lat: selected.location.lat, lng: selected.location.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ background: '#141F14', padding: '16px', borderRadius: '12px', minWidth: '240px', color: '#E8F5E8', fontFamily: 'DM Sans, sans-serif' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#2ECC71', marginBottom: 8, fontSize: '1rem' }}>
                    🍱 {selected.foodDescription}
                  </div>
                  {selected.image && (
                    <img
                      src={`${API_BASE_URL}${selected.image}`}
                      alt="food"
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                    />
                  )}
                  <div style={{ display: 'grid', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#7A9A7A' }}>Type</span>
                      <span>{selected.foodType}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#7A9A7A' }}>Quantity</span>
                      <span>{selected.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#7A9A7A' }}>Donor</span>
                      <span>{selected.donorName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#7A9A7A' }}>Expires</span>
                      <span style={{ color: getDaysUntilExpiry(selected.expiryDate) <= 1 ? '#E74C3C' : '#F39C12' }}>
                        {getExpiryTag(selected.expiryDate).label}
                      </span>
                    </div>
                    <div style={{ color: '#7A9A7A', fontSize: '0.8rem' }}>{selected.address}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/order/${selected._id}`, { state: { donation: selected } })}
                    style={{
                      width: '100%', padding: '10px', background: '#2ECC71', border: 'none',
                      borderRadius: '8px', color: '#0a0f0a', fontFamily: 'Syne, sans-serif',
                      fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
                    }}
                  >
                    Request This Food →
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;