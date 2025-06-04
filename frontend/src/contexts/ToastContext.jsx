import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Context para gerenciar toasts
const ToastContext = createContext();

// Hook para usar o toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};

// Componente Toast individual
const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
<div
  className={`
    w-full max-w-sm sm:max-w-md ${getBackgroundColor()} border rounded-lg shadow-lg px-4 py-3 mb-3
    transform transition-all duration-300 ease-in-out break-words animate-slide-in-right
  `}
>
  <div className="flex items-start">
    <div className="flex-shrink-0">{getIcon()}</div>
    <div className="ml-3 flex-1 min-w-0">
      {toast.title && (
        <p className={`text-sm font-medium ${getTextColor()}`}>
          {toast.title}
        </p>
      )}
      <p className={`text-sm ${getTextColor()} ${toast.title ? 'mt-1' : ''}`}>
        {toast.message}
      </p>
    </div>
    <div className="ml-4 flex-shrink-0 flex">
      <button
        className={`
          inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-zapchat-primary rounded-md
        `}
        onClick={() => onRemove(toast.id)}
      >
        <span className="sr-only">Fechar</span>
        <X className="h-4 w-4" />
      </button>
    </div>
  </div>
</div>


  );
};

// Container de toasts
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Provider do Toast
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remover após duração especificada
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Funções de conveniência
  const showSuccess = useCallback((message, title = 'Sucesso!') => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
    });
  }, [addToast]);

  const showError = useCallback((message, title = 'Erro!') => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 6000,
    });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Atenção!') => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 5000,
    });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Informação') => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 4000,
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;

