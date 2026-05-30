
import React, { useState } from 'react';
import { APP_CONFIG } from '../config';
import { Transaction, TransactionType } from '../types';
import { ArrowLeft, User, DollarSign, FileText, CheckCircle, Share2, Copy, Link as LinkIcon, ChevronRight, History } from 'lucide-react';

interface RequestMoneyProps {
    transactions: Transaction[];
    onRequest: (amount: number, name: string, note: string) => void;
    onBack: () => void;
    shouldFail?: boolean;
}

export const RequestMoney: React.FC<RequestMoneyProps> = ({ transactions, onRequest, onBack, shouldFail = false }) => {
    const [step, setStep] = useState<'form' | 'success' | 'failed'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [note, setNote] = useState('');
    const [shareLink, setShareLink] = useState('');

    // Filter recent requests (incoming transfers or requests)
    const recentRequests = transactions
        .filter(t => t.type === TransactionType.TRANSFER_IN || t.category === 'Request')
        .slice(0, 3);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setAmount(parts.join('.'));
    };

    const isEmailValid = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !name || !isEmailValid(name)) return;

        setIsLoading(true);
        const rawAmount = parseFloat(amount.replace(/,/g, ''));

        // Simulate API call
        setTimeout(() => {
            onRequest(rawAmount, name, note);
            if (shouldFail) {
                setIsLoading(false);
                setStep('failed');
            } else {
                setShareLink(`https://yourdomain.com/pay/req_${Math.floor(Math.random() * 100000)}`);
                setIsLoading(false);
                setStep('success');
            }
        }, 1500);
    };

    const resetForm = () => {
        setAmount('');
        setName('');
        setNote('');
        setStep('form');
    };

    if (step === 'failed') {
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in p-4">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="h-2 bg-red-600" />
                    <div className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request Failed</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Your payment request could not be processed due to a connection timeout. Our systems are temporarily unavailable. Please try again later.
                        </p>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-3 w-full text-left">
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Error Details</p>
                            <p className="text-xs text-red-500 dark:text-red-300 font-mono">CONNECTION_TIMEOUT — Request to ${name} for ${Number(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })} failed.</p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button onClick={resetForm} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm">Try Again</button>
                            <button onClick={onBack} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors text-sm">Go Back</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in p-2">
                <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">

                    <div className="absolute top-0 left-0 w-full h-24 bg-blue-600 rounded-b-[50%] scale-x-150 z-0"></div>

                    <div className="relative z-10 pt-6 pb-2 text-center text-white">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl animate-bounce">
                            <CheckCircle size={32} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Request Created</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Ready to share</p>
                    </div>

                    <div className="px-3 pb-3 space-y-3">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Requested Amount</p>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                ${Number(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 space-y-2 shadow-inner">
                            <div className="flex justify-between items-start text-xs">
                                <span className="text-slate-500 dark:text-slate-400 mt-1">From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{name}</span>
                                </div>
                            </div>
                            {note && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 shrink-0 mr-4">Note</span>
                                        <span className="font-medium text-slate-900 dark:text-white text-right italic">"{note}"</span>
                                    </div>
                                </>
                            )}
                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Link</p>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 truncate font-mono">
                                        {shareLink}
                                    </div>
                                    <button className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2">
                            <Share2 size={16} /> Share Link
                        </button>
                        <button onClick={resetForm} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                            New Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col items-center justify-start md:justify-center animate-fade-in p-0 md:p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full md:h-auto md:max-h-[calc(100vh-100px)]">

                {/* Header */}
                <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Request Payment</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Ask for money securely</p>
                    </div>
                </div>

                {/* Content with bottom padding for fixed footer */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 pb-32 md:pb-0">
                    <form onSubmit={handleContinue} className="p-2 md:p-8 space-y-2 md:space-y-6">

                        {/* Amount Input */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign size={12} /> Request Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {/* Details Section - Compressed Grid */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm grid grid-cols-1 gap-2">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
                                <User size={12} /> Payer Details
                            </h3>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1">Request From (Email)</label>
                                <input
                                    type="email"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter valid email address"
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1">Note (Optional)</label>
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 top-3 text-slate-400" />
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="What's this for?"
                                        rows={2}
                                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Requests Section */}
                        {recentRequests.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <History size={12} /> Recent Requests
                                </h3>
                                <div className="space-y-0">
                                    {recentRequests.map((tx, i) => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                    <DollarSign size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description.replace('Request: ', '')}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">${Math.abs(tx.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Action - Fixed above nav on mobile */}
                <div className="p-3 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 fixed bottom-16 w-[97%] left-1/2 -translate-x-1/2 rounded-b-3xl z-30 md:static md:bottom-auto md:w-full md:transform-none md:rounded-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
                    <button
                        onClick={handleContinue}
                        disabled={!amount || !name || !isEmailValid(name) || isLoading}
                        className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm md:text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Creating Link...' : 'Create Request Link'}
                        {!isLoading && <LinkIcon size={16} className="md:w-5 md:h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
