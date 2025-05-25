import jsPDF from 'jspdf';

interface LabelData {
  preparedBy: string;
  itemName: string;
  batchNumber: string;
  quantity: string;
  producedOn: string;
  bestBefore: string;
}

export function drawRecipeLabelOnDoc(doc: jsPDF, data: LabelData, opts?: { marginX?: number, marginY?: number, labelWidth?: number, labelHeight?: number, visualOffset?: number }) {
  // Defaults for label size and position
  const labelWidth = opts?.labelWidth ?? 120;
  const labelHeight = opts?.labelHeight ?? 60;
  const marginX = opts?.marginX ?? 5;
  const marginY = opts?.marginY ?? (doc.internal.pageSize.getHeight() - labelHeight - 5);
  const visualOffset = opts?.visualOffset ?? -10;

  // Add logo
  const logoWidth = 25;
  const logoHeight = 12;
  const logoX = marginX + (labelWidth - logoWidth) / 2 + visualOffset;
  const logoY = marginY;
  const logoPath = '/assets/images/logo.png';
  doc.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Set font for title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const title = 'RECIPE LABEL';
  const titleWidth = doc.getStringUnitWidth(title) * 11 / doc.internal.scaleFactor;
  const titleX = marginX + (labelWidth - titleWidth) / 2 + visualOffset;
  doc.text(title, titleX, logoY + logoHeight + 5);

  // Add prepared by
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const preparedByText = `Prepared By: ${data.preparedBy}`;
  const preparedByWidth = doc.getStringUnitWidth(preparedByText) * 9 / doc.internal.scaleFactor;
  const preparedByX = marginX + (labelWidth - preparedByWidth) / 2 + visualOffset;
  doc.text(preparedByText, preparedByX, logoY + logoHeight + 10);

  // Set smaller font size for content
  doc.setFontSize(9);
  const startY = logoY + logoHeight + 15;
  const lineHeight = 5;
  const col1X = marginX + 2;
  const col2X = marginX + 40;
  let currentY = startY;
  const addRow = (label: string, value: string, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, col2X, y);
  };
  addRow('Item Name:', data.itemName, currentY);
  currentY += lineHeight + 1;
  addRow('Batch Number:', data.batchNumber, currentY);
  currentY += lineHeight + 1;
  addRow('Quantity:', data.quantity, currentY);
  currentY += lineHeight + 1;
  addRow('Produced On:', data.producedOn, currentY);
  currentY += lineHeight + 1;
  addRow('Best Before:', data.bestBefore, currentY);
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
  const labelWidth = 120;
  const labelHeight = 60;
  const marginX = 5;
  const marginY = pageHeight - labelHeight - 5;
  const visualOffset = -10;
  drawRecipeLabelOnDoc(doc, data, { marginX, marginY, labelWidth, labelHeight, visualOffset });
  return doc;
};