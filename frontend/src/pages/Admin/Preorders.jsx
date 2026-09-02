import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export default function AdminPreorders() {
  const { token } = useAuth();
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    api.adminPreorders(token).then(setPreorders).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  function toggle(productId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  if (loading) return <p className="muted">Loading preorders…</p>;

  if (preorders.length === 0) {
    return <p className="muted">No preorders right now — this fills in once a customer orders a product marked "Preorder" in your catalog.</p>;
  }

  return (
    <div className="preorder-list">
      {preorders.map((p) => {
        const isOpen = expanded.has(p.productId);
        return (
          <div className="preorder-card" key={p.productId}>
            <button className="preorder-card-head" onClick={() => toggle(p.productId)} aria-expanded={isOpen}>
              <div className="preorder-card-title">
                <span className={`expand-caret ${isOpen ? 'open' : ''}`}>▸</span>
                <div>
                  <h3>{p.productName}</h3>
                  <span className="muted" style={{ fontSize: 13 }}>SKU: {p.sku} · {p.orders.length} customer{p.orders.length === 1 ? '' : 's'}</span>
                </div>
              </div>
              <div className="preorder-qty-badge">
                <strong>{p.totalQuantity}</strong>
                <span>unit{p.totalQuantity === 1 ? '' : 's'} needed</span>
              </div>
            </button>

            {isOpen && (
              <div className="admin-table" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Qty</th>
                      <th>Delivery Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.orders.map((o) => (
                      <tr key={o.orderNumber}>
                        <td>
                          #{o.orderNumber}
                          <div className="muted" style={{ fontSize: 12 }}>{new Date(o.orderDate).toLocaleDateString('en-GB')}</div>
                        </td>
                        <td>
                          {o.customerName || '—'}
                          <div className="muted" style={{ fontSize: 12 }}>{o.customerEmail}</div>
                        </td>
                        <td>{o.quantity}{o.variantLabel ? <div className="muted" style={{ fontSize: 12 }}>{o.variantLabel}</div> : null}</td>
                        <td className="muted" style={{ fontSize: 13 }}>
                          {o.address?.line1}{o.address?.line2 ? `, ${o.address.line2}` : ''}<br />
                          {o.address?.city}, {o.address?.postcode}<br />
                          {o.deliveryCountry}
                        </td>
                        <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
