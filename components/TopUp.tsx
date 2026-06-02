
import React, { useState, useEffect, useRef } from 'react';
import { Account, Card, Transaction, TransactionType, TransactionStatus } from '../types';
import { ArrowLeft, Wallet, CheckCircle, ChevronRight, DollarSign, CreditCard, ShieldCheck, History, Snowflake, AlertCircle, Lock, Loader2, X, Mail, KeyRound, Clock, Share2 } from 'lucide-react';
import { shareReceipt } from '../utils/receipt';
import { supabase } from '../services/supabase';
import { mvp } from '../services/mvpService';
import { PinVerificationModal } from './ui/PinVerificationModal';
import { NetworkDisruptionModal } from './ui/NetworkDisruptionModal';

interface TopUpProps {
    user: any;
    onSendOtp?: () => Promise<string | null>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
    accounts: Account[];
    cards: Card[];
    transactions: Transaction[];
    onTopUp: (amount: number, status: TransactionStatus) => Promise<boolean> | void;
    onChangePin?: (id: number, newPin: string) => void;
    onBack: () => void;
    shouldFail?: boolean;
}

export const TopUp: React.FC<TopUpProps> = ({ user, onSendOtp, onUpdatePin, accounts, cards, transactions, onTopUp, onChangePin, onBack, shouldFail = false }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Only card sources now
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [transactionDate, setTransactionDate] = useState('');
    const [refId, setRefId] = useState('');
    const [error, setError] = useState('');
    const [showDisruptionModal, setShowDisruptionModal] = useState(false);
    const [txnStatus, setTxnStatus] = useState<TransactionStatus>('Success');

    // Use ref to avoid stale closure in async PIN modal flow
    const shouldFailRef = useRef(shouldFail);
    useEffect(() => {
        shouldFailRef.current = shouldFail;
    }, [shouldFail]);

    // PIN Verification State
    const [showPinModal, setShowPinModal] = useState(false);

    const mainAccount = accounts.find(a => a.is_main) || accounts[0];

    // Initialize selected card if available
    useEffect(() => {
        if (cards.length > 0) {
            setSelectedCardId(cards[0].id);
        }
    }, [cards]);



    // Filter recent deposits for the history section
    const recentDeposits = transactions
        .filter(t => t.type === TransactionType.DEPOSIT)
        .slice(0, 3);

    const getCardAsset = (type: string = '') => {
        const t = (type || '').toLowerCase();
        if (t.includes('visa')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', className: 'brightness-0 invert' };
        if (t.includes('master')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', className: '' };
        if (t.includes('amex') || t.includes('american')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg', className: 'brightness-0 invert' };
        return null;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setAmount(parts.join('.'));
        setError('');
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Block if transaction disruption is active (read from ref to avoid stale closure)
        console.log('[TopUp.handleContinue] shouldFailRef:', shouldFailRef.current);
        if (shouldFailRef.current) {
            console.log('[TopUp.handleContinue] BLOCKED: Transaction disruption is active');
            setShowDisruptionModal(true);
            return;
        }

        const rawAmount = parseFloat(amount.replace(/,/g, ''));
        if (!amount || rawAmount <= 0) return;

        if (!selectedCardId) {
            setError('Please select a card to top up from.');
            return;
        }

        const card = cards.find(c => c.id === selectedCardId);
        if (card && card.isFrozen) {
            setError('Selected card is frozen. Please unfreeze it in Wallet or select another card.');
            return;
        }

        // Require PIN verification
        setShowPinModal(true);
    };

    const processTopUp = async () => {
        setShowPinModal(false);
        const card = cards.find(c => c.id === selectedCardId);
        if (!card) return;

        setIsLoading(true);
        const rawAmount = parseFloat(amount.replace(/,/g, ''));
        const cardBalance = Number(card.balance) || 0;

        // Block if transaction disruption is active (read from ref to avoid stale closure)
        console.log('[TopUp.processTopUp] shouldFailRef:', shouldFailRef.current);
        if (shouldFailRef.current) {
            console.log('[TopUp.processTopUp] BLOCKED: Transaction disruption is active');
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsLoading(false);
            setShowDisruptionModal(true);
            return;
        }

        try {
            // Deduct from card balance — use Supabase directly (MVP API is broken 404)
            const { error: cardUpdateErr } = await supabase
                .from('mvp_cards')
                .update({ balance: cardBalance - rawAmount })
                .eq('id', card.id);
            if (cardUpdateErr) throw new Error(cardUpdateErr.message);

            const status: TransactionStatus = 'Pending';
            setTxnStatus(status);

            setTransactionDate(new Date().toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
            setRefId(`#TOP-${Math.floor(100000 + Math.random() * 90000000)}`);

            const result = await onTopUp(rawAmount, status);
            setIsLoading(false);

            // Only proceed to success screen if explicitly allowed (or returned true)
            // Defaulting to true if the function returns void for backward compat, 
            // but strict typed check handles boolean
            if (result !== false) {
                setStep('success');
            }
        } catch (err: any) {
            setIsLoading(false);
            setError("Transaction failed. Please try again.");
        }
    };

    const resetForm = () => {
        setAmount('');
        setError('');
        setStep('form');
    };

    const handleShare = async () => {
        setIsSharing(true);
        await shareReceipt('topup-receipt', `TopUp-${refId}.png`);
        setIsSharing(false);
    };

    const getPaymentSourceName = () => {
        if (selectedCardId) {
            const card = cards.find(c => c.id === selectedCardId);
            return card ? `${card.type} Card` : 'Card';
        }
        return 'Unknown Source';
    };

    const getPaymentSourceNumber = () => {
        if (selectedCardId) {
            const card = cards.find(c => c.id === selectedCardId);
            return card ? card.number : '....';
        }
        return '....';
    };

    if (step === 'success') {
        const isPending = txnStatus === 'Pending';
        return (
            <div className="min-h-full flex items-center justify-center animate-fade-in">
                <div id="topup-receipt" className="bg-white dark:bg-slate-800 w-full max-w-[420px] md:max-w-none rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col relative">

                    <div className={`absolute top-0 left-0 w-full h-20 rounded-b-[50%] scale-x-150 z-0 ${isPending ? 'bg-amber-500' : 'bg-emerald-600'}`}></div>

                    <div className="relative z-10 pt-4 pb-2 text-center text-white">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl animate-bounce">
                            {isPending ? <Clock size={24} className="text-amber-500" /> : <CheckCircle size={24} className="text-emerald-600" />}
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{isPending ? 'Deposit Pending' : 'Top Up Successful'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{transactionDate}</p>
                    </div>

                    <div className="px-3 pb-3 space-y-3 bg-white dark:bg-slate-800">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Amount {isPending ? 'Processing' : 'Added'}</p>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                ${Number(amount.replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            {isPending && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full inline-block">Awaiting confirmation from bank</p>}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 space-y-2 shadow-inner">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{refId}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                            <div className="flex justify-between items-start text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">Source</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">{getPaymentSourceName()}</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">**** {getPaymentSourceNumber().slice(-4)}</span>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                            <div className="flex justify-between items-start text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400 mt-0.5">Deposited To</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 dark:text-white block">Main Wallet</span>
                                    <span className="text-[10px] text-slate-400 block font-mono">**** {mainAccount?.accountNumber?.slice(-4)}</span>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleShare} disabled={isSharing} className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 text-xs no-capture disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                            {isSharing ? 'Preparing Receipt...' : 'Share Receipt'}
                        </button>

                        <button onClick={resetForm} className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20 text-xs no-capture">
                            Top Up Again
                        </button>
                        <button onClick={onBack} className="w-full py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs no-capture">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col animate-fade-in relative">

            {/* Network Disruption Modal */}
            {showDisruptionModal && (
                <NetworkDisruptionModal isOpen={showDisruptionModal} onClose={() => setShowDisruptionModal(false)} />
            )}

            {/* PIN Verification Modal */}
            {showPinModal && (
                <PinVerificationModal
                    isOpen={showPinModal}
                    title="Confirm Top Up"
                    subtitle={`Enter PIN to charge card for $${amount}`}
                    expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
                    onSuccess={processTopUp}
                    onClose={() => setShowPinModal(false)}
                    email={user?.email}
                    onSendOtp={onSendOtp}
                    onUpdatePin={onUpdatePin}
                />
            )}

            <div className="bg-white dark:bg-slate-800 w-full rounded-none md:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full md:h-auto md:max-h-[calc(100vh-100px)]">

                <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">Top Up Wallet</h2>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">Add funds instantly</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 pb-32 md:pb-0">
                    <form onSubmit={handleContinue} className="p-2 md:p-8 space-y-2 md:space-y-6">

                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign size={12} /> Amount
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
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {[50, 100, 200, 500].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => { setAmount(val.toLocaleString()); setError(''); }}
                                        className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200 transition-colors whitespace-nowrap bg-slate-50 dark:bg-slate-900"
                                    >
                                        +${val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Wallet size={12} /> Select Card
                            </h3>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {cards.map(card => {
                                    const asset = getCardAsset(card.type);
                                    return (
                                        <div
                                            key={card.id}
                                            onClick={() => { setSelectedCardId(card.id); setError(''); }}
                                            className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 min-w-[140px] flex-shrink-0 snap-center ${selectedCardId === card.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'} ${card.isFrozen ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm ${card.isFrozen ? 'grayscale' : ''}`}>
                                                    {asset ? <img src={asset.url} alt={card.type || 'Card'} className={`h-4 w-auto object-contain ${asset.className}`} /> : <CreditCard size={16} className="text-purple-600" />}
                                                </div>
                                                {selectedCardId === card.id && !card.isFrozen && <CheckCircle size={14} className="text-blue-500" />}
                                                {card.isFrozen && <Snowflake size={14} className="text-blue-400" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{card.type}</p>
                                                <p className="text-[10px] text-slate-500">•••• {card.number.slice(-4)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-2 border border-red-100 dark:border-red-800/50 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {recentDeposits.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2 shadow-sm">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <History size={12} /> Recent Top Ups
                                </h3>
                                <div className="space-y-0">
                                    {recentDeposits.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                    <DollarSign size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.description}</p>
                                                    <p className="text-[10px] text-slate-500">{tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-emerald-600">+${Math.abs(tx.amount).toLocaleString()}</span>
                                                {tx.status === 'Pending' && <p className="text-[9px] text-amber-500 font-bold">Pending</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-3 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 fixed bottom-16 w-[97%] left-1/2 -translate-x-1/2 rounded-b-3xl z-30 md:static md:bottom-auto md:w-full md:transform-none md:rounded-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
                    <button
                        onClick={handleContinue}
                        disabled={!amount || isLoading}
                        className="w-full py-3 md:py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold text-sm md:text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Processing...' : 'Confirm Top Up'}
                        {!isLoading && <ChevronRight size={16} className="md:w-5 md:h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};