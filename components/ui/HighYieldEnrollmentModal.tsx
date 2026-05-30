import React, { useState, useRef, useEffect } from 'react';
import { APP_CONFIG } from '../../config';
import { X, TrendingUp, Check, ChevronRight, ShieldCheck, Lock, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { PinVerificationModal } from './PinVerificationModal';

interface HighYieldEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnroll: (amount: number, sourceAccountId: number) => Promise<void>;
    userPin?: string;
    accounts: any[];
    onSendOtp?: () => Promise<string | null>;
    onVerifyOtp?: (otp: string) => Promise<boolean>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
    userEmail?: string;
}

export const HighYieldEnrollmentModal: React.FC<HighYieldEnrollmentModalProps> = ({ isOpen, onClose, onEnroll, userPin, accounts, onSendOtp, onVerifyOtp, onUpdatePin, userEmail }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const fundingAccounts = accounts.filter(a =>
        ((a.type || '').toLowerCase() === 'checking' ||
            (a.type || '').toLowerCase() === 'savings' ||
            (a.name || '').toLowerCase().includes('main') ||
            (a.name || '').toLowerCase().includes('saving')) &&
        (a.type || '').toLowerCase() !== 'investment' &&
        !(a.name || '').toLowerCase().includes('high yield')
    );

    const [selectedAccountId, setSelectedAccountId] = useState<number>(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    React.useEffect(() => {
        if (fundingAccounts.length > 0 && selectedAccountId === 0) {
            setSelectedAccountId(fundingAccounts[0].id);
        }
    }, [fundingAccounts, selectedAccountId]);

    if (!isOpen) return null;

    const handleTermsAccept = () => {
        if (acceptedTerms) {
            setStep(3);
        }
    };

    const handleAmountSubmit = (val?: string) => {
        const value = parseFloat((val || amount).replace(/,/g, ''));
        if (isNaN(value) || value <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const selectedAccount = fundingAccounts.find(a => String(a.id) === String(selectedAccountId));
        if (!selectedAccount) {
            setError('Please select a valid funding account');
            return;
        }

        if (value > Number(selectedAccount.balance)) {
            setError('Insufficient funds in selected account');
            return;
        }
        setShowPin(true);
    };

    const handlePinSuccess = async () => {
        console.log('[HYI] PIN verified, starting enrollment...');
        setShowPin(false);
        setIsProcessing(true);

        // Safety timeout: if enrollment hangs, reset after 15s
        const safetyTimeout = setTimeout(() => {
            console.warn('[HYI] Enrollment safety timeout triggered — forcing state reset');
            if (isMountedRef.current) setIsProcessing(false);
        }, 15000);

        try {
            await onEnroll(parseFloat(amount.replace(/,/g, '')), selectedAccountId);
            console.log('[HYI] Enrollment completed successfully');
        } catch (error) {
            console.error('[HYI] Enrollment failed:', error);
        } finally {
            clearTimeout(safetyTimeout);
            if (isMountedRef.current) {
                setIsProcessing(false);
                console.log('[HYI] Processing state reset');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && onClose()}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 z-[110]">
                {/* Header Image/Gradient */}
                <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
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
                        <TrendingUp size={40} className="text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                                    Grow Your Wealth
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Activate your High Yield Investment account today and start earning industry-leading returns on your idle cash.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                        8%
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Annual Percentage Yield</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Compounded daily, paid monthly</p>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    {[
                                        'No minimum deposit required',
                                        'Zero maintenance fees',
                                        'Instant liquidity access',
                                        'One-time deposit Lock-in'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                Start Investing <ArrowRight size={20} />
                            </button>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                                    Terms & Conditions
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Please review the terms before activating your account.
                                </p>
                            </div>

                            <div className="h-48 overflow-y-auto custom-scrollbar p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 leading-relaxed space-y-2">
                                <p><strong>1. Interest Rates:</strong> The Annual Percentage Yield (APY) is fixed at 8% provided funds remain locked.</p>
                                <p><strong>2. Locked Savings:</strong> Funds deposited are locked until you explicitly choose to break the saving. Breaking the saving may result in forfeiture of accrued interest for the current period.</p>
                                <p><strong>3. Risks:</strong> While funds are FDIC insured, investment products involve risk. Past performance does not guarantee future results.</p>
                                <p><strong>4. Fees:</strong> {APP_CONFIG.BANK_NAME} reserves the right to introduce maintenance fees with 30 days prior notice.</p>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${acceptedTerms ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {acceptedTerms && <Check size={14} strokeWidth={3} />}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">I accept the Terms & Conditions</span>
                            </div>

                            <button
                                onClick={handleTermsAccept}
                                disabled={!acceptedTerms}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue <ArrowRight size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                                    Initial Deposit
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Enter the amount you wish to lock in your High Yield Savings.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Funding Source</label>
                                    <div className="relative">
                                        <select
                                            value={selectedAccountId}
                                            onChange={(e) => {
                                                setSelectedAccountId(Number(e.target.value));
                                                setError('');
                                            }}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                        >
                                            {fundingAccounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name} (${Number(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronRight className="rotate-90 text-slate-400" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                        <span>Available Balance</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                                            ${(fundingAccounts.find(a => String(a.id) === String(selectedAccountId))?.balance || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                                        <input
                                            type="text"
                                            value={amount}
                                            onChange={e => {
                                                const rawValue = e.target.value.replace(/,/g, '');
                                                if (!isNaN(Number(rawValue)) || rawValue === '') {
                                                    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                                    setAmount(formatted);
                                                }
                                                setError('');
                                            }}
                                            className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white pl-10 focus:outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-red-500 text-xs font-bold flex items-center gap-1 animate-in slide-in-from-top-1">
                                        <X size={12} /> {error}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleAmountSubmit(amount)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                Authorize & Lock Funds <ShieldCheck size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showPin && (
                <div className="fixed inset-0 z-[200]">
                    <PinVerificationModal
                        isOpen={showPin}
                        title="Authorize Activation"
                        subtitle="Enter PIN to create your Investment Account"
                        expectedPin={userPin || '0000'}
                        onSuccess={handlePinSuccess}
                        onClose={() => setShowPin(false)}
                        email={userEmail}
                        onSendOtp={onSendOtp}
                        onVerifyOtp={onVerifyOtp}
                        onUpdatePin={onUpdatePin}
                    />
                </div>
            )}

            {isProcessing && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="text-center text-white">
                        <Loader2 size={48} className="animate-spin mb-4 mx-auto text-indigo-500" />
                        <h3 className="text-xl font-bold mb-2">Processing Investment...</h3>
                        <p className="text-white/60">Allocating funds to secure node</p>
                    </div>
                </div>
            )}
        </div>
    );
};
