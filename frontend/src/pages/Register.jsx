import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', wantsVip: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" style={{ maxWidth: 460, margin: '0 auto' }}>
      <div className="section-head">
        <div className="eyebrow">Create Account</div>
        <h2>Both guest checkout and accounts are supported</h2>
        <p>Create a free account for order history and VIP perks — or just check out as a guest anytime.</p>
      </div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <input placeholder="Full name *" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
        <input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={{ marginTop: 12 }} />
        <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={{ marginTop: 12 }} />
        <input type="password" placeholder="Password *" required minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} style={{ marginTop: 12 }} />
        <label className="checkbox-row" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={form.wantsVip} onChange={(e) => setForm((f) => ({ ...f, wantsVip: e.target.checked }))} />
          Sign me up as a free VIP customer (no minimum order required)
        </label>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
          * Required — without this information we're unable to fulfil your orders. Your delivery address is
          collected separately at checkout for each order. See our <Link to="/legal/privacy">Privacy Policy</Link> for details.
        </p>
        {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
