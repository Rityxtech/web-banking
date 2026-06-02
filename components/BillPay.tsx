
import React, { useState, useEffect } from 'react';
import { Account, Transaction, TransactionType } from '../types';
import { ArrowLeft, Zap, Droplet, Wifi, Smartphone, Tv, CreditCard, CheckCircle, ChevronRight, History, Search, AlertCircle, Share2, Loader2, ChevronDown, Lock, XCircle } from 'lucide-react';
import { shareReceipt } from '../utils/receipt';
import { PinVerificationModal } from './ui/PinVerificationModal';
import { NetworkDisruptionModal } from './ui/NetworkDisruptionModal';

interface BillPayProps {
    accounts: Account[];
    transactions: Transaction[];
    onPay: (biller: string, amount: number) => Promise<boolean> | void;
    onBack: () => void;
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

const BILLERS = [
    { id: 'electric', name: 'ComEd Electric', icon: Zap, color: 'bg-yellow-500' },
    { id: 'water', name: 'City Water Dept', icon: Droplet, color: 'bg-blue-500' },
    { id: 'internet', name: 'Xfinity', icon: Wifi, color: 'bg-purple-500' },
    { id: 'phone', name: 'Verizon', icon: Smartphone, color: 'bg-red-500' },
    { id: 'tv', name: 'Netflix', icon: Tv, color: 'bg-red-600' },
    { id: 'card', name: 'Amex Card', icon: CreditCard, color: 'bg-blue-600' },
];

export const BillPay: React.FC<BillPayProps> = ({
    accounts, transactions, onPay, onBack,
    maxLimit = 50000, shouldFail = false,
    kycLevel = 0, dailyLimit = 0, dailyUsage = 0,
    user, isBalanceHidden = false,
    onSendOtp, onUpdatePin
}) => {
    const [step, setStep] = useState<'form' | 'result'>('form');
    const [amount, setAmount] = useState('');
    const [selectedBillerId, setSelectedBillerId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [transactionDate, setTransactionDate] = useState('');
    const [refId, setRefId] = useState('');
    const [error, setError] = useState('');
    const [showDisruptionModal, setShowDisruptionModal] = useState(false);

    const selectedBiller = BILLERS.find(b => b.id === selectedBillerId);
    const mainAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
    const remainingDaily = Math.max(0, dailyLimit - dailyUsage);

    // Filter recent bill payments
    const recentBills = transactions
        .filter(t => t.category === 'Bills')
        .slice(0, 3);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setAmount(parts.join('.'));
    };

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!amount || !selectedBillerId || !accountNumber) return;

        const rawAmount = parseFloat(amount.replace(/,/g, ''));

        if (rawAmount < 3) {
            setError('Minimum bill payment amount is $3.00');
            return;
        }

        if (rawAmount > 50) {
            setError('Maximum bill payment amount is $50.00');
            return;
        }

        if (mainAccount && rawAmount > mainAccount.balance) {
            setError(`Insufficient balance. Available: $${mainAccount.balance.toLocaleString()}`);
            return;
        }

        if (rawAmount > maxLimit) {
            setError(`Amount exceeds the global transaction limit of $${maxLimit.toLocaleString()}`);
            return;
        }

        setShowPinModal(true);
    };

    const processPayment = async () => {
        setShowPinModal(false);
        setIsLoading(true);
        const rawAmount = parseFloat(amount.replace(/,/g, ''));

        // Block if transaction disruption is active
        if (shouldFail) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsLoading(false);
            setShowDisruptionModal(true);
            return;
        }

        // Simulate delay for UX
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await onPay(selectedBiller?.name || 'Unknown Biller', rawAmount);

        // Only proceed to success if not blocked
        if (result !== false) {
            setTransactionDate(new Date().toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
            setRefId(`#BILL-${Math.floor(10000000 + Math.random() * 90000000)}`);
            setStep('result');
        }

        setIsLoading(false);
    };

    const resetForm = () => {
        setAmount('');
        setSelectedBillerId('');
        setAccountNumber('');
        setError('');
        setStep('form');
    };

    const handleShare = async () => {
        setIsSharing(true);
        await shareReceipt('bill-receipt', `BillPay-${refId}.png`);
        setIsSharing(false);
    };

    if (step === 'result') {
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in p-2">
                <div id="bill-receipt" className="bg-white dark:bg-slate-800 w-full max-w-[420px] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">
                    {/* ... (Success View Content) ... */}
                    <div className={`absolute top-0 left-0 w-full h-20 rounded-b-[50%] scale-x-150 z-0 ${shouldFail ? 'bg-red-600' : 'bg-purple-600'}`}></div>

                    <div className="relative z-10 pt-4 pb-2 text-center text-white">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl animate-bounce">
                            {shouldFail ? <XCircle size={24} className="text-red-600" /> : <CheckCircle size={24} className="text-purple-600" />}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{shouldFail ? 'Payment Failed' : 'Bill Paid Successfully'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{transactionDate}</p>
                    </div>

                    <div className="px-3 pb-3 space-y-3 bg-white dark:bg-slate-800">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Amount {shouldFail ? 'Attempted' : 'Paid'}</p>
                            <h1 className={`text-2xl font-bold tracking-tight ${shouldFail ? 'text-red-600 dark:text-red-400 decoration-red-600/30 line-through' : 'text-slate-900 dark:text-white'}`}>
                                ${Number(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            {shouldFail && <p className="text-[10px] text-red-500 font-bold mt-0.5">Network Timeout - Not Charged</p>}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 space-y-2 shadow-inner">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{refId}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                            <div className="flex justify-between items-start text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">Paid From</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{mainAccount?.name || 'Main Wallet'}</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">**** {mainAccount?.accountNumber?.slice(-4)}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                            <div className="flex justify-between items-start text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">Biller</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{selectedBiller?.name}</span>
                                    {accountNumber && <span className="text-[10px] text-slate-400 block font-mono">Acct: {accountNumber}</span>}
                                </div>
                            </div>
                            {shouldFail && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                    <div className="flex justify-between items-start text-[10px] bg-red-50 dark:bg-red-900/10 p-1.5 rounded-lg">
                                        <span className="text-red-500 font-bold mt-0.5">Error</span>
                                        <span className="text-red-700 dark:text-red-400 font-medium text-right max-w-[150px]">Connection timed out. Please try again later.</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 no-capture">
                            <button onClick={handleShare} disabled={isSharing} className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                                {isSharing ? 'Wait...' : 'Share'}
                            </button>

                            <button onClick={resetForm} className="flex-1 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 text-xs">
                                Pay Another
                            </button>
                        </div>

                        <button onClick={onBack} className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs no-capture">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full rounded-none md:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full md:h-auto md:max-h-[calc(100vh-100px)]">

                {/* Header */}
                <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Pay Bills</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Utilities, Services & Cards</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 pb-32 md:pb-0">
                    <form onSubmit={handleContinue} className="p-2 md:p-8 space-y-2 md:space-y-6">

                        {/* Biller Selection - Horizontal Scroll */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Search size={12} /> Select Biller
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {BILLERS.map(biller => (
                                    <div
                                        key={biller.id}
                                        onClick={() => setSelectedBillerId(biller.id)}
                                        className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 min-w-[100px] flex-shrink-0 snap-center ${selectedBillerId === biller.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${biller.color}`}>
                                            <biller.icon size={20} />
                                        </div>
                                        <p className={`text-[10px] font-bold text-center truncate w-full ${selectedBillerId === biller.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {biller.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amount & Account Input */}
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">

                            {/* Account Selector (Locked to Main) */}
                            <div className="relative mb-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pay From</label>
                                <div className="w-full p-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium flex items-center justify-between text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                    <span>{mainAccount?.name || 'Main Wallet'} ({isBalanceHidden ? '••••••••' : `$${mainAccount?.balance.toLocaleString()}`})</span>
                                    <Lock size={14} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={amount}
                                        onChange={handleAmountChange}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <div className="flex justify-between px-1">
                                    <span className="text-[10px] md:text-xs text-slate-500">{isBalanceHidden ? 'Available: ••••••••' : `Available: $${mainAccount?.balance.toLocaleString() || '0.00'}`}</span>
                                    {dailyLimit !== Infinity && (
                                        <span className={`text-[10px] md:text-xs font-bold ${remainingDaily < 100 ? 'text-red-500' : 'text-purple-600'}`}>
                                            Daily Limit: ${remainingDaily.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {error && (
                                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} /> {error}
                                    </div>
                                )}
                            </div>

                            {selectedBillerId && (
                                <div className="space-y-1 pt-2 border-t border-slate-50 dark:border-slate-700 animate-fade-in">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account ID</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="Enter account ID"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Recent Bills */}
                        {recentBills.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <History size={12} /> Recent Payments
                                </h3>
                                <div className="space-y-0">
                                    {recentBills.map((tx, i) => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                                    <Zap size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description.replace('Bill Pay: ', '')}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">-${Math.abs(tx.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Action */}
                <div className="p-3 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 fixed bottom-16 w-[97%] left-1/2 -translate-x-1/2 rounded-b-3xl z-30 md:static md:bottom-auto md:w-full md:transform-none md:rounded-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
                    <button
                        onClick={handleContinue}
                        disabled={!amount || !selectedBillerId || !accountNumber || isLoading}
                        className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm md:text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Processing...' : `Pay ${selectedBiller?.name || 'Bill'}`}
                        {!isLoading && <ChevronRight size={16} className="md:w-5 md:h-5" />}
                    </button>
                </div>

                {showDisruptionModal && (
                    <NetworkDisruptionModal isOpen={showDisruptionModal} onClose={() => setShowDisruptionModal(false)} />
                )}

                {showPinModal && (
                    <PinVerificationModal
                        isOpen={showPinModal}
                        title="Confirm Payment"
                        subtitle={`Enter PIN to pay $${amount}`}
                        expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
                        onSuccess={processPayment}
                        onClose={() => setShowPinModal(false)}
                        email={user?.email}
                        onSendOtp={onSendOtp}
                        onUpdatePin={onUpdatePin}
                    />
                )}
            </div>
        </div>
    );
};