import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { formatPence } from '../../format';
import { resolveImageUrl } from '../../imageUrl';
import ProductImageManager from '../../components/ProductImageManager';
import ProductVariantManager from '../../components/ProductVariantManager';
import ProductEditModal from '../../components/ProductEditModal';
import AddProductModal from '../../components/AddProductModal';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [imageManagerProduct, setImageManagerProduct] = useState(null);
  const [variantManagerProduct, setVariantManagerProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  function load() {
    api.adminProducts().then(setProducts).catch(() => {});
  }
  useEffect(load, []);

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
    <div>
      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Product</button>
      </div>

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
          <thead><tr><th></th><th>Product</th><th>Category</th><th>Weight</th><th>Stock</th><th>Status</th><th></th></tr></thead>
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
                {/* <td>{p.price_pence != null ? formatPence(p.price_pence) : <span className="muted">Via variants</span>}</td> */}
                <td className="muted">
                  {p.weight_grams ? `${(p.weight_grams / 1000).toString()}kg` : (
                    p.availability === 'preorder' ? <span style={{ color: 'var(--pepper)' }}>Not set</span> : '—'
                  )}
                </td>
                <td>{p.stock_qty}</td>
                <td>
                  {p.availability === 'out_of_stock' && <span className="badge badge-outofstock">Out of Stock</span>}
                  {p.availability === 'preorder' && <span className="badge badge-preorder">Preorder</span>}
                  {(!p.availability || p.availability === 'in_stock') && <span className="badge badge-instock">In Stock</span>}
                </td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setImageManagerProduct(p)}>Images</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setVariantManagerProduct(p)}>Variants</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }} onClick={() => setEditProduct(p)}>Edit</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5, color: 'var(--pepper)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={8} className="muted" style={{ padding: '20px 12px' }}>No products match "{search}".</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onChanged={load}
        />
      )}

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

      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
