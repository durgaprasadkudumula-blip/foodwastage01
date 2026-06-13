import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
 
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
 
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <div className="nav-logo">🌱</div>
        FoodShare
      </Link>
 
      <div className="nav-links">
        <NavLink to="/">🗺 Map</NavLink>
        <NavLink to="/donate">➕ Donate</NavLink>
        <NavLink to="/my-orders">📦 My Orders</NavLink>
        <NavLink to="/my-donations">🍱 My Donations</NavLink>
      </div>
 
      <div className="nav-user">
        <span className="nav-user-name">👋 {user?.name}</span>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};
 
export default Navbar;