import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DetailFieldConfig } from '@/components/common/GenericDetailPage';
import { getImageUrlWithAuth } from '@/utils/imageUtils';

// No need for the custom type declaration since we're importing properly
// and using the plugin directly

// Function to safely extract text from any content
const extractTextContent = (value: any): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    
    // Handle simple arrays
    if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
      return value.join(', ');
    }
    
    // For complex arrays
    return `${value.length} items`;
  }
  
  if (typeof value === 'object') {
    // Try to determine if it's a React element or complex object
    return 'Complex data (see web view)';
  }
  
  return 'N/A';
};

// Add this helper function at the top with other helpers
const splitTextIntoLines = (text: string, maxWidth: number, doc: jsPDF): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // If a single word is too long, split it
        const chars = word.split('');
        let tempLine = '';
        chars.forEach(char => {
          const testCharLine = tempLine + char;
          if (doc.getTextWidth(testCharLine) > maxWidth) {
            lines.push(tempLine);
            tempLine = char;
          } else {
            tempLine += char;
          }
        });
        currentLine = tempLine;
      }
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

// Add this helper function near the top, after extractTextContent and splitTextIntoLines
const sanitize = (str: any) =>
  String(str || '')
    .replace(/[\r\n]+/g, ' ') // Remove line breaks
    .replace(/[^\x20-\x7E]+/g, '') // Remove non-printable characters
    .trim();

export const generateDetailPDF = async (
  title: string,
  data: any,
  fieldConfig: DetailFieldConfig[],
  logoPath: string = '/assets/images/logo.png',
  imageKey?: string, 
  imageBaseUrl?: string,
  branchDetails?: any[],
  purchaseOrders?: any[],
  ingredients?: any[],
  procedures?: any[],
  isAdmin?: boolean
) => {
  ingredients = Array.isArray(ingredients) ? ingredients : [];
  procedures = Array.isArray(procedures) ? procedures : [];
  // console.log('ingredients', ingredients);
  console.log('procedures', procedures);

  console.log('branchDetails', branchDetails);
  console.log('purchaseOrders', purchaseOrders);
  // Check if we have authentication token for images
  let authToken = '';
  try {
    // Use the same key as imageUtils
    authToken = localStorage.getItem('authToken') || '';
    if (!authToken) {
      // Fallback to checking authUser if needed
      const authUserStr = localStorage.getItem('authUser');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        authToken = authUser.token || '';
        // Store it in the correct key for future use
        if (authToken) {
          localStorage.setItem('authToken', authToken);
        }
      }
    }
    console.log('Auth token available:', !!authToken);
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add title
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  doc.text(title, 14, 22);
  
  // Process field data in a format we can use for the report
  const processedFields = fieldConfig
    .filter(field => data && (data[field.key] !== undefined || field.render))
    .map(field => {
      const rawValue = field.key.split('.').reduce((o, k) => (o || {})[k], data);
      let value: string;
      
      // Use render function if provided
      if (field.render && data) {
        try {
          const rendered = field.render(rawValue, data);
          
          if (typeof rendered === 'string' || typeof rendered === 'number' || typeof rendered === 'boolean') {
            value = String(rendered);
          } else {
            // Try to extract text content from React element or complex object
            value = extractTextContent(rawValue);
          }
        } catch (error) {
          console.error(`Error rendering field ${field.key}:`, error);
          value = 'Error rendering value';
        }
      } else {
        // Use the raw value but convert it to a readable format
        value = extractTextContent(rawValue);
      }
      
      return { label: field.label, value };
    });
  
  // Check if the data has branch details
  const hasBranchDetails = data && data.branchDetails && Array.isArray(data.branchDetails) && data.branchDetails.length > 0;
  
  // Check if data has images
  const hasImages = imageKey && data && data[imageKey] && Array.isArray(data[imageKey]) && data[imageKey].length > 0;
  
  // Function to generate PDF content
  const generateContent = async (hasLogo = false) => {
    // Set starting y position based on whether logo is present
    let yPos = hasLogo ? 60 : 40; // Increased spacing when logo is present
    
    // Try to add product images if available
    if (hasImages) {
      const images = data[imageKey];
      
      // Skip image section if we can't show images
      if (images.length > 0) {
        // Add images header
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('Images', 14, yPos);
        yPos += 8;
        
        // Draw a light gray line under the header
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, yPos, pageWidth - 14, yPos);
        yPos += 10;

        // Calculate image dimensions
        const maxImageWidth = pageWidth - 28; // Full width minus margins
        const maxImageHeight = 60; // Maximum height for each image
        const imagesPerRow = Math.min(2, images.length); // Show max 2 images per row
        const imageWidth = 80; // Fixed width in mm (approximately 3.15 inches)
        const imageGap = 10; // Gap between images
        
        // Function to load an image and return a promise
        const loadImage = (path: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            // Use the same image proxy as the rest of the application
            const imageUrl = getImageUrlWithAuth(path);
            const authToken = localStorage.getItem('authToken');
            console.log('Fetching image from:', imageUrl);
            
            fetch(imageUrl, {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.blob();
            })
            .then(blob => {
              // Convert blob to base64
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            })
            .then(base64data => {
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              
              img.onload = () => {
                console.log('Image loaded successfully:', path, 'Size:', img.width, 'x', img.height);
                resolve(img);
              };
              
              img.onerror = (error) => {
                console.error('Error loading image:', path, error);
                reject(new Error(`Failed to load image: ${path}`));
              };
              
              img.src = base64data as string;
            })
            .catch(error => {
              console.error('Error fetching image:', path, error);
              reject(error);
            });
          });
        };

        // Load all images first
        console.log('Starting to load images:', images);
        const imagePromises = images.map((img: { path: string }) => {
          console.log('Processing image path:', img.path);
          return loadImage(img.path);
        });

        try {
          console.log('Waiting for all images to load...');
          const loadedImages = await Promise.all(imagePromises);
          console.log('All images loaded successfully:', loadedImages.length);
          
          if (loadedImages.length === 0) {
            throw new Error('No images were loaded successfully');
          }
          
          // Now add each loaded image to the PDF
          for (let i = 0; i < loadedImages.length; i++) {
            // Check if we need a new page
            if (yPos > pageHeight - maxImageHeight - 20) {
              doc.addPage();
              yPos = 20;
            }

            const img = loadedImages[i];
            console.log(`Adding image ${i + 1} to PDF, size:`, img.width, 'x', img.height);
            
            // Calculate position for this image
            const rowPosition = i % imagesPerRow;
            const xPos = 14 + (rowPosition * (imageWidth + imageGap));

            // Calculate height while maintaining aspect ratio
            const aspectRatio = img.width / img.height;
            const finalHeight = imageWidth / aspectRatio;

            try {
              // Add image to PDF
              doc.addImage(
                img,
                'JPEG',
                xPos,
                yPos,
                imageWidth,
                finalHeight
              );
              console.log(`Successfully added image ${i + 1} to PDF`);

              // If this is the last image in the row or the last image overall, move to next row
              if (rowPosition === imagesPerRow - 1 || i === loadedImages.length - 1) {
                yPos += finalHeight + imageGap;
              }
            } catch (error) {
              console.error(`Error adding image ${i + 1} to PDF:`, error);
            }
          }
        } catch (error) {
          console.error('Error in image loading process:', error);
          // Add error message to PDF if images fail to load
          doc.setFontSize(10);
          doc.setTextColor(255, 0, 0);
          doc.text('Error loading images. Please check online version.', 14, yPos);
          yPos += 15;
        }

        // Add some space after images
        yPos += 10;
      }
    }
    
    // Add details section header
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text('Details', 14, yPos);
    yPos += 8;
    
    // Draw a light gray line under the header
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 6;
    
    // Calculate how many fields to put in each column
    const totalFields = processedFields.length;
    const fieldsPerColumn = Math.ceil(totalFields / 2);
    
    // Add the details in a 2-column grid layout
    const leftColumnX = 14;
    const rightColumnX = Math.floor(pageWidth / 2) + 5;
    const columnWidth = (pageWidth - 38) / 2; // Width for each column (accounting for margins)
    const lineHeight = 12;
    let maxYPos = yPos; // Track the maximum Y position for both columns
    
    for (let i = 0; i < totalFields; i++) {
      // Determine if we're in the left or right column
      const isLeftColumn = i < fieldsPerColumn;
      const x = isLeftColumn ? leftColumnX : rightColumnX;
      
      // Adjust y position for right column fields
      let currentYPos = isLeftColumn 
        ? yPos + (i * lineHeight) 
        : yPos + ((i - fieldsPerColumn) * lineHeight);
      
      // Add label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(processedFields[i].label, x, currentYPos);
      
      // Add value with text wrapping
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      
      // Split text into lines that fit within column width
      const valueLines = splitTextIntoLines(processedFields[i].value, columnWidth - 5, doc);
      
      // Add each line of the value
      valueLines.forEach((line, lineIndex) => {
        // Check if we need a new page
        if (currentYPos + 5 + (lineIndex * lineHeight) > pageHeight - 20) {
          doc.addPage();
          currentYPos = 20;
          // If we're in the right column, we need to adjust the x position
          if (!isLeftColumn) {
            currentYPos = yPos + ((i - fieldsPerColumn) * lineHeight);
          }
        }
        doc.text(line, x, currentYPos + 5 + (lineIndex * lineHeight));
      });
      
      // Update maxYPos if this field extends further down
      const fieldEndY = currentYPos + 5 + (valueLines.length * lineHeight);
      maxYPos = Math.max(maxYPos, fieldEndY);
    }
    
    // Move y position past the details section using the maximum Y position
    yPos = maxYPos + 15;
    
    // Add Branch Details section if available (use branchDetails prop if provided)
    const branchArr = branchDetails && branchDetails.length > 0 ? branchDetails : (data && data.branchDetails ? data.branchDetails : []);
    if (branchArr.length > 0) {
      // Check if we need a new page for branch details
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Branch Stock Details', 14, yPos);
      yPos += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 10;
      branchArr.forEach((branch: any, index: number) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        doc.text(branch.branchName || 'Unknown Branch', 14, yPos);
        yPos += 6;
        const gridStartY = yPos;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Location', 14, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        doc.text(branch.storageLocationName || 'N/A', 14, yPos);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Quantity', pageWidth / 2, gridStartY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 33, 33);
        // Use calculatedQuantity and unitName if available, else fallback
        const qty = branch.calculatedQuantity !== undefined ? branch.calculatedQuantity : (branch.quantity || '0');
        const unit = branch.unitName || '';
        doc.text(`${qty} ${unit}`.trim(), pageWidth / 2, gridStartY + 5);
        yPos += 10;
        if (index < branchArr.length - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(0.2);
          doc.line(14, yPos, pageWidth - 14, yPos);
          yPos += 8;
        }
      });
    }

    // Add Stock details from purchases section if available
    if (purchaseOrders && purchaseOrders.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Stock details from purchases', 14, yPos);
      yPos += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 10;
      // Table header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const headers = ['Purchase Order Id', 'Quantity', 'Unit', 'Supplier Name', 'Delivered Date', 'Expiry Date'];
      let x = 14;
      headers.forEach((header, i) => {
        doc.text(header, x, yPos);
        x += 32;
      });
      yPos += 6;
      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      purchaseOrders.forEach((po: any) => {
        let x = 14;
        doc.text(String(po.id), x, yPos);
        x += 32;
        doc.text(String(po.quantity), x, yPos);
        x += 32;
        doc.text(String(po.unitName), x, yPos);
        x += 32;
        doc.text(String(po.supplierName), x, yPos);
        x += 32;
        doc.text(po.dateOfDelivery ? new Date(po.dateOfDelivery).toLocaleDateString('en-GB') : 'N/A', x, yPos);
        x += 32;
        doc.text(po.expiryDate ? new Date(po.expiryDate).toLocaleDateString('en-GB') : 'N/A', x, yPos);
        yPos += 6;
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
      });
      yPos += 10;
    }
    
    // --- INGREDIENTS TABLE ---
    if (ingredients && ingredients.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Ingredients', 14, yPos);
      yPos += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 6;
      // Prepare table columns
      const columns = [
        { header: 'Ingredient', dataKey: 'ingredient' },
        { header: 'Quantity', dataKey: 'quantity' },
        { header: 'Unit', dataKey: 'unit' },
        { header: 'Yield %', dataKey: 'yield' },
      ];
      if (isAdmin) {
        columns.push({ header: 'Cost', dataKey: 'cost' });
      }
      // Prepare table rows
      const rows = ingredients.map((ing: any) => {
        const cost = isAdmin
          ? (typeof ing.recipeCost === 'number'
              ? `$${(ing.recipeCost > 1000 ? ing.recipeCost / 100 : ing.recipeCost).toFixed(2)}`
              : '0.00')
          : undefined;
        return {
          ingredient: sanitize(ing.itemName?.split('@')[0] || ing.itemName || 'N/A'),
          quantity: sanitize(ing.quantity ?? 'N/A'),
          unit: sanitize(ing.unit ?? 'N/A'),
          yield: sanitize((ing.yieldPercentage ?? 'N/A') + '%'),
          ...(isAdmin ? { cost: sanitize(cost) } : {}),
        };
      });
      // Use autoTable for better formatting
      autoTable(doc, {
        startY: yPos,
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey as keyof typeof row] ?? '')),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [240, 240, 240], textColor: 33, fontStyle: 'bold' },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        didDrawPage: (data) => {
          if (data.cursor && typeof data.cursor.y === 'number') {
            yPos = data.cursor.y + 10;
          }
        },
      });
      if ((doc as any).lastAutoTable && typeof (doc as any).lastAutoTable.finalY === 'number') {
        yPos = (doc as any).lastAutoTable.finalY + 10;
      } else {
        yPos += 10;
      }
    }

    // --- PROCEDURES/INSTRUCTIONS ---
    if (procedures && procedures.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Instructions', 14, yPos);
      yPos += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 6;

      procedures.forEach((step: any, idx: number) => {
        // Check if we need a new page before starting a new step
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }

        // Add step number
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(33, 33, 33);
        doc.text(`Step ${idx + 1} of ${procedures.length}`, 14, yPos);
        yPos += 6;

        // Handle description with text wrapping
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(33, 33, 33);
        
        // Split description into lines that fit within page width
        const descriptionLines = splitTextIntoLines(step.description || 'No description', pageWidth - 28, doc);
        
        // Add each line of the description
        descriptionLines.forEach((line, lineIndex) => {
          // Check if we need a new page for the next line
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 14, yPos);
        yPos += 6;
        });

        // Handle critical point with text wrapping
        if (step.criticalPoint) {
          // Add some space before critical point
          yPos += 4;
          
          // Check if we need a new page for critical point
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(200, 0, 0);
          
          // Split critical point into lines
          const criticalPointLines = splitTextIntoLines(`Critical Point: ${step.criticalPoint}`, pageWidth - 28, doc);
          
          // Add each line of the critical point
          criticalPointLines.forEach((line, lineIndex) => {
            // Check if we need a new page for the next line
            if (yPos > pageHeight - 20) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 14, yPos);
          yPos += 6;
          });
        }

        // Add space between steps
        yPos += 8;
      });
      yPos += 10;
    }
    
    // Add footer
    addFooter();
    
    // Save the PDF
    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
  // Helper function to add footer on each page
  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const date = new Date().toLocaleDateString();
      const footerY = pageHeight - 10;
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${date}`, 14, footerY);
      doc.text('Prime Cost', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, footerY, { align: 'right' });
    }
  };
  
  // Try to add logo
  try {
    console.log('Attempting to load logo from:', logoPath);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // Set absolute path if needed
    const finalLogoPath = logoPath.startsWith('http') 
      ? logoPath 
      : window.location.origin + logoPath;
      
    console.log('Final logo path:', finalLogoPath);
    
    // Load logo and generate content
    const loadLogo = new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        console.log('Logo loaded successfully');
        try {
          // Calculate aspect ratio to maintain proportions
          const imgWidth = 40; // Width in mm
          const imgHeight = img.height * (imgWidth / img.width);
          
          // Position logo in top right with margin
          doc.addImage(img, 'PNG', pageWidth - imgWidth - 14, 14, imgWidth, imgHeight);
          console.log('Logo added to PDF');
          // Generate content with logo
          await generateContent(true);
          resolve();
        } catch (imgError) {
          console.error('Error adding logo to PDF:', imgError);
          reject(imgError);
        }
      };
      
      img.onerror = (e) => {
        console.error('Failed to load logo from path:', finalLogoPath, e);
        reject(e);
      };
      
      img.src = finalLogoPath;
    });
    
    // Set a timeout for logo loading
    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => {
        if (!img.complete) {
          console.log('Logo loading timed out');
          reject(new Error('Logo loading timed out'));
        }
      }, 3000);
    });
    
    // Try to load logo with timeout
    try {
      await Promise.race([loadLogo, timeout]);
    } catch (error) {
      console.error('Error or timeout in logo loading:', error);
      await generateContent(false);
    }
    
  } catch (error) {
    console.error('Error in logo loading process:', error);
    await generateContent(false);
  }
}; 