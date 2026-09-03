import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VIP() {
  const { user, joinVip } = useAuth();

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <div className="eyebrow">Become a VIP Customer</div>
        <h1 style={{ fontSize: 40, margin: '14px 0 20px', color: 'var(--pantry)' }}>
          Free delivery. Exclusive offers. Completely free to join.
        </h1>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.7, marginBottom: 30 }}>
          Sign up for a free monthly VIP account and get free delivery on orders worth £50 or more, anywhere in the UK.
          As a VIP customer you get access to exclusive benefits, reward points, and discount offers — and there's no minimum order requirement.
        </p>

        {user?.is_vip ? (
          <p style={{ color: 'var(--leaf)', fontWeight: 700 }}>✓ You're already a VIP member.</p>
        ) : user ? (
          <button className="btn btn-primary" onClick={joinVip}>Join VIP Now — Free</button>
        ) : (
          <Link to="/register" className="btn btn-primary">Create a Free VIP Account →</Link>
        )}

        <div className="faq-list" style={{ marginTop: 56 }}>
          <h3 style={{ marginBottom: 20 }}>VIP FAQ</h3>
          <details><summary>Why should I sign up as a VIP customer?</summary><p>We refer to our registered customers as VIP because they are special and undoubtedly that's who they are. Creating your VIP account is completely free.</p></details>
          <details><summary>Is it really free to register?</summary><p>Yes, it is completely free to register — no hidden sign-up fees.</p></details>
          <details><summary>Do I have to make a purchase, or is there a minimum order?</summary><p>No, not at all. When you sign up as a VIP member, there is no minimum order requirement, and you are not obligated to make any purchase.</p></details>
          <details><summary>How do grocery reward points work?</summary><p>Products worth £50 or more each earn reward points — 5p in reward value for every £50 that item is worth. Points build up in your account and become redeemable for money off once you've accumulated £1.</p></details>
        </div>
      </div>
    </section>
  );
}
