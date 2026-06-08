import React, { useState, useMemo } from 'react';
import { APP_CONFIG } from '../config';
import { Transaction, Account, Card, Asset, TransactionType } from '../types';
import { Search, MoreHorizontal, ArrowUpRight, ArrowDownRight, Info, Eye, EyeOff, Send, ArrowDownLeft, Wallet, Receipt, CreditCard, Plus, X, Check, ChevronRight, Copy, Share2, Building, User, Smartphone, Loader2, ArrowRight, Utensils, ShoppingCart, Activity, Zap, Monitor, Coffee, BarChart3, Calendar, Snowflake, CheckCircle, Film, Car, ShoppingBag, HeartPulse, ArrowRightLeft, Globe, ShieldCheck, Plane, Laptop, RefreshCw, FileText, TrendingUp, PlusCircle, Minus, Landmark, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  assets?: Asset[];
  onQuickAction?: (action: string) => void;
  onCancelTransaction?: (id: string) => void;
  isBalanceHidden?: boolean;
  onToggleBalance?: () => void;
}

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

const SmallChart = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-10 w-16 md:h-16 md:w-24">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#grad${color.replace('#', '')})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const StatsCard = ({ title, value, change, isPositive, chartData, color, className }: any) => (
  <div className={`bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft flex justify-between items-start ${className || ''}`}>
    <div>
      <div className="flex items-center gap-2 mb-1 md:mb-2">
        <h3 className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</h3>
        <Info size={12} className="text-slate-300 dark:text-slate-500 md:w-3.5 md:h-3.5" />
      </div>
      <p className="text-lg md:text-3xl font-bold text-slate-900 dark:text-white mb-1 md:mb-2">{value}</p>
      <div className="flex items-center gap-1 text-[10px] md:text-sm font-medium">
        {isPositive ? (
          <ArrowUpRight size={12} className="text-emerald-500 md:w-4 md:h-4" />
        ) : (
          <ArrowDownRight size={12} className="text-red-500 md:w-4 md:h-4" />
        )}
        <span className="text-emerald-500">{change}</span>
        <span className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs ml-0.5 md:ml-1 whitespace-nowrap">vs last week</span>
      </div>
    </div>
    <SmallChart data={chartData} color={color} />
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick, color = 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' }: any) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 group flex-1 md:flex-none md:min-w-[60px]"
  >
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${color}`}>
      <Icon size={18} className="md:w-5 md:h-5" />
    </div>
    <span className="text-[10px] md:text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate w-full text-center">{label}</span>
  </button>
);

// Helper for dynamic icons (Enhanced to match Transactions.tsx)
const getCategoryIcon = (category: string = '') => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('restaurant') || cat.includes('grocer')) return { icon: Utensils, color: 'bg-orange-500' };
  if (cat.includes('shopping') || cat.includes('amazon') || cat.includes('costco')) return { icon: ShoppingBag, color: 'bg-blue-600' };
  if (cat.includes('health') || cat.includes('gym') || cat.includes('medical')) return { icon: HeartPulse, color: 'bg-red-500' };
  if (cat.includes('bill') || cat.includes('electric') || cat.includes('utilit')) return { icon: Zap, color: 'bg-yellow-500' };
  if (cat.includes('tech') || cat.includes('sub') || cat.includes('digital')) return { icon: Laptop, color: 'bg-indigo-500' };
  if (cat.includes('transport') || cat.includes('ride') || cat.includes('uber') || cat.includes('lyft') || cat.includes('travel')) return { icon: Plane, color: 'bg-sky-500' };
  if (cat.includes('entertainment') || cat.includes('netflix') || cat.includes('film')) return { icon: Film, color: 'bg-purple-500' };
  if (cat.includes('coffee') || cat.includes('cafe')) return { icon: Coffee, color: 'bg-amber-600' };
  if (cat.includes('subscription') || cat.includes('service')) return { icon: RefreshCw, color: 'bg-slate-600' };
  if (cat.includes('education')) return { icon: FileText, color: 'bg-emerald-600' };
  if (cat.includes('investment')) return { icon: TrendingUp, color: 'bg-emerald-500' };

  return { icon: Landmark, color: 'bg-slate-400' };
};

// Enhanced Helper for Transactions Icons (Real Logos)
export const getTxAsset = (description: string = '', category: string = '', type: string = '') => {
  const desc = (description || '').toLowerCase();
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();

  // 1. Check Investment Logos (Highest Priority)
  for (const [symbol, url] of Object.entries(INVESTMENT_LOGOS)) {
    if (desc.includes(symbol.toLowerCase())) {
      return { type: 'image', url, symbol };
    }
  }

  // 2. High-Fidelity Brand Map (Domain verified)
  const brandMap: Record<string, string> = {
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

  for (const key in brandMap) {
    if (desc.includes(key)) return { type: 'image', url: `https://logo.clearbit.com/${brandMap[key]}?size=128`, symbol: key };
  }

  // 3. Fallback to Category Icons (Logic matching getCategoryIcon)
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

  return { type: 'icon', icon: Landmark, color: 'bg-slate-400' };
};

// Helper for card assets
const getCardAsset = (type: string = '') => {
  const t = (type || '').toLowerCase();
  if (t.includes('visa')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', className: 'brightness-0 invert' };
  if (t.includes('master')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', className: '' };
  if (t.includes('amex') || t.includes('american')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg', className: 'brightness-0 invert' };
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, cards, assets = [], onQuickAction, onCancelTransaction, isBalanceHidden = false, onToggleBalance }) => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Calculate total balance from MAIN WALLET only
  const mainAccount = accounts.find(a => a.is_main) || accounts[0];
  const totalBalance = mainAccount ? mainAccount.balance : 0;

  // Asset Summaries
  const { totalSavings, totalLocked } = useMemo(() => {
    let savings = 0, locked = 0;
    accounts.forEach(a => {
      const type = (a.type || '').toLowerCase();
      const name = (a.name || '').toLowerCase();
      const bal = Number(a.balance) || 0;

      if (name.includes('high yield') || name.includes('locked')) {
        locked += bal;
      } else if (type === 'savings' || name.includes('saving')) {
        savings += bal;
      }
    });
    return { totalSavings: savings, totalLocked: locked };
  }, [accounts]);

  // Total portfolio value = cost basis adjusted by growth%, mirrors App.tsx totalPortfolio formula
  const totalInvestment = useMemo(() =>
    assets.reduce((sum, a) => {
      const growth = Number(a.growth) || 0;
      const isPositive = (a as any).is_positive == 1 || (a as any).is_positive === true || (a as any).is_positive === '1';
      const currentValue = Number(a.amount) * (1 + (isPositive ? growth : -growth) / 100);
      return sum + currentValue;
    }, 0),
    [assets]
  );

  // Filter transactions
  const validTransactions = transactions.filter(t => t.status === 'Success' || t.status === 'Pending' || t.status === 'Processing' || t.status === 'On Hold');
  const scheduledTransactions = transactions.filter(t => t.status === 'Scheduled');

  const handleCancelClick = () => {
    if (selectedScheduleId && onCancelTransaction) {
      onCancelTransaction(selectedScheduleId);
      setSuccessMsg('Scheduled payment cancelled');
      setSelectedScheduleId(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  // --- Real-time Chart Data Calculation ---
  const {
    txChartData,
    spentChartData,
    incomeChartData,
    mainChartData,
    totalSpent,
    totalIncome,
    avgIncome,
    avgExpense
  } = useMemo(() => {
    // 1. Last 7 Days for Small Charts
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    // Transactions Volume Chart Data
    const txData = last7Days.map(date => ({
      v: validTransactions.filter(t => t.date && t.date.startsWith(date)).length
    }));

    // Spending Chart Data
    const spData = last7Days.map(date => ({
      v: validTransactions
        .filter(t => t.date && t.date.startsWith(date) && (t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type)))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    }));

    // Income Chart Data
    const incData = last7Days.map(date => ({
      v: validTransactions
        .filter(t => t.date && t.date.startsWith(date) && t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0)
    }));

    // 2. Main Statistics Chart (Last 6 Months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        key: d.toISOString().slice(0, 7), // YYYY-MM
        label: d.toLocaleString('default', { month: 'short' })
      };
    });

    const mainData = last6Months.map(m => {
      const monthlyTx = validTransactions.filter(t => t.date && t.date.startsWith(m.key));
      const income = monthlyTx
        .filter(t => t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type))
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthlyTx
        .filter(t => t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { name: m.label, income, expense };
    });

    // 3. Totals and Averages
    const totSpent = validTransactions
      .filter(t => t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totInc = validTransactions
      .filter(t => t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const avInc = mainData.reduce((acc, curr) => acc + curr.income, 0) / (mainData.length || 1);
    const avExp = mainData.reduce((acc, curr) => acc + curr.expense, 0) / (mainData.length || 1);

    return {
      txChartData: txData,
      spentChartData: spData,
      incomeChartData: incData,
      mainChartData: mainData,
      totalSpent: totSpent,
      totalIncome: totInc,
      avgIncome: avInc,
      avgExpense: avExp
    };
  }, [validTransactions]);

  // Dynamic Top Expenses
  const expensesByCategory = validTransactions
    .filter(t => t.amount < 0 || ['Payment', 'Purchase', 'Transfer Out'].includes(t.type))
    .reduce((acc: any, t) => {
      const cat = t.category || 'General';
      if (!acc[cat]) acc[cat] = { amount: 0, count: 0 };
      acc[cat].amount += Math.abs(t.amount);
      acc[cat].count += 1;
      return acc;
    }, {});

  const topExpenses = Object.entries(expensesByCategory)
    .map(([category, data]: any) => {
      const { icon, color } = getCategoryIcon(category);
      return { category, amount: data.amount, count: data.count, icon, color };
    })
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="space-y-2.5 md:space-y-6 animate-fade-in relative">

      {/* Toast */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={18} /> <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* 2. Wallet Balance & Quick Actions */}
      <div className="bg-white dark:bg-slate-800 px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">Total Balance</h2>
            <button
              onClick={() => onToggleBalance?.()}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1 -ml-1"
            >
              {!isBalanceHidden ? <Eye size={14} className="md:w-4 md:h-4" /> : <EyeOff size={14} className="md:w-4 md:h-4" />}
            </button>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {!isBalanceHidden ? totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••'}
            </h1>
            <span className="hidden md:inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 font-medium">+2.5%</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-8 w-full md:w-auto">
          <QuickAction icon={Send} label="Transfer" onClick={() => onQuickAction?.('transfer')} />
          <QuickAction icon={Wallet} label="Top Up" onClick={() => onQuickAction?.('topup')} />
          <QuickAction icon={ArrowDownLeft} label="Request" onClick={() => onQuickAction?.('request')} />
          <QuickAction icon={Receipt} label="Bill Pay" onClick={() => onQuickAction?.('billpay')} />
          <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 hidden md:block"></div>
          <QuickAction
            icon={MoreHorizontal}
            label="More"
            onClick={() => onQuickAction?.('more')}
            color="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-800 group-hover:text-white"
          />
        </div>
      </div>

      {/* Asset Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
        {[
          { label: 'Checking Account', amount: totalBalance, icon: Wallet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Total Savings', amount: totalSavings, icon: Landmark, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Investments', amount: totalInvestment, icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { label: 'High Yield (Locked)', amount: totalLocked, icon: Lock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft flex items-center gap-3 md:gap-4 transition-transform hover:-translate-y-0.5">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
              <item.icon size={18} className="md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5 truncate">{item.label}</p>
              <p className="text-sm md:text-xl font-bold text-slate-900 dark:text-white truncate tracking-tight">
                {!isBalanceHidden ? item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2.5 md:gap-6">
        <div className="xl:col-span-2 space-y-2.5 md:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-6">
            <StatsCard
              title="Transactions"
              value={validTransactions.length}
              change="+2"
              isPositive={true}
              chartData={txChartData}
              color="#3b82f6"
            />
            <StatsCard
              title="Spent"
              value={`$${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              change="1.5%"
              isPositive={false}
              chartData={spentChartData}
              color="#ef4444"
            />
            <StatsCard
              title="Income"
              value={`$${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              change="+2.1%"
              isPositive={true}
              chartData={incomeChartData}
              color="#10b981"
              className="hidden md:flex"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">Statistics <Info size={14} className="text-slate-300 dark:text-slate-600 md:w-4 md:h-4" /></h3>
            </div>
            <div className="flex gap-6 md:gap-12 mb-2 md:mb-4">
              <div>
                <p className="text-slate-400 text-[10px] md:text-sm mb-0.5">Average Income</p>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
                  ${avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-[10px] md:text-sm font-medium text-emerald-500 ml-1 md:ml-2">↑ 16.8%</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] md:text-sm mb-0.5">Average Expenses</p>
                <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
                  ${avgExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  <span className="text-[10px] md:text-sm font-medium text-red-500 ml-1 md:ml-2">↓ 12.5%</span>
                </p>
              </div>
            </div>
            <div className="h-32 md:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mainChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} interval={0} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expense" name="Expenses" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">Recent Transaction <Info size={14} className="text-slate-300 dark:text-slate-600 md:w-4 md:h-4" /></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-3 pl-2 md:pl-4"><div className="w-3 h-3 md:w-4 md:h-4 border-2 border-slate-300 dark:border-slate-600 rounded"></div></th>
                    <th className="pb-3 pr-2">Name</th>
                    <th className="pb-3 pr-2 hidden md:table-cell">Transaction</th>
                    <th className="pb-3 pr-2 hidden sm:table-cell">Date</th>
                    <th className="pb-3 pr-2">Amount</th>
                    <th className="pb-3 pr-2 hidden sm:table-cell">Status</th>
                    <th className="pb-3 text-right pr-2 md:pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm">
                  {validTransactions.length > 0 ? (
                    [...validTransactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((t, i) => {
                      const asset = getTxAsset(t.description, t.category, t.type);
                      return (
                        <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="py-3 pl-2 md:pl-4"><div className="w-3 h-3 md:w-4 md:h-4 border-2 border-slate-300 dark:border-slate-600 rounded"></div></td>
                          <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
                            {asset.type === 'image' ? (
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden bg-white shadow-sm border border-slate-100 shrink-0">
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
                              <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white shrink-0 ${asset.color}`}>
                                {asset.icon && <asset.icon size={14} className="md:w-4 md:h-4" />}
                              </div>
                            )}
                            <span className="truncate">{t.description}</span>
                          </td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 hidden md:table-cell">{t.id}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">{t.date ? new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}</td>
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">{Math.abs(t.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                          <td className="py-3 hidden sm:table-cell">
                            <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium border
                                    ${t.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900' : t.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900' : t.status === 'Processing' || t.status === 'On Hold' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900' : t.status === 'Failed' || t.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900' : 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800'}
                                `}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 text-right pr-2 md:pr-4">
                            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreHorizontal size={16} className="md:w-[18px] md:h-[18px]" /></button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400 italic">No transactions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 md:space-y-6">
          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">My Cards</h3>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{cards.length} Active Cards</p>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 md:p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"><Search size={14} className="text-slate-400 md:w-4 md:h-4" /></button>
                <button onClick={() => onQuickAction?.('wallet')} className="flex items-center gap-1 px-2 py-1.5 md:px-3 md:py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300"><Plus size={14} className="md:w-4 md:h-4" /> Add</button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide snap-x">
              {cards.map((card) => {
                const asset = getCardAsset(card.type);
                return (
                  <div key={card.id} onClick={() => onQuickAction?.('wallet')} className={`flex-shrink-0 w-52 h-32 md:w-72 md:h-44 bg-gradient-to-r ${card.gradient} rounded-2xl p-4 md:p-5 text-white shadow-lg ${card.shadow} relative overflow-hidden snap-center transition-transform hover:scale-[1.02] duration-200 flex flex-col justify-between border border-white/10 ${card.isFrozen ? 'grayscale opacity-90' : ''} cursor-pointer`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6"></div>
                    {asset && <div className="absolute -bottom-8 -right-8 opacity-[0.07] rotate-[-15deg] pointer-events-none"><img src={asset.url} alt="" className="w-48 h-auto grayscale invert" /></div>}
                    {card.isFrozen && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20"><div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 text-slate-900 font-bold flex items-center gap-1.5 shadow-xl text-[10px] md:text-xs"><Snowflake size={12} className="text-blue-600" /> Frozen</div></div>}
                    <div className="flex justify-between items-start relative z-10"><span className="font-bold text-xs md:text-sm">{APP_CONFIG.BANK_NAME}</span>{asset ? <img src={asset.url} alt={card.type} className={`h-5 md:h-7 w-auto object-contain ${asset.className}`} /> : <span className="italic font-bold opacity-80 text-xs md:text-sm">{card.type}</span>}</div>
                    <div className="relative z-10"><div className="flex items-center gap-2 mb-1.5 md:mb-2"><div className="w-6 h-4 md:w-8 md:h-5 bg-yellow-200/80 rounded relative overflow-hidden"><div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div></div><div className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/50"></div></div><p className="font-mono text-sm md:text-lg tracking-wider drop-shadow-sm">•••• •••• •••• ••••</p></div>
                    <div className="flex justify-between items-end opacity-90 text-[8px] md:text-[10px] uppercase font-medium relative z-10"><div><span className="block opacity-70 text-[6px] md:text-[8px] mb-0.5">Card Holder</span><span>{card.holder}</span></div><div className="text-right"><span className="block opacity-70 text-[6px] md:text-[8px] mb-0.5">Expires</span><span>{card.expiry}</span></div></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-4 md:mb-6">Top expenses</h3>
            <div className="space-y-2.5 md:space-y-4">
              {topExpenses.length > 0 ? (
                topExpenses.map((expense: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 md:p-3 border border-slate-100 dark:border-slate-700 rounded-lg md:rounded-xl hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white ${expense.color}`}>
                        <expense.icon size={16} className="md:w-[18px] md:h-[18px]" />
                      </div>
                      <div><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{expense.category}</p><p className="text-[10px] md:text-xs text-slate-400">{expense.category}</p></div>
                    </div>
                    <div className="text-right"><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">${expense.amount.toLocaleString()}</p><p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full inline-block mt-0.5">{expense.count} Transactions &gt;</p></div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"><div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2"><BarChart3 size={20} /></div><p className="text-sm font-bold text-slate-600 dark:text-slate-300">No expenses yet</p><p className="text-[10px] text-slate-400">Start spending to see analytics</p></div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-3 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div className="flex items-center gap-2"><h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">Payment schedule</h3><Info size={12} className="text-slate-300 dark:text-slate-500 md:w-3.5 md:h-3.5" /></div>
              {selectedScheduleId && <button onClick={handleCancelClick} className="text-[10px] md:text-xs text-red-500 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors animate-in fade-in">Cancel Selected <X size={12} /></button>}
            </div>
            <div className="space-y-0">
              {scheduledTransactions.length > 0 ? (
                scheduledTransactions.map((item, i) => (
                  <div key={item.id} onClick={() => setSelectedScheduleId(selectedScheduleId === item.id ? null : item.id)} className={`flex items-start gap-3 md:gap-4 py-3 md:py-4 border-b border-slate-50 dark:border-slate-700 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors -mx-3 px-3 rounded-lg ${selectedScheduleId === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700 rounded-lg w-8 h-8 md:w-10 md:h-10 flex-shrink-0 text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300"><span>{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short' }) : '??'}</span><span>{item.date ? new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' }) : '??'}</span></div>
                    <div className="flex-1"><div className="flex justify-between items-start mb-0.5 md:mb-1"><h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{(item.description || '').replace('Scheduled: ', '')}</h4><p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">${Math.abs(item.amount)}</p></div><p className="text-[10px] md:text-xs text-slate-400 mb-0">Upcoming Auto-Pay</p></div>
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center transition-colors ${selectedScheduleId === item.id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{selectedScheduleId === item.id && <Check size={10} />}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"><div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2"><Calendar size={20} /></div><p className="text-sm font-bold text-slate-600 dark:text-slate-300">No scheduled payments</p><p className="text-[10px] text-slate-400">Set up future transfers to see them here</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for responsiveness in chart props (simple check)
function mobileCheck() {
  return window.innerWidth < 768;
}