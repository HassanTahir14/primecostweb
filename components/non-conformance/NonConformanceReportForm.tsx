'use client';

import React, { useState } from 'react';
import Input from '@/components/common/input';
import Select from '@/components/common/select';
import Button from '@/components/common/button';
import Textarea from '../common/textarea'; // Assuming you have a Textarea component

// Mock data for selects - replace with actual data fetching/props later
const SUPPLIER_OPTIONS = [
    { value: '', label: 'Select Supplier', disabled: true },
    { value: 'supplier1', label: 'Supplier A' },
    { value: 'supplier2', label: 'Supplier B' },
];

const BRANCH_OPTIONS = [
    { value: '', label: 'Select Branch', disabled: true },
    { value: 'branch1', label: 'Main Branch' },
    { value: 'branch2', label: 'Downtown Branch' },
];

interface NonConformanceReportFormProps {
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    initialData?: any; // For pre-filling form in edit mode (optional)
    isLoading?: boolean;
}

const NonConformanceReportForm: React.FC<NonConformanceReportFormProps> = ({ 
    onSubmit, 
    onCancel, 
    initialData = {}, 
    isLoading = false 
}) => {
    const [formData, setFormData] = useState({
        orderNo: initialData.orderNo || '',
        supplierId: initialData.supplierId || '',
        branchId: initialData.branchId || '',
        date: initialData.date || new Date().toISOString().split('T')[0], // Default to today
        title: initialData.title || '',
        description: initialData.description || '',
        correctiveAction: initialData.correctiveAction || '',
        actionBy: initialData.actionBy || '',
        impact: initialData.impact || '',
        closeOutDate: initialData.closeOutDate || new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add validation here if needed
        console.log('Submitting Non Conformance Report:', formData);
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Top Row: Order No, Supplier, Branch, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                    label="Order No."
                    name="orderNo"
                    value={formData.orderNo}
                    onChange={handleChange}
                    placeholder="Enter Order No."
                    disabled={isLoading}
                />
                <Select
                    label="Supplier"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    options={SUPPLIER_OPTIONS}
                    disabled={isLoading}
                />
                 <Select
                    label="Branch"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    options={BRANCH_OPTIONS}
                    disabled={isLoading}
                />
                <Input
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    disabled={isLoading}
                />
            </div>

            {/* Title */}
            <Textarea
                label="Non-conformance Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter value"
                rows={3}
                disabled={isLoading}
            />

            {/* Description */}
            <Textarea
                label="Non-conformance description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter value"
                rows={4}
                disabled={isLoading}
            />

            {/* Corrective Action */}
            <Textarea
                label="Corrective action"
                name="correctiveAction"
                value={formData.correctiveAction}
                onChange={handleChange}
                placeholder="Enter value"
                rows={4}
                disabled={isLoading}
            />

            {/* Action By */}
             <Input
                label="Action by"
                name="actionBy"
                value={formData.actionBy}
                onChange={handleChange}
                placeholder="Enter value"
                disabled={isLoading}
            />

            {/* Impact */}
             <Textarea
                label="Impact on delivery schedule"
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="Enter value"
                rows={3}
                disabled={isLoading}
            />

             {/* Close Out Date */}
            <Input
                label="Close out date"
                name="closeOutDate"
                type="date"
                value={formData.closeOutDate}
                onChange={handleChange}
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