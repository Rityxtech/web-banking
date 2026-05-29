
import React, { useState, useRef, useEffect } from 'react';
import { Account } from '../types';
import { Wallet, CheckCircle, ChevronRight, ChevronDown, User, Hash, DollarSign, ArrowLeft, FileText, ShieldCheck, Clock, Share2, Download, Calendar, Globe, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { shareReceipt } from '../utils/receipt';
import { supabase } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { PinVerificationModal } from './ui/PinVerificationModal';

interface TransfersProps {
    accounts: Account[];
    onTransfer: (fromId: string, toId: string, amount: number, note: string) => Promise<boolean> | void;
    onSchedule?: (fromId: string, toId: string, amount: number, note: string, date: string, frequency: string) => void;
    onBack?: () => void;
    maxLimit?: number;
    shouldFail?: boolean;
    kycLevel?: number;
    dailyLimit?: number;
    dailyUsage?: number;
    user?: any;
    isBalanceHidden?: boolean;
    onSendOtp?: () => Promise<string | null>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
}

export const Transfers: React.FC<TransfersProps> = ({
    accounts, onTransfer, onSchedule, onBack,
    maxLimit = 50000, shouldFail = false,
    kycLevel = 0, dailyLimit = 0, dailyUsage = 0,
    user, isBalanceHidden = false,
    onSendOtp, onUpdatePin
}) => {
    const [step, setStep] = useState<'form' | 'review' | 'result'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const bankDropdownRef = useRef<HTMLDivElement>(null);
    const [transactionDate, setTransactionDate] = useState('');
    const [refId, setRefId] = useState('');
    const [error, setError] = useState('');

    // Dynamic Banks State
    const [banks, setBanks] = useState<any[]>([]);

    // Scheduling State
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleFreq, setScheduleFreq] = useState('Monthly');

    const [formData, setFormData] = useState({
        recipientName: '',
        bankId: '', // Initialized later
        accountNumber: '',
        amount: '',
        note: ''
    });

    const mainAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
    const selectedBank = banks.find(b => String(b.id) === String(formData.bankId)) || banks[0] || { name: 'Select Bank', id: '', logo: '' };

    const remainingDaily = Math.max(0, dailyLimit - dailyUsage);

    useEffect(() => {
        // Fetch Banks on Mount
        const loadBanks = async () => {
            try {
                // Pass false to read globally (no user filter)
                const { data } = await supabase.from('mvp_banks').select('*');
                if (data && Array.isArray(data) && data.length > 0) {
                    // Sort banks alphabetically (A-Z)
                    data.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));

                    setBanks(data);
                    setFormData(prev => ({ ...prev, bankId: String(data[0].id) }));
                } else {
                    // Fallback if DB is empty to prevent crash
                    setBanks([{ id: 'mock', name: 'Standard Bank', logo: '', color: 'bg-slate-500' }]);
                }
            } catch (e) {
                console.error("Failed to load banks", e);
            }
        };
        loadBanks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
                setShowBankDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setFormData({ ...formData, amount: parts.join('.') });
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.recipientName || !formData.accountNumber || !formData.amount) return;

        const rawAmount = parseFloat(formData.amount.replace(/,/g, ''));

        if (mainAccount && rawAmount > mainAccount.balance) {
            setError(`Insufficient balance. Available: $${mainAccount.balance.toLocaleString()}`);
            return;
        }

        if (rawAmount > maxLimit) {
            setError(`Amount exceeds the global transaction limit of $${maxLimit.toLocaleString()}`);
            return;
        }

        // Set default schedule date to tomorrow if not set
        if (!scheduleDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduleDate(tomorrow.toISOString().split('T')[0]);
        }

        // Set the transaction date when entering review step
        setTransactionDate(new Date().toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));

        setStep('review');
    };

    const handleConfirm = () => {
        setShowPinModal(true);
    };

    const executeTransfer = async () => {
        setShowPinModal(false);
        setIsLoading(true);
        const rawAmount = parseFloat(formData.amount.replace(/,/g, ''));

        // Simulate delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (mainAccount) {
            if (isScheduling && onSchedule) {
                onSchedule(mainAccount.id, formData.recipientName, rawAmount, formData.note, scheduleDate, scheduleFreq);
                setStep('result');
            } else {
                const result = await onTransfer(mainAccount.id, formData.recipientName, rawAmount, formData.note);

                // Only proceed if transaction was allowed (not blocked by limits)
                if (result !== false) {
                    setRefId(`#TRX-${Math.floor(10000000 + Math.random() * 90000000)}`);
                    setStep('result');
                }
            }
        }

        setIsLoading(false);
    };

    const resetForm = () => {
        setFormData({
            recipientName: '',
            bankId: banks.length > 0 ? String(banks[0].id) : '',
            accountNumber: '',
            amount: '',
            note: ''
        });
        setError('');
        setIsScheduling(false);
        setStep('form');
    };

    const handleShare = async () => {
        setIsSharing(true);
        await shareReceipt('transfer-receipt', `Transfer-${refId}.png`);
        setIsSharing(false);
    };

    const renderBankIcon = (bank: any, sizeClass = "w-6 h-6 md:w-8 md:h-8") => {
        if (bank?.logo) {
            return <img src={bank.logo} alt={bank.name} className={`${sizeClass} rounded-full object-cover bg-white shadow-sm border border-slate-100`} onError={(e) => { e.currentTarget.style.display = 'none' }} />;
        }
        // Fallback if logo fails or is missing
        return (
            <div className={`${sizeClass} rounded-full ${bank?.color || 'bg-slate-400'} flex items-center justify-center text-white font-bold shadow-sm`}>
                {bank?.name ? bank.name.charAt(0) : <Globe size={14} />}
            </div>
        );
    };

    // --------------------------------------------------------------------------
    // SUCCESS VIEW
    // --------------------------------------------------------------------------
    if (step === 'result') {
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in p-2 md:p-4">
                <div id="transfer-receipt" className="bg-white dark:bg-slate-800 w-full max-w-[420px] rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">
                    {/* Decorative background circle */}
                    <div className={`absolute top-0 left-0 w-full h-20 md:h-24 rounded-b-[50%] scale-x-150 z-0 ${shouldFail ? 'bg-red-600' : isScheduling ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>

                    {/* Success Header */}
                    <div className="relative z-10 pt-4 md:pt-6 pb-2 text-center text-white">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-xl animate-bounce">
                            {shouldFail ? <XCircle size={24} className="text-red-600 md:w-8 md:h-8" /> : isScheduling ? <Calendar size={24} className="text-blue-600 md:w-8 md:h-8" /> : <CheckCircle size={24} className="text-emerald-600 md:w-8 md:h-8" />}
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1 md:mt-2">{shouldFail ? 'Transaction Failed' : isScheduling ? 'Payment Scheduled' : 'Transfer Successful'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs mt-0.5">{isScheduling ? `First payment on ${new Date(scheduleDate).toLocaleDateString()}` : transactionDate}</p>
                    </div>

                    {/* Receipt Body */}
                    <div className="px-3 pb-3 md:px-5 md:pb-5 space-y-2 md:space-y-4 bg-white dark:bg-slate-800">

                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Amount {shouldFail ? 'Attempted' : isScheduling ? 'Scheduled' : 'Sent'}</p>
                            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${shouldFail ? 'text-red-600 dark:text-red-400 decoration-red-600/30 line-through' : 'text-slate-900 dark:text-white'}`}>
                                ${Number(formData.amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            {shouldFail && <p className="text-[10px] text-red-500 font-bold mt-0.5">Network Timeout - Not Charged</p>}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 space-y-2 shadow-inner">

                            {/* Transaction ID */}
                            <div className="flex justify-between items-center text-[10px] md:text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{refId}</span>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* From */}
                            <div className="flex justify-between items-start text-[10px] md:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">**** {mainAccount?.accountNumber?.slice(-4) || '....'}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* To */}
                            <div className="flex justify-between items-start text-[10px] md:text-xs">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">To</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{formData.recipientName}</span>
                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                        {renderBankIcon(selectedBank, "w-3 h-3")}
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{selectedBank.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block font-mono">**** {formData.accountNumber.slice(-4)}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>

                            {/* Status */}
                            <div className="flex justify-between items-center text-[10px] md:text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide flex items-center gap-1 ${shouldFail ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30' : isScheduling ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                    {shouldFail ? <XCircle size={10} /> : isScheduling ? <Calendar size={10} /> : <CheckCircle size={10} />} {shouldFail ? 'Failed' : isScheduling ? 'Scheduled' : 'Completed'}
                                </span>
                            </div>

                            {/* Note */}
                            {formData.note && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-[10px] md:text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 shrink-0 mr-4">Note</span>
                                        <span className="font-medium text-slate-900 dark:text-white text-right italic break-words line-clamp-2">"{formData.note}"</span>
                                    </div>
                                </>
                            )}

                            {shouldFail && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-[10px] md:text-xs bg-red-50 dark:bg-red-900/10 p-1.5 rounded-lg">
                                        <span className="text-red-500 font-bold mt-0.5">Error</span>
                                        <span className="text-red-700 dark:text-red-400 font-medium text-right max-w-[150px]">Connection timed out. Please try again later.</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 no-capture">
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                                <span className="inline">{isSharing ? 'Preparing...' : 'Share Receipt'}</span>
                            </button>
                        </div>

                        <button onClick={resetForm} className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 text-xs md:text-sm no-capture">
                            Make Another Transfer
                        </button>
                        {onBack && (
                            <button onClick={onBack} className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs md:text-sm no-capture">
                                Back to Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // REVIEW VIEW
    if (step === 'review') {
        return (
            <div className="min-h-full flex flex-col md:items-center md:justify-center animate-fade-in p-0 md:p-4">
                <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:shadow-xl md:border border-slate-100 dark:border-slate-700 md:overflow-hidden flex flex-col h-auto">
                    <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
                        <button onClick={() => setStep('form')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Review Transfer</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Amount to send</p>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">${formData.amount}</h1>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-4 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-xs text-slate-500 font-mono">**** {mainAccount?.accountNumber?.slice(-4)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">To</span>
                                <span className="font-bold text-slate-900 dark:text-white">{formData.recipientName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Bank</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedBank.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Account</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">**** {formData.accountNumber.slice(-4)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Date</span>
                                <span className="font-bold text-slate-900 dark:text-white">{transactionDate}</span>
                            </div>
                            {formData.note && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Note</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formData.note}</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                        </button>
                    </div>
                </div>

                {
                    showPinModal && (
                        <PinVerificationModal
                            isOpen={showPinModal}
                            title="Confirm Transfer"
                            subtitle={`Enter PIN to send $${formData.amount}`}
                            expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
                            onSuccess={executeTransfer}
                            onClose={() => setShowPinModal(false)}
                            email={user?.email}
                            onSendOtp={onSendOtp}
                            onUpdatePin={onUpdatePin}
                        />
                    )
                }
            </div >
        );
    }

    // FORM VIEW
    return (
        <div className="min-h-full flex flex-col md:items-center md:justify-center animate-fade-in p-0 md:p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:shadow-xl md:border border-slate-100 dark:border-slate-700 md:overflow-hidden flex flex-col h-auto md:h-auto md:max-h-[calc(100vh-100px)]">

                {/* Header */}
                <div className="p-2.5 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 md:sticky md:top-0 md:z-10 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">New Transfer</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Send money to any bank account</p>
                    </div>
                </div>

                <form onSubmit={handleContinue} className="md:flex-1 md:overflow-y-auto p-2.5 md:p-8 space-y-3 md:space-y-6">

                    {/* 1. Recipient Details */}
                    <div className="space-y-2 md:space-y-4">
                        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <User size={12} className="md:w-3.5 md:h-3.5" /> Recipient Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            <div className="space-y-1 md:space-y-1.5">
                                <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                    className="w-full p-2.5 md:p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-1 md:space-y-1.5 relative" ref={bankDropdownRef}>
                                <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Bank</label>

                                {/* Custom Dropdown Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                                    className="w-full p-2.5 md:p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {renderBankIcon(selectedBank, "w-5 h-5 md:w-6 md:h-6")}
                                        <span className="truncate">{selectedBank.name}</span>
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showBankDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Custom Dropdown List */}
                                {showBankDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                        {banks.map(bank => (
                                            <button
                                                key={bank.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, bankId: String(bank.id) });
                                                    setShowBankDropdown(false);
                                                }}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                            >
                                                {renderBankIcon(bank, "w-8 h-8")}
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{bank.name}</p>
                                                </div>
                                                {String(formData.bankId) === String(bank.id) && <CheckCircle size={16} className="ml-auto text-blue-600 dark:text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Account Number</label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 md:w-[18px] md:h-[18px]" />
                                <input
                                    type="number"
                                    placeholder="0000 0000 0000"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* 2. Amount & Payment */}
                    <div className="space-y-2 md:space-y-4">
                        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={12} className="md:w-3.5 md:h-3.5" /> Payment Details
                        </h3>

                        {/* From Account Static Display */}
                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Pay From</label>
                            <div className="w-full p-2.5 md:p-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-[10px]">{isBalanceHidden ? 'Available: ••••••••' : `Available: $${mainAccount?.balance.toLocaleString()}`}</span>
                                </div>
                                <ChevronDown size={16} className="opacity-0" /> {/* Hidden but keeps spacing if needed */}
                            </div>
                        </div>

                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Amount</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-slate-900 dark:text-white md:w-5 md:h-5" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleAmountChange}
                                    className="w-full pl-9 md:pl-10 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl md:text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <div className="flex justify-between px-1">
                                <span className="text-[10px] md:text-xs text-slate-500">{isBalanceHidden ? 'Available: ••••••••' : `Available: $${mainAccount?.balance.toLocaleString() || '0.00'}`}</span>
                                {dailyLimit !== Infinity && (
                                    <span className={`text-[10px] md:text-xs font-bold ${remainingDaily < 100 ? 'text-red-500' : 'text-blue-600'}`}>
                                        Daily Limit Remaining: ${remainingDaily.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {error && (
                                <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={12} /> {error}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 md:space-y-1.5">
                            <label className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Reference (Optional)</label>
                            <div className="relative">
                                <FileText size={14} className="absolute left-3 md:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 md:w-[18px] md:h-[18px]" />
                                <input
                                    type="text"
                                    placeholder="What is this for?"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Action */}
                <div className="p-[5px] md:p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 mt-auto md:sticky md:bottom-0 md:z-10">
                    <button
                        onClick={handleContinue}
                        disabled={!formData.recipientName || !formData.accountNumber || !formData.amount}
                        className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm md:text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Continue <ChevronRight size={16} className="md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};