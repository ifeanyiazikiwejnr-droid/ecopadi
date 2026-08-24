import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => { api.adminSummary(token).then(setSummary).catch(() => {}); }, [token]);

  return (
    <section className="section">
      <div className="wrap">
        <div className="eyebrow">Admin</div>
        <h2 style={{ margin: '10px 0 30px', color: 'var(--pantry)' }}>Store Dashboard</h2>

        {summary && (
          <div className="admin-stats">
            <button className="card stat-card stat-card-clickable" onClick={() => navigate('/admin/orders')}>
              <span className="stat-icon">🧾</span>
              <span className="muted">Orders</span>
              <h3 style={{ fontSize: 28 }}>{summary.orderCount}</h3>
            </button>
            <div className="card stat-card"><span className="stat-icon">💷</span><span className="muted">Revenue (paid)</span><h3 style={{ fontSize: 28 }}>{formatPence(summary.revenuePence)}</h3></div>
            <div className="card stat-card"><span className="stat-icon">📦</span><span className="muted">Products</span><h3 style={{ fontSize: 28 }}>{summary.productCount}</h3></div>
            <div className="card stat-card"><span className="stat-icon">👥</span><span className="muted">Customers</span><h3 style={{ fontSize: 28 }}>{summary.customerCount}</h3></div>
          </div>
        )}

        <div className="admin-tabs">
          <NavLink to="/admin/products" end>Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </div>

        <Outlet />
      </div>
    </section>
  );
}
