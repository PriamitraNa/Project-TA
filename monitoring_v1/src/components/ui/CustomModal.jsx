import { useEffect, useCallback } from 'react';
import Button from './Button';
import { FaTimes } from 'react-icons/fa';

export default function CustomModal({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    icon, 
    children, 
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    isLoading = false
}) {
    // Handler untuk close modal
    const handleClose = useCallback(() => {
        if (!isLoading) {
            onClose?.();
        }
    }, [isLoading, onClose]);

    // Handler untuk backdrop click
    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
        }
    };

    // Handler untuk escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (closeOnEscape && e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleClose, closeOnEscape]);

    // Size classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl'
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto mx-4`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                            {description && (
                                <p className="text-sm text-gray-600">{description}</p>
                            )}
                        </div>
                    </div>
                    {showCloseButton && (
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            <FaTimes className="text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
