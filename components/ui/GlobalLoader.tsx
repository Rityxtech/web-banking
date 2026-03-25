import React from 'react';

export const GlobalLoader = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative mb-8">
                {/* Outer Ring */}
                <div className="w-24 h-24 rounded-full border-[6px] border-slate-200 dark:border-slate-800"></div>

                {/* Spinning Gradient Ring */}
                <div className="absolute inset-0 w-24 h-24 rounded-full border-[6px] border-transparent border-t-blue-600 border-r-emerald-500 animate-spin"></div>

                {/* Inner Logo/Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900 dark:bg-white rounded-full animate-ping"></div>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">LENNOX</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">Processing Securely</p>
            </div>
        </div>
    );
};
