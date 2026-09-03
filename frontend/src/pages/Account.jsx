import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPence } from '../format';

export default function Account() {
  const { user, token, loading, joinVip } = useAuth();
  const [orders, setOrders] = useState([]);
  const [rewardSettings, setRewardSettings] = useState(null);

  useEffect(() => {
    if (token) api.myOrders(token).then(setOrders).catch(() => {});
    api.rewardSettings().then(setRewardSettings).catch(() => {});
  }, [token]);

  if (loading) return <div className="wrap section"><p className="muted">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  const threshold = rewardSettings?.redemption_threshold_pence || 100;
  const balance = user.reward_points || 0;
  const progressPct = Math.min(100, Math.round((balance / threshold) * 100));
  const canRedeem = balance >= threshold;

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">My Account</div>
          <h2>Hi, {user.full_name.split(' ')[0]}.</h2>
        </div>

        <div className="account-grid">
          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>VIP Status</h3>
            {user.is_vip ? (
              <>
                <span className="badge badge-vip">VIP Member</span>
                <p className="muted" style={{ marginTop: 12 }}>Free delivery on orders £50+.</p>
              </>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: 14 }}>Join free for delivery perks and reward points — no minimum order required.</p>
                <button className="btn btn-primary" onClick={joinVip}>Become a VIP — Free</button>
              </>
            )}
          </div>

          <div className="card reward-card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>
              <span className="reward-icon" role="img" aria-label="Reward points">🎁</span> Reward Points
            </h3>
            <div className="reward-balance">{formatPence(balance)}</div>
            <div className="reward-progress-track">
              <div className="reward-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              {canRedeem
                ? `Ready to redeem — apply this at checkout for money off your next order.`
                : `${formatPence(threshold - balance)} more to reach your first ${formatPence(threshold)} discount.`}
            </p>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10 }}>Account Details</h3>
            <p className="muted">{user.email}</p>
            {user.phone && <p className="muted">{user.phone}</p>}
          </div>
        </div>

        <h3 style={{ margin: '40px 0 18px' }}>Order History</h3>
        {orders.length === 0 ? (
          <p className="muted">No orders yet. <Link to="/shop">Start shopping →</Link></p>
        ) : (
          <div className="order-list">
            {orders.map((o) => (
              <div className="order-row" key={o.id}>
                <div>
                  <strong>#{o.order_number}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>{new Date(o.created_at).toLocaleDateString('en-GB')}</div>
                </div>
                <span className={`status-pill status-${o.status}`}>{o.status}</span>
                <strong>{formatPence(o.total_pence)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
