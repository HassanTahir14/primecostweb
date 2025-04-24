export const getImageUrlWithAuth = (path: string) => {
  if (!path) return '/placeholder-image.svg';

  if (path.startsWith('http')) return path;

  // Proxy image path through Vercel
  return `/images-proxy/${path}`;
};
