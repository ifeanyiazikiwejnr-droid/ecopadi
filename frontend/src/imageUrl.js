const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

// Uploaded images come back from the backend as relative paths like
// "/uploads/169...-abc.jpg" — this turns that into a full URL pointing at
// wherever the backend is actually hosted.
export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_ORIGIN}${url}`;
}
