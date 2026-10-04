import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPence } from '../format';

const EMPTY_ITEM = { name: '', qty: '1', notes: '' };

const STATUS_LABELS = {
  new: 'Received',
  quoted: 'Quoted — awaiting your OK',
  ordered: 'Sourcing your order',
  fulfilled: 'Shipped',
  cancelled: 'Cancelled',
};

export default function Concierge() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [requests, setRequests] = useState([]);

  function load() {
    if (!token) { setLoading(false); return; }
    Promise.all([api.conciergeStatus(token), api.conciergeMyRequests(token)])
      .then(([s, r]) => { setStatus(s); setRequests(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function handleSubscribe() {
    setStarting(true);
    try {
      const { url } = await api.conciergeCreateCheckoutSession(token);
      window.location.href = url;
    } catch (err) {
      setNotice(err.message);
      setStarting(false);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const { url } = await api.conciergeBillingPortal(token);
      window.location.href = url;
    } catch (err) {
      setNotice(err.message);
      setPortalLoading(false);
    }
  }

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }
  function addRow() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }
  function removeRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitList(e) {
    e.preventDefault();
    setSubmitting(true);
    setNotice('');
    try {
      await api.conciergeSubmitRequest({ items, notes }, token);
      setItems([{ ...EMPTY_ITEM }]);
      setNotes('');
      setNotice('Your list is in — we\'ll be in touch with a quote shortly.');
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const isActive = status?.isActive;
  const justSubscribed = searchParams.get('subscribed') === '1';

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="eyebrow">VIP Concierge</div>
        <h1 style={{ fontSize: 40, margin: '14px 0 20px', color: 'var(--pantry)' }}>
          Personal shopping, sourced and shipped to your door.
        </h1>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 10 }}>
          Can't find what you're after in the shop? As a VIP Concierge subscriber, send us your own personal
          shopping list — anything you'd like us to source on your behalf — and our team will find it, quote you,
          and ship it straight to your doorstep.
        </p>
        <p className="muted" style={{ fontSize: 14 }}>
          This is a separate, paid service from our free <Link to="/vip">VIP program</Link> — concierge sourcing is
          £10/month, billed monthly, cancel anytime.
        </p>

        {justSubscribed && <p style={{ color: 'var(--leaf)', fontWeight: 700, marginTop: 20 }}>✓ Subscription confirmed — welcome to VIP Concierge!</p>}

        {!user ? (
          <div style={{ marginTop: 30 }}>
            <Link to="/login" className="btn btn-primary">Log in to subscribe</Link>
          </div>
        ) : loading ? (
          <p className="muted" style={{ marginTop: 30 }}>Loading…</p>
        ) : !isActive ? (
          <div className="concierge-pitch-panel" style={{ marginTop: 30 }}>
            {status?.status === 'past_due' && (
              <p style={{ color: 'var(--pepper)', fontWeight: 700, marginBottom: 14 }}>
                Your last payment didn't go through — resubscribe or update your card to keep using concierge sourcing.
              </p>
            )}
            {status?.status === 'canceled' && (
              <p className="muted" style={{ marginBottom: 14 }}>Your VIP Concierge subscription has ended.</p>
            )}
            <button className="btn btn-primary" onClick={handleSubscribe} disabled={starting}>
              {starting ? 'Starting checkout…' : 'Subscribe for £10/month'}
            </button>
            {notice && <p className="muted" style={{ marginTop: 10 }}>{notice}</p>}
          </div>
        ) : (
          <>
            <div className="concierge-pitch-panel" style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <p style={{ color: 'var(--leaf)', fontWeight: 700, margin: 0 }}>
                ✓ You're an active VIP Concierge subscriber
                {status.currentPeriodEnd ? ` — renews ${new Date(status.currentPeriodEnd).toLocaleDateString('en-GB')}` : ''}
              </p>
              <button className="btn btn-ghost" onClick={handleManageBilling} disabled={portalLoading}>
                {portalLoading ? 'Opening…' : 'Manage billing'}
              </button>
            </div>

            <form className="concierge-list-form" onSubmit={handleSubmitList} style={{ marginTop: 30 }}>
              <h3 style={{ marginBottom: 16 }}>Submit your personal shopping list</h3>
              {items.map((item, i) => (
                <div className="concierge-item-row" key={i}>
                  <input
                    placeholder="Item (e.g. a specific brand of palm oil)"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                  />
                  <input
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateItem(i, 'qty', e.target.value)}
                  />
                  <input
                    placeholder="Notes (brand, size, etc.)"
                    value={item.notes}
                    onChange={(e) => updateItem(i, 'notes', e.target.value)}
                  />
                  {items.length > 1 && (
                    <button type="button" className="danger" onClick={() => removeRow(i)} aria-label="Remove item">✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-ghost" onClick={addRow} style={{ marginTop: 10 }}>+ Add another item</button>

              <textarea
                placeholder="Anything else we should know? (delivery timing, substitutes you'd accept, etc.)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ marginTop: 18 }}
              />
              <button className="btn btn-dark" type="submit" disabled={submitting} style={{ marginTop: 14 }}>
                {submitting ? 'Sending…' : 'Send list for a quote'}
              </button>
              {notice && <p className="muted" style={{ marginTop: 10 }}>{notice}</p>}
            </form>

            {requests.length > 0 && (
              <div className="concierge-requests-list" style={{ marginTop: 44 }}>
                <h3 style={{ marginBottom: 18 }}>Your submitted lists</h3>
                {requests.map((r) => (
                  <div className="concierge-request-item" key={r.id}>
                    <div className="concierge-request-head">
                      <strong>{new Date(r.created_at).toLocaleDateString('en-GB')}</strong>
                      <span className={`badge badge-concierge-${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span>
                    </div>
                    <ul className="concierge-request-items">
                      {r.items.map((it, idx) => (
                        <li key={idx}>{it.qty}× {it.name}{it.notes ? ` — ${it.notes}` : ''}</li>
                      ))}
                    </ul>
                    {r.quote_pence != null && <p className="muted">Quoted: {formatPence(r.quote_pence)}</p>}
                    {r.admin_notes && <p className="muted" style={{ fontStyle: 'italic' }}>"{r.admin_notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
