import React, { useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import {
    Search, Filter, Download, Calendar, ChevronLeft, ChevronRight,
    ArrowDownCircle, ArrowUpCircle, MoreHorizontal, X, Printer,
    FileText, CheckCircle, Clock, Share2, Loader2, AlertCircle,
    PlusCircle, Minus, Landmark, CreditCard, Wallet, Send,
    ArrowDownLeft, Apple, Coffee, ShoppingCart, Music,
    Smartphone, Activity, Shield, Zap, Tv, Utensils,
    Car, Film, ShoppingBag, HeartPulse, Globe, Pizza,
    Flame, Ticket, ArrowRightLeft, Store, Laptop, Plane,
    Gamepad2, Lightbulb, Receipt, User,
    // Fix: Added missing RefreshCw and TrendingUp imports
    RefreshCw, TrendingUp
} from 'lucide-react';
import { shareReceipt } from '../utils/receipt';

// Exact Asset Logos from Investment Page
const INVESTMENT_LOGOS: Record<string, string> = {
    'NVDA': 'https://logo.clearbit.com/nvidia.com?size=128',
    'AAPL': 'https://logo.clearbit.com/apple.com?size=128',
    'MSFT': 'https://logo.clearbit.com/microsoft.com?size=128',
    'AMZN': 'https://logo.clearbit.com/amazon.com?size=128',
    'TSLA': 'https://logo.clearbit.com/tesla.com?size=128',
    'GOOGL': 'https://logo.clearbit.com/google.com?size=128',
    'META': 'https://logo.clearbit.com/meta.com?size=128',
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png?v=024',
    'ADA': 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=024',
    'VTI': 'https://logo.clearbit.com/vanguard.com?size=128'
};

// --- Local Enhanced Iconography Helper ---
const getEnhancedTxAsset = (description: string = '', category: string = '', type: string = '') => {
    const desc = (description || '').toLowerCase();
    const cat = (category || '').toLowerCase();
    const t = (type || '').toLowerCase();

    // 1. Check Investment Logos (Highest Priority)
    for (const [symbol, url] of Object.entries(INVESTMENT_LOGOS)) {
        if (desc.includes(symbol.toLowerCase())) {
            return { type: 'image', url, symbol };
        }
    }

    // 2. Premium Brand Identity Map (Clearbit Integration)
    const brands: Record<string, string> = {
        'paypal': 'paypal.com',
        'wise': 'wise.com',
        'uber': 'uber.com',
        'lyft': 'lyft.com',
        'adobe': 'adobe.com',
        'netflix': 'netflix.com',
        'apple': 'apple.com',
        'amazon': 'amazon.com',
        'starbucks': 'starbucks.com',
        'spotify': 'spotify.com',
        'target': 'target.com',
        'walmart': 'walmart.com',
        'nike': 'nike.com',
        'mcdonald': 'mcdonalds.com',
        'burger king': 'bk.com',
        'google': 'google.com',
        'microsoft': 'microsoft.com',
        'shell': 'shell.com',
        'exxon': 'exxon.com',
        'costco': 'costco.com',
        'atlassian': 'atlassian.com',
        'slack': 'slack.com',
        'openai': 'openai.com',
        'figma': 'figma.com',
        'zoom': 'zoom.us',
        'discord': 'discord.com',
        'coinbase': 'coinbase.com',
        'binance': 'binance.com',
        'stripe': 'stripe.com',
        'verizon': 'verizon.com',
        'at&t': 'att.com',
        't-mobile': 't-mobile.com',
        'facebook': 'facebook.com',
        'meta': 'meta.com',
        'instagram': 'instagram.com',
        'x.com': 'x.com',
        'twitter': 'twitter.com',
        'airbnb': 'airbnb.com',
        'steam': 'steampowered.com',
        'playstation': 'playstation.com',
        'xbox': 'xbox.com'
    };

    for (const brand in brands) {
        if (desc.includes(brand)) {
            return { type: 'image', url: `https://logo.clearbit.com/${brands[brand]}?size=128`, symbol: brand };
        }
    }

    // 3. Category Logic Mapping (Fintech Standard)
    if (cat.includes('food') || cat.includes('restaurant')) return { type: 'icon', icon: Utensils, color: 'bg-orange-500' };
    if (cat.includes('coffee') || desc.includes('cafe')) return { type: 'icon', icon: Coffee, color: 'bg-amber-600' };
    if (cat.includes('shopping') || cat.includes('store')) return { type: 'icon', icon: ShoppingBag, color: 'bg-blue-600' };
    if (cat.includes('health') || cat.includes('medical')) return { type: 'icon', icon: HeartPulse, color: 'bg-red-500' };
    if (cat.includes('transport') || cat.includes('travel')) return { type: 'icon', icon: Plane, color: 'bg-sky-500' };
    if (cat.includes('bill') || cat.includes('utilit')) return { type: 'icon', icon: Zap, color: 'bg-yellow-500' };
    if (cat.includes('tech') || cat.includes('digital')) return { type: 'icon', icon: Laptop, color: 'bg-indigo-500' };
    if (cat.includes('entertainment') || cat.includes('film')) return { type: 'icon', icon: Film, color: 'bg-purple-500' };
    if (cat.includes('subscription') || cat.includes('service')) return { type: 'icon', icon: RefreshCw, color: 'bg-slate-600' };
    if (cat.includes('education')) return { type: 'icon', icon: FileText, color: 'bg-emerald-600' };
    if (cat.includes('investment')) return { type: 'icon', icon: TrendingUp, color: 'bg-emerald-500' };
    if (cat.includes('transfer')) return { type: 'icon', icon: ArrowRightLeft, color: 'bg-blue-500' };
    if (cat.includes('deposit') || cat.includes('top up')) return { type: 'icon', icon: PlusCircle, color: 'bg-emerald-500' };
    if (cat.includes('withdrawal')) return { type: 'icon', icon: Minus, color: 'bg-red-500' };

    // 4. Default Node Icon
    return { type: 'icon', icon: Landmark, color: 'bg-slate-400' };
};

interface TransactionsProps {
    transactions: Transaction[];
    onModalChange?: (isOpen: boolean) => void;
    onRecordDownload?: (statementInfo: any) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, onModalChange, onRecordDownload }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [listDateFilter, setListDateFilter] = useState('');

    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadStartDate, setDownloadStartDate] = useState('');
    const [downloadEndDate, setDownloadEndDate] = useState('');

    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

    const [itemsPerPage, setItemsPerPage] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 15);
    const prevTxCount = useRef(transactions.length);

    useEffect(() => {
        const handleResize = () => setItemsPerPage(window.innerWidth < 768 ? 10 : 15);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (transactions.length > prevTxCount.current) {
            setCurrentPage(1);
        }
        prevTxCount.current = transactions.length;
    }, [transactions.length]);

    useEffect(() => {
        const isModalOpen = showDownloadModal || !!selectedTx;
        if (onModalChange) onModalChange(isModalOpen);
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showDownloadModal, selectedTx, onModalChange]);

    const filteredTransactions = transactions.filter(t => {
        const desc = (t.description || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = desc.includes(search) || cat.includes(search);
        const isExpense = t.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT, TransactionType.PURCHASE].includes(t.type);
        const isIncome = (t.amount > 0 && !isExpense) || [TransactionType.DEPOSIT, TransactionType.TRANSFER_IN].includes(t.type);
        let matchesType = true;
        if (filterType === 'Income') matchesType = isIncome;
        if (filterType === 'Expense') matchesType = isExpense;
        let matchesDate = true;
        if (listDateFilter && t.date) {
            const filterDay = new Date(listDateFilter).toDateString();
            const txDay = new Date(t.date).toDateString();
            if (filterDay !== txDay) matchesDate = false;
        }
        return matchesSearch && matchesType && matchesDate;
    });

    filteredTransactions.sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return 1;
        if (isNaN(bTime)) return -1;
        return bTime - aTime;
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    }, [itemsPerPage, totalPages, currentPage]);

    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const totalIncome = filteredTransactions.filter(t => t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpense = filteredTransactions.filter(t => t.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT].includes(t.type)).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const handleDownloadConfirm = () => {
        if (onRecordDownload) {
            const startDate = downloadStartDate ? new Date(downloadStartDate).toLocaleDateString() : 'Start';
            const endDate = downloadEndDate ? new Date(downloadEndDate).toLocaleDateString() : 'End';
            onRecordDownload({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                range: `${startDate} - ${endDate}`,
                size: '1.2 MB'
            });
        }
        setShowDownloadModal(false);
    };

    const getDateLabel = (dateStr: string) => {
        if (!dateStr) return 'Unknown Date';
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const TransactionDetailModal = ({ tx, onClose }: { tx: Transaction, onClose: () => void }) => {
        const [isSharing, setIsSharing] = useState(false);
        const isNegative = tx.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT, TransactionType.PURCHASE].includes(tx.type);
        const color = isNegative ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400';

        const handleShareReceipt = async () => {
            setIsSharing(true);
            await shareReceipt('transaction-receipt', `Receipt-${tx.id}.png`);
            setIsSharing(false);
        };

        let badgeBg = 'bg-slate-100 dark:bg-slate-800';
        let badgeText = 'text-slate-700 dark:text-slate-300';
        let badgeBorder = 'border-slate-200 dark:border-slate-700';
        let badgeDot = 'bg-slate-400';

        if (tx.status === 'Success') {
            badgeBg = 'bg-emerald-50 dark:bg-emerald-900/20';
            badgeText = 'text-emerald-700 dark:text-emerald-400';
            badgeBorder = 'border-emerald-100 dark:border-emerald-800';
            badgeDot = 'bg-emerald-500';
        } else if (tx.status === 'Pending') {
            badgeBg = 'bg-amber-50 dark:bg-amber-900/20';
            badgeText = 'text-amber-700 dark:text-amber-400';
            badgeBorder = 'border-amber-100 dark:border-amber-800';
            badgeDot = 'bg-amber-500';
        } else if (tx.status === 'Cancelled' || tx.status === 'Failed') {
            badgeBg = 'bg-red-50 dark:bg-red-900/20';
            badgeText = 'text-red-700 dark:text-red-400';
            badgeBorder = 'border-red-100 dark:border-red-800';
            badgeDot = 'bg-red-500';
        }

        const asset = getEnhancedTxAsset(tx.description, tx.category, tx.type);

        return (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
                <div className="relative w-full max-w-[400px] bg-transparent mb-[85px] md:mb-0 animate-in slide-in-from-bottom-10 md:animate-in md:fade-in md:zoom-in duration-200">
                    <div id="transaction-receipt" className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-full h-20 rounded-b-[50%] scale-x-150 z-0 ${tx.status === 'Success' ? 'bg-blue-600' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1 bg-black/10 hover:bg-black/20 rounded-full text-white no-capture"><X size={16} /></button>
                        <div className="relative z-10 pt-4 pb-2 text-center text-white">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-xl overflow-hidden border-2 border-white">
                                {asset.type === 'image' ? (
                                    <img src={asset.url} alt="" className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = `https://ui-avatars.com/api/?name=${asset.symbol || tx.description?.charAt(0) || 'L'}&background=137fec&color=fff&bold=true`;
                                        }}
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${asset.color}`}>
                                        {asset.icon && <asset.icon size={20} className="text-white" />}
                                    </div>
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Transaction Details</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{tx.date ? new Date(tx.date).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="px-4 pb-4 bg-white dark:bg-slate-800 pt-2">
                            <div className="text-center mb-4">
                                <h1 className={`text-2xl font-bold tracking-tight ${color}`}>{isNegative ? '-' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
                                <div className="mt-2"><div className={`w-fit mx-auto flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg border ${badgeBg} ${badgeBorder} ${badgeText}`}><div className={`w-1.5 h-1.5 rounded-full ${badgeDot} shrink-0`}></div><span className="text-[10px] font-bold uppercase tracking-wider leading-none pt-[1px]">{tx.status}</span></div></div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 space-y-2">
                                <div className="flex justify-between items-start text-[10px]"><span className="text-slate-500 shrink-0 mt-0.5">Merchant/Recipient</span><span className="font-bold text-slate-900 dark:text-white text-right break-words max-w-[65%] leading-tight">{tx.description}</span></div>
                                <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                <div className="flex justify-between items-start text-[10px]"><span className="text-slate-500 shrink-0 mt-0.5">Category</span><span className="font-medium text-slate-700 dark:text-slate-300 text-right">{tx.category}</span></div>
                                <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                <div className="flex justify-between items-start text-[10px]"><span className="text-slate-500 shrink-0 mt-0.5">Transaction ID</span><span className="font-mono text-slate-700 dark:text-slate-300 text-right break-all ml-4">{tx.id}</span></div>
                                <div className="border-t border-slate-200 dark:border-slate-700 border-dashed"></div>
                                <div className="flex justify-between items-start text-[10px]"><span className="text-slate-500 shrink-0 mt-0.5">Type</span><span className="font-medium text-slate-700 dark:text-slate-300 text-right">{tx.type}</span></div>
                            </div>
                            <div className="mt-4 flex gap-2 no-capture"><button onClick={handleShareReceipt} disabled={isSharing} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed">{isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}{isSharing ? 'Preparing...' : 'Share'}</button></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    let lastDateLabel = '';

    return (
        <div className="max-w-[1600px] mx-auto relative px-0 md:px-0">
            {selectedTx && <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
            {showDownloadModal && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDownloadModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl w-full max-w-sm p-6 shadow-2xl border-t md:border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-10 md:animate-in md:fade-in md:zoom-in duration-200 pb-8 md:pb-6 mb-[85px] md:mb-0">
                        <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center"><FileText size={20} /></div><h3 className="font-bold text-slate-900 dark:text-white text-lg">Download Statement</h3></div><button onClick={() => setShowDownloadModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button></div>
                        <div className="space-y-4 mb-6">
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">From Date</label><input type="date" value={downloadStartDate} onChange={e => setDownloadStartDate(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">To Date</label><input type="date" value={downloadEndDate} onChange={e => setDownloadEndDate(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        </div>
                        <button onClick={handleDownloadConfirm} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"><Download size={18} /> Generate PDF</button>
                    </div>
                </div>
            )}

            <div className="space-y-4 md:space-y-6 animate-fade-in pt-2">
                <div className="grid grid-cols-2 gap-2 md:gap-4 px-0 md:px-0">
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div><p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wide">Income</p><h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">${totalIncome.toLocaleString()}</h3></div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400"><ArrowDownCircle size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div><p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 uppercase tracking-wide">Spend</p><h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">${totalExpense.toLocaleString()}</h3></div>
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"><ArrowUpCircle size={18} className="md:w-6 md:h-6" /></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 border-t md:border border-slate-100 dark:border-slate-700 md:rounded-xl shadow-sm flex flex-col min-h-[50vh] md:min-h-[60vh]">
                    <div className="p-2.5 md:p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            {['All', 'Income', 'Expense'].map((type) => (
                                <button key={type} onClick={() => { setFilterType(type as any); setCurrentPage(1); }} className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${filterType === type ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}>{type}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-8 pr-3 py-1.5 md:py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white" /></div>
                            <div className="relative">
                                <div className={`flex items-center justify-center p-2 border rounded-lg transition-colors cursor-pointer ${listDateFilter ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500'}`}><Calendar size={16} className="shrink-0" /><input type="date" value={listDateFilter} onChange={(e) => { setListDateFilter(e.target.value); setCurrentPage(1); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" /></div>
                                {listDateFilter && <button onClick={() => setListDateFilter('')} className="absolute -top-2 -right-2 bg-slate-200 dark:bg-slate-700 rounded-full p-0.5 text-slate-600 dark:text-slate-300 shadow-sm z-20"><X size={10} /></button>}
                            </div>
                            <button onClick={() => setShowDownloadModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"><Printer size={14} /> <span className="hidden md:inline">Statement</span></button>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700"><tr><th className="px-6 py-4 w-[140px]">Date</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 w-[50px]"></th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {paginatedTransactions.length > 0 ? (paginatedTransactions.map((t) => {
                                    const isNegative = t.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT, TransactionType.PURCHASE].includes(t.type);
                                    const asset = getEnhancedTxAsset(t.description, t.category, t.type);
                                    return (
                                        <tr key={t.id} onClick={() => setSelectedTx(t)} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.date ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}<div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.date ? new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {asset.type === 'image' ? (
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0">
                                                            <img
                                                                src={asset.url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = `https://ui-avatars.com/api/?name=${asset.symbol || t.description?.charAt(0) || 'L'}&background=137fec&color=fff&bold=true`;
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${asset.color}`}>
                                                            {asset.icon && <asset.icon size={20} />}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0"><p className="font-bold text-slate-900 dark:text-white truncate">{t.description || 'Untitled Transaction'}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">NODE: {t.type}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 tracking-tighter">{t.category || 'General'}</span></td>
                                            <td className="px-6 py-4"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${t.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' : t.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900' : t.status === 'Processing' || t.status === 'On Hold' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900' : t.status === 'Failed' || t.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}><span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Success' ? 'bg-emerald-500' : t.status === 'Pending' ? 'bg-amber-500' : t.status === 'Processing' || t.status === 'On Hold' ? 'bg-blue-500' : t.status === 'Failed' || t.status === 'Cancelled' ? 'bg-red-500' : 'bg-slate-500'}`}></span>{t.status || 'Success'}</div></td>
                                            <td className={`px-6 py-4 text-right font-bold ${isNegative ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>{isNegative ? '-' : '+'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-right"><button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button></td>
                                        </tr>
                                    );
                                })) : (<tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"><div className="flex flex-col items-center gap-2"><Search size={24} className="text-slate-300 dark:text-slate-600" /><p>No transactions found matching your filters.</p></div></td></tr>)}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden flex-1">
                        {paginatedTransactions.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {paginatedTransactions.map((t) => {
                                    const isNegative = t.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT, TransactionType.PURCHASE].includes(t.type);
                                    const asset = getEnhancedTxAsset(t.description, t.category, t.type);
                                    const dateLabel = getDateLabel(t.date || '');
                                    const showDateHeader = dateLabel !== lastDateLabel;
                                    if (showDateHeader) lastDateLabel = dateLabel;

                                    return (
                                        <React.Fragment key={t.id}>
                                            {showDateHeader && (
                                                <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">{dateLabel}</div>
                                            )}
                                            <div onClick={() => setSelectedTx(t)} className="p-3 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/30 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    {asset.type === 'image' ? (
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-slate-100 shrink-0">
                                                            <img
                                                                src={asset.url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = `https://ui-avatars.com/api/?name=${asset.symbol || t.description?.charAt(0) || 'L'}&background=137fec&color=fff&bold=true`;
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${asset.color}`}>
                                                            {asset.icon && <asset.icon size={20} />}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{t.description || 'Untitled'}</p><p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.category || 'General'}</p></div>
                                                </div>
                                                <div className="text-right"><p className={`text-sm font-bold ${isNegative ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>{isNegative ? '-' : '+'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><div className="flex items-center justify-end gap-1 mt-1"><span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Success' ? 'bg-emerald-500' : t.status === 'Pending' ? 'bg-amber-500' : t.status === 'Processing' || t.status === 'On Hold' ? 'bg-blue-500' : t.status === 'Failed' || t.status === 'Cancelled' ? 'bg-red-500' : 'bg-slate-500'}`}></span><span className="text-[9px] text-slate-400 dark:text-slate-500">{t.status || 'Success'}</span></div></div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        ) : (<div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center h-64"><div className="flex flex-col items-center gap-3"><div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center"><Search size={24} className="text-slate-400 dark:text-slate-600" /></div><p className="text-sm font-medium">No transactions found.</p><p className="text-xs text-slate-400">Try adjusting your filters.</p></div></div>)}
                    </div>

                    <div className="p-2 md:p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto bg-white dark:bg-slate-800 sticky bottom-0">
                        <p>Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages || 1}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};