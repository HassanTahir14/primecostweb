'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
}

const AuthImage: React.FC<AuthImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc = '/placeholder-image.svg'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchImage = async () => {
      if (!src) {
        setImageSrc(fallbackSrc);
        return;
      }

      try {
        setIsLoading(true);
        setError(false);
        
        // Get the auth token from localStorage
        const authToken = localStorage.getItem('authToken');
        
        // Fetch the image with the Authorization header
        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
        
        // Convert the response to a blob
        const blob = await response.blob();
        
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        
        // Set the image source to the object URL
        setImageSrc(objectUrl);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
        setImageSrc(fallbackSrc);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    // Clean up the object URL when the component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, fallbackSrc]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse`} style={{ width, height }} />
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`} style={{ width, height }}>
        <span className="text-gray-400 text-xs">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => {
        setError(true);
        setImageSrc(fallbackSrc);
      }}
    />
  );
};

export default AuthImage; 