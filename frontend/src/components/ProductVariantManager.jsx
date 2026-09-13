import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPence, formatKg } from '../format';

export default function ProductVariantManager({ product, onClose, onChanged }) {
  const { token } = useAuth();
  const [variants, setVariants] = useState([]);
  const [name, setName] = useState('Type');
  const [value, setValue] = useState('');
  const [priceDelta, setPriceDelta] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  function load() {
    api.adminGetVariants(product.id, token).then(setVariants).catch(() => {});
  }
  useEffect(load, [product.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setSaving(true);
    setError('');
    try {
      await api.adminCreateVariant(product.id, {
        name: name.trim() || 'Type',
        value: value.trim(),
        priceDeltaPence: priceDelta ? Math.round(Number(priceDelta) * 100) : 0,
        weightGrams: weightKg ? Math.round(Number(weightKg) * 1000) : null,
      }, token);
      setValue('');
      setPriceDelta('');
      setWeightKg('');
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId) {
    await api.adminDeleteVariant(product.id, variantId, token);
    load();
    onChanged?.();
  }

  function startEdit(v) {
    setEditingId(v.id);
    setEditError('');
    setEditForm({
      name: v.name,
      value: v.value,
      priceDelta: v.price_delta_pence ? (v.price_delta_pence / 100).toString() : '',
      weightKg: v.weight_grams ? (v.weight_grams / 1000).toString() : '',
    });
  }

  async function handleSaveEdit(variantId) {
    setEditSaving(true);
    setEditError('');
    try {
      await api.adminUpdateVariant(product.id, variantId, {
        name: editForm.name.trim() || 'Type',
        value: editForm.value.trim(),
        priceDeltaPence: editForm.priceDelta ? Math.round(Number(editForm.priceDelta) * 100) : 0,
        weightGrams: editForm.weightKg ? Math.round(Number(editForm.weightKg) * 1000) : null,
      }, token);
      setEditingId(null);
      load();
      onChanged?.();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Variants — {product.name}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          These appear as a dropdown on the product page for customers to choose from — e.g. different cuts,
          sizes, or lengths. Price adjustment is added on top of the base price. Weight, if set here,
          replaces the product's base weight for that specific option — useful when different variants
          genuinely weigh different amounts (e.g. "Leg" 2.4kg vs "Head" 3kg of the same product).
        </p>

        <form className="checkout-form" onSubmit={handleAdd} style={{ marginBottom: 22 }}>
          <div className="form-row">
            <input placeholder="Option name (e.g. Type)" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Value (e.g. Leg)" required value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <input
              type="number" step="0.01" placeholder="Price adjustment (£, optional)"
              value={priceDelta} onChange={(e) => setPriceDelta(e.target.value)}
            />
            <input
              type="number" step="0.01" min="0" placeholder="Weight (kg, optional)"
              value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 10 }}>{saving ? 'Adding…' : 'Add Variant'}</button>
          {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
        </form>

        {variants.length === 0 ? (
          <p className="muted">No variants yet. Add one above — once you have at least one, customers will see a dropdown on the product page.</p>
        ) : (
          <div className="variant-list">
            {variants.map((v) => (
              editingId === v.id ? (
                <div className="variant-list-row variant-list-row-editing" key={v.id}>
                  <div className="form-row">
                    <input placeholder="Option name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                    <input placeholder="Value" value={editForm.value} onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))} />
                  </div>
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <input type="number" step="0.01" placeholder="Price adjustment (£)" value={editForm.priceDelta} onChange={(e) => setEditForm((f) => ({ ...f, priceDelta: e.target.value }))} />
                    <input type="number" step="0.01" min="0" placeholder="Weight (kg)" value={editForm.weightKg} onChange={(e) => setEditForm((f) => ({ ...f, weightKg: e.target.value }))} />
                  </div>
                  {editError && <p style={{ color: 'var(--pepper)', marginTop: 8, fontSize: 13 }}>{editError}</p>}
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} disabled={editSaving} onClick={() => handleSaveEdit(v.id)}>
                      {editSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="variant-list-row" key={v.id}>
                  <div>
                    <strong>{v.value}</strong>
                    <span className="muted" style={{ marginLeft: 8, fontSize: 12.5 }}>{v.name}</span>
                    {v.weight_grams > 0 && <span className="muted" style={{ marginLeft: 8, fontSize: 12.5 }}>· {formatKg(v.weight_grams)}kg</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="muted" style={{ fontSize: 13.5 }}>
                      {v.price_delta_pence > 0 ? `+${formatPence(v.price_delta_pence)}` : v.price_delta_pence < 0 ? `−${formatPence(Math.abs(v.price_delta_pence))}` : 'No change'}
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => startEdit(v)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: 'var(--pepper)' }} onClick={() => handleDelete(v.id)}>Delete</button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
