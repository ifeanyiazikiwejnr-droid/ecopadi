import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { formatPence, formatKg } from '../format';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotalPence, itemCount, hasPreorderItems, preorderWeightGrams } = useCart();
  const [preorderSettings, setPreorderSettings] = useState(null);

  useEffect(() => {
    if (hasPreorderItems && !preorderSettings) api.preorderSettings().then(setPreorderSettings).catch(() => {});
  }, [hasPreorderItems, preorderSettings]);

  const preorderMinimumGrams = preorderSettings?.minimum_weight_grams;
  const preorderMinimumMet = !hasPreorderItems || (preorderMinimumGrams && preorderWeightGrams >= preorderMinimumGrams);

  return (
    <>
      <div className={`drawer-overlay ${isOpen ? 'show' : ''}`} onClick={() => setIsOpen(false)} />
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h3>Your Basket ({itemCount})</h3>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your basket is empty.</p>
            <Link to="/shop" className="btn btn-primary" onClick={() => setIsOpen(false)}>Browse the Pantry</Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.map((item) => (
                <div className="drawer-item" key={item.key}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.variantLabel && <div className="muted">{item.variantLabel}</div>}
                    <div className="muted">{formatPence(item.unitPricePence)} each</div>
                  </div>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(item.key)} aria-label="Remove item">🗑</button>
                </div>
              ))}
            </div>
            <div className="drawer-footer">
              {hasPreorderItems && preorderMinimumGrams && (
                <p className={`muted drawer-preorder-hint ${preorderMinimumMet ? 'met' : ''}`}>
                  {preorderMinimumMet
                    ? `✓ Preorder minimum met (${formatKg(preorderWeightGrams)}kg of ${formatKg(preorderMinimumGrams)}kg)`
                    : `Preorder items: ${formatKg(preorderWeightGrams)}kg of ${formatKg(preorderMinimumGrams)}kg needed to check out`}
                </p>
              )}
              <div className="drawer-subtotal">
                <span>Subtotal</span>
                <strong>{formatPence(subtotalPence)}</strong>
              </div>
              <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                Checkout →
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
