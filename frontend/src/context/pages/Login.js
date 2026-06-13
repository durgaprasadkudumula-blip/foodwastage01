import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
 
const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Fighting food waste,<br />one meal at a time.</h1>
        <p>Connect with local donors and ensure surplus food reaches those who need it most. Every meal shared is a step towards a sustainable future.</p>
        <div className="auth-stats">
          <div className="auth-stat-item">
            <div className="number">2.4K</div>
            <div className="label">Meals Saved</div>
          </div>
          <div className="auth-stat-item">
            <div className="number">180+</div>
            <div className="label">Active Donors</div>
          </div>
          <div className="auth-stat-item">
            <div className="number">12T</div>
            <div className="label">CO₂ Prevented</div>
          </div>
        </div>
      </div>
 
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-logo">
            <div className="auth-logo-icon">🌱</div>
            <span className="auth-logo-text">FoodShare</span>
          </div>
 
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue making a difference</p>
 
          <form onSubmit={handleSubmit}>
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
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : '→ Sign In'}
            </button>
          </form>
 
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default Login;