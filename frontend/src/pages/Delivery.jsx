export default function Delivery() {
  return (
    <section className="section" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="eyebrow">Delivery</div>
      <h1 style={{ fontSize: 36, margin: '14px 0 24px', color: 'var(--pantry)' }}>Delivery Information</h1>

      <div className="delivery-cards">
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>United Kingdom</h3>
          <p className="muted">Standard delivery within the UK is between 2–3 working days.</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Ireland</h3>
          <p className="muted">Standard delivery within Ireland is 3–5 working days.</p>
        </div>
      </div>

      <div className="promise-strip" style={{ marginTop: 40, borderRadius: 20 }}>
        <div className="promise-inner" style={{ padding: 40, flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <h2 style={{ fontSize: 24 }}>Become a VIP customer</h2>
          <p style={{ color: 'rgba(248,245,239,0.8)', maxWidth: 520 }}>
            Sign up for a free monthly subscription and get free delivery for orders worth £50 or more.
            As a VIP customer you have access to exclusive benefits and discount offers — and it's completely free to join.
          </p>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 30 }}>
        For more delivery information, please contact us at <a href="tel:+447901555647" style={{ color: 'var(--leaf)', fontWeight: 700 }}>07901 555647</a>.
      </p>
    </section>
  );
}
