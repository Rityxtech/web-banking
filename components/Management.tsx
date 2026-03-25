
import React, { useState } from 'react';
import { ArrowLeft, Repeat, Shield, DollarSign, AlertCircle, Edit2, Plus, Trash2, Calendar, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';

const PageHeader = ({ title, subtitle, onBack }: { title: string, subtitle: string, onBack: () => void }) => (
    <div className="p-3 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// RECURRING PAYMENTS COMPONENT
// ----------------------------------------------------------------------
export const Recurring = ({ transactions = [], onBack }: { transactions?: Transaction[], onBack: () => void }) => {
    const total = transactions.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Recurring" subtitle={`Total Scheduled: $${total.toFixed(2)}`} onBack={onBack} />
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-100 dark:border-blue-800">
                    <Repeat size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Scheduled Transfers</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            You have {transactions.length} active payments scheduled. Manage them directly from your dashboard.
                        </p>
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map(sub => (
                            <div key={sub.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-indigo-500">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{sub.description.replace('Scheduled: ', '')}</h4>
                                        <p className="text-xs text-slate-500">Next: {new Date(sub.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">${Math.abs(sub.amount)}</p>
                                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 text-slate-400">
                            <Repeat size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No scheduled payments</p>
                        <p className="text-xs text-slate-400 mt-1">Set up recurring transfers in the Transfers tab.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// SPENDING LIMITS COMPONENT
// ----------------------------------------------------------------------
export const SpendingLimits = ({ 
    onBack, 
    dailyUsage = 0, 
    monthlyUsage = 0,
    dailyLimit = 0,
    monthlyLimit = 0,
    kycLevel = 0
}: { 
    onBack: () => void,
    dailyUsage?: number,
    monthlyUsage?: number,
    dailyLimit?: number,
    monthlyLimit?: number,
    kycLevel?: number
}) => {
    
    const LimitCard = ({ label, current, max, icon: Icon, colorClass, barColor }: any) => {
        // Prevent division by zero if limit is 0
        const pct = max > 0 ? (current / max) * 100 : (current > 0 ? 100 : 0);
        const safePct = Math.min(pct, 100);
        
        return (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                {kycLevel === 0 && (
                    <div className="absolute inset-0 bg-slate-100/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-red-50 dark:bg-red-900/80 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-800 flex items-center gap-2">
                            <Lock size={12} className="text-red-600 dark:text-red-300" />
                            <span className="text-[10px] font-bold text-red-700 dark:text-red-200 uppercase tracking-wide">Locked (Unverified)</span>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                            <Icon size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label} Limit</h4>
                            <p className="text-xs text-slate-500">{kycLevel === 0 ? 'Verification Required' : `Tier ${kycLevel} Active`}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Remaining</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                            ${Math.max(0, max - current).toLocaleString()}
                        </p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600 dark:text-slate-400">${current.toLocaleString()} used</span>
                        <span className="text-slate-900 dark:text-white font-bold">${max.toLocaleString()} limit</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                            style={{width: `${safePct}%`}}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Transaction Limits" subtitle="Account Usage Controls" onBack={onBack} />
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                
                {kycLevel === 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle size={24} className="text-red-600 dark:text-red-400 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-red-900 dark:text-red-100">Zero Limit (Unverified)</h4>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                                Your account is currently <strong>Unverified (Tier 0)</strong>. All transactions are disabled. You must verify your identity (KYC 1) to unlock your first limit tier.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <LimitCard 
                        label="Daily" 
                        current={dailyUsage} 
                        max={dailyLimit} 
                        icon={Shield} 
                        colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        barColor="bg-blue-600"
                    />
                    <LimitCard 
                        label="Monthly" 
                        current={monthlyUsage} 
                        max={monthlyLimit} 
                        icon={Calendar} 
                        colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                        barColor="bg-purple-600"
                    />
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                    <ShieldCheck size={20} className="text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tier Levels</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed mb-3">
                            Upgrade your verification to increase your spending power.
                        </p>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-[10px] font-bold bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600">
                                <span className="text-slate-500">Tier 0 (Unverified)</span>
                                <span className="text-red-500">$0 Limit</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600">
                                <span className="text-blue-600 dark:text-blue-400">Tier 1 (Basic)</span>
                                <span className="text-slate-900 dark:text-white">$1,000 / Day</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-bold bg-slate-50 dark:bg-slate-700/50 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600">
                                <span className="text-emerald-600 dark:text-emerald-400">Tier 2 (Verified)</span>
                                <span className="text-slate-900 dark:text-white">$50,000 / Day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
