"use client"
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', duration = 5000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (type === 'loading') return;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    loading: <Loader2 className="animate-spin text-gray-400" size={20} />
  };

  const bgs = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    info: 'bg-blue-50 border-blue-100',
    warning: 'bg-amber-50 border-amber-100',
    loading: 'bg-white border-gray-100'
  };

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl border shadow-xl flex items-center gap-3 transition-all duration-300 ${bgs[type]} ${isExiting ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
      {icons[type]}
      <span className="text-sm font-bold text-gray-900">{message}</span>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<{message: string; type: ToastType} | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
};
