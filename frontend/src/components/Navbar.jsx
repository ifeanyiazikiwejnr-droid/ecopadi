import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="nav-inner wrap">
        <Link to="/" className="logo">
          <img src="/brand/logo.png" alt="EcoPadi — groceries from home" className="logo-badge" />
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/delivery" onClick={() => setMenuOpen(false)}>Delivery</NavLink>
          <NavLink to="/vip" onClick={() => setMenuOpen(false)}>VIP</NavLink>
          <NavLink to="/faq" onClick={() => setMenuOpen(false)}>FAQ</NavLink>
          {user ? (
            <NavLink to="/account" onClick={() => setMenuOpen(false)}>My Account</NavLink>
          ) : (
            <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>
          )}
        </div>

        <div className="nav-actions">
          {user && (
            <button className="btn btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }} onClick={logout}>
              Log out
            </button>
          )}
          <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Open cart">
            🛒 {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>
          <button className="burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">☰</button>
        </div>
      </nav>
    </header>
  );
}
