'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import Button from '@/components/common/button';
import Textarea from '../common/textarea';
import { RootState, AppDispatch } from '@/store/store';
import { fetchAllSuppliers } from '@/store/supplierSlice';
import { fetchAllBranches, Branch } from '@/store/branchSlice';
import { fetchAllPurchaseOrders, PurchaseOrder } from '@/store/purchaseOrderSlice';
import { Supplier } from '@/store/supplierApi';

interface FormData {
    orderNo: string;
    supplierId: string;
    branchId: string;
    date: string;
    title: string;
    description: string;
    correctiveAction: string;
    impact: string;
    dateCloseOut: string;
    actionBy: string;
}

interface NonConformanceReportFormProps {
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    initialData?: any; 
    isLoading?: boolean;
}

const NonConformanceReportForm: React.FC<NonConformanceReportFormProps> = ({ 
    onSubmit, 
    onCancel, 
    initialData = {}, 
    isLoading = false 
}) => {
    const dispatch = useDispatch<AppDispatch>();

    const { orders: purchaseOrderList } = useSelector((state: RootState) => state.purchaseOrder);
    const { suppliers } = useSelector((state: RootState) => state.supplier);
    const { branches } = useSelector((state: RootState) => state.branch);

    useEffect(() => {
        if (!purchaseOrderList || purchaseOrderList.length === 0) {
             dispatch(fetchAllPurchaseOrders({ page: 0, size: 1000, sortBy: 'id', direction: 'asc' }));
        }
        if (!suppliers || suppliers.length === 0) {
             dispatch(fetchAllSuppliers());
        }
        if (!branches || branches.length === 0) {
            dispatch(fetchAllBranches());
        }
    }, [dispatch, purchaseOrderList, suppliers, branches]);

    const [formData, setFormData] = useState<FormData>({
        orderNo: initialData.orderNo || '', 
        supplierId: initialData.supplierId || '',
        branchId: initialData.branchId || '',
        date: initialData.date || new Date().toISOString().split('T')[0], 
        title: initialData.title || '', 
        description: initialData.description || '', 
        correctiveAction: initialData.correctiveAction || '',
        impact: initialData.impact || '', 
        dateCloseOut: initialData.dateCloseOut || new Date().toISOString().split('T')[0],
        actionBy: initialData.actionBy || '', 
    });

    // Add state for validation errors
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const orderOptions = [
        { value: '', label: 'Select Order No.', disabled: true },
        ...(purchaseOrderList?.map((po: PurchaseOrder) => ({ value: String(po.id), label: `PO-${po.id}` })) || [])
    ];
    const supplierOptions = [
        { value: '', label: 'Select Supplier', disabled: true },
        ...(suppliers?.map((s: Supplier) => ({ value: String(s.supplierId), label: s.name })) || [])
    ];
    const branchOptions = [
        { value: '', label: 'Select Branch', disabled: true },
        ...(branches?.map((b: Branch) => ({ value: String(b.branchId), label: b.branchName })) || [])
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        if (!formData.orderNo) newErrors.orderNo = 'Order No. is required.';
        if (!formData.supplierId) newErrors.supplierId = 'Supplier is required.';
        if (!formData.branchId) newErrors.branchId = 'Branch is required.';
        if (!formData.date) newErrors.date = 'Date is required.';
        if (!formData.title.trim()) newErrors.title = 'Title/Summary is required.';
        if (!formData.description.trim()) newErrors.description = 'Detailed Description is required.';
        if (!formData.correctiveAction.trim()) newErrors.correctiveAction = 'Corrective Action is required.';
        if (!formData.impact.trim()) newErrors.impact = 'Impact is required.';
        if (!formData.dateCloseOut) newErrors.dateCloseOut = 'Close Out Date is required.';
        // Add validation for actionBy if it becomes required
        // if (!formData.actionBy.trim()) newErrors.actionBy = 'Action By is required.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) { // Validate before submitting
            onSubmit(formData);
        } else {
            console.warn("Form validation failed:", errors);
            // Optionally show a general error message or focus the first invalid field
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Top Row: Order No, Supplier, Branch, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Select
                    label="Order No."
                    name="orderNo"
                    value={formData.orderNo}
                    onChange={handleChange}
                    options={orderOptions}
                    error={errors.orderNo} // Pass error
                    disabled={isLoading}
                />
                <Select
                    label="Supplier"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    options={supplierOptions}
                    error={errors.supplierId} // Pass error
                    disabled={isLoading}
                />
                 <Select
                    label="Branch"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    options={branchOptions}
                    error={errors.branchId} // Pass error
                    disabled={isLoading}
                />
                <Input
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date} // Pass error
                    disabled={isLoading}
                />
            </div>

            {/* Title (maps to API description) */}
            <Textarea
                label="Non-conformance Title/Summary"
                name="title" 
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                rows={3}
                error={errors.title} // Pass error
                disabled={isLoading}
            />

            {/* Description (maps to API nonConformanceDescription) */}
            <Textarea
                label="Detailed Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the non-conformance"
                rows={4}
                error={errors.description} // Pass error
                disabled={isLoading}
            />

            {/* Corrective Action */}
            <Textarea
                label="Corrective Action"
                name="correctiveAction"
                value={formData.correctiveAction}
                onChange={handleChange}
                placeholder="Describe the corrective action taken or planned"
                rows={4}
                error={errors.correctiveAction} // Pass error
                disabled={isLoading}
            />

            {/* Action By - Keep if needed for UI, but not in API payload shown */}
             <Input
                label="Action By"
                name="actionBy"
                value={formData.actionBy}
                onChange={handleChange}
                placeholder="Person responsible for action"
                // error={errors.actionBy} // Add if becomes required
                disabled={isLoading}
            />

            {/* Impact (maps to API impactOnDeliverySchedule) */}
             <Textarea
                label="Impact on Delivery Schedule"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="Describe the impact on the delivery schedule"
                rows={3}
                error={errors.impact} // Pass error
                disabled={isLoading}
            />

             {/* Close Out Date */}
            <Input
                label="Close Out Date"
                name="dateCloseOut"
                type="date"
                value={formData.dateCloseOut}
                onChange={handleChange}
                error={errors.dateCloseOut} // Pass error
                disabled={isLoading}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </form>
    );
};

export default NonConformanceReportForm; 