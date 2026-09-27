const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
  return data;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),

  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  joinVip: (token) => request('/auth/vip/join', { method: 'POST', token }),

  // Reviews
  submitReview: (payload) => request('/reviews', { method: 'POST', body: payload }),

  // Discounts
  validateDiscount: (payload) => request('/discounts/validate', { method: 'POST', body: payload }),

  // Checkout / orders
  checkout: (payload, token) => request('/checkout', { method: 'POST', body: payload, token }),
  rewardSettings: () => request('/reward-settings'),
  preorderSettings: () => request('/preorder-settings'),
  bannerSlides: () => request('/banner-slides'),
  categories: () => request('/categories'),
  myOrders: (token) => request('/orders/mine', { token }),
  orderDetail: (orderNumber, token) => request(`/orders/${orderNumber}`, { token }),
  lookupOrder: (payload) => request('/orders/lookup', { method: 'POST', body: payload }),

  // Payments
  createStripeSession: (orderNumber) => request('/payments/stripe/create-session', { method: 'POST', body: { orderNumber } }),

  // Admin
  adminSummary: (token) => request('/admin/summary', { token }),
  adminCustomers: (token) => request('/admin/customers', { token }),
  adminProducts: () => request('/products'),
  adminCreateProduct: (payload, token) => request('/admin/products', { method: 'POST', body: payload, token }),
  adminUpdateProduct: (id, payload, token) => request(`/admin/products/${id}`, { method: 'PUT', body: payload, token }),
  adminDeleteProduct: (id, token) => request(`/admin/products/${id}`, { method: 'DELETE', token }),
  adminOrders: (token) => request('/admin/orders', { token }),
  adminPreorders: (token) => request('/admin/preorders', { token }),
  adminUpdateOrderStatus: (id, status, token) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
  adminGetRewardSettings: (token) => request('/admin/reward-settings', { token }),
  adminUpdateRewardSettings: (payload, token) => request('/admin/reward-settings', { method: 'PUT', body: payload, token }),
  adminGetPreorderSettings: (token) => request('/admin/preorder-settings', { token }),
  adminUpdatePreorderSettings: (payload, token) => request('/admin/preorder-settings', { method: 'PUT', body: payload, token }),

  // Product images — separate from `request()` because file uploads use
  // multipart/form-data, not JSON.
  adminGetProductImages: (productId, token) =>
    request(`/admin/products/${productId}/images`, { token }),
  adminUploadProductImages: async (productId, files, token) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    const res = await fetch(`${API_URL}/admin/products/${productId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed.');
    return data;
  },
  adminSetThumbnail: (productId, imageId, token) =>
    request(`/admin/products/${productId}/images/${imageId}/thumbnail`, { method: 'PUT', token }),
  adminDeleteProductImage: (productId, imageId, token) =>
    request(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE', token }),

  adminGetVariants: (productId, token) => request(`/admin/products/${productId}/variants`, { token }),
  adminCreateVariant: (productId, payload, token) =>
    request(`/admin/products/${productId}/variants`, { method: 'POST', body: payload, token }),
  adminUpdateVariant: (productId, variantId, payload, token) =>
    request(`/admin/products/${productId}/variants/${variantId}`, { method: 'PUT', body: payload, token }),
  adminDeleteVariant: (productId, variantId, token) =>
    request(`/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE', token }),
  adminDiscounts: (token) => request('/admin/discounts', { token }),
  adminCreateDiscount: (payload, token) => request('/admin/discounts', { method: 'POST', body: payload, token }),

  // Shop banner slider — file uploads use multipart/form-data, not JSON.
  adminGetBannerSlides: (token) => request('/admin/banner-slides', { token }),
  adminCreateBannerSlide: async ({ file, linkUrl, title }, token) => {
    const formData = new FormData();
    formData.append('image', file);
    if (linkUrl) formData.append('linkUrl', linkUrl);
    if (title) formData.append('title', title);
    const res = await fetch(`${API_URL}/admin/banner-slides`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed.');
    return data;
  },
  adminUpdateBannerSlide: async (id, { file, linkUrl, title, active }, token) => {
    const formData = new FormData();
    if (file) formData.append('image', file);
    if (linkUrl !== undefined) formData.append('linkUrl', linkUrl || '');
    if (title !== undefined) formData.append('title', title || '');
    if (active !== undefined) formData.append('active', String(active));
    const res = await fetch(`${API_URL}/admin/banner-slides/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Update failed.');
    return data;
  },
  adminReorderBannerSlides: (order, token) =>
    request('/admin/banner-slides/reorder', { method: 'PUT', body: { order }, token }),
  adminDeleteBannerSlide: (id, token) => request(`/admin/banner-slides/${id}`, { method: 'DELETE', token }),

  // Categories
  adminGetCategories: (token) => request('/admin/categories', { token }),
  adminCreateCategory: (name, token) => request('/admin/categories', { method: 'POST', body: { name }, token }),
  adminUpdateCategory: (id, name, token) => request(`/admin/categories/${id}`, { method: 'PUT', body: { name }, token }),
  adminDeleteCategory: (id, token) => request(`/admin/categories/${id}`, { method: 'DELETE', token }),
  adminReorderCategories: (order, token) => request('/admin/categories/reorder', { method: 'PUT', body: { order }, token }),
};
