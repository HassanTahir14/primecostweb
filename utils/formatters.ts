export const formatPositionName = (position: string): string => {
  if (!position) return '';
  
  // Convert position to title case and replace underscores with spaces
  return position
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 