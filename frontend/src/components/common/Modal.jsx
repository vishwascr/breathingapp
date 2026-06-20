import { useEffect, useRef } from 'react';
import Card from './Card';

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - If the modal should be visible
 * @property {() => void} onClose - Callback when close is requested (backdrop click, Esc key)
 * @property {'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl'} [maxWidth='sm'] - Maximum width of the modal
 * @property {'md' | 'xl'} [backdropBlur='md'] - Blur strength for the backdrop
 * @property {string} [backdropOpacity='bg-black/60'] - Background opacity/color for the backdrop
 * @property {string} [zIndex='z-[100]'] - Custom z-index class if needed
 * @property {string} [className] - Extra classNames to add to the modal card
 * @property {React.ReactNode} children - Modal contents
 */

/**
 * Reusable modal component with overlay, backdrop-blur, animation, Esc key closing, and backdrop closing.
 */
export default function Modal({
  isOpen,
  onClose,
  maxWidth = 'sm',
  backdropBlur = 'md',
  backdropOpacity = 'bg-black/60',
  zIndex = 'z-[100]',
  className = '',
  children,
}) {
  const overlayRef = useRef(null);

  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  const blurClasses = {
    md: 'backdrop-blur-md',
    xl: 'backdrop-blur-xl',
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 ${zIndex} flex items-center justify-center ${backdropOpacity} ${blurClasses[backdropBlur]} p-4 md:p-6 transition-all duration-300 animate-fadeIn`}
    >
      <Card
        variant="default"
        padding="lg"
        className={`w-full ${maxWidthClasses[maxWidth]} shadow-2xl animate-scaleIn overflow-y-auto max-h-[90vh] custom-scrollbar min-w-0 ${className}`}
      >
        {children}
      </Card>
    </div>
  );
}
