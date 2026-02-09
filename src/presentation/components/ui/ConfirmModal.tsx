import React from 'react';
import Card from './Card';
import { AlertCircleIcon, XIcon, CheckCircleIcon } from '../icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      icon: <AlertCircleIcon className="w-6 h-6" />,
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      icon: <AlertCircleIcon className="w-6 h-6" />,
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
  };

  const style = variantStyles[variant];

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay con blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-fadeIn"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto animate-fadeInScale">
          <Card elevation="lg" className="shadow-2xl">
            <Card.Header
              action={
                <button
                  onClick={handleClose}
                  className="p-1.5 text-light-gray-400 hover:text-error-600 hover:bg-red-50 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              }
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center ${style.iconColor}`}>
                  {style.icon}
                </div>
                <span>{title}</span>
              </div>
            </Card.Header>

            <Card.Body className="space-y-4">
              <p className="text-sm text-light-gray-700 leading-relaxed">
                {message}
              </p>
            </Card.Body>

            <Card.Footer>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-light-gray-700 bg-white border border-light-gray-300 rounded-lg hover:bg-light-gray-50 transition-all"
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${style.buttonBg} rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
