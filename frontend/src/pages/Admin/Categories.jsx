import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  function load() {
    api.adminGetCategories(token).then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      await api.adminCreateCategory(newName.trim(), token);
      setNewName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setError('');
  }

  async function handleRename(category) {
    if (!editingName.trim() || editingName.trim() === category.name) {
      setEditingId(null);
      return;
    }
    setError('');
    try {
      await api.adminUpdateCategory(category.id, editingName.trim(), token);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Delete "${category.name}"? This only works if no products currently use it.`)) return;
    setError('');
    try {
      await api.adminDeleteCategory(category.id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMove(index, direction) {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    await api.adminReorderCategories(next.map((c) => c.id), token);
  }

  if (loading) return <p className="muted">Loading categories…</p>;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 4 }}>Shop Categories</h3>
        <p className="muted" style={{ fontSize: 13.5 }}>
          These are the categories customers filter by on the Shop page, and that show up in the
          category dropdown when adding or editing a product. Renaming one updates every product
          filed under it automatically. A category can't be deleted while products still use it.
        </p>
      </div>

      <form onSubmit={handleAdd} className="form-row" style={{ marginBottom: 18, maxWidth: 420 }}>
        <input
          placeholder="New category name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={adding}>{adding ? 'Adding…' : '+ Add'}</button>
      </form>

      {error && <p style={{ color: 'var(--pepper)', marginBottom: 14 }}>{error}</p>}

      {categories.length === 0 ? (
        <p className="muted">No categories yet — add one above.</p>
      ) : (
        <div className="category-list">
          {categories.map((category, i) => (
            <div className="category-row" key={category.id}>
              <div className="category-row-order">
                <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
                <button type="button" onClick={() => handleMove(i, 1)} disabled={i === categories.length - 1} aria-label="Move down">▼</button>
              </div>

              <div className="category-row-name">
                {editingId === category.id ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(category)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRename(category); } if (e.key === 'Escape') setEditingId(null); }}
                  />
                ) : (
                  <button type="button" className="category-name-btn" onClick={() => startEdit(category)}>
                    {category.name}
                  </button>
                )}
              </div>

              <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => startEdit(category)}>Rename</button>
              <button className="btn btn-ghost" style={{ color: 'var(--pepper)' }} onClick={() => handleDelete(category)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
