export const getUserIdFromToken = (): number | null => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // JWT token is split into three parts by dots
    const payload = token.split('.')[1];
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}; 