'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/common/button';
import Input from '@/components/common/input';
import { AppDispatch, RootState } from '@/store/store';
import {
    fetchItemsBySupplier,
    clearReportError,
} from '@/store/purchaseReportsSlice';
import { ItemsBySupplierDetail } from '@/store/purchaseReportsApi';
import ReportTypeTable, { ColumnDefinition } from '@/components/reports/ReportTypeTable';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDefaultDateRange } from '@/utils/dateUtils';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrencyValue } from '@/utils/currencyUtils';

export default function ItemsBySupplierReportPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { currency } = useCurrency();
    const [formattedAmounts, setFormattedAmounts] = useState<any>({});
    const [formattedTotalCost, setFormattedTotalCost] = useState<string>('N/A');

    // State for filters
    const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Get report state from Redux
    const { data, loading, error, totalItems, totalCost } = useSelector((state: RootState) => state.purchaseReports.itemsBySupplier);

    // Fetch data on first load
    useEffect(() => {
        dispatch(clearReportError('itemsBySupplier'));
        dispatch(fetchItemsBySupplier({ startDate, endDate }));
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        if (data && currency) {
            const formatAmounts = async () => {
                try {
                    const amounts: {[key: string]: string} = {};
                    for (const record of data) {
                        const key = `${record.itemName}-${record.date}`;
                        amounts[key] = await formatCurrencyValue(record.amount || 0, currency);
                    }
                    setFormattedAmounts(amounts);

                    // Format total cost
                    if (totalCost !== undefined) {
                        const formattedTotal = await formatCurrencyValue(totalCost, currency);
                        setFormattedTotalCost(formattedTotal);
                    }
                } catch (error) {
                    console.error('Error formatting amounts:', error);
                    setFormattedAmounts({});
                    setFormattedTotalCost('N/A');
                }
            };
            formatAmounts();
        }
    }, [data, currency, totalCost]);

    const handleFetchReport = () => {
        if (!startDate || !endDate) {
            setValidationError('Please select both a Start Date and End Date.');
            return;
        }
        setValidationError(null);
        dispatch(clearReportError('itemsBySupplier'));
        dispatch(fetchItemsBySupplier({ startDate, endDate }));
    };

    const handleCloseErrorModal = () => {
        dispatch(clearReportError('itemsBySupplier'));
    };

    // Column definitions moved inside component to access formattedAmounts
    const itemsBySupplierColumns: ColumnDefinition<ItemsBySupplierDetail>[] = [
        { 
            header: 'Item Name', 
            accessorKey: 'itemName',
            cell: (value) => {
                const itemName = value as string;
                return itemName.split('@')[0];
            }
        },
        { header: 'Quantity', accessorKey: 'quantity' },
        { header: 'Unit', accessorKey: 'unit' },
        { header: 'Date', accessorKey: 'date' },
        { 
            header: 'Amount', 
            accessorKey: 'amount',
            cell: (value, record) => formattedAmounts[`${record.itemName}-${record.date}`] || 'N/A'
        },
        { header: 'PO Status', accessorKey: 'purchaseOrderStatus' },
    ];

    // Update table title to use formatted total cost
    const tableTitle = `Items Purchased (Total Items: ${totalItems ?? 0}, Total Cost: ${formattedTotalCost})`;

    return (
        <PageLayout title="Items Purchased">
             <div className="mb-4">
                <Link href="/reports/purchase" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 w-fit">
                    <ArrowLeft size={20} />
                    <span>Back to Purchase Reports</span>
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input 
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={handleFetchReport} disabled={loading}>
                        {loading ? 'Loading...' : 'Fetch Report'}
                    </Button>
                </div>
                 {validationError && (
                    <p className="mt-2 text-sm text-red-600">{validationError}</p>
                )}
            </div>

            {/* Report Table Section */}
            <ReportTypeTable
                title={tableTitle} // Use dynamic title
                data={data}
                columns={itemsBySupplierColumns}
                isLoading={loading}
            />

            {/* Error Modal */}
            <ConfirmationModal
                isOpen={!!error}
                onClose={handleCloseErrorModal}
                title="Error"
                message={typeof error === 'string' ? error : (error as any)?.message || 'An error occurred fetching the report.'}
                isAlert={true}
                okText="OK"
            />
        </PageLayout>
    );
} 