import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';
import { resolveImageUrl } from '../../imageUrl';
import ProductImageManager from '../../components/ProductImageManager';
import ProductVariantManager from '../../components/ProductVariantManager';

const CATEGORIES = ['Fats, Oils & Butters', 'Heritage Botanicals', 'Natural Sweeteners', 'Snacks & Dry Foods', 'Protein', 'Bush Meat', 'Spices & Seasonings', 'Fresh Produce', 'Hair & Beauty'];
const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Preorder' },
];
const EMPTY_FORM = { sku: '', name: '', slug: '', category: CATEGORIES[0], description: '', pricePence: '', stockQty: 0, availability: 'in_stock', availabilityNote: '' };

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageManagerProduct, setImageManagerProduct] = useState(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState(null);
  const [search, setSearch] = useState('');

  function load() {
    api.adminProducts().then(setProducts).catch(() => {});
  }
  useEffect(load, []);

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      sku: p.sku, name: p.name, slug: p.slug, category: p.category,
      description: p.description || '', pricePence: p.price_pence, stockQty: p.stock_qty,
      availability: p.availability || 'in_stock', availabilityNote: p.availability_note || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editingId) {
        await api.adminUpdateProduct(editingId, {
          name: form.name, category: form.category, description: form.description,
          pricePence: Number(form.pricePence), imageUrl: null, stockQty: Number(form.stockQty),
          availability: form.availability, availabilityNote: form.availabilityNote,
        }, token);
      } else {
        await api.adminCreateProduct({
          sku: form.sku, name: form.name, slug: form.slug || slugify(form.name), category: form.category,
          description: form.description, pricePence: Number(form.pricePence), stockQty: Number(form.stockQty),
          availability: form.availability, availabilityNote: form.availabilityNote,
        }, token);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.adminDeleteProduct(id, token);
    load();
  }

  const filteredProducts = products.filter((p) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-panel">
      <form className="checkout-form admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
        <div className="form-row">
          <input placeholder="SKU" required disabled={!!editingId} value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Price (£)" required
            value={form.pricePence ? (form.pricePence / 100).toString() : ''}
            onChange={(e) => setForm((f) => ({ ...f, pricePence: Math.round(Number(e.target.value) * 100) }))} />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input type="number" placeholder="Stock quantity" value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))} />

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

        {error && <p style={{ color: 'var(--pepper)' }}>{error}</p>}
        <div className="form-row">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}</button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="admin-table">
        <div className="admin-search-row">
          <input
            type="search"
            placeholder="Search products by name, SKU, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          {search && <span className="muted admin-search-count">{filteredProducts.length} of {products.length}</span>}
        </div>
        <table>
          <thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-thumb">
                    {p.image_url ? <img src={resolveImageUrl(p.image_url)} alt="" /> : <span>—</span>}
                  </div>
                </td>
                <td>{p.name} {p.is_placeholder && <span className="badge badge-placeholder">Sample</span>}</td>
                <td className="muted">{p.category}</td>
                <td>{formatPence(p.price_pence)}</td>
                <td>{p.stock_qty}</td>
                <td>
                  {p.availability === 'out_of_stock' && <span className="badge badge-outofstock">Out of Stock</span>}
                  {p.availability === 'preorder' && <span className="badge badge-preorder">Preorder</span>}
                  {(!p.availability || p.availability === 'in_stock') && <span className="badge badge-instock">In Stock</span>}
                </td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setImageManagerProduct(p)}>Media</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setVariantManagerProduct(p)}>Variants</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => startEdit(p)}>Edit</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5, color: 'var(--pepper)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ padding: '20px 12px' }}>No products match "{search}".</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {imageManagerProduct && (
        <ProductImageManager
          product={imageManagerProduct}
          onClose={() => setImageManagerProduct(null)}
          onChanged={load}
        />
      )}

      {variantManagerProduct && (
        <ProductVariantManager
          product={variantManagerProduct}
          onClose={() => setVariantManagerProduct(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
