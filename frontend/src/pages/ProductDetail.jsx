import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { formatPence } from '../format';
import { resolveImageUrl } from '../imageUrl';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', reviewerName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  function load() {
    api.getProduct(slug).then((p) => {
      setProduct(p);
      setVariant(p.variants?.[0] || null);
      const thumb = p.images?.find((img) => img.is_thumbnail) || p.images?.[0];
      setActiveImage(thumb || null);
    }).catch(() => setProduct(null));
  }

  useEffect(() => { load(); }, [slug]);

  if (!product) return <div className="wrap section"><p className="muted">Loading…</p></div>;

  const price = product.price_pence + (variant?.price_delta_pence || 0);

  async function handleAddToCart() {
    addItem(product, variant, quantity);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitReview({ productId: product.id, ...reviewForm });
      setNotice('Thanks — your review has been posted.');
      setReviewForm({ rating: 5, comment: '', reviewerName: '' });
      load();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="wrap">
        <Link to="/shop" className="muted" style={{ fontSize: 14, fontWeight: 700 }}>← Back to Shop</Link>

        <div className="pdp-grid">
          <div>
            <div className="pdp-image">
              {product.is_placeholder && <span className="badge badge-placeholder" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>Sample product — replace with real listing</span>}
              {activeImage ? (
                <img src={resolveImageUrl(activeImage.url)} alt={product.name} />
              ) : (
                <span className="pdp-emoji">🛒</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="pdp-thumb-strip">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    className={`pdp-thumb ${activeImage?.id === img.id ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    aria-label="View image"
                  >
                    <img src={resolveImageUrl(img.url)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="eyebrow">{product.category}</div>
            <h1 style={{ fontSize: 34, margin: '10px 0' }}>{product.name}</h1>
            {product.review_count > 0 && (
              <div className="stars">{'★'.repeat(Math.round(product.avg_rating))}{'☆'.repeat(5 - Math.round(product.avg_rating))} <span className="muted">({product.review_count} reviews)</span></div>
            )}
            <div className="pdp-price">{formatPence(price)}</div>
            {product.availability === 'out_of_stock' && <span className="badge badge-outofstock" style={{ marginBottom: 12, display: 'inline-block' }}>Out of Stock</span>}
            {product.availability === 'preorder' && <span className="badge badge-preorder" style={{ marginBottom: 12, display: 'inline-block' }}>Available on Preorder</span>}
            {product.availability_note && (product.availability === 'out_of_stock' || product.availability === 'preorder') && (
              <p className="availability-note">{product.availability_note}</p>
            )}

            {product.availability === 'preorder' && (
              <div className="preorder-info-panel">
                <h4>How Preorder Works</h4>
                <p><strong>Minimum order: 10kg.</strong> Preorder items are sourced in bulk, so orders must total 10kg or more.</p>
                <p>
                  You don't need 10kg of this one item — mix and match with any of our other preorder items to reach
                  the minimum together. For example: egusi (melon seed), ogbono, goat meat, catfish, snail, and more.
                </p>
                <p>
                  <strong>Choose your protein form:</strong> for protein items, order them however you prefer —
                  fresh frozen or smoked/dried. Select your preference from the options on this page where available,
                  or let us know in your order.
                </p>
              </div>
            )}

            <p className="muted" style={{ margin: '18px 0', lineHeight: 1.7 }}>{product.description}</p>

            {product.variants?.length > 0 && (
              <div className="variant-picker">
                <label className="eyebrow" htmlFor="variant-select" style={{ marginBottom: 8, display: 'block' }}>{product.variants[0].name}</label>
                <select
                  id="variant-select"
                  className="variant-select"
                  value={variant?.id || ''}
                  onChange={(e) => setVariant(product.variants.find((v) => v.id === e.target.value))}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.value}{v.price_delta_pence > 0 ? ` (+${formatPence(v.price_delta_pence)})` : v.price_delta_pence < 0 ? ` (−${formatPence(Math.abs(v.price_delta_pence))})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="qty-row">
              <div className="qty-controls">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.availability === 'out_of_stock'}>
                {product.availability === 'out_of_stock' ? 'Out of Stock' : product.availability === 'preorder' ? 'Preorder Now' : 'Add to Basket'}
              </button>
            </div>
          </div>
        </div>

        {product.nutrition?.items?.length > 0 && (
          <div className="nutrition-section">
            <h3 style={{ marginBottom: 6 }}>Nutritional Value</h3>
            <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>{product.nutrition.basis}</p>
            <div className="nutrition-table">
              {product.nutrition.items.map((n) => (
                <div className="nutrition-row" key={n.label}>
                  <span>{n.label}</span>
                  <strong>{n.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="reviews-section">
          <h3 style={{ marginBottom: 20 }}>Reviews</h3>
          {product.reviews?.length ? (
            <div className="review-list">
              {product.reviews.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <strong>{r.reviewer_name}</strong>
                  {r.comment && <p className="muted">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No reviews yet — be the first.</p>
          )}

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h4>Leave a review</h4>
            <div className="form-row">
              <input placeholder="Your name" required value={reviewForm.reviewerName} onChange={(e) => setReviewForm((f) => ({ ...f, reviewerName: e.target.value }))} />
              <select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <textarea placeholder="What did you think?" value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} />
            <button className="btn btn-dark" type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post Review'}</button>
            {notice && <p className="muted" style={{ marginTop: 10 }}>{notice}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
