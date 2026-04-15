import React, { useMemo, useState } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Calendar, Filter, PieChart as PieIcon, ArrowRight } from 'lucide-react';

interface StatisticsProps {
  transactions: Transaction[];
  accounts: Account[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export const Statistics: React.FC<StatisticsProps> = ({ transactions, accounts }) => {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

  // Filter transactions based on time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const rangeDate = new Date();

    switch (timeRange) {
      case '1M': rangeDate.setMonth(now.getMonth() - 1); break;
      case '3M': rangeDate.setMonth(now.getMonth() - 3); break;
      case '6M': rangeDate.setMonth(now.getMonth() - 6); break;
      case '1Y': rangeDate.setFullYear(now.getFullYear() - 1); break;
    }

    return transactions.filter(t => {
      if (!t.date) return false;
      const tDate = new Date(t.date);
      return tDate >= rangeDate && t.status === 'Success';
    });
  }, [transactions, timeRange]);

  // Calculate Key Metrics
  const { totalIncome, totalExpense, savingsRate, netCashFlow } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const net = income - expense;
    const rate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return { totalIncome: income, totalExpense: expense, savingsRate: rate, netCashFlow: net };
  }, [filteredTransactions]);

  // Prepare Chart Data (Monthly)
  const chartData = useMemo(() => {
    const data: Record<string, { income: number; expense: number }> = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., "Jan 24"

      if (!data[key]) data[key] = { income: 0, expense: 0 };

      if (t.amount > 0 && ![TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT].includes(t.type)) {
        data[key].income += t.amount;
      } else if (t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type)) {
        data[key].expense += Math.abs(t.amount);
      }
    });

    return Object.entries(data).map(([name, vals]) => ({ name, ...vals })).reverse();
  }, [filteredTransactions]);

  // Prepare Category Data
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.amount < 0 || [TransactionType.PAYMENT, TransactionType.PURCHASE, TransactionType.TRANSFER_OUT].includes(t.type))
      .forEach(t => {
        const c = t.category || 'Uncategorized';
        cats[c] = (cats[c] || 0) + Math.abs(t.amount);
      });

    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fade-in w-full pb-20">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Financial Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Detailed breakdown of your financial health.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['1M', '3M', '6M', '1Y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Income</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalIncome.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">+5%</span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Expenses</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalExpense.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Net Cash Flow</p>
          <h3 className={`text-2xl font-black ${netCashFlow >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
            {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString()}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp size={20} className="text-white" />
            </div>
          </div>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Savings Rate</p>
          <h3 className="text-2xl font-black">{savingsRate.toFixed(1)}%</h3>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Cash Flow</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ paddingTop: '4px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Spending by Category</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {categoryData.length > 0 ? ((categoryData[0].value / totalExpense) * 100).toFixed(0) : 0}%
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider max-w-[100px] truncate text-center">
                {categoryData.length > 0 ? categoryData[0].name : 'None'}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {categoryData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
