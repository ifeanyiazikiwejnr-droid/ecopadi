import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export default function AdminSettings() {
  const { token } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.adminGetRewardSettings(token).then((s) => setForm({
      minItemPricePence: (s.min_item_price_pence / 100).toString(),
      bracketPence: (s.bracket_pence / 100).toString(),
      pointsPerBracketPence: (s.points_per_bracket_pence / 100).toString(),
      redemptionThresholdPence: (s.redemption_threshold_pence / 100).toString(),
    })).catch(() => {});
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.adminUpdateRewardSettings({
        minItemPricePence: Math.round(Number(form.minItemPricePence) * 100),
        bracketPence: Math.round(Number(form.bracketPence) * 100),
        pointsPerBracketPence: Math.round(Number(form.pointsPerBracketPence) * 100),
        redemptionThresholdPence: Math.round(Number(form.redemptionThresholdPence) * 100),
      }, token);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="muted">Loading…</p>;

  return (
    <div className="admin-form" style={{ maxWidth: 520 }}>
      <h3>Reward Points Rules</h3>
      <p className="muted" style={{ fontSize: 13.5, marginBottom: 20 }}>
        Controls how customers earn and redeem reward points storewide. Changes apply to orders placed after saving.
      </p>
      <form className="checkout-form" onSubmit={handleSubmit}>
        <label className="field-label">Minimum order subtotal to earn anything (£)</label>
        <input type="number" step="0.01" min="0" value={form.minItemPricePence} onChange={(e) => setForm((f) => ({ ...f, minItemPricePence: e.target.value }))} />

        <label className="field-label">Bracket size — earn points per this much spent on a qualifying order (£)</label>
        <input type="number" step="0.01" min="0.01" value={form.bracketPence} onChange={(e) => setForm((f) => ({ ...f, bracketPence: e.target.value }))} />

        <label className="field-label">Points earned per bracket (£)</label>
        <input type="number" step="0.01" min="0" value={form.pointsPerBracketPence} onChange={(e) => setForm((f) => ({ ...f, pointsPerBracketPence: e.target.value }))} />

        <label className="field-label">Redeemable once balance reaches (£)</label>
        <input type="number" step="0.01" min="0.01" value={form.redemptionThresholdPence} onChange={(e) => setForm((f) => ({ ...f, redemptionThresholdPence: e.target.value }))} />

        <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
          With these numbers: an order worth £{form.minItemPricePence || 0}+ in total earns £{form.pointsPerBracketPence || 0}
          {' '}for every £{form.bracketPence || 0} it's worth. A customer can redeem once they've built up £{form.redemptionThresholdPence || 0}.
        </p>

        {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}
        {saved && <p style={{ color: 'var(--leaf)', marginTop: 10 }}>✓ Saved</p>}
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop: 14 }}>
          {saving ? 'Saving…' : 'Save Rules'}
        </button>
      </form>
    </div>
  );
}
