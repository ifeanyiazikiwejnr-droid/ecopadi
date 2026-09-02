import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const CATEGORIES = ['Fats, Oils & Butters', 'Heritage Botanicals', 'Natural Sweeteners', 'Snacks & Dry Foods', 'Protein', 'Bush Meat', 'Spices & Seasonings', 'Fresh Produce', 'Hair & Beauty'];
const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Preorder' },
];

export default function ProductEditModal({ product, onClose, onChanged }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    description: product.description || '',
    pricePence: product.price_pence,
    stockQty: product.stock_qty,
    availability: product.availability || 'in_stock',
    availabilityNote: product.availability_note || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.adminUpdateProduct(product.id, {
        name: form.name,
        category: form.category,
        description: form.description,
        pricePence: Number(form.pricePence),
        imageUrl: null,
        stockQty: Number(form.stockQty),
        availability: form.availability,
        availabilityNote: form.availabilityNote,
      }, token);
      onChanged?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Edit Product</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input value={product.sku} disabled />
            <input placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input
              type="number" step="0.01" placeholder="Price (£)" required
              value={form.pricePence ? (form.pricePence / 100).toString() : ''}
              onChange={(e) => setForm((f) => ({ ...f, pricePence: Math.round(Number(e.target.value) * 100) }))}
            />
          </div>
          <textarea
            placeholder="Description" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            style={{ marginTop: 10 }}
          />
          <input
            type="number" placeholder="Stock quantity" value={form.stockQty}
            onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
            style={{ marginTop: 10 }}
          />

          <label className="field-label">Availability</label>
          <select value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}>
            {AVAILABILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {form.availability !== 'in_stock' && (
            <input
              placeholder={form.availability === 'preorder' ? "Preorder note, e.g. 'Ships in 2 weeks'" : "Note, e.g. 'Back in stock Friday'"}
              value={form.availabilityNote}
              onChange={(e) => setForm((f) => ({ ...f, availabilityNote: e.target.value }))}
              style={{ marginTop: 10 }}
            />
          )}

          {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
          <div className="form-row" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
