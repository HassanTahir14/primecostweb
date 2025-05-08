import jsPDF from 'jspdf';

/**
 * Generic function to export table data to PDF (styled report)
 * @param data Array of objects to export
 * @param filename Name of the PDF file (without extension)
 * @param header Title/header for the report
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

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 40;
  let pageNum = 1;
  const footer = (num: number) => {
    doc.setFontSize(10);
    doc.text(`Page ${num}`, pageWidth - 60, pageHeight - 20);
  };

  // Draw logo
  const logoImg = new Image();
  logoImg.src = '/logo.png';
  logoImg.onload = () => {
    doc.addImage(logoImg, 'PNG', 30, 20, 50, 50);
    // Header
    doc.setFontSize(22);
    doc.text('Report', pageWidth / 2, 50, { align: 'center' });
    // Date
    doc.setFontSize(12);
    const dateStr = `Date: ${new Date().toISOString().slice(0, 10)}`;
    doc.text(dateStr, pageWidth - 120, 35);
    y = 80;

    // Get all unique keys from all objects
    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    );
    // Filter out excluded fields
    const filteredKeys = excludeFields 
      ? allKeys.filter(key => !excludeFields.includes(key))
      : allKeys;

    // For each record, draw a box and key-value pairs
    data.forEach((item, idx) => {
      const boxTop = y;
      let boxHeight = 30 + filteredKeys.length * 22;
      if (boxTop + boxHeight > pageHeight - 40) {
        footer(pageNum);
        doc.addPage();
        pageNum++;
        y = 40;
      }
      // Draw box
      doc.setDrawColor(180);
      doc.roundedRect(30, y, pageWidth - 60, boxHeight, 8, 8);
      let textY = y + 22;
      filteredKeys.forEach(key => {
        const label = headers?.[key] || key;
        let value = item[key];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'object') value = JSON.stringify(value);
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 45, textY);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 180, textY);
        textY += 20;
      });
      y += boxHeight + 18;
    });

    // Footer for the last page
    footer(pageNum);
    doc.save(`${filename}.pdf`);
  };
}; 