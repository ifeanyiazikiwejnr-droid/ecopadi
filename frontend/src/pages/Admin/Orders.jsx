import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({}); // orderNumber -> full order with items
  const [loadingDetail, setLoadingDetail] = useState(null);

  function load() {
    api.adminOrders(token).then(setOrders).catch(() => {});
  }
  useEffect(load, [token]);

  async function updateStatus(id, status) {
    await api.adminUpdateOrderStatus(id, status, token);
    load();
  }

  async function toggleExpand(order) {
    if (expandedId === order.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(order.id);
    if (!orderDetails[order.order_number]) {
      setLoadingDetail(order.id);
      try {
        const detail = await api.orderDetail(order.order_number, token);
        setOrderDetails((prev) => ({ ...prev, [order.order_number]: detail }));
      } catch {
        // leave unset — row will show a fallback message
      } finally {
        setLoadingDetail(null);
      }
    }
  }

  return (
    <div className="admin-table">
      <table>
        <thead><tr><th></th><th>Order</th><th>Customer</th><th>Method</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => {
            const isOpen = expandedId === o.id;
            const detail = orderDetails[o.order_number];
            return (
              <Fragment key={o.id}>
                <tr className="order-row-clickable" onClick={() => toggleExpand(o)}>
                  <td><span className={`expand-caret ${isOpen ? 'open' : ''}`}>▸</span></td>
                  <td>#{o.order_number}<div className="muted" style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('en-GB')}</div></td>
                  <td className="muted">{o.guest_name || o.guest_email || 'Registered customer'}</td>
                  <td className="muted">{o.payment_method}</td>
                  <td>{formatPence(o.total_pence)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="order-detail-row">
                    <td colSpan={6}>
                      {loadingDetail === o.id ? (
                        <p className="muted" style={{ padding: '12px 0' }}>Loading order…</p>
                      ) : detail ? (
                        <div className="order-detail-panel">
                          <div className="order-detail-items">
                            <h4>Items Purchased</h4>
                            {detail.items.map((item) => (
                              <div className="order-detail-line" key={item.id}>
                                <span>{item.product_name}{item.variant_label ? ` (${item.variant_label})` : ''} × {item.quantity}</span>
                                <strong>{formatPence(item.line_total_pence)}</strong>
                              </div>
                            ))}
                            <div className="order-detail-line muted" style={{ marginTop: 8 }}>
                              <span>Subtotal</span><span>{formatPence(detail.subtotal_pence)}</span>
                            </div>
                            {detail.discount_pence > 0 && (
                              <div className="order-detail-line muted">
                                <span>Discount {detail.discount_code ? `(${detail.discount_code})` : ''}</span><span>−{formatPence(detail.discount_pence)}</span>
                              </div>
                            )}
                            <div className="order-detail-line muted">
                              <span>Delivery</span><span>{formatPence(detail.delivery_fee_pence)}</span>
                            </div>
                          </div>
                          <div className="order-detail-address">
                            <h4>Delivery Address</h4>
                            <p>
                              {detail.delivery_address.line1}<br />
                              {detail.delivery_address.line2 && <>{detail.delivery_address.line2}<br /></>}
                              {detail.delivery_address.city}, {detail.delivery_address.postcode}<br />
                              {detail.delivery_country}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="muted" style={{ padding: '12px 0' }}>Couldn't load order details.</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {orders.length === 0 && <tr><td colSpan={6} className="muted">No orders yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
