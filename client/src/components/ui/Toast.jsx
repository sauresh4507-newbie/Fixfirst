import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, opts) => addToast({ type: 'success', message, ...opts }),
    error:   (message, opts) => addToast({ type: 'error', message, ...opts }),
    warning: (message, opts) => addToast({ type: 'warning', message, ...opts }),
    info:    (message, opts) => addToast({ type: 'info', message, ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const configs = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
    bg: 'bg-white',
  },
  error: {
    icon: XCircle,
    bar: 'bg-red-500',
    iconClass: 'text-red-500',
    bg: 'bg-white',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-500',
    iconClass: 'text-amber-500',
    bg: 'bg-white',
  },
  info: {
    icon: Info,
    bar: 'bg-brand-500',
    iconClass: 'text-brand-500',
    bg: 'bg-white',
  },
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div
    className="fixed bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 pointer-events-none"
    aria-live="polite"
  >
    {toasts.map((toast) => (
      <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
    ))}
  </div>
);

const ToastItem = ({ toast, onRemove }) => {
  const config = configs[toast.type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-2xl
        border border-surface-border shadow-xl max-w-[340px] w-full animate-slide-up
        ${config.bg} overflow-hidden relative`}
    >
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bar} rounded-l-2xl`} />

      <Icon className={`w-[18px] h-[18px] shrink-0 mt-0.5 ${config.iconClass}`} />
      <p className="text-sm text-ink flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-lg hover:bg-surface-tertiary transition-colors text-ink-tertiary hover:text-ink shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export default ToastProvider;
