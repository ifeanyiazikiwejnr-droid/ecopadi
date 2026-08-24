import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../imageUrl';
import { formatPence } from '../format';

export default function ProductCard({ product }) {
  return (
    <Link to={`/shop/${product.slug}`} className="card product-card">
      <div className="product-thumb">
        {product.image_url && <img src={resolveImageUrl(product.image_url)} alt={product.name} />}
        {product.availability === 'out_of_stock' && <span className="badge badge-outofstock">Out of Stock</span>}
        {product.availability === 'preorder' && <span className="badge badge-preorder">Preorder</span>}
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <div className="product-price">{formatPence(product.price_pence)}</div>
      </div>
    </Link>
  );
}
