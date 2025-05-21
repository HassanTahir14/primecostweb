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
import { useTranslation } from '@/context/TranslationContext'; // <-- Add this import

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
    const { t } = useTranslation(); // <-- Add this line

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
        { value: '', label: t('nonConformance.form.selectOrderNo'), disabled: true },
        ...(purchaseOrderList?.map((po: PurchaseOrder) => ({ value: String(po.id), label: `PO-${po.id}` })) || [])
    ];
    const supplierOptions = [
        { value: '', label: t('nonConformance.form.selectSupplier'), disabled: true },
        ...(suppliers?.map((s: Supplier) => ({ value: String(s.supplierId), label: s.name })) || [])
    ];
    const branchOptions = [
        { value: '', label: t('nonConformance.form.selectBranch'), disabled: true },
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
        if (!formData.orderNo) newErrors.orderNo = t('nonConformance.form.orderNoRequired');
        if (!formData.supplierId) newErrors.supplierId = t('nonConformance.form.supplierRequired');
        if (!formData.branchId) newErrors.branchId = t('nonConformance.form.branchRequired');
        if (!formData.date) newErrors.date = t('nonConformance.form.dateRequired');
        if (!formData.title.trim()) newErrors.title = t('nonConformance.form.titleRequired');
        if (!formData.description.trim()) newErrors.description = t('nonConformance.form.descriptionRequired');
        if (!formData.correctiveAction.trim()) newErrors.correctiveAction = t('nonConformance.form.correctiveActionRequired');
        if (!formData.impact.trim()) newErrors.impact = t('nonConformance.form.impactRequired');
        if (!formData.dateCloseOut) newErrors.dateCloseOut = t('nonConformance.form.dateCloseOutRequired');
        // if (!formData.actionBy.trim()) newErrors.actionBy = t('nonConformance.form.actionByRequired');
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
                    label={t('nonConformance.form.orderNo')}
                    name="orderNo"
                    value={formData.orderNo}
                    onChange={handleChange}
                    options={orderOptions}
                    error={errors.orderNo}
                    disabled={isLoading}
                />
                <Select
                    label={t('nonConformance.form.supplier')}
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    options={supplierOptions}
                    error={errors.supplierId}
                    disabled={isLoading}
                />
                 <Select
                    label={t('nonConformance.form.branch')}
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    options={branchOptions}
                    error={errors.branchId}
                    disabled={isLoading}
                />
                <Input
                    label={t('nonConformance.form.date')}
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    disabled={isLoading}
                />
            </div>

            {/* Title (maps to API description) */}
            <Textarea
                label={t('nonConformance.form.title')}
                name="title" 
                value={formData.title}
                onChange={handleChange}
                placeholder={t('nonConformance.form.titlePlaceholder')}
                rows={3}
                error={errors.title}
                disabled={isLoading}
            />

            {/* Description (maps to API nonConformanceDescription) */}
            <Textarea
                label={t('nonConformance.form.description')}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('nonConformance.form.descriptionPlaceholder')}
                rows={4}
                error={errors.description}
                disabled={isLoading}
            />

            {/* Corrective Action */}
            <Textarea
                label={t('nonConformance.form.correctiveAction')}
                name="correctiveAction"
                value={formData.correctiveAction}
                onChange={handleChange}
                placeholder={t('nonConformance.form.correctiveActionPlaceholder')}
                rows={4}
                error={errors.correctiveAction}
                disabled={isLoading}
            />

            {/* Action By */}
             <Input
                label={t('nonConformance.form.actionBy')}
                name="actionBy"
                value={formData.actionBy}
                onChange={handleChange}
                placeholder={t('nonConformance.form.actionByPlaceholder')}
                // error={errors.actionBy}
                disabled={isLoading}
            />

            {/* Impact (maps to API impactOnDeliverySchedule) */}
             <Textarea
                label={t('nonConformance.form.impact')}
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder={t('nonConformance.form.impactPlaceholder')}
                rows={3}
                error={errors.impact}
                disabled={isLoading}
            />

             {/* Close Out Date */}
            <Input
                label={t('nonConformance.form.dateCloseOut')}
                name="dateCloseOut"
                type="date"
                value={formData.dateCloseOut}
                onChange={handleChange}
                error={errors.dateCloseOut}
                disabled={isLoading}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
                    {t('nonConformance.form.cancel')}
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? t('nonConformance.form.submitting') : t('nonConformance.form.submit')}
                </Button>
            </div>
        </form>
    );
};

export default NonConformanceReportForm;