import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPence } from '../format';

export default function Checkout() {
  const { items, subtotalPence, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', postcode: '', country: 'United Kingdom' });
  const [deliveryCountry, setDeliveryCountry] = useState('United Kingdom');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [rewardSettings, setRewardSettings] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.rewardSettings().then(setRewardSettings).catch(() => {}); }, []);

  async function applyDiscount() {
    setDiscountError('');
    try {
      const result = await api.validateDiscount({ code: discountCode, subtotalPence });
      setDiscount(result);
    } catch (err) {
      setDiscount(null);
      setDiscountError(err.message);
    }
  }

  const discountPence = discount?.discountPence || 0;
  const isVip = user?.is_vip;
  const isIreland = deliveryCountry === 'Ireland';
  const baseDelivery = isIreland ? 799 : 499;
  const freeDelivery = isVip && subtotalPence - discountPence >= 5000;
  const deliveryFeePence = freeDelivery ? 0 : baseDelivery;

  // How much of the customer's reward balance is actually redeemable right
  // now — mirrors the backend's logic exactly so this preview never over-promises.
  const pointsBalance = user?.reward_points || 0;
  const redemptionThreshold = rewardSettings?.redemption_threshold_pence || 100;
  const redeemableUnits = Math.floor(pointsBalance / redemptionThreshold);
  const maxPointsDiscountPence = Math.min(redeemableUnits * redemptionThreshold, Math.max(0, subtotalPence - discountPence));
  const canRedeemPoints = user && maxPointsDiscountPence > 0;
  const pointsDiscountPence = redeemPoints && canRedeemPoints ? maxPointsDiscountPence : 0;

  const totalPence = Math.max(0, subtotalPence - discountPence - pointsDiscountPence) + deliveryFeePence;

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    if (items.length === 0) { setError('Your basket is empty.'); return; }
    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        discountCode: discount?.code,
        redeemPoints: redeemPoints && canRedeemPoints,
        deliveryCountry,
        address,
        paymentMethod,
        guestEmail: user ? undefined : guestEmail,
        guestName: user ? undefined : guestName,
      };
      const result = await api.checkout(payload, token);
      clearCart();

      if (paymentMethod === 'stripe') {
        try {
          const session = await api.createStripeSession(result.order.order_number);
          window.location.href = session.url;
          return;
        } catch (err) {
          // Stripe not configured yet in this environment — still confirm the order
          navigate(`/order-confirmation?order=${result.order.order_number}&notice=${encodeURIComponent(err.message)}`);
          return;
        }
      }
      navigate(`/order-confirmation?order=${result.order.order_number}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <h2>Your basket is empty</h2>
        <p className="muted" style={{ margin: '16px 0' }}>Add something from the pantry before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Browse Groceries</Link>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="wrap checkout-grid">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2 style={{ marginBottom: 24 }}>Checkout</h2>

          {!user && (
            <fieldset>
              <legend>Contact details</legend>
              <p className="muted" style={{ marginBottom: 10, fontSize: 13.5 }}>
                Checking out as a guest. <Link to="/login">Log in</Link> if you have a VIP account for free delivery and reward points.
              </p>
              <input placeholder="Full name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <input type="email" placeholder="Email address" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            </fieldset>
          )}

          <fieldset>
            <legend>Delivery address</legend>
            <select value={deliveryCountry} onChange={(e) => setDeliveryCountry(e.target.value)}>
              <option>United Kingdom</option>
              <option>Ireland</option>
            </select>
            <input placeholder="Address line 1" required value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} />
            <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} />
            <div className="form-row">
              <input placeholder="City" required value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
              <input placeholder="Postcode" required value={address.postcode} onChange={(e) => setAddress((a) => ({ ...a, postcode: e.target.value }))} />
            </div>
            <p className="muted" style={{ fontSize: 13 }}>
              Standard delivery: 2–3 working days (UK) · 3–5 working days (Ireland).
              {isVip ? ' As a VIP, orders £50+ get free delivery.' : ' Join VIP free for delivery perks.'}
            </p>
          </fieldset>

          <fieldset>
            <legend>Discount code</legend>
            <div className="form-row">
              <input placeholder="Enter code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
              <button type="button" className="btn btn-ghost" onClick={applyDiscount}>Apply</button>
            </div>
            {discount && <p style={{ color: 'var(--leaf)', fontSize: 13.5 }}>✓ {discount.code} applied</p>}
            {discountError && <p style={{ color: 'var(--pepper)', fontSize: 13.5 }}>{discountError}</p>}
          </fieldset>

          {user && (
            <fieldset>
              <legend>Reward points</legend>
              {canRedeemPoints ? (
                <label className="checkbox-row">
                  <input type="checkbox" checked={redeemPoints} onChange={(e) => setRedeemPoints(e.target.checked)} />
                  🎁 Redeem {formatPence(maxPointsDiscountPence)} of your {formatPence(pointsBalance)} reward balance on this order
                </label>
              ) : (
                <p className="muted" style={{ fontSize: 13.5 }}>
                  🎁 You have {formatPence(pointsBalance)} in reward points — redeemable once you reach {formatPence(redemptionThreshold)}.
                </p>
              )}
            </fieldset>
          )}

          <fieldset>
            <legend>Payment method</legend>
            <div className="payment-options">
              {[
                { id: 'stripe', label: 'Debit / Credit Card & Apple Pay', hint: 'Visa, Mastercard, Apple Pay via Stripe' },
                { id: 'paypal', label: 'PayPal', hint: 'Pay via your PayPal account' },
                { id: 'bank_transfer', label: 'Direct Bank Transfer', hint: 'Bank details sent after order confirmation' },
              ].map((opt) => (
                <label key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'active' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} />
                  <div><strong>{opt.label}</strong><div className="muted" style={{ fontSize: 13 }}>{opt.hint}</div></div>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p style={{ color: 'var(--pepper)', marginBottom: 16 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={placing} style={{ width: '100%', justifyContent: 'center' }}>
            {placing ? 'Placing order…' : `Place Order — ${formatPence(totalPence)}`}
          </button>
        </form>

        <aside className="order-summary">
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
          {items.map((i) => (
            <div className="summary-line" key={i.key}>
              <span>{i.name} {i.variantLabel ? `(${i.variantLabel})` : ''} × {i.quantity}</span>
              <strong>{formatPence(i.unitPricePence * i.quantity)}</strong>
            </div>
          ))}
          <hr />
          <div className="summary-line"><span>Subtotal</span><strong>{formatPence(subtotalPence)}</strong></div>
          {discountPence > 0 && <div className="summary-line"><span>Discount</span><strong>−{formatPence(discountPence)}</strong></div>}
          {pointsDiscountPence > 0 && <div className="summary-line"><span>🎁 Reward points</span><strong>−{formatPence(pointsDiscountPence)}</strong></div>}
          <div className="summary-line"><span>Delivery</span><strong>{freeDelivery ? 'Free (VIP)' : formatPence(deliveryFeePence)}</strong></div>
          <hr />
          <div className="summary-line total"><span>Total</span><strong>{formatPence(totalPence)}</strong></div>
        </aside>
      </div>
    </section>
  );
}
