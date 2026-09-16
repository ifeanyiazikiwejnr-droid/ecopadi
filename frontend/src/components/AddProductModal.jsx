import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import DescriptionEditor from './DescriptionEditor';

const CATEGORIES = ['Fats, Oils & Butters', 'Heritage Botanicals', 'Natural Sweeteners', 'Snacks & Dry Foods', 'Protein', 'Bush Meat', 'Spices & Seasonings', 'Fresh Produce', 'Hair & Beauty'];
const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Preorder' },
];
const EMPTY_FORM = { sku: '', name: '', slug: '', category: CATEGORIES[0], description: '', pricePence: '', stockQty: 0, availability: 'in_stock', availabilityNote: '', weightGrams: '' };

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AddProductModal({ onClose, onChanged }) {
  const { token } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.adminCreateProduct({
        sku: form.sku, name: form.name, slug: form.slug || slugify(form.name), category: form.category,
        description: form.description, pricePence: form.pricePence === '' ? null : Number(form.pricePence), stockQty: Number(form.stockQty),
        availability: form.availability, availabilityNote: form.availabilityNote,
        weightGrams: form.weightGrams ? Math.round(Number(form.weightGrams) * 1000) : null,
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
    <div className="modal-overlay">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Add Product</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input placeholder="SKU" required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
            <input placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Price (£, optional)"
              value={form.pricePence ? (form.pricePence / 100).toString() : ''}
              onChange={(e) => setForm((f) => ({ ...f, pricePence: e.target.value === '' ? '' : Math.round(Number(e.target.value) * 100) }))} />
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: -6, marginBottom: 10 }}>
            Leave blank if every option will be priced through its own variant instead (Variants button, after saving).
          </p>
          <div style={{ marginTop: 10 }}>
            <DescriptionEditor
              value={form.description}
              onChange={(description) => setForm((f) => ({ ...f, description }))}
            />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <input type="number" placeholder="Stock quantity" value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))} />
            <input type="number" step="0.01" min="0" placeholder="Weight (kg)" value={form.weightGrams} onChange={(e) => setForm((f) => ({ ...f, weightGrams: e.target.value }))} />
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
            Weight is required for preorder items — it's what determines when a customer's basket reaches the preorder minimum.
          </p>

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
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add Product'}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
