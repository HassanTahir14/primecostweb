export const getImageUrlWithAuth = (path: string, baseUrl?: string) => {
  // We no longer need to get the token here as it will be added via headers
  //  const imageBaseUrl = baseUrl || process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';
  const imageBaseUrl = '/images-proxy'
  if (!path) return '/placeholder-image.svg';
  
  // If the path is already a full URL, return it without token
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct the full URL without token
  return `${imageBaseUrl}/${path}`;
}; 