import jsPDF from 'jspdf';

interface LabelData {
  preparedBy: string;
  itemName: string;
  batchNumber: string;
  quantity: string;
  producedOn: string;
  bestBefore: string;
}

export const generateRecipeLabel = async (data: LabelData) => {
  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;

  // Label dimensions and position (bottom left corner)
  const labelWidth = 120; // More landscape oriented
  const labelHeight = 60; // Reduced height
  const marginX = 5; // Minimal left margin
  const marginY = pageHeight - labelHeight - 5; // Minimal bottom margin

  // Visual adjustment factor for centered elements
  const visualOffset = -10; // Shift left by 10mm for better visual balance

  // Add logo
  const logoWidth = 25; // Reduced logo width
  const logoHeight = 12; // Reduced logo height
  // Center logo horizontally with visual adjustment
  const logoX = marginX + (labelWidth - logoWidth) / 2 + visualOffset;
  const logoY = marginY;
  
  // Add logo image
  const logoPath = '/assets/images/logo.png';
  doc.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Set font for title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  
  // Add title (centered with visual adjustment)
  const title = 'RECIPE LABEL';
  const titleWidth = doc.getStringUnitWidth(title) * 11 / doc.internal.scaleFactor;
  const titleX = marginX + (labelWidth - titleWidth) / 2 + visualOffset;
  doc.text(title, titleX, logoY + logoHeight + 5);

  // Add prepared by (centered with visual adjustment)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const preparedByText = `Prepared By: ${data.preparedBy}`;
  const preparedByWidth = doc.getStringUnitWidth(preparedByText) * 9 / doc.internal.scaleFactor;
  const preparedByX = marginX + (labelWidth - preparedByWidth) / 2 + visualOffset;
  doc.text(preparedByText, preparedByX, logoY + logoHeight + 10);

  // Set smaller font size for content
  doc.setFontSize(9);
  
  // Add content with proper spacing
  const startY = logoY + logoHeight + 15;
  const lineHeight = 5;
  const col1X = marginX + 2;
  const col2X = marginX + 40; // Adjusted for better alignment

  let currentY = startY;

  // Helper function to add a row with bold label
  const addRow = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, col2X, y);
  };

  // Add all rows (except Prepared By which is already added above)
  addRow('Item Name:', data.itemName, currentY);
  currentY += lineHeight + 1;
  
  addRow('Batch Number:', data.batchNumber, currentY);
  currentY += lineHeight + 1;
  
  addRow('Quantity:', data.quantity, currentY);
  currentY += lineHeight + 1;
  
  addRow('Produced On:', data.producedOn, currentY);
  currentY += lineHeight + 1;
  
  addRow('Best Before:', data.bestBefore, currentY);

  return doc;
}; 