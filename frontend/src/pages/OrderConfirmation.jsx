import { useSearchParams, Link } from 'react-router-dom';

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const notice = params.get('notice');

  return (
    <section className="section" style={{ textAlign: 'center' }}>
      <div className="wrap" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Order confirmed</h1>
        <p className="muted" style={{ marginBottom: 6 }}>Thank you — your order is in.</p>
        {orderNumber && <p style={{ fontFamily: 'var(--serif)', fontSize: 20, margin: '18px 0' }}>Order #{orderNumber}</p>}
        <p className="muted" style={{ marginBottom: 24 }}>
          If you chose direct bank transfer, payment instructions have been sent to your email — for security we never publish bank details on the website itself.
        </p>
        {notice && <p className="muted" style={{ fontSize: 13, marginBottom: 24 }}>({notice})</p>}
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </section>
  );
}
