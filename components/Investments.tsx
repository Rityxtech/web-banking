import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Asset } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Search, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Briefcase, Bitcoin, Zap, Filter, RefreshCw, X, ChevronRight, Minus, PieChart as PieIcon, Wallet, AlertCircle, CheckCircle, Loader2, Unplug } from 'lucide-react';
import { PinVerificationModal } from './ui/PinVerificationModal';
import { NetworkDisruptionModal } from './ui/NetworkDisruptionModal';

interface InvestmentsProps {
    assets: Asset[];
    totalPortfolio: number;
    walletBalance: number;
    onBuyAsset: (symbol: string, name: string, amount: number, price: number) => Promise<boolean>;
    onModalChange?: (isOpen: boolean) => void;
    user?: any;
    isBalanceHidden?: boolean;
    onSendOtp?: () => Promise<string | null>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
    shouldFail?: boolean;
}

const ALLOCATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

// Enhanced Asset Metadata with verified domains for logos
const ASSET_METADATA: Record<string, { logo: string; type: string }> = {
    'NVDA': { logo: 'https://logo.clearbit.com/nvidia.com?size=128', type: 'Stock' },
    'AAPL': { logo: 'https://logo.clearbit.com/apple.com?size=128', type: 'Stock' },
    'MSFT': { logo: 'https://logo.clearbit.com/microsoft.com?size=128', type: 'Stock' },
    'AMZN': { logo: 'https://logo.clearbit.com/amazon.com?size=128', type: 'Stock' },
    'TSLA': { logo: 'https://logo.clearbit.com/tesla.com?size=128', type: 'Stock' },
    'GOOGL': { logo: 'https://logo.clearbit.com/google.com?size=128', type: 'Stock' },
    'META': { logo: 'https://logo.clearbit.com/meta.com?size=128', type: 'Stock' },
    'BTC': { logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024', type: 'Crypto' },
    'ETH': { logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024', type: 'Crypto' },
    'SOL': { logo: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=024', type: 'Crypto' },
    'ADA': { logo: 'https://cryptologos.cc/logos/cardano-ada-logo.png?v=024', type: 'Crypto' },
    'VTI': { logo: 'https://logo.clearbit.com/vanguard.com?size=128', type: 'Stock' }
};

export const Investments: React.FC<InvestmentsProps> = ({ assets, totalPortfolio, walletBalance, onBuyAsset, onModalChange, user, isBalanceHidden = false, onSendOtp, onUpdatePin, shouldFail = false }) => {
    const [activeTab, setActiveTab] = useState<'portfolio' | 'market'>('portfolio');
    const [marketFilter, setMarketFilter] = useState<'all' | 'stocks' | 'crypto'>('all');
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [selectedAsset, setSelectedAsset] = useState<{ symbol: string, price: number } | null>(null);
    const [tradeAmount, setTradeAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [networkError, setNetworkError] = useState<string | null>(null);
    const [showDisruptionModal, setShowDisruptionModal] = useState(false);
    const [lastSync, setLastSync] = useState(new Date());

    // Real-time market state
    const [marketPrices, setMarketPrices] = useState<any[]>([
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 135.50, change: 4.5, type: 'Stock' },
        { symbol: 'AAPL', name: 'Apple Inc.', price: 228.80, change: 1.2, type: 'Stock' },
        { symbol: 'MSFT', name: 'Microsoft', price: 412.20, change: -0.8, type: 'Stock' },
        { symbol: 'AMZN', name: 'Amazon.com', price: 188.60, change: 2.1, type: 'Stock' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: 242.30, change: -2.5, type: 'Stock' },
        { symbol: 'BTC', name: 'Bitcoin', price: 64250.00, change: -1.5, type: 'Crypto', coingeckoId: 'bitcoin' },
        { symbol: 'ETH', name: 'Ethereum', price: 3450.00, change: 2.1, type: 'Crypto', coingeckoId: 'ethereum' },
        { symbol: 'SOL', name: 'Solana', price: 145.20, change: 5.4, type: 'Crypto', coingeckoId: 'solana' },
        { symbol: 'ADA', name: 'Cardano', price: 0.45, change: -0.5, type: 'Crypto', coingeckoId: 'cardano' }
    ]);

    // Sync Logic
    const syncMarket = useCallback(async () => {
        try {
            const cryptoAssets = marketPrices.filter(p => p.type === 'Crypto' && p.coingeckoId);
            const cryptoIds = cryptoAssets.map(p => p.coingeckoId).join(',');

            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`);
            const data = await res.json();

            setMarketPrices(prev => prev.map(p => {
                if (p.type === 'Crypto' && data[p.coingeckoId]) {
                    return {
                        ...p,
                        price: data[p.coingeckoId].usd,
                        change: parseFloat(data[p.coingeckoId].usd_24h_change.toFixed(2))
                    };
                }
                // Simulate Stock Drift for realism (High Fidelity Simulation)
                if (p.type === 'Stock') {
                    const drift = 1 + (Math.random() * 0.002 - 0.001); // Up or down 0.1%
                    return { ...p, price: parseFloat((p.price * drift).toFixed(2)) };
                }
                return p;
            }));
            setLastSync(new Date());
        } catch (e) {
            // Fallback for simulation heartbeat
            setMarketPrices(prev => prev.map(p => {
                const drift = 1 + (Math.random() * 0.0006 - 0.0003);
                return { ...p, price: parseFloat((p.price * drift).toFixed(2)) };
            }));
        }
    }, [marketPrices]);

    useEffect(() => {
        const interval = setInterval(syncMarket, 10000); // 10s ultra-live updates
        return () => clearInterval(interval);
    }, [syncMarket]);

    useEffect(() => {
        if (onModalChange) onModalChange(showTradeModal || !!networkError);
        document.body.style.overflow = showTradeModal || !!networkError ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showTradeModal, networkError, onModalChange]);

    // Real-time Calculations
    const activeAssets = useMemo(() => assets.filter(a => Number(a.shares) > 0), [assets]);

    const { investedCapital, totalReturnVal, totalReturnPct, historyData, allocationData } = useMemo(() => {
        const invested = activeAssets.reduce((acc, asset) => {
            const mPrice = marketPrices.find(m => m.symbol === asset.symbol)?.price || 100;
            const costBasis = Number(asset.amount);
            return acc + costBasis;
        }, 0);

        const currentVal = activeAssets.reduce((acc, asset) => {
            const mPrice = marketPrices.find(m => m.symbol === asset.symbol)?.price || 100;
            return acc + (Number(asset.shares) * mPrice);
        }, 0);

        const retVal = currentVal - invested;
        const retPct = invested > 0 ? (retVal / invested) * 100 : 0;

        const volatilityFactors = [0.94, 0.92, 0.96, 0.95, 0.98, 0.99, 1.0];
        const hist = volatilityFactors.map((factor, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: currentVal > 0 ? currentVal * factor : 0
            };
        });

        const alloc = activeAssets.length > 0
            ? activeAssets.map((asset, index) => ({
                name: asset.symbol,
                value: (marketPrices.find(m => m.symbol === asset.symbol)?.price || 100) * Number(asset.shares),
                color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]
            }))
            : [{ name: 'Cash', value: 100, color: '#e2e8f0' }];

        return {
            investedCapital: invested,
            totalReturnVal: retVal,
            totalReturnPct: retPct,
            historyData: hist,
            allocationData: alloc
        };
    }, [activeAssets, marketPrices]);

    const handleOpenTrade = (symbol: string, price: number = 0, type: 'buy' | 'sell' = 'buy') => {
        const mAsset = marketPrices.find(a => a.symbol === symbol);
        const finalPrice = price || mAsset?.price || 100;
        setSelectedAsset({ symbol, price: finalPrice });
        setTradeType(type);
        setTradeAmount('');
        setError('');
        setSuccessMsg('');
        setShowTradeModal(true);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setTradeAmount(parts.join('.'));
    };

    const handleSetMax = () => {
        if (tradeType === 'sell' && selectedAsset) {
            const asset = assets.find(a => a.symbol === selectedAsset.symbol);
            if (asset) {
                const mAsset = marketPrices.find(m => m.symbol === asset.symbol);
                const val = (mAsset?.price || 0) * Number(asset.shares);
                setTradeAmount(val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                setError('');
            }
        } else if (tradeType === 'buy') {
            setTradeAmount(walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            setError('');
        }
    };

    const handleExecuteTrade = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawAmount = parseFloat(tradeAmount.replace(/,/g, ''));
        if (!selectedAsset || rawAmount <= 0) return;

        if (tradeType === 'buy') {
            if (rawAmount > walletBalance) {
                setError(`Insufficient balance. You have $${walletBalance.toLocaleString()}.`);
                return;
            }
        } else {
            const holding = assets.find(a => a.symbol === selectedAsset.symbol);
            const mAsset = marketPrices.find(m => m.symbol === selectedAsset.symbol);
            const currentVal = (mAsset?.price || 0) * (holding?.shares || 0);
            if (!holding || rawAmount > currentVal + 0.01) {
                setError(`Insufficient holdings. You own $${currentVal.toLocaleString()}.`);
                return;
            }
        }

        setShowPinModal(true);
    };

    const processTrade = async () => {
        setShowPinModal(false);

        const rawAmount = parseFloat(tradeAmount.replace(/,/g, ''));
        if (!selectedAsset || rawAmount <= 0) return;

        setIsProcessing(true);

        // Block if transaction disruption is active
        if (shouldFail) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsProcessing(false);
            setShowDisruptionModal(true);
            return;
        }

        const assetInfo = marketPrices.find(a => a.symbol === selectedAsset.symbol);
        const assetName = assetInfo?.name || selectedAsset.symbol;
        const finalAmount = tradeType === 'buy' ? rawAmount : -rawAmount;

        try {
            const success = await onBuyAsset(selectedAsset.symbol, assetName, finalAmount, selectedAsset.price);
            setIsProcessing(false);
            if (success) {
                setSuccessMsg(tradeType === 'buy' ? `Purchased ${selectedAsset.symbol}` : `Sold ${selectedAsset.symbol}`);
                setTimeout(() => {
                    setShowTradeModal(false);
                    setSuccessMsg('');
                    setActiveTab('portfolio');
                }, 1500);
            } else {
                setNetworkError("Market liquidity issue. Order declined.");
            }
        } catch (e) {
            setIsProcessing(false);
            setNetworkError("Engine synchronization fault.");
        }
    };

    const getFilteredMarketData = () => {
        return marketPrices.filter(p => {
            if (marketFilter === 'stocks') return p.type === 'Stock';
            if (marketFilter === 'crypto') return p.type === 'Crypto';
            return true;
        });
    };

    const currentHolding = selectedAsset ? assets.find(a => a.symbol === selectedAsset.symbol) : null;
    const isPortfolioEmpty = activeAssets.length === 0;

    const mobileCheck = () => window.innerWidth < 768;

    return (
        <div className="max-w-[1600px] mx-auto relative">

            {networkError && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNetworkError(null)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 mb-0 pb-10 md:pb-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-6xl mb-4">😓</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction Halted</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{networkError}</p>
                            <button onClick={() => setNetworkError(null)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg">Close & Retry</button>
                        </div>
                    </div>
                </div>
            )}

            {showDisruptionModal && (
                <NetworkDisruptionModal isOpen={showDisruptionModal} onClose={() => setShowDisruptionModal(false)} />
            )}

            {showPinModal && (
                <PinVerificationModal
                    isOpen={showPinModal}
                    title="Confirm Investment"
                    subtitle={`Enter PIN to ${tradeType} $${tradeAmount}`}
                    expectedPin={user?.pin || user?.user_metadata?.pin || '0000'}
                    onSuccess={processTrade}
                    onClose={() => setShowPinModal(false)}
                    email={user?.email}
                    onSendOtp={onSendOtp}
                    onUpdatePin={onUpdatePin}
                />
            )}

            {showTradeModal && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setShowTradeModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl border-t md:border border-slate-100 dark:border-slate-700 animate-slide-up md:animate-in md:fade-in md:zoom-in duration-200 pb-8 md:pb-6 mb-[85px] md:mb-0">
                        {!successMsg && (
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0">
                                        <img
                                            src={ASSET_METADATA[selectedAsset?.symbol || '']?.logo}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://ui-avatars.com/api/?name=${selectedAsset?.symbol}&background=137fec&color=fff&bold=true`;
                                            }}
                                        />
                                    </div>
                                    <div><h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedAsset?.symbol}</h3><p className="text-[10px] md:text-xs text-slate-500">Live Price: ${selectedAsset?.price.toLocaleString()}</p></div>
                                </div>
                                <button onClick={() => setShowTradeModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                            </div>
                        )}
                        {successMsg ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center animate-in zoom-in">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 shadow-sm"><CheckCircle size={32} /></div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Order Executed</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{successMsg}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleExecuteTrade} className="p-4 md:p-6 space-y-4 md:space-y-6">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-500"><span>{tradeType === 'buy' ? 'Wallet Balance' : 'Current Value'}</span><span className="text-slate-900 dark:text-white">{tradeType === 'buy' ? (isBalanceHidden ? '••••••••' : `$${walletBalance.toLocaleString()}`) : (isBalanceHidden ? '••••••••' : `$${((marketPrices.find(m => m.symbol === selectedAsset?.symbol)?.price || 0) * (currentHolding?.shares || 0)).toLocaleString()}`)}</span></div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">{tradeType === 'buy' ? 'Investment Amount' : 'Sell Amount'}</label>
                                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span><input type="text" inputMode="decimal" value={tradeAmount} onChange={handleAmountChange} className="w-full pl-10 pr-16 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xl md:text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="0.00" required /><button type="button" onClick={handleSetMax} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors">{tradeType === 'buy' ? 'MAX' : 'ALL'}</button></div>
                                    {error && <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1"><AlertCircle size={12} /> {error}</div>}
                                </div>
                                {selectedAsset && tradeAmount && !error && (<div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800"><span className="text-[10px] md:text-xs text-slate-500 font-medium">Est. Quantity</span><span className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">{(parseFloat(tradeAmount.replace(/,/g, '')) / (marketPrices.find(m => m.symbol === selectedAsset.symbol)?.price || 1)).toFixed(4)} {selectedAsset.symbol}</span></div>)}
                                <button type="submit" disabled={isProcessing} className={`w-full py-3 md:py-4 text-white rounded-xl font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2 mb-4 md:mb-0 ${tradeType === 'buy' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'} disabled:opacity-70 disabled:cursor-not-allowed`}>{isProcessing ? <Loader2 size={18} className="animate-spin" /> : (tradeType === 'buy' ? 'Confirm Investment' : 'Confirm Sale')}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-2 md:space-y-6 animate-fade-in pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-1 md:mb-2">
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Portfolio</p>
                                <div className="flex items-center gap-1"><RefreshCw size={10} className="text-slate-300 animate-spin-slow" /><span className="text-[8px] text-slate-400">Sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{isBalanceHidden ? '••••••••' : `$${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</h2>
                            <div className="flex items-center gap-2 mt-1 md:mt-2">
                                <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1 ${totalReturnVal >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>{totalReturnVal >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{totalReturnVal >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%</span>
                                <span className="text-[10px] md:text-xs text-slate-400">Net Growth</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"><p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-2">Market Sentiment</p><h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${totalReturnVal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{isBalanceHidden ? '••••••••' : `${totalReturnVal >= 0 ? '+' : ''}$${Math.abs(totalReturnVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</h2><div className="flex items-center gap-2 mt-1 md:mt-2"><span className="text-[10px] md:text-xs text-slate-400">Net Profit / Loss</span></div></div>
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"><div className="flex justify-between items-center"><p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Invested Capital</p><Briefcase size={16} className="text-slate-400 md:w-4 md:h-4" /></div><div><h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{isBalanceHidden ? '••••••••' : `$${investedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</h2><div className="w-full bg-slate-100 dark:bg-slate-700 h-1 md:h-1.5 rounded-full overflow-hidden mt-2 md:mt-3"><div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${totalPortfolio > 0 ? (investedCapital / totalPortfolio) * 100 : 0}%` }}></div></div><p className="text-[9px] md:text-[10px] text-slate-400 mt-1 md:mt-2 text-right">{totalPortfolio > 0 ? ((investedCapital / totalPortfolio) * 100).toFixed(1) : 0}% cost basis</p></div></div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 md:gap-6">
                    <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"><div className="flex justify-between items-center mb-4 md:mb-6"><h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg flex items-center gap-2"><Activity size={16} className="text-blue-500 md:w-[18px]" /> Performance</h3><div className="flex bg-slate-100 dark:bg-slate-700/50 rounded-lg p-0.5 md:p-1"><button className="px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm">1W</button>{['1M', '3M', '1Y', 'ALL'].map(range => (<button key={range} className="px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-all">{range}</button>))}</div></div><div className="h-48 md:h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={historyData}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#fff' }} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} /><Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" /></AreaChart></ResponsiveContainer></div></div>
                    <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col"><h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-lg mb-2 md:mb-4">Allocation</h3><div className="flex items-center gap-4 md:block flex-1"><div className="flex-1 min-h-[140px] md:min-h-[200px] relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocationData} innerRadius={mobileCheck() ? 40 : 60} outerRadius={mobileCheck() ? 55 : 80} paddingAngle={5} dataKey="value">{allocationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']} /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-[9px] md:text-xs text-slate-400 font-medium">Top Asset</span><span className="text-sm md:text-xl font-bold text-slate-900 dark:text-white">{allocationData.length > 0 && !isPortfolioEmpty ? allocationData.sort((a, b) => b.value - a.value)[0].name : 'None'}</span></div></div>{isPortfolioEmpty ? (<p className="text-center text-xs text-slate-400 italic mt-2">No assets allocated.</p>) : (<div className="flex-1 md:mt-4 space-y-1.5 md:space-y-2">{allocationData.slice(0, 3).map((item, i) => (<div key={i} className="flex items-center justify-between text-xs md:text-sm"><div className="flex items-center gap-2"><div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span></div><span className="text-slate-900 dark:text-white font-bold">{totalPortfolio > 0 ? ((item.value / totalPortfolio) * 100).toFixed(1) : 0}%</span></div>))}</div>)}</div></div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"><div className="flex border-b border-slate-100 dark:border-slate-700"><button onClick={() => setActiveTab('market')} className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'market' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Explore Market</button><button onClick={() => setActiveTab('portfolio')} className={`flex-1 py-3 md:py-4 text-xs md:text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>My Portfolio</button></div>
                    <div className="p-0">
                        {activeTab === 'portfolio' && (
                            <>
                                {isPortfolioEmpty ? (<div className="flex flex-col items-center justify-center py-16 text-center"><div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-slate-400"><PieIcon size={40} opacity={0.6} /></div><h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start building your wealth</h3><p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-8">You haven't invested in any assets yet. Explore the market to find opportunities.</p><button onClick={() => setActiveTab('market')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Explore Market</button></div>) : (
                                    <>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-700"><tr><th className="px-6 py-4">Asset</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-right">Holdings</th><th className="px-6 py-4 text-right">Value</th><th className="px-6 py-4 text-right">Return</th><th className="px-6 py-4 text-center">Action</th></tr></thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {activeAssets.map((asset) => {
                                                        const mAsset = marketPrices.find(m => m.symbol === asset.symbol);
                                                        const currentPrice = mAsset?.price || (Number(asset.amount) / (Number(asset.shares) || 1));
                                                        return (
                                                            <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0"><img src={ASSET_METADATA[asset.symbol]?.logo} alt="" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=137fec&color=fff&bold=true`; }} /></div><div><p className="font-bold text-slate-900 dark:text-white">{asset.symbol}</p><p className="text-xs text-slate-500 dark:text-slate-400">{asset.name}</p></div></div></td>
                                                                <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">{isBalanceHidden ? '••••••••' : `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</td>
                                                                <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">{isBalanceHidden ? '••••' : Number(asset.shares).toFixed(4)} <span className="text-[10px]">{asset.symbol}</span></td>
                                                                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{isBalanceHidden ? '••••••••' : `$${(currentPrice * Number(asset.shares)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</td>
                                                                <td className="px-6 py-4 text-right"><div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${asset.isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>{asset.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Number(asset.growth).toFixed(2)}%</div></td>
                                                                <td className="px-6 py-4 text-center"><button onClick={() => handleOpenTrade(asset.symbol, currentPrice, 'sell')} className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Sell</button></td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                                            {activeAssets.map((asset) => {
                                                const mAsset = marketPrices.find(m => m.symbol === asset.symbol);
                                                const currentPrice = mAsset?.price || (Number(asset.amount) / (Number(asset.shares) || 1));
                                                return (
                                                    <div key={asset.id} className="p-3 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                                                        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0"><img src={ASSET_METADATA[asset.symbol]?.logo} alt="" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.src = `https://ui-avatars.com/api/?name=${asset.symbol}&background=137fec&color=fff&bold=true`; }} /></div><div><p className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{isBalanceHidden ? '••••' : Number(asset.shares).toFixed(2)} shares</p></div></div>
                                                        <div className="flex items-center gap-3"><div className="text-right"><p className="font-bold text-sm text-slate-900 dark:text-white">{isBalanceHidden ? '••••••••' : `$${(currentPrice * Number(asset.shares)).toLocaleString()}`}</p><div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${asset.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{asset.isPositive ? '+' : ''}{Number(asset.growth).toFixed(2)}%</div></div><button onClick={() => handleOpenTrade(asset.symbol, currentPrice, 'sell')} className="ml-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-1.5 rounded-lg"><Minus size={14} /></button></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        {activeTab === 'market' && (
                            <div>
                                <div className="p-2 md:p-4 border-b border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto scrollbar-hide"><button onClick={() => setMarketFilter('all')} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-colors whitespace-nowrap ${marketFilter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>All Assets</button><button onClick={() => setMarketFilter('stocks')} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-colors whitespace-nowrap ${marketFilter === 'stocks' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Stocks</button><button onClick={() => setMarketFilter('crypto')} className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-colors whitespace-nowrap ${marketFilter === 'crypto' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>Crypto</button></div>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-left"><thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-700"><tr><th className="px-6 py-4">Instrument</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-right">24h Change</th><th className="px-6 py-4 text-center">Trend</th><th className="px-6 py-4 text-center"></th></tr></thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {getFilteredMarketData().map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0"><img src={ASSET_METADATA[item.symbol]?.logo} alt="" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.src = `https://ui-avatars.com/api/?name=${item.symbol}&background=137fec&color=fff&bold=true`; }} /></div><div><p className="font-bold text-slate-900 dark:text-white">{item.symbol}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p></div></div></td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    <td className="px-6 py-4 text-right"><span className={`text-xs font-bold ${item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{item.change >= 0 ? '+' : ''}{item.change}%</span></td>
                                                    <td className="px-6 py-4 text-center"><div className="flex items-end justify-center gap-0.5 h-6">{[1, 2, 3, 4, 5].map(bar => (<div key={bar} className={`w-1 rounded-t-sm ${item.change >= 0 ? 'bg-emerald-200 dark:bg-emerald-900' : 'bg-red-200 dark:bg-red-900'}`} style={{ height: `${Math.random() * 100}%` }}></div>))}</div></td>
                                                    <td className="px-6 py-4 text-center"><button onClick={() => handleOpenTrade(item.symbol, item.price, 'buy')} className="flex items-center gap-1 mx-auto text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"><Plus size={14} /> Invest</button></td>
                                                </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                                    {getFilteredMarketData().map((item, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full overflow-hidden bg-white shadow-sm border border-slate-200 shrink-0"><img src={ASSET_METADATA[item.symbol]?.logo} alt="" className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.src = `https://ui-avatars.com/api/?name=${item.symbol}&background=137fec&color=fff&bold=true`; }} /></div><div><p className="font-bold text-sm text-slate-900 dark:text-white">{item.symbol}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{item.name}</p></div></div>
                                            <div className="flex items-center gap-3"><div className="text-right"><p className="font-bold text-sm text-slate-900 dark:text-white">${item.price.toLocaleString()}</p><p className={`text-[10px] font-bold ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{item.change >= 0 ? '+' : ''}{item.change}%</p></div><button onClick={() => handleOpenTrade(item.symbol, item.price, 'buy')} className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold">Invest</button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};