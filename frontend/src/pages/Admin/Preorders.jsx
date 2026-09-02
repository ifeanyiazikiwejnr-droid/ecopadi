import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export default function AdminPreorders() {
  const { token } = useAuth();
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminPreorders(token).then(setPreorders).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="muted">Loading preorders…</p>;

  if (preorders.length === 0) {
    return <p className="muted">No preorders right now — this fills in once a customer orders a product marked "Preorder" in your catalog.</p>;
  }

  return (
    <div className="preorder-list">
      {preorders.map((p) => (
        <div className="preorder-card" key={p.productId}>
          <div className="preorder-card-head">
            <div>
              <h3>{p.productName}</h3>
              <span className="muted" style={{ fontSize: 13 }}>SKU: {p.sku}</span>
            </div>
            <div className="preorder-qty-badge">
              <strong>{p.totalQuantity}</strong>
              <span>unit{p.totalQuantity === 1 ? '' : 's'} needed</span>
            </div>
          </div>

          <div className="admin-table" style={{ marginTop: 4 }}>
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
        </div>
      ))}
    </div>
  );
}
