import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';

const STATUS_OPTIONS = ['new', 'quoted', 'ordered', 'fulfilled', 'cancelled'];

function RequestRow({ request, token, onSaved }) {
  const [status, setStatus] = useState(request.status);
  const [quote, setQuote] = useState(request.quote_pence != null ? (request.quote_pence / 100).toFixed(2) : '');
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.adminUpdateConciergeRequest(request.id, {
        status,
        quotePence: quote !== '' ? Math.round(Number(quote) * 100) : null,
        adminNotes: adminNotes || null,
      }, token);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="concierge-admin-request">
      <div className="concierge-admin-request-head">
        <div>
          <strong>{request.full_name}</strong> <span className="muted">({request.email})</span>
          <div className="muted" style={{ fontSize: 13 }}>{new Date(request.created_at).toLocaleString('en-GB')}</div>
        </div>
      </div>
      <ul className="concierge-request-items">
        {request.items.map((it, idx) => (
          <li key={idx}>{it.qty}× {it.name}{it.notes ? ` — ${it.notes}` : ''}</li>
        ))}
      </ul>
      {request.notes && <p className="muted" style={{ fontStyle: 'italic' }}>Customer note: "{request.notes}"</p>}

      <div className="concierge-admin-controls">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="number"
          step="0.01"
          placeholder="Quote (£)"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
        />
        <input
          placeholder="Admin notes (visible to customer)"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
        <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}

export default function AdminConcierge() {
  const { token } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      api.adminConciergeSubscribers(token),
      api.adminConciergeRequests(token, filter || undefined),
    ]).then(([s, r]) => { setSubscribers(s); setRequests(r); }).finally(() => setLoading(false));
  }
  useEffect(load, [token, filter]);

  if (loading) return <p className="muted">Loading…</p>;

  const activeCount = subscribers.filter((s) => s.status === 'active').length;

  return (
    <div>
      <h3 style={{ margin: '20px 0 14px' }}>VIP Concierge Subscribers ({activeCount} active)</h3>
      {subscribers.length === 0 ? (
        <p className="muted">No subscribers yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Status</th><th>Renews / ended</th><th>Since</th></tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.user_id}>
                  <td>{s.full_name} <span className="muted">({s.email})</span></td>
                  <td><span className={`badge badge-concierge-${s.status}`}>{s.status}</span></td>
                  <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-GB') : '—'}</td>
                  <td>{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
        <h3 style={{ margin: 0 }}>Personal Shopping Requests</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="branded-select" style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {requests.length === 0 ? (
        <p className="muted" style={{ marginTop: 14 }}>No requests yet.</p>
      ) : (
        <div style={{ marginTop: 14 }}>
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} token={token} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}
