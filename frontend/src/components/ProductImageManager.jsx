import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { resolveImageUrl } from '../imageUrl';

export default function ProductImageManager({ product, onClose, onChanged }) {
  const { token } = useAuth();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function load() {
    api.adminGetProductImages(product.id, token).then(setImages).catch(() => {});
  }
  useEffect(load, [product.id]);

  async function handleFiles(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await api.adminUploadProductImages(product.id, files, token);
      load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSetThumbnail(imageId) {
    await api.adminSetThumbnail(product.id, imageId, token);
    load();
    onChanged?.();
  }

  async function handleDelete(imageId) {
    await api.adminDeleteProductImage(product.id, imageId, token);
    load();
    onChanged?.();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Images — {product.name}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label className="upload-dropzone">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            hidden
          />
          <span>{uploading ? 'Uploading…' : '📷 Click to upload images (JPG, PNG, WEBP — up to 8MB each)'}</span>
        </label>
        {error && <p style={{ color: 'var(--pepper)', marginTop: 10 }}>{error}</p>}

        {images.length === 0 ? (
          <p className="muted" style={{ marginTop: 20 }}>No images yet. Upload one to get started — the first image you add becomes the thumbnail automatically.</p>
        ) : (
          <div className="image-grid">
            {images.map((img) => (
              <div className={`image-tile ${img.is_thumbnail ? 'is-thumb' : ''}`} key={img.id}>
                <img src={resolveImageUrl(img.url)} alt="" />
                {img.is_thumbnail && <span className="thumb-badge">Thumbnail</span>}
                <div className="image-tile-actions">
                  {!img.is_thumbnail && (
                    <button onClick={() => handleSetThumbnail(img.id)}>Set as thumbnail</button>
                  )}
                  <button className="danger" onClick={() => handleDelete(img.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
