import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useAuth } from '../AuthContext';
 
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a120a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7a9a7a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a1a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#051205' }] },
];
 
const foodTypes = ['Cooked Meal', 'Raw Ingredients', 'Packaged Food', 'Fruits & Vegetables', 'Dairy', 'Bakery', 'Other'];
 
const DonatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 17.385, lng: 78.4867 });
 
  const [form, setForm] = useState({
    foodType: 'Cooked Meal',
    foodDescription: '',
    quantity: '',
    expiryDate: '',
    address: '',
    donorPhone: user?.phone || '',
    image: null,
  });
 
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };
 
  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
 
    // Reverse geocode
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setForm(prev => ({ ...prev, address: results[0].formatted_address }));
        }
      });
    }
  }, []);
 
  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setMarkerPos({ lat, lng });
      setMapCenter({ lat, lng });
 
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setForm(prev => ({ ...prev, address: results[0].formatted_address }));
          }
        });
      }
    }, () => toast.error('Unable to get location'));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!markerPos) return toast.error('Please pin your location on the map');
    if (!form.image) return toast.error('Please upload an image of the food');
 
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'image') formData.append(k, v); });
      formData.append('image', form.image);
      formData.append('lat', markerPos.lat);
      formData.append('lng', markerPos.lng);
 
      await axios.post('/api/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
 
      toast.success('🎉 Food donation posted successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post donation');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div>
      <Navbar />
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <div className="page-title">
            <h2>🍱 Donate Food</h2>
            <p>Share your surplus food with those who need it</p>
          </div>
        </div>
 
        <form onSubmit={handleSubmit}>
          {/* Food Details */}
          <div className="card">
            <div className="card-title">📋 Food Details</div>
            <div className="form-row">
              <div className="form-group">
                <label>Food Type</label>
                <select value={form.foodType} onChange={e => setForm({ ...form, foodType: e.target.value })}>
                  {foodTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  placeholder="e.g. 5 kg, 20 servings"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
            </div>
 
            <div className="form-group">
              <label>Food Description</label>
              <textarea
                placeholder="Describe the food (e.g. freshly cooked biryani, packaged biscuits...)"
                value={form.foodDescription}
                onChange={e => setForm({ ...form, foodDescription: e.target.value })}
                required
              />
            </div>
 
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Phone</label>
                <input
                  placeholder="+91 98765 43210"
                  value={form.donorPhone}
                  onChange={e => setForm({ ...form, donorPhone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
 
          {/* Image Upload */}
          <div className="card">
            <div className="card-title">📸 Food Photo</div>
            <div className="image-upload-area">
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="image-preview" />
              ) : (
                <>
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    <span>Click to upload</span> or drag & drop<br />
                    JPG, PNG, WEBP up to 5MB
                  </div>
                </>
              )}
            </div>
          </div>
 
          {/* Location */}
          <div className="card">
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>📍 Pickup Location</span>
              <button type="button" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={useMyLocation}>
                Use My Location
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
              Click on the map to set your donation pickup location
            </p>
 
            {isLoaded ? (
              <div className="location-picker">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={14}
                  onClick={handleMapClick}
                  options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
                >
                  {markerPos && <Marker position={markerPos} />}
                </GoogleMap>
              </div>
            ) : (
              <div style={{ height: '260px', background: 'var(--bg3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Loading map...
              </div>
            )}
 
            <div className="form-group" style={{ marginTop: '14px' }}>
              <label>Address</label>
              <input
                placeholder="Address will auto-fill when you pin the map"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
 
            {markerPos && (
              <div className="location-info">
                ✅ Location set: {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
              </div>
            )}
          </div>
 
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: '40px' }}>
            {loading ? 'Posting donation...' : '🌱 Post Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default DonatePage;