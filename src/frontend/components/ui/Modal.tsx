import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useThemeContext } from 'src/shared/contexts/index';
import Button from 'src/frontend/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  const { theme } = useThemeContext();

  // Define base modal classes
  const baseClasses = `fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none ${
    theme === 'dark' ? 'bg-black bg-opacity-50' : 'bg-white bg-opacity-50'
  }`;

  // Combine base classes with any additional className prop
  const modalClasses = `${baseClasses} ${className}`;

  // Handle body scroll locking
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

  // Create modal content
  const modalContent = (
    <div className={modalClasses} aria-modal="true" role="dialog">
      <div className={`relative w-auto max-w-lg mx-auto my-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="relative flex flex-col w-full border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t">
            <h3 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{title}</h3>
            <Button onClick={onClose} variant="secondary" size="small" aria-label="Close modal">
              ×
            </Button>
          </div>
          <div className={`relative p-6 flex-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the modal outside the normal DOM hierarchy
  return isOpen ? createPortal(modalContent, document.body) : null;
};