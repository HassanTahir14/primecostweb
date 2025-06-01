'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import api from '@/store/api';
import { useTranslation } from '@/context/TranslationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TransferDetailPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency') || 'USD';
    setCurrency(storedCurrency);
  }, []);
  const router = useRouter();

  const type = searchParams.get('type');
  const id = searchParams.get('id');

  useEffect(() => {
    fetchTransferDetails();
    // eslint-disable-next-line
  }, [type, id]);

  const fetchTransferDetails = async () => {
    if (!type || !id) {
      setError(t('transferDetail.invalidDetails'));
      return;
    }
    setLoading(true);
    try {
      let endpoint = '';
      let responseKey = '';
      switch (type) {
        case 'inventory':
          endpoint = '/transfer/view/items';
          responseKey = 'itemList';
          break;
        case 'recipe':
          endpoint = '/transfer/view/prepared-main-recipe';
          responseKey = 'transferPreparedMainRecipeList';
          break;
        case 'sub-recipe':
          endpoint = '/transfer/view/prepared-sub-recipe';
          responseKey = 'transferPreparedSubRecipeList';
          break;
        default:
          throw new Error('Invalid transfer type');
      }
      const result = await api.post(endpoint, {
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        direction: 'asc',
      });
      const items = result.data[responseKey] || [];
      const transfer = items.find((item: any) => item.transferReferenceNumber === Number(id));
      if (!transfer) {
        throw new Error('Transfer not found');
      }
      setData(transfer);
      setError(null);
    } catch (error: any) {
      setError(error.message || t('transferDetail.invalidDetails'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getItemList = () => {
    if (!data) return [];
    if (type === 'inventory') return data.itemTransferList || [];
    if (type === 'recipe') return data.preparedMainRecipeTransferList || [];
    if (type === 'sub-recipe') return data.preparedSubRecipeTransferList || [];
    return [];
  };

  // Fix reduce types
  const getTotalCost = () => {
    const items = getItemList();
    if (!items.length) return 0;
    return items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0), 0);
  };

  const getTransferDate = () => {
    if (!data?.transferDate) return '';
    return new Date(data.transferDate).toISOString().slice(0, 10);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40; // Starting position

    // Add logo to top right
    const logoWidth = 150;
    const logoHeight = 120;
    // Use base64 image to avoid loading issues
    const logoUrl = '/logo.png';
    
    // Add title on the left
    doc.setFontSize(24);
    doc.setTextColor('#333');
    doc.text(t('transferDetail.detailsTitle', { id }) || 'Transfer Details', 40, 50);
    
    // Load and add logo image to the right side
    const img = document.createElement('img');
    img.src = window.location.origin + logoUrl;
    
    img.onload = () => {
      try {
        doc.addImage(img, 'PNG', pageWidth - logoWidth - 40, 20, logoWidth, logoHeight);
        
        // Continue with the rest of the document
        y = 150; // Start content below the header area
        
        // Transfer Info section with better formatting
        doc.setDrawColor('#e5e7eb'); // Light gray border
        doc.setFillColor('#f9fafb'); // Very light gray background
        doc.roundedRect(40, y, pageWidth - 80, 100, 5, 5, 'FD');
        
        y += 25;
        doc.setFontSize(14);
        doc.setTextColor('#111827');
        
        // Left column 
        doc.text(`${t('transferDetail.transferType') || ''}:`, 60, y);
        doc.text(`${t('transferDetail.transferDate') || ''}:`, 60, y + 40);
        
        // Right column titles
        doc.text(`${t('transferDetail.transferBy') || ''}:`, pageWidth/2, y);
        doc.text(`${t('transferDetail.referenceNo') || ''}:`, pageWidth/2, y + 40);
        
        // Values with different styling
        doc.setFontSize(12);
        doc.setTextColor('#4b5563');
        
        // Left column values
        doc.text(data?.transferType || '', 60, y + 20);
        doc.text(getTransferDate() || '', 60, y + 60);
        
        // Right column values
        doc.text(data?.transferredBy || '', pageWidth/2, y + 20);
        doc.text(data?.transferReferenceNumber?.toString() || '', pageWidth/2, y + 60);
        
        y += 120; // Space after the info section
        
        // Table
        const itemList = getItemList();
        const tableColumn = [
          t('transferDetail.table.sourceItemName') || '',
          t('transferDetail.table.sourceItemCode') || '',
          t('transferDetail.table.quantity') || '',
          t('transferDetail.table.uom') || '',
          t('transferDetail.table.costWithVat') || '',
        ];
        const tableRows = itemList.map((item: any) => [
          (item.itemName || item.mainRecipeName || item.subRecipeName)?.split('@')[0],
          item.itemCode || item.mainRecipeCode || item.subRecipeCode,
          item.itemQuantity || item.quantity,
          item.uom,
          `${Number(item.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
        ]);
        
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: y,
          theme: 'grid',
          headStyles: { 
            fillColor: [94, 168, 157],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
          },
          styles: { 
            fontSize: 10,
            cellPadding: 8
          },
          margin: { left: 40, right: 40 },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          }
        });
        
        y = (doc as any).lastAutoTable.finalY + 30;
        
        // Costs Table with improved styling
        autoTable(doc, {
          head: [[
            t('transferDetail.costs.type') || '',
            t('transferDetail.costs.percentValue') || '',
            t('transferDetail.costs.taxesAmount') || '',
            t('transferDetail.costs.totalWithTaxes') || '',
          ]],
          body: [[
            t('transferDetail.costs.transferAmount') || '',
            '',
            `${t('transferDetail.costs.total') || ''}: 0.00 ${currency}`,
            `${t('transferDetail.costs.total') || ''}: ${getTotalCost().toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
          ]],
          startY: y,
          theme: 'grid',
          headStyles: { 
            fillColor: [94, 168, 157],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
          },
          styles: { 
            fontSize: 10,
            cellPadding: 8
          },
          margin: { left: 40, right: 40 }
        });
        
        y = (doc as any).lastAutoTable.finalY + 40;
        
        // Approval section with improved styling
        doc.setFontSize(12);
        doc.setTextColor('#111827');
        doc.text(`${t('transferDetail.approval.transferredBy') || ''}:`, 60, y);
        doc.text(`${t('transferDetail.approval.approvedBy') || ''}:`, pageWidth/2 + 20, y);
        
        // Approval values
        doc.setDrawColor('#e5e7eb');
        doc.setFillColor('#f9fafb');
        
        // Signature boxes
        doc.roundedRect(60, y + 10, 180, 40, 3, 3, 'FD');
        doc.roundedRect(pageWidth/2 + 20, y + 10, 180, 40, 3, 3, 'FD');
        
        doc.setFontSize(10);
        doc.setTextColor('#4b5563');
        doc.text(data?.transferredBy || '', 60 + 90, y + 35, { align: 'center' });
        doc.text(data?.approvedBy || data?.transferredBy || '', pageWidth/2 + 20 + 90, y + 35, { align: 'center' });
        
        // Save the PDF
        doc.save(`${t('transferDetail.detailsTitle', { id }) || 'transfer'}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Fallback to save without image if there's an error
        generatePDFWithoutLogo();
      }
    };
    
    img.onerror = () => {
      console.error('Error loading logo image');
      // Fallback if image fails to load
      generatePDFWithoutLogo();
    };
    
    // Fallback function if image loading fails
    const generatePDFWithoutLogo = () => {
      // Reset position
      y = 40;
      
      // Add just the title
      doc.setFontSize(24);
      doc.setTextColor('#333');
      doc.text(t('transferDetail.detailsTitle', { id }) || 'Transfer Details', 40, 50);
      
      // Continue with rest of the document (copy content from above, starting from y = 120)
      y = 120;
      
      // Transfer Info section
      doc.setDrawColor('#e5e7eb');
      doc.setFillColor('#f9fafb');
      doc.roundedRect(40, y, pageWidth - 80, 100, 5, 5, 'FD');
      
      y += 25;
      doc.setFontSize(14);
      doc.setTextColor('#111827');
      
      // Left column 
      doc.text(`${t('transferDetail.transferType') || ''}:`, 60, y);
      doc.text(`${t('transferDetail.transferDate') || ''}:`, 60, y + 40);
      
      // Right column titles
      doc.text(`${t('transferDetail.transferBy') || ''}:`, pageWidth/2, y);
      doc.text(`${t('transferDetail.referenceNo') || ''}:`, pageWidth/2, y + 40);
      
      // Values with different styling
      doc.setFontSize(12);
      doc.setTextColor('#4b5563');
      
      // Left column values
      doc.text(data?.transferType || '', 60, y + 20);
      doc.text(getTransferDate() || '', 60, y + 60);
      
      // Right column values
      doc.text(data?.transferredBy || '', pageWidth/2, y + 20);
      doc.text(data?.transferReferenceNumber?.toString() || '', pageWidth/2, y + 60);
      
      y += 120;
      
      // Table
      const itemList = getItemList();
      const tableColumn = [
        t('transferDetail.table.sourceItemName') || '',
        t('transferDetail.table.sourceItemCode') || '',
        t('transferDetail.table.quantity') || '',
        t('transferDetail.table.uom') || '',
        t('transferDetail.table.costWithVat') || '',
      ];
      const tableRows = itemList.map((item: any) => [
        (item.itemName || item.mainRecipeName || item.subRecipeName)?.split('@')[0],
        item.itemCode || item.mainRecipeCode || item.subRecipeCode,
        item.itemQuantity || item.quantity,
        item.uom,
        `${Number(item.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
      ]);
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y,
        theme: 'grid',
        headStyles: { 
          fillColor: [94, 168, 157],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        styles: { 
          fontSize: 10,
          cellPadding: 8
        },
        margin: { left: 40, right: 40 },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });
      
      // Save the PDF
      doc.save(`${t('transferDetail.detailsTitle', { id }) || 'transfer'}.pdf`);
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg font-semibold">{t('transferDetail.loading')}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-red-500 text-lg font-semibold">{error}</span>
      </div>
    );
  }

  return (
    <>
      {/* Custom Header (not shown in print) */}
      <div className="print:hidden w-full flex items-center justify-between px-6 py-3" style={{ background: 'linear-gradient(90deg, #4e8a7d 0%, #339a89 100%)' }}>
        <button
          onClick={handleBack}
          className="text-white flex items-center justify-center p-2 rounded hover:bg-white/10 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white m-0">{t('transferDetail.detailsTitle', { id }) || ''}</h1>
        <div style={{ width: 40 }} /> {/* Spacer to balance the layout */}
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="hidden print:block mb-6 border-b pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{t('transferDetail.detailsTitle', { id }) || ''}</h1>
            <div className="relative w-[140px] h-[140px]">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">

            <h1 className="text-xl md:text-2xl font-bold text-[#1a2b3c]">
              {t('transferDetail.detailsTitle', { id }) || ''}
            </h1>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">{t('transferDetail.transferType')}</label>
                  <div className="border rounded-lg p-2.5 bg-gray-50">
                    {data?.transferType || ''}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('transferDetail.transferBy')}</label>
                  <div className="border rounded-lg p-2.5 bg-gray-50">
                    {data?.transferredBy || ''}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">{t('transferDetail.transferDate')}</label>
                  <div className="border rounded-lg p-2.5 bg-gray-50">
                    {getTransferDate()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('transferDetail.referenceNo')}</label>
                  <div className="border rounded-lg p-2.5 bg-gray-50">
                    {data?.transferReferenceNumber || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#339a89] text-white">
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.table.sourceItemName')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.table.sourceItemCode')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.table.quantity')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.table.uom')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.table.costWithVat')}</th>
                </tr>
              </thead>
              <tbody>
                {getItemList().map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-4">{(item.itemName || item.mainRecipeName || item.subRecipeName)?.split('@')[0]}</td>
                    <td className="py-3 px-4">{item.itemCode || item.mainRecipeCode || item.subRecipeCode}</td>
                    <td className="py-3 px-4">{item.itemQuantity || item.quantity}</td>
                    <td className="py-3 px-4">{item.uom}</td>
                    <td className="py-3 px-4">{Number(item.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="bg-[#339a89] text-white">
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.costs.type')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.costs.percentValue')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.costs.taxesAmount')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('transferDetail.costs.totalWithTaxes')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4">{t('transferDetail.costs.transferAmount')}</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4">{t('transferDetail.costs.total')}: 0.00 {currency}</td>
                  <td className="py-3 px-4">{t('transferDetail.costs.total')}: {getTotalCost().toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 mt-8">
            <div>
              <div className="text-sm text-gray-600 mb-2">{t('transferDetail.approval.transferredBy')}</div>
              <div className="border rounded-lg p-3 min-w-[200px] text-center bg-gray-50">
                {data?.transferredBy || ''}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">{t('transferDetail.approval.approvedBy')}</div>
              <div className="border rounded-lg p-3 min-w-[200px] text-center bg-gray-50">
                {data?.approvedBy || data?.transferredBy || ''}
              </div>
            </div>
            <button 
              className="bg-[#339a89] text-white px-6 py-2.5 rounded-lg hover:bg-[#4e8a7d] transition-colors print:hidden"
              onClick={handleDownloadPDF}
            >
              {t('transferDetail.actions.print')}
            </button>
          </div>
        </div>
      </div>

    </>
  );
}