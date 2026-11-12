import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Cell Master Pro</Link>
      <div className="nav-links">
        <Link to="/" className={currentPath === '/' ? 'active' : ''}>Home</Link>
        <Link to="/sell" className={currentPath === '/sell' ? 'active' : ''}>Sell Devices</Link>
        <Link to="/buy" className={currentPath === '/buy' ? 'active' : ''}>Buy Refurbished</Link>
        <Link to="/repair" className={currentPath === '/repair' ? 'active' : ''}>Repair Service</Link>
        <Link to="/how-it-works" className={currentPath === '/how-it-works' ? 'active' : ''}>How it Works</Link>
      </div>
    </nav>
  );
};

export default Navbar;
