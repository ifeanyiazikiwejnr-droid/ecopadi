import { useState } from 'react';
import { api } from '../api';
import { formatPence } from '../format';

export default function OrderLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setOrder(null);
    try {
      const result = await api.lookupOrder({ orderNumber, email });
      setOrder(result);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="section-head">
          <div className="eyebrow">Track an Order</div>
          <h2>Find your order</h2>
          <p>Enter your order number and the email you used at checkout.</p>
        </div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <input placeholder="Order number (e.g. EP-XXXXX)" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          <input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginTop: 12 }} />
          <button className="btn btn-primary" type="submit" style={{ marginTop: 16 }}>Find Order</button>
          {error && <p style={{ color: 'var(--pepper)', marginTop: 12 }}>{error}</p>}
        </form>

        {order && (
          <div className="order-summary" style={{ marginTop: 32 }}>
            <h3>Order #{order.order_number}</h3>
            <p className="muted">Status: <strong>{order.status}</strong></p>
            {order.items.map((i) => (
              <div className="summary-line" key={i.id}>
                <span>{i.product_name} × {i.quantity}</span>
                <strong>{formatPence(i.line_total_pence)}</strong>
              </div>
            ))}
            <hr />
            <div className="summary-line total"><span>Total</span><strong>{formatPence(order.total_pence)}</strong></div>
          </div>
        )}
      </div>
    </section>
  );
}
