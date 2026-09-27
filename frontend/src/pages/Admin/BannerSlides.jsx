import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { resolveImageUrl } from '../../imageUrl';

export default function AdminBannerSlides() {
  const { token } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    api.adminGetBannerSlides(token).then(setSlides).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function handleAddSlide(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await api.adminCreateBannerSlide({ file }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFieldChange(slide, changes) {
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, ...changes } : s)));
  }

  async function handleSave(slide) {
    setSavingId(slide.id);
    setError('');
    try {
      await api.adminUpdateBannerSlide(slide.id, {
        linkUrl: slide.link_url || '',
        title: slide.title || '',
        active: slide.active,
      }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleReplaceImage(slide, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSavingId(slide.id);
    try {
      await api.adminUpdateBannerSlide(slide.id, { file }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
      e.target.value = '';
    }
  }

  async function handleDelete(slide) {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    await api.adminDeleteBannerSlide(slide.id, token);
    load();
  }

  async function handleMove(index, direction) {
    const next = [...slides];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    await api.adminReorderBannerSlides(next.map((s) => s.id), token);
  }

  if (loading) return <p className="muted">Loading slides…</p>;

  return (
    <div>
      <div className="admin-search-row">
        <div>
          <h3 style={{ marginBottom: 4 }}>Shop Slider</h3>
          <p className="muted" style={{ fontSize: 13.5 }}>
            These slides appear above the products on the Shop page. Add an image, an optional link
            (clicking the slide takes the customer there), and an optional caption.
          </p>
        </div>
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : '+ Add Slide'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAddSlide}
            hidden
          />
        </label>
      </div>

      {error && <p style={{ color: 'var(--pepper)', marginBottom: 14 }}>{error}</p>}

      {slides.length === 0 ? (
        <p className="muted">No slides yet. Add one to get the slider showing on the Shop page.</p>
      ) : (
        <div className="slide-list">
          {slides.map((slide, i) => (
            <div className="slide-row" key={slide.id}>
              <div className="slide-row-order">
                <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
                <button type="button" onClick={() => handleMove(i, 1)} disabled={i === slides.length - 1} aria-label="Move down">▼</button>
              </div>

              <label className="slide-row-thumb">
                <img src={resolveImageUrl(slide.image_url)} alt="" />
                <span>Replace</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleReplaceImage(slide, e)} hidden />
              </label>

              <div className="slide-row-fields">
                <input
                  placeholder="Caption (optional)"
                  value={slide.title || ''}
                  onChange={(e) => handleFieldChange(slide, { title: e.target.value })}
                  onBlur={() => handleSave(slide)}
                />
                <input
                  placeholder="Link URL (optional) — e.g. /shop or https://…"
                  value={slide.link_url || ''}
                  onChange={(e) => handleFieldChange(slide, { link_url: e.target.value })}
                  onBlur={() => handleSave(slide)}
                />
              </div>

              <label className="slide-row-active">
                <input
                  type="checkbox"
                  checked={slide.active}
                  onChange={(e) => { handleFieldChange(slide, { active: e.target.checked }); handleSave({ ...slide, active: e.target.checked }); }}
                />
                Active
              </label>

              <button
                className="btn btn-ghost"
                style={{ color: 'var(--pepper)' }}
                onClick={() => handleDelete(slide)}
                disabled={savingId === slide.id}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
