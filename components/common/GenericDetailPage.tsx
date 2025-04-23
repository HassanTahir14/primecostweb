'use client';

import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Button from './button'; // Assuming Button component exists

// Configuration for a single field to display
export interface DetailFieldConfig {
  key: string; // Key in the data object
  label: string; // Display label
  render?: (value: any, data: Record<string, any>) => React.ReactNode; // Optional custom render function
}

// Props for the generic detail page
interface GenericDetailPageProps {
  title: string;
  data: Record<string, any> | null;
  fieldConfig: DetailFieldConfig[];
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  imageKey?: string; // Optional: Key for an array of image objects (like { path: '...' })
  imageBaseUrl?: string; // Optional: Base URL for relative image paths
}

const GenericDetailPage: React.FC<GenericDetailPageProps> = ({
  title,
  data,
  fieldConfig,
  onBack,
  isLoading,
  error,
  imageKey,
  imageBaseUrl = '',
}) => {

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-lg text-gray-600">Loading details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-red-600">
         <AlertCircle className="w-12 h-12 mb-4" />
         <p className="text-lg font-medium mb-2">Error Loading Details</p>
         <p className="text-center mb-6">{error}</p>
         <Button onClick={onBack} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!data) {
    return (
       <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
         <p className="text-lg font-medium mb-6">Details not found.</p>
         <Button onClick={onBack} variant="outline">Go Back</Button>
      </div>
    );
  }

  const images = imageKey && data[imageKey] && Array.isArray(data[imageKey]) ? data[imageKey] : [];

  // Update the image base URL
  const imageBaseUrlUpdated = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://212.85.26.46:8082/api/v1/images/view';

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* Main Content Area */} 
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Optional Image Gallery */} 
        {images.length > 0 && (
          <div className="p-4 sm:p-6 border-b">
             <h2 className="text-lg font-semibold text-gray-700 mb-4">Images</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={img.id || img.imageId || index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`${imageBaseUrlUpdated}/${img.path}`}
                      alt={`${title} image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        const target = e.currentTarget;
                        target.src = '/placeholder-image.svg';
                        target.onerror = null; // Prevent infinite loop
                      }}
                    />
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Details Section */} 
        <div className="p-4 sm:p-6">
           <h2 className="text-lg font-semibold text-gray-700 mb-4">Details</h2>
           <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {fieldConfig.map(({ key, label, render }) => {
                const value = key.split('.').reduce((o, k) => (o || {})[k], data); // Basic nested key access
                return (
                  <div key={key} className="py-2">
                    <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
                    <dd className="text-sm text-gray-900">
                      {render ? render(value, data) : (typeof value === 'object' ? JSON.stringify(value) : (value ?? 'N/A'))} 
                    </dd>
                  </div>
                );
              })}
           </dl>
        </div>
      </div>
    </div>
  );
};

export default GenericDetailPage; 