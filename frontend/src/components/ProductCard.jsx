import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../imageUrl';
import { formatPence } from '../format';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function ProductCard({ product }) {
  const isNew = product.created_at && Date.now() - new Date(product.created_at).getTime() < THIRTY_DAYS
    && !product.availability?.match(/out_of_stock|preorder/);
  const rating = Math.round(product.avg_rating || 0);

  return (
    <Link to={`/shop/${product.slug}`} className="card product-card">
      <div className="product-thumb">
        {product.image_url && <img src={resolveImageUrl(product.image_url)} alt={product.name} />}
        {product.availability === 'out_of_stock' && <span className="badge badge-outofstock">Out of Stock</span>}
        {product.availability === 'preorder' && <span className="badge badge-preorder">Preorder</span>}
        {isNew && <span className="badge badge-new">New</span>}
      </div>
      <div className="product-body">
        {product.review_count > 0 && (
          <div className="product-rating">
            <span className="stars-inline">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>({product.review_count})
          </div>
        )}
        <h3>{product.name}</h3>
        {product.price_pence != null && <div className="product-price">{formatPence(product.price_pence)}</div>}
      </div>
    </Link>
  );
}
