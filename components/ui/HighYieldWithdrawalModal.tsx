
import React, { useState } from 'react';
import { X, Lock, Unlock, ArrowRight, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';


interface HighYieldWithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    amount: number;
    targetAccountName: string;
}

export const HighYieldWithdrawalModal: React.FC<HighYieldWithdrawalModalProps> = ({ isOpen, onClose, onConfirm, amount, targetAccountName }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);

    if (!isOpen) return null;

    const handleUnlock = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && onClose()}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 pb-6 md:pb-0 z-[110]">
                {/* Header Warning Theme */}
                <div className="h-32 bg-gradient-to-br from-orange-500 to-red-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8 -mt-12 relative z-10">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mb-6">
                        <Unlock size={40} className="text-orange-500" />
                    </div>

                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                                Unlock Funds?
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                You are about to withdraw <span className="font-bold text-slate-900 dark:text-white">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> to your <span className="font-bold text-slate-900 dark:text-white">{targetAccountName}</span>.
                            </p>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50 flex items-start gap-3">
                            <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Warning: Interest Forfeiture</h4>
                                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1 leading-relaxed">
                                    Breaking your investment lock early may result in forfeiture of accrued interest for the current period.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlock}
                                disabled={isProcessing}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <>Confirm Unlock <ArrowRight size={20} /></>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
