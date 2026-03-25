import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, AlertCircle, Loader2, KeyRound, ArrowLeft, Send, CheckCircle, Timer, RefreshCw, LogOut } from 'lucide-react';

interface PinVerificationModalProps {
    isOpen: boolean;
    onSuccess: () => void;
    onClose?: () => void; // Optional, some flows might be blocking (no close)
    title?: string;
    subtitle?: string;
    expectedPin: string; // The correct PIN to check against
    email?: string;
    onSendOtp?: () => Promise<string | null>;
    onVerifyOtp?: (otp: string) => Promise<boolean>;
    onUpdatePin?: (newPin: string) => Promise<boolean>;
    onLogout?: () => void;
}

interface OtpViewProps {
    email?: string;
    otpInput: string;
    setOtpInput: (val: string) => void;
    error: string;
    onVerify: (e: React.FormEvent) => void;
    onResend: () => void;
    onBack: () => void;
}

const OtpView: React.FC<OtpViewProps> = ({ email, otpInput, setOtpInput, error, onVerify, onResend, onBack }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleResend = () => {
        setCanResend(false);
        setTimeLeft(30);
        onResend();
    };

    return (
        <form onSubmit={onVerify} className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <button type="button" onClick={onBack} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>

            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
                <KeyRound size={32} />
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Check</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[250px] mx-auto">
                    We sent a verification code to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>
                </p>
            </div>

            <div className="w-full">
                <input
                    type="text"
                    inputMode="numeric"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 text-center text-2xl font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="000000"
                    maxLength={6}
                />
                {error && <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm font-bold"><AlertCircle size={16} /> {error}</div>}
            </div>

            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20">
                Verify Code
            </button>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">
                {canResend ? (
                    <button type="button" onClick={handleResend} className="flex items-center gap-2 mx-auto text-blue-500 hover:text-blue-600 transition-colors">
                        <RefreshCw size={14} /> Resend Code
                    </button>
                ) : (
                    <span className="flex items-center gap-2 justify-center">
                        <Timer size={14} /> Resend in {timeLeft}s
                    </span>
                )}
            </div>
        </form>
    );
};

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
    isOpen,
    onSuccess,
    onClose,
    title = "Security Verification",
    subtitle = "Enter your 4-digit security PIN to continue.",
    expectedPin,
    email,
    onSendOtp,
    onVerifyOtp,
    onUpdatePin,
    onLogout
}) => {
    const [view, setView] = useState<'auth' | 'otp' | 'new_pin'>('auth');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);

    // OTP & Reset States
    const [serverOtp, setServerOtp] = useState<string | null>(null);
    const [otpInput, setOtpInput] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            setIsLoading(false);
            setView('auth');
            setOtpInput('');
            setNewPin('');
            setConfirmNewPin('');
        }
    }, [isOpen]);

    const handlePinChange = (val: string) => {
        const input = val.replace(/\D/g, '').slice(0, 4);
        setPin(input);
        setError('');

        if (input.length === 4) {
            verifyPin(input);
        }
    };

    const verifyPin = async (enteredPin: string) => {
        setIsLoading(true);
        // Small artificial delay for UX feel
        await new Promise(resolve => setTimeout(resolve, 600));

        if (enteredPin === expectedPin) {
            onSuccess();
        } else {
            setError('Incorrect PIN');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPin('');
        }
        setIsLoading(false);
    };

    const handleForgotPin = async () => {
        if (!onSendOtp) return;
        setIsLoading(true);
        setError('');
        try {
            const code = await onSendOtp();
            if (code) {
                setServerOtp(code);
                setView('otp');
            } else {
                setError('Failed to send verification code.');
            }
        } catch (e) {
            setError('Error processing request.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        let isValid = false;

        if (serverOtp === 'SUPABASE_VERIFY' && onVerifyOtp) {
            isValid = await onVerifyOtp(otpInput);
        } else {
            isValid = otpInput === serverOtp;
        }

        setIsLoading(false);

        if (isValid) {
            setView('new_pin');
            setError('');
        } else {
            setError('Invalid Verification Code');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleResetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin.length !== 4) return setError('PIN must be 4 digits');
        if (newPin !== confirmNewPin) return setError('PINs do not match');
        if (!onUpdatePin) return;

        setIsLoading(true);
        try {
            const success = await onUpdatePin(newPin);
            if (success) {
                // Flash success then proceed
                setTimeout(() => onSuccess(), 500);
            } else {
                setError('Failed to update PIN. Try again.');
            }
        } catch (e) {
            setError('Update failed.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-slate-900 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-300 pb-8 md:pb-8 z-[110] ${shake ? 'animate-shake' : ''}`}>

                {view === 'auth' && (
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-600/10">
                            {isLoading ? <Loader2 size={32} className="animate-spin" /> : <ShieldCheck size={32} />}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[250px] mx-auto">{subtitle}</p>
                        </div>

                        <div className="w-full">
                            <div className="relative">
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={(e) => handlePinChange(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 text-center text-3xl font-bold tracking-[1em] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:tracking-normal"
                                    placeholder="••••"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                        </div>

                        <div className="flex w-full items-center justify-between mt-4 px-1">
                            {onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 opacity-80 hover:opacity-100"
                                >
                                    <LogOut size={12} /> Logout
                                </button>
                            )}

                            {onSendOtp && (
                                <button
                                    onClick={handleForgotPin}
                                    disabled={isLoading}
                                    className="text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest ml-auto"
                                >
                                    Forgot PIN?
                                </button>
                            )}
                        </div>


                    </div>
                )}

                {view === 'otp' && (
                    <OtpView
                        email={email}
                        otpInput={otpInput}
                        setOtpInput={setOtpInput}
                        error={error}
                        onVerify={handleVerifyOtp}
                        onResend={handleForgotPin}
                        onBack={() => setView('auth')}
                    />
                )}

                {view === 'new_pin' && (
                    <form onSubmit={handleResetPin} className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                            <CheckCircle size={32} />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Set New PIN</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Create a secure 4-digit PIN.</p>
                        </div>

                        <div className="w-full space-y-4">
                            <input
                                type="password"
                                inputMode="numeric"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 text-center text-xl font-bold tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:tracking-normal"
                                placeholder="New PIN"
                            />
                            <input
                                type="password"
                                inputMode="numeric"
                                value={confirmNewPin}
                                onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 text-center text-xl font-bold tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:tracking-normal"
                                placeholder="Confirm"
                            />
                            {error && <div className="mt-2 flex items-center justify-center gap-2 text-red-500 text-sm font-bold"><AlertCircle size={16} /> {error}</div>}
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Reset & Continue'}
                        </button>
                    </form>
                )}

                {onClose && view === 'auth' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>
        </div>
    );
};
