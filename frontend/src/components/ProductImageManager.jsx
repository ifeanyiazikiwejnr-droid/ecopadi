import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { resolveImageUrl } from '../imageUrl';

const GENERAL_KEY = '__general__';

export default function ProductImageManager({ product, onClose, onChanged }) {
  const { token } = useAuth();
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [uploadVariantId, setUploadVariantId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function load() {
    api.adminGetProductImages(product.id, token).then(setImages).catch(() => {});
    api.adminGetVariants(product.id, token).then(setVariants).catch(() => {});
  }
  useEffect(load, [product.id]);

  async function handleFiles(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await api.adminUploadProductImages(product.id, files, token, uploadVariantId || null);
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

  async function handleSetVariant(imageId, variantId) {
    await api.adminSetImageVariant(product.id, imageId, variantId || null, token);
    load();
  }

  async function handleDelete(imageId) {
    await api.adminDeleteProductImage(product.id, imageId, token);
    load();
    onChanged?.();
  }

  // Group images by variant so e.g. every "Head" photo sits together,
  // separate from "Leg" photos — "General" images (no variant assigned)
  // show for every option and get their own group too.
  const groups = [];
  const generalImages = images.filter((img) => !img.variant_id);
  if (generalImages.length > 0 || variants.length === 0) {
    groups.push({ key: GENERAL_KEY, label: variants.length > 0 ? 'General (shown for every option)' : 'All images', images: generalImages });
  }
  for (const v of variants) {
    groups.push({ key: v.id, label: v.value, images: images.filter((img) => img.variant_id === v.id) });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Images — {product.name}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        {variants.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <label className="field-label" htmlFor="upload-variant-select">
              File new uploads under
            </label>
            <select
              id="upload-variant-select"
              className="branded-select"
              value={uploadVariantId}
              onChange={(e) => setUploadVariantId(e.target.value)}
            >
              <option value="">General (shown for every option)</option>
              {variants.map((v) => <option key={v.id} value={v.id}>{v.value}</option>)}
            </select>
          </div>
        )}

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
          groups.map((group) => (
            <div key={group.key} className="image-group">
              <h4 className="image-group-label">
                {group.label} <span className="muted" style={{ fontWeight: 400, fontSize: 12.5 }}>({group.images.length})</span>
              </h4>
              {group.images.length === 0 ? (
                <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>No images filed here yet.</p>
              ) : (
                <div className="image-grid">
                  {group.images.map((img) => (
                    <div className={`image-tile ${img.is_thumbnail ? 'is-thumb' : ''}`} key={img.id}>
                      <img src={resolveImageUrl(img.url)} alt="" />
                      {img.is_thumbnail && <span className="thumb-badge">Thumbnail</span>}
                      <div className="image-tile-actions">
                        {!img.is_thumbnail && (
                          <button onClick={() => handleSetThumbnail(img.id)}>Set as thumbnail</button>
                        )}
                        {variants.length > 0 && (
                          <select
                            value={img.variant_id || ''}
                            onChange={(e) => handleSetVariant(img.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">General</option>
                            {variants.map((v) => <option key={v.id} value={v.id}>{v.value}</option>)}
                          </select>
                        )}
                        <button className="danger" onClick={() => handleDelete(img.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
