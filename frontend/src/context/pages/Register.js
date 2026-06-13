import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
 
const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to FoodShare 🌱');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Join the food rescue movement.</h1>
        <p>Whether you're donating surplus meals or looking for available food — you're making a direct impact in your community.</p>
        <div className="auth-stats">
          <div className="auth-stat-item">
            <div className="number">Free</div>
            <div className="label">Always</div>
          </div>
          <div className="auth-stat-item">
            <div className="number">Real-time</div>
            <div className="label">Map Updates</div>
          </div>
          <div className="auth-stat-item">
            <div className="number">0%</div>
            <div className="label">Waste Goal</div>
          </div>
        </div>
      </div>
 
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">🌱</div>
            <span className="auth-logo-text">FoodShare</span>
          </div>
 
          <h2>Create account</h2>
          <p className="auth-subtitle">Start your food rescue journey today</p>
 
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Your Address</label>
              <input
                placeholder="Street, City, State"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : '→ Create Account'}
            </button>
          </form>
 
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default Register;