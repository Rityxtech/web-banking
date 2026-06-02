import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface NetworkDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkDisruptionModal: React.FC<NetworkDisruptionModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111a22] rounded-2xl border border-red-500/50 p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>

        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase tracking-tight mb-2">
          Network Disruption
        </h2>

        <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          We are experiencing temporary network issues. All transactions are currently unavailable. Please try again later.
        </p>

        <div className="space-y-3">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-xs text-red-800 dark:text-red-400 font-medium">
              <strong>Status:</strong> Our servers are experiencing high latency. Engineers are working to restore full connectivity.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
