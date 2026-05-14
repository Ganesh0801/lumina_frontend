/**
 * Resolves a product image URL.
 * - If the src is already absolute (http/https) return as-is.
 * - If it's a relative path (e.g. /uploads/product-xxx.jpg) prepend the backend base URL.
 */
const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

export default function resolveImg(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}
