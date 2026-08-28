import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Fats, Oils & Butters', 'Heritage Botanicals', 'Natural Sweeteners', 'Snacks & Dry Foods', 'Protein', 'Bush Meat', 'Spices & Seasonings', 'Fresh Produce', 'Hair & Beauty'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category !== 'All') params.category = category;
    if (search) params.search = search;
    api.getProducts(params).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [category, search]);

  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">Shop</div>
          <h2>The full Ecopadi pantry.</h2>
          <p>Browse by category, or search for what you're craving.</p>
        </div>

        <div className="shop-toolbar">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shop-search"
          />
          <div className="cat-filters">
            {CATEGORIES.map((c) => (
              <button key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="muted">No products found. Try a different search or category.</p>
        ) : (
          <div className="cat-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}
