/**
 * Resolves an image path to an absolute URL pointing to the Backend API
 * if it represents an uploaded or stored asset.
 *
 * @param {string|null|undefined} url - The image URL or relative path
 * @param {string} fallback - The fallback image path
 * @returns {string}
 */
export const resolveImageUrl = (url, fallback = '/images/courses/Course 3.jpg') => {
  if (!url) return fallback;
  const clean = String(url).replace(/\\/g, '/').trim();
  if (!clean) return fallback;

  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const backendBase = apiUrl.replace(/\/api\/?$/, '');

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    const path = clean.startsWith('/') ? clean : `/${clean}`;
    return backendBase ? `${backendBase}${path}` : path;
  }

  if (clean.startsWith('/storage/') || clean.startsWith('storage/')) {
    const path = clean.startsWith('/') ? clean : `/${clean}`;
    return backendBase ? `${backendBase}${path}` : path;
  }

  if (clean.startsWith('/images/')) return clean;
  if (clean.startsWith('images/')) return `/${clean}`;

  return clean.startsWith('/') ? clean : `/${clean}`;
};

export default resolveImageUrl;
