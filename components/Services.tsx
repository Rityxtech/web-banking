
import React, { useState, useRef } from 'react';
import { APP_CONFIG } from '../config';
import { ArrowLeft, Camera, Upload, CheckCircle, FileText, Download, Search, MapPin, Navigation, ScanLine, X, Image as ImageIcon, DollarSign } from 'lucide-react';

// Common Header for sub-pages
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
// CHECK DEPOSIT COMPONENT
// ----------------------------------------------------------------------
export const CheckDeposit = ({ onBack, limit = 5000 }: { onBack: () => void, limit?: number }) => {
    const [step, setStep] = useState<'capture' | 'amount' | 'success'>('capture');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setErrorMsg('File size exceeds 2MB limit.');
                return;
            }
            setErrorMsg(null);

            // Create preview URL
            const url = URL.createObjectURL(file);
            if (side === 'front') setFrontImage(url);
            else setBackImage(url);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if ((val.match(/\./g) || []).length > 1) return;
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (parts[1] && parts[1].length > 2) parts[1] = parts[1].slice(0, 2);
        setAmount(parts.join('.'));
    };

    const handleDeposit = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('success');
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deposit Submitted</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your check for ${amount} is being processed. Funds will be available within 1-2 business days.</p>
                    <button onClick={onBack} className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold">Done</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Check Deposit" subtitle="Mobile Deposit" onBack={onBack} />
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {step === 'capture' ? (
                    <div className="space-y-4">
                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold text-center">
                                {errorMsg}
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            ref={frontInputRef}
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'front')}
                        />
                        <div
                            onClick={() => frontInputRef.current?.click()}
                            className={`border-2 border-dashed ${frontImage ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'} rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 h-48 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative overflow-hidden`}
                        >
                            {frontImage ? (
                                <>
                                    <img src={frontImage} alt="Front" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    <div className="relative z-10 bg-white/80 dark:bg-black/50 p-2 rounded-lg">
                                        <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Front Captured</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Front of Check</p>
                                        <p className="text-xs text-slate-500">Tap to upload (Max 2MB)</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={backInputRef}
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'back')}
                        />
                        <div
                            onClick={() => backInputRef.current?.click()}
                            className={`border-2 border-dashed ${backImage ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'} rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 h-48 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative overflow-hidden`}
                        >
                            {backImage ? (
                                <>
                                    <img src={backImage} alt="Back" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                    <div className="relative z-10 bg-white/80 dark:bg-black/50 p-2 rounded-lg">
                                        <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Back Captured</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300">
                                        <Camera size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Back of Check</p>
                                        <p className="text-xs text-slate-500">Tap to upload (Max 2MB)</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setStep('amount')}
                            disabled={!frontImage || !backImage}
                            className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold mt-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center py-10">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2">Enter Check Amount</label>
                            <div className="relative flex items-center justify-center w-full max-w-[250px]">
                                <DollarSign size={32} className="absolute left-2 text-slate-400" />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full text-center text-4xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none py-2 pl-8 placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            {limit !== Infinity && (
                                <p className="text-xs text-slate-400 mt-4">Daily Limit: ${limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            )}
                        </div>
                        <button
                            onClick={handleDeposit}
                            disabled={!amount || isLoading}
                            className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold mt-2 shadow-lg flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Confirm Deposit'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// STATEMENTS COMPONENT
// ----------------------------------------------------------------------
export const Statements = ({ statements = [], onBack }: { statements?: any[], onBack: () => void }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Statements" subtitle="Downloaded Documents" onBack={onBack} />
            <div className="flex-1 p-4 overflow-y-auto">
                {statements.length > 0 ? (
                    <div className="space-y-3">
                        {statements.map((stmt, index) => (
                            <div key={stmt.id || index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Account Statement</p>
                                        <p className="text-xs text-slate-500">{stmt.range}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block mb-1">{new Date(stmt.date).toLocaleDateString()}</span>
                                    <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1">
                                        Open <Download size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <FileText size={32} opacity={0.5} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">No statements yet</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                            Download statements from your Transaction History page to see them here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// ATM LOCATOR COMPONENT
// ----------------------------------------------------------------------
export const AtmLocator = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Find ATM" subtitle="Nearby Locations" onBack={onBack} />

            {/* Mock Map View */}
            <div className="h-64 bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-xl z-10 animate-pulse"></div>
                <div className="absolute top-1/3 left-1/3 w-6 h-6 bg-slate-900 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-slate-900 rounded-full border-2 border-white shadow-lg"></div>
                <button className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <Navigation size={20} className="text-blue-600" />
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Nearest Locations</h3>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{APP_CONFIG.BRAND_NAME} Branch {i}</h4>
                                <span className="text-xs font-bold text-emerald-600">Open</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">123 Market St, San Francisco, CA</p>
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">ATM</span>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Deposit</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">0.{i} mi</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// SCAN TO PAY COMPONENT
// ----------------------------------------------------------------------
export const ScanPay = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="p-4 flex justify-between items-center text-white/80">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                    <X size={24} />
                </button>
                <span className="font-bold">Scan QR Code</span>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex items-center justify-center relative">
                {/* Camera Viewfinder Mock */}
                <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1 rounded-br-xl"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-0.5 bg-red-500/50 animate-pulse"></div>
                    </div>
                </div>
                <p className="absolute bottom-20 text-white/70 text-sm">Align QR code within the frame</p>
            </div>

            <div className="p-8 bg-black/50 backdrop-blur-lg flex justify-center gap-8 pb-12">
                <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Upload size={20} />
                    </div>
                    <span className="text-xs">Upload</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <ScanLine size={28} />
                    </div>
                </button>
                <button className="flex flex-col items-center gap-2 text-white/80 hover:text-white">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <FileText size={20} />
                    </div>
                    <span className="text-xs">Code</span>
                </button>
            </div>
        </div>
    );
};
