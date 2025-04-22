/**
 * Generic function to export table data to CSV
 * @param data Array of objects to export
 * @param filename Name of the CSV file (without extension)
 * @param headers Optional custom headers mapping. If not provided, object keys will be used
 * @param excludeFields Optional array of field names to exclude from export
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>,
  excludeFields?: string[]
): void => {
  if (!data.length) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Filter out excluded fields
  const filteredKeys = excludeFields 
    ? allKeys.filter(key => !excludeFields.includes(key))
    : allKeys;

  // Create CSV header row
  const headerRow = filteredKeys.map(key => 
    headers?.[key] || key
  ).join(',');

  // Create CSV data rows
  const csvRows = data.map(item => {
    return filteredKeys
      .map(key => {
        const value = item[key];
        // Handle different data types
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        // Escape commas and quotes in string values
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  // Combine header and data rows
  const csvContent = [headerRow, ...csvRows].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 