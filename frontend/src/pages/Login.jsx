import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="section-head">
        <div className="eyebrow">Welcome Back</div>
        <h2>Log in</h2>
      </div>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 12 }} />
        {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
        No account? <Link to="/register">Create one — it's free</Link>
      </p>
    </section>
  );
}
