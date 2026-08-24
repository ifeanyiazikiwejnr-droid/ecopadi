import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { formatPence } from '../format';

export default function ProductVariantManager({ product, onClose, onChanged }) {
  const { token } = useAuth();
  const [variants, setVariants] = useState([]);
  const [name, setName] = useState('Type');
  const [value, setValue] = useState('');
  const [priceDelta, setPriceDelta] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      }, token);
      setValue('');
      setPriceDelta('');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Variants — {product.name}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>
          These appear as a dropdown on the product page for customers to choose from — e.g. different hair
          extension types, sizes, or lengths. Price adjustment is added on top of the base price when selected.
        </p>

        <form className="checkout-form" onSubmit={handleAdd} style={{ marginBottom: 22 }}>
          <div className="form-row">
            <input placeholder="Option name (e.g. Type)" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Value" required value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="form-row" style={{ marginTop: 10 }}>
            <input
              type="number" step="0.01" placeholder="Price adjustment (£, optional)"
              value={priceDelta} onChange={(e) => setPriceDelta(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Variant'}</button>
          </div>
          {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
        </form>

        {variants.length === 0 ? (
          <p className="muted">No variants yet. Add one above — once you have at least one, customers will see a dropdown on the product page.</p>
        ) : (
          <div className="variant-list">
            {variants.map((v) => (
              <div className="variant-list-row" key={v.id}>
                <div>
                  <strong>{v.value}</strong>
                  <span className="muted" style={{ marginLeft: 8, fontSize: 12.5 }}>{v.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="muted" style={{ fontSize: 13.5 }}>
                    {v.price_delta_pence > 0 ? `+${formatPence(v.price_delta_pence)}` : v.price_delta_pence < 0 ? `−${formatPence(Math.abs(v.price_delta_pence))}` : 'No change'}
                  </span>
                  <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: 'var(--pepper)' }} onClick={() => handleDelete(v.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
