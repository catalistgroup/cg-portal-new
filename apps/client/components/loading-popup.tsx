'use client';

import type React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoadingPopupProps {
  isOpen: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function LoadingPopup({
  isOpen,
  children,
  className = '',
}: LoadingPopupProps) {
  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const popupContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-center animate-in fade-in-0 zoom-in-95 duration-200 ${className} mx-4 p-4 sm:p-6`}
      >
        {children || (
          <>
            <div className="flex flex-col items-center p-10">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 border-t-blue-500 h-12 w-12 mb-4 animate-spin"></div>
              <p className="text-lg font-bold mt-4">Loading...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Use portal to render outside normal DOM hierarchy
  return createPortal(popupContent, document?.body || document.createElement('body'));
}
