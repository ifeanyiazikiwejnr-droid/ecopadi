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
  myOrders: (token) => request('/orders/mine', { token }),
  orderDetail: (orderNumber, token) => request(`/orders/${orderNumber}`, { token }),
  lookupOrder: (payload) => request('/orders/lookup', { method: 'POST', body: payload }),

  // Payments
  createStripeSession: (orderNumber) => request('/payments/stripe/create-session', { method: 'POST', body: { orderNumber } }),

  // Admin
  adminSummary: (token) => request('/admin/summary', { token }),
  adminProducts: () => request('/products'),
  adminCreateProduct: (payload, token) => request('/admin/products', { method: 'POST', body: payload, token }),
  adminUpdateProduct: (id, payload, token) => request(`/admin/products/${id}`, { method: 'PUT', body: payload, token }),
  adminDeleteProduct: (id, token) => request(`/admin/products/${id}`, { method: 'DELETE', token }),
  adminOrders: (token) => request('/admin/orders', { token }),
  adminPreorders: (token) => request('/admin/preorders', { token }),
  adminUpdateOrderStatus: (id, status, token) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status }, token }),

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
  adminDeleteVariant: (productId, variantId, token) =>
    request(`/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE', token }),
  adminDiscounts: (token) => request('/admin/discounts', { token }),
  adminCreateDiscount: (payload, token) => request('/admin/discounts', { method: 'POST', body: payload, token }),
};
