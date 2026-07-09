import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Account, Transaction, TransactionType, Card, Asset, User, Notification, TransactionStatus, AccountType } from './types';
import { supabase } from './services/supabase';
import { mvp } from './services/mvpService';
import { Loader2, ShieldCheck, Save, AlertCircle, ShieldAlert, LogOut, Send, CheckCircle, Ticket, Lock, Clock, ChevronRight, MessageSquare, Mail, Key, UserX, AlertTriangle, Ban, ArrowLeft } from 'lucide-react';
import { getEmailTemplate } from './utils/emailTemplates';
import { APP_CONFIG, setSiteConfig } from './config';

// Components
import { Layout } from './components/ui/Layout';
import { GlobalLoader } from './components/ui/GlobalLoader';
import { PinVerificationModal } from './components/ui/PinVerificationModal';
import { Dashboard } from './components/Dashboard';
import { Accounts } from './components/Accounts';
import { Transactions } from './components/Transactions';
import { Transfers } from './components/Transfers';
import { TopUp } from './components/TopUp';
import { RequestMoney } from './components/RequestMoney';
import { BillPay } from './components/BillPay';
import { MoreActions } from './components/MoreActions';
import { CheckDeposit, Statements, AtmLocator, ScanPay } from './components/Services';
import { Recurring, SpendingLimits } from './components/Management';
import { HelpCenter, ContactUs } from './components/Support';
import { Statistics } from './components/Statistics';
import { AiAssistant } from './components/AiAssistant';
import { Profile } from './components/Profile';
import { KycVerification } from './components/KycVerification';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Investments } from './components/Investments';
import { Settings } from './components/Settings';
import { HomePage } from './components/HomePage';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveChat } from './components/LiveChat';
import { PublicSupport } from './components/PublicSupport';


function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const MaintenanceScreen = ({ onAdminLogin, onLogout, isLoggedIn }: { onAdminLogin: () => void, onLogout?: () => void, isLoggedIn: boolean }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketSent, setTicketSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) return;
        setIsSubmitting(true);
        await supabase.from('mvp_support_tickets').insert([{
            user_id: 'MAINTENANCE_USER',
            subject: 'Maintenance Query',
            message: `[MAINTENANCE MODE] From: ${email} - ${message}`,
            status: 'Open'
        }]);
        setTicketSent(true);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black pointer-events-none"></div>
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-amber-500/20 shadow-2xl shadow-amber-500/20">
                    <ShieldAlert size={40} className="text-amber-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">System Offline</h1>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">Maintenance Active</span>
                    </div>
                    <p className="text-slate-400 mt-4 text-sm leading-relaxed max-w-xs mx-auto">
                        We are currently performing critical updates. Access is restricted to administrative personnel.
                    </p>
                </div>
                {!ticketSent ? (
                    <form onSubmit={handleSubmit} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-4 text-left shadow-xl">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Ticket size={14} /> Contact Support</h3>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Your Email Address" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-colors placeholder:text-slate-600" />
                        <textarea rows={3} required value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-amber-500 outline-none transition-colors resize-none placeholder:text-slate-600"></textarea>
                        <button disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit Ticket
                        </button>
                    </form>
                ) : (
                    <div className="bg-emerald-50/10 p-6 rounded-2xl border border-emerald-500/20 text-emerald-400">
                        <CheckCircle size={32} className="mx-auto mb-2" />
                        <p className="font-bold">Ticket Received</p>
                    </div>
                )}
                <button onClick={isLoggedIn ? onLogout : onAdminLogin} className="text-xs font-bold text-slate-600 hover:text-slate-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                    {isLoggedIn ? <><LogOut size={12} /> Logout</> : <><Lock size={12} /> Staff Access</>}
                </button>
            </div>
        </div>
    );
};

const LimitExceededModal = ({
    isOpen,
    onClose,
    currentUsage,
    limit,
    type,
    kycLevel
}: {
    isOpen: boolean;
    onClose: () => void;
    currentUsage: number;
    limit: number;
    type: 'daily' | 'weekly' | 'monthly';
    kycLevel: number;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 mb-0 pb-10 md:pb-6 border border-red-100 dark:border-red-900/30">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500 shadow-inner">
                        <Ban size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                        {kycLevel === 0 ? "Account Unverified" : "Limit Reached"}
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 w-full mb-6 border border-slate-100 dark:border-slate-800">
                        {kycLevel === 0 ? (
                            <>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Transaction Limit</p>
                                <p className="text-2xl font-black text-red-500 dark:text-red-400 mb-1">$0.00</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Verification Required</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Your {type} transaction limit of</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">${limit.toLocaleString()}</p>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-full"></div>
                                </div>
                                <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-wide">Usage Limit Exceeded</p>
                            </>
                        )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {kycLevel === 0
                            ? "You must complete KYC Level 1 verification to unlock transaction capabilities."
                            : kycLevel === 1
                                ? "You have hit your Tier 1 limits. Upgrade to Tier 2 for higher limits."
                                : "You have reached your maximum transaction limit for this period."}
                    </p>

                    <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-sm uppercase tracking-wider">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

const WaitlistScreen = ({ onAdminLogin }: { onAdminLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [joined, setJoined] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        try {
            await supabase.from('mvp_waitlist').insert([{ email }]);
            setJoined(true);
        } catch (err) {
            console.error(err);
            setJoined(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <img
                    src="https://image2url.com/r2/default/images/1769428285590-d43b30ba-a0ba-499f-a066-6411c1619f75.webp"
                    alt={APP_CONFIG.BANK_NAME}
                    className="w-24 h-24 mx-auto object-contain drop-shadow-2xl"
                />
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Exclusive Access</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-sm mx-auto">Registration is currently limited. Join our waitlist.</p>
                </div>
                {!joined ? (
                    <form onSubmit={handleJoin} className="max-w-sm mx-auto space-y-4 relative">
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="relative w-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button disabled={isSubmitting} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-xl">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Join Waitlist'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl animate-in zoom-in">
                        <CheckCircle size={24} className="mx-auto mb-4 text-emerald-600" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You're on the list!</h3>
                    </div>
                )}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-800/50">
                    <button onClick={onAdminLogin} className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center justify-center gap-2 mx-auto">
                        <Key size={14} /> Staff Access
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuspendedScreen = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingTicket, setExistingTicket] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkExisting = async () => {
            const { data: tickets } = await supabase.from('mvp_support_tickets').select('id,subject,status').limit(10);
            const appeal = (tickets || []).find((t: any) => t.subject === 'Account Suspension Appeal' && t.status === 'Open');
            if (appeal) setExistingTicket(appeal);
            setIsChecking(false);
        };
        checkExisting();
    }, []);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || existingTicket) return;
        setIsSubmitting(true);
        setError('');
        try {
            const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
            if (authErr || !authUser) {
                setError('Session error. Please log in again.');
                return;
            }
            const { data: res, error: ticketErr } = await supabase.from('mvp_support_tickets').insert([{
                user_id: authUser.id,
                subject: 'Account Suspension Appeal',
                message: `[LOCKOUT PROTOCOL APPEAL]: ${message}`,
                status: 'Open'
            }]).select('id');
            if (ticketErr) {
                setError(ticketErr.message || 'Failed to submit ticket. Please try again.');
                console.error(ticketErr);
                return;
            }
            if (res) {
                setExistingTicket({ id: res[0]?.id, status: 'Open' });
                setMessage('');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit ticket. Please try again.');
            console.error(err);
        } finally { setIsSubmitting(false); }
    };

    if (isChecking) return <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /><p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Security Node...</p></div>;

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-3">
            <div className="w-full max-lg bg-[#151A25] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="h-2 bg-red-600"></div>
                <div className="p-6 md:p-12 text-center">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-8" />
                    <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Security Lockout</h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[320px] mx-auto">Your access has been restricted. Assets are secured but non-transferable.</p>
                    <div className="bg-black/40 rounded-3xl p-8 border border-white/5 text-left mb-8 shadow-inner">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-xs opacity-60"><Ticket size={14} className="text-blue-500" /> Support Channel</h3>
                        {existingTicket ? (
                            <div className="py-8 text-center animate-in fade-in">
                                <Clock size={40} className="text-amber-500 mx-auto mb-4" />
                                <h4 className="text-amber-400 font-black uppercase tracking-widest text-sm">Appeal Pending</h4>
                            </div>
                        ) : showForm ? (
                            <form onSubmit={handleSubmitTicket} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}
                                <textarea rows={3} autoFocus value={message} onChange={e => setMessage(e.target.value)} placeholder="Explain your situation..." className="w-full p-4 bg-black/60 border border-white/10 rounded-2xl text-sm text-white focus:border-red-600 outline-none transition-all resize-none shadow-inner"></textarea>
                                <button type="submit" disabled={isSubmitting || !message.trim()} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Transmit Signal
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="w-full text-center text-[9px] font-bold text-slate-600 uppercase">Return</button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <button onClick={() => setShowForm(true)} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 mx-auto">
                                    <MessageSquare size={18} className="text-blue-500" /> Open Appeal Ticket
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 mx-auto text-slate-500 hover:text-white font-black text-xs transition-colors uppercase tracking-[0.2em]">
                        <LogOut size={14} /> Disconnect Node
                    </button>
                </div>
            </div>
        </div>
    );
};

const CompleteRegistration = ({ user, onComplete }: { user: any, onComplete: () => void }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin.length !== 4) return setError("PIN must be 4 digits.");
        if (pin !== confirmPin) return setError("PINs do not match.");

        setIsLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { pin: pin }
            });
            if (updateError) throw updateError;

            const { data: profiles } = await supabase.from('mvp_profiles').select('id,user_id,settings');
            const existing = (profiles || []).find((p: any) => p.user_id === user.id);
            if (existing) {
                const currentSettings = typeof existing.settings === 'string' ? JSON.parse(existing.settings || '{}') : (existing.settings || {});
                await supabase.from('mvp_profiles').update({
                    settings: JSON.stringify({ ...currentSettings, pinSet: true })
                }).eq('id', existing.id);
            } else {
                await supabase.from('mvp_profiles').insert([{
                    user_id: user.id,
                    full_name: user.user_metadata?.full_name || APP_CONFIG.BANK_NAME,
                    email: user.email,
                    settings: JSON.stringify({ pinSet: true })
                }]);
            }

            onComplete();
        } catch (err: any) {
            setError(err.message || "Failed to save profile.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-lg shadow-blue-600/10">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Security Setup</h1>
                <p className="text-slate-500 text-sm mb-8">Set a 4-digit security PIN to access your vault.</p>
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                <form onSubmit={handleComplete} className="space-y-6">
                    <div className="space-y-4">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={confirmPin}
                                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading || pin.length !== 4 || confirmPin.length !== 4} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50">
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />} Finalize Node
                    </button>
                </form>
            </div>
        </div>
    );
};

const AdminLoginScreen = ({ logoUrl, siteName, onBack }: { logoUrl?: string, siteName?: string, onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const inputClass = "w-full pl-9 pr-3 py-2.5 bg-black/20 border border-white/20 rounded-xl text-xs font-medium outline-none focus:bg-black/30 focus:border-blue-300 transition-all placeholder:text-white/60 text-white backdrop-blur-[2px] shadow-sm";
    const displayName = siteName || APP_CONFIG.BANK_NAME;
    const displayLogo = logoUrl || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) return;
        setIsLoading(true);
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            if (!data.user) throw new Error('No user returned');

            // Check admin status
            const userEmail = data.user.email?.toLowerCase();
            let isAdmin = userEmail === APP_CONFIG.ADMIN_EMAILS[0] || userEmail === 'akugbof@gmail.com';
            if (!isAdmin) {
                const { data: profiles } = await supabase.from('mvp_profiles').select('role').eq('user_id', data.user.id).single();
                if (profiles?.role === 'admin') isAdmin = true;
            }

            if (!isAdmin) {
                await supabase.auth.signOut();
                throw new Error('Access denied. This login is reserved for authorized staff only.');
            }
            // Success — auth listener will handle setting isAdminMode and routing
        } catch (err: any) {
            setError(err.message || 'Authentication failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans overflow-hidden bg-cover bg-center bg-no-repeat fixed inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070')" }}>
            <div className="w-full max-w-[380px] flex flex-col items-center transition-all duration-300 ease-in-out relative z-10 -mt-[50px] md:mt-0">
                <div className="w-full bg-black/20 backdrop-blur-[4px] rounded-[24px] shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 ring-1 ring-white/10">
                    <div className="pt-6 pb-2 px-8 text-center">
                        <img
                            src={displayLogo}
                            alt={displayName}
                            className="w-12 h-12 mx-auto mb-3 object-contain drop-shadow-lg rounded-full"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <h1 className="text-lg font-bold text-white tracking-tight drop-shadow-md">Staff Access</h1>
                        <p className="text-[11px] text-white/90 mt-1 font-medium drop-shadow-md">{displayName} Administration</p>
                    </div>
                    <div className="px-8 pb-6 pt-4">
                        {error && (
                            <div className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px] font-bold backdrop-blur-md border bg-red-500/20 text-white border-red-200/30">
                                <AlertCircle size={14} /> <span className="flex-1">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={14} />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="Admin email address" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={14} />
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="Password" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-1 backdrop-blur-sm border bg-blue-600/80 hover:bg-blue-600 text-white shadow-blue-600/20 border-blue-500/30">
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />} Authenticate
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button onClick={onBack} className="text-[10px] font-bold text-white hover:text-white/80 flex items-center justify-center gap-1 mx-auto">
                                <ArrowLeft size={14} /> Back to Home
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center opacity-90">
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest text-shadow-sm drop-shadow-md">Secured by {displayName} ID</p>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [notificationsSynced, setNotificationsSynced] = useState(false); // Controls Badge Visibility
    const [isSuspended, setIsSuspended] = useState(false);
    const [forceMaintenance, setForceMaintenance] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showSuspendedModal, setShowSuspendedModal] = useState(false);
    const [supportInitialSubject, setSupportInitialSubject] = useState('General Inquiry');

    const [currentView, setCurrentView] = useState<'home' | 'signin' | 'signup' | 'admin_login' | 'support'>(() => {
        const hash = window.location.hash.substring(1);
        if (hash === 'admin-login') return 'admin_login';
        if (hash === 'signin' || hash === 'signup' || hash === 'support') return hash;
        const saved = localStorage.getItem(APP_CONFIG.STORAGE_PREFIX + 'view');
        if (saved === 'admin_login') return 'admin_login';
        return (saved === 'signin' || saved === 'signup' || saved === 'support') ? saved : 'home';
    });

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [prefilledEmail, setPrefilledEmail] = useState('');

    const [isAccountIncomplete, setIsAccountIncomplete] = useState(false);
    const [rawSessionUser, setRawSessionUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    const [authErrorMessage, setAuthErrorMessage] = useState(''); // New state for passing auth errors

    // Global PIN Verification State with Session Persistence
    const [isPinVerified, setIsPinVerifiedState] = useState(() => {
        return sessionStorage.getItem(APP_CONFIG.STORAGE_PREFIX + 'pin_verified') === 'true';
    });

    const setIsPinVerified = (verified: boolean) => {
        setIsPinVerifiedState(verified);
        if (verified) {
            sessionStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'pin_verified', 'true');
        } else {
            sessionStorage.removeItem(APP_CONFIG.STORAGE_PREFIX + 'pin_verified');
        }
    };

    // Lock to prevent race conditions during logout
    const isLoggingOut = useRef(false);

    const [globalSettings, setGlobalSettings] = useState({
        maintenanceMode: false,
        allowRegistration: true,
        maxTxLimit: 50000,
        emailNotifications: true,
        disableTransactions: false,
        siteName: 'Veltrix Bank',
        siteLogo: '',
        siteUrl: '',
        enableDailyLimit: true,
        enableWeeklyLimit: true,
        enableMonthlyLimit: true,
        dailyLimit: 50000,
        weeklyLimit: 250000,
        monthlyLimit: 500000,
        tier0DailyLimit: 0,
        tier0WeeklyLimit: 0,
        tier0MonthlyLimit: 0,
        tier1DailyLimit: 1000,
        tier1WeeklyLimit: 5000,
        tier1MonthlyLimit: 10000,
        tier2DailyLimit: 50000,
        tier2WeeklyLimit: 250000,
        tier2MonthlyLimit: 500000,
        defaultTransferStatus: 'Success'
    });

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadAiMessages, setUnreadAiMessages] = useState(0);
    const [unreadSupportMessages, setUnreadSupportMessages] = useState(0);

    // Global Balance Visibility
    const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
        return localStorage.getItem(APP_CONFIG.STORAGE_PREFIX + 'hide_balance') === 'true';
    });

    const toggleBalanceVisibility = useCallback(() => {
        setIsBalanceHidden(prev => {
            const newValue = !prev;
            localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'hide_balance', String(newValue));
            return newValue;
        });
    }, []);

    const [route, setRoute] = useState(() => {
        // Email clients sometimes strip hash fragments; support ?livechat=true fallback
        const params = new URLSearchParams(window.location.search);
        if (params.get('livechat') === 'true') {
            const email = params.get('email');
            const source = params.get('source');
            const queryParts: string[] = [];
            if (email) queryParts.push('email=' + encodeURIComponent(email));
            if (source) queryParts.push('source=' + encodeURIComponent(source));
            const hash = 'livechat' + (queryParts.length > 0 ? '?' + queryParts.join('&') : '');
            window.history.replaceState({}, '', window.location.pathname + '#' + hash);
            return 'livechat';
        }
        return window.location.hash.substring(1).split('?')[0] || 'dashboard';
    });

    const navigate = useCallback((path: string) => {
        setRoute(path);
        window.location.hash = path;
    }, []);

    // Navigation History Handler
    useEffect(() => {
        const handleHashChange = () => {
            const rawHash = window.location.hash.substring(1);
            const hash = rawHash.split('?')[0]; // Strip query params from route

            // AUTH NAVIGATION (Checking !currentUser inside effect creates closure issues, rely on currentView logic)
            if (hash === 'admin-login') {
                setCurrentView('admin_login');
                localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'view', 'admin_login');
            } else if (hash === 'signin' || hash === 'signup' || hash === 'support') {
                setCurrentView(hash);
                localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'view', hash);
            } else {
                // For any other hash (including empty, 'home', 'banking', or dashboard routes like 'transactions')
                // We default the view state to 'home'.
                // If logged in: Layout renders based on 'route' (synced below).
                // If logged out: HomePage renders (handling anchors like #banking).
                setCurrentView('home');
                localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'view', 'home');
                setRoute(hash || 'dashboard');
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [kycLevel, setKycLevel] = useState(0); // Default to 0 (Unverified)
    const [downloadedStatements, setDownloadedStatements] = useState<any[]>([]);

    // Limit States
    const [dailyUsage, setDailyUsage] = useState(0);
    const [weeklyUsage, setWeeklyUsage] = useState(0);
    const [monthlyUsage, setMonthlyUsage] = useState(0);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [limitModalType, setLimitModalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    // Lock body scroll whenever any modal overlay is active
    useEffect(() => {
        const pinModalActive = !!currentUser && !isAdminMode && !isPinVerified;
        const anyModalActive = pinModalActive || isModalOpen || showLimitModal;
        if (anyModalActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [currentUser, isAdminMode, isPinVerified, isModalOpen, showLimitModal]);

    const [userSettings, setUserSettings] = useState({
        emailNotifs: true,
        pushNotifs: true,
        biometric: true,
        twoFactor: false
    });

    const [cardControls, setCardControls] = useState({ online: true, international: false, contactless: true });

    const initRef = useRef<string | null>(null);

    const calculateUsage = useCallback(() => {
        if (!transactions || transactions.length === 0) {
            setDailyUsage(0);
            setWeeklyUsage(0);
            setMonthlyUsage(0);
            return;
        }

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const monthStr = now.toISOString().slice(0, 7);

        // Calculate start of current week (Monday)
        const d = new Date(now);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        const outflows = transactions.filter(t =>
            (t.amount < 0 || [TransactionType.WITHDRAWAL, TransactionType.TRANSFER_OUT, TransactionType.PAYMENT, TransactionType.PURCHASE].includes(t.type)) &&
            t.status === 'Success'
        );

        let daily = 0;
        let weekly = 0;
        let monthly = 0;

        outflows.forEach(t => {
            const amt = Math.abs(Number(t.amount));
            const tDate = new Date(t.date);
            const tDateStr = t.date.split('T')[0];

            if (tDateStr === todayStr) daily += amt;
            if (tDate >= monday) weekly += amt;
            if (t.date.startsWith(monthStr)) monthly += amt;
        });

        setDailyUsage(daily);
        setWeeklyUsage(weekly);
        setMonthlyUsage(monthly);
    }, [transactions]);

    useEffect(() => {
        calculateUsage();
    }, [calculateUsage, transactions]);

    // Determine Current Limits based on KYC Level (admin-configurable per tier)
    const currentLimits = useMemo(() => {
        const limits = kycLevel === 0 ? {
            daily: globalSettings.tier0DailyLimit,
            weekly: globalSettings.tier0WeeklyLimit,
            monthly: globalSettings.tier0MonthlyLimit
        } : kycLevel === 1 ? {
            daily: globalSettings.tier1DailyLimit,
            weekly: globalSettings.tier1WeeklyLimit,
            monthly: globalSettings.tier1MonthlyLimit
        } : {
            daily: globalSettings.tier2DailyLimit || globalSettings.dailyLimit,
            weekly: globalSettings.tier2WeeklyLimit || globalSettings.weeklyLimit,
            monthly: globalSettings.tier2MonthlyLimit || globalSettings.monthlyLimit
        };
        return {
            daily: globalSettings.enableDailyLimit ? (limits.daily ?? 0) : Infinity,
            weekly: globalSettings.enableWeeklyLimit ? (limits.weekly ?? 0) : Infinity,
            monthly: globalSettings.enableMonthlyLimit ? (limits.monthly ?? 0) : Infinity,
            label: `Tier ${kycLevel}`
        };
    }, [kycLevel, globalSettings]);

    const checkTransactionLimit = (amount: number): { allowed: boolean; type?: 'daily' | 'weekly' | 'monthly' } => {
        const absAmount = Math.abs(amount);
        if (dailyUsage + absAmount > currentLimits.daily) return { allowed: false, type: 'daily' };
        if (weeklyUsage + absAmount > currentLimits.weekly) return { allowed: false, type: 'weekly' };
        if (monthlyUsage + absAmount > currentLimits.monthly) return { allowed: false, type: 'monthly' };
        return { allowed: true };
    };

    const handleTransactionAttempt = (amount: number, callback: () => void) => {
        const { allowed, type } = checkTransactionLimit(amount);
        if (!allowed) {
            setLimitModalType(type || 'daily');
            setShowLimitModal(true);
        } else {
            callback();
        }
    };

    const fetchGlobalSettings = useCallback(async () => {
        try {
            const { data: settings } = await supabase.from('mvp_app_settings').select('*').eq('id', 1).single();
            if (settings) {
                const isMaintenance = settings.maintenance_mode == "1" || settings.maintenance_mode == 1 || settings.maintenance_mode === true;
                const isRegAllowed = settings.allow_registration == "1" || settings.allow_registration == 1 || settings.allow_registration === true;
                const isTxDisabled = settings.disable_transactions == "1" || settings.disable_transactions == 1 || settings.disable_transactions === true;

                const newSiteName = settings.site_name || 'Veltrix Bank';
                const newSiteLogo = settings.site_logo || '';
                const newSiteUrl = settings.site_url || '';
                setSiteConfig(newSiteName, newSiteLogo, newSiteUrl);
                setGlobalSettings({
                    maintenanceMode: isMaintenance,
                    allowRegistration: isRegAllowed,
                    maxTxLimit: Number(settings.max_transaction_limit) || 50000,
                    emailNotifications: settings.email_notifications == "1" || settings.email_notifications == 1 || settings.email_notifications === true,
                    disableTransactions: isTxDisabled,
                    siteName: newSiteName,
                    siteLogo: newSiteLogo,
                    siteUrl: newSiteUrl,
                    enableDailyLimit: settings.enable_daily_limit == "1" || settings.enable_daily_limit === 1 || settings.enable_daily_limit === true,
                    enableWeeklyLimit: settings.enable_weekly_limit == "1" || settings.enable_weekly_limit === 1 || settings.enable_weekly_limit === true,
                    enableMonthlyLimit: settings.enable_monthly_limit == "1" || settings.enable_monthly_limit === 1 || settings.enable_monthly_limit === true,
                    dailyLimit: Number(settings.daily_limit) || 50000,
                    weeklyLimit: Number(settings.weekly_limit) || 250000,
                    monthlyLimit: Number(settings.monthly_limit) || 500000,
                    tier0DailyLimit: Number(settings.tier0_daily_limit) || 0,
                    tier0WeeklyLimit: Number(settings.tier0_weekly_limit) || 0,
                    tier0MonthlyLimit: Number(settings.tier0_monthly_limit) || 0,
                    tier1DailyLimit: Number(settings.tier1_daily_limit) || 1000,
                    tier1WeeklyLimit: Number(settings.tier1_weekly_limit) || 5000,
                    tier1MonthlyLimit: Number(settings.tier1_monthly_limit) || 10000,
                    tier2DailyLimit: Number(settings.tier2_daily_limit) || Number(settings.daily_limit) || 50000,
                    tier2WeeklyLimit: Number(settings.tier2_weekly_limit) || Number(settings.weekly_limit) || 250000,
                    tier2MonthlyLimit: Number(settings.tier2_monthly_limit) || Number(settings.monthly_limit) || 500000,
                    defaultTransferStatus: settings.default_transfer_status || 'Success'
                });
            }
        } catch (e: any) {
            console.warn("Failed to fetch settings", e);
        } finally {
            setLoadingSettings(false);
        }
    }, []);

    const refreshMessageCounts = useCallback(async () => {
        if (!currentUser) return;
        try {
            const { data: msgs } = await supabase.from('mvp_messages').select('id,sender,is_read,ticket_id').limit(100);
            if (msgs) {
                const aiCount = msgs.filter((m: any) => m.sender !== 'user' && (m.is_read == 0 || m.is_read === "0" || m.is_read === false) && (!m.ticket_id || m.ticket_id === "null" || m.ticket_id === 0)).length;
                const supportCount = msgs.filter((m: any) => m.sender !== 'user' && (m.is_read == 0 || m.is_read === "0" || m.is_read === false) && (m.ticket_id && m.ticket_id !== "null" && m.ticket_id !== 0)).length;
                setUnreadAiMessages(aiCount);
                setUnreadSupportMessages(supportCount);
            }
        } catch (e) {
            // Silent fail on background refresh 
        }
    }, [currentUser]);

    const fetchAllUserData = useCallback(async (userId: string, userMetadata?: any) => {
        if (initRef.current === userId) return;
        initRef.current = userId; // Lock immediately to prevent concurrent runs

        setLoadingData(true);
        setNotificationsSynced(false); // Hide badge until fetch complete

        try {
            // Use Supabase directly — MVP API is broken (404)
            const { data: profiles } = await supabase
                .from('mvp_profiles')
                .select('id,user_id,full_name,email,role,kyc_level,is_suspended,theme,avatar_url,settings')
                .eq('user_id', userId);
            let profile = profiles?.find((p: any) => p.user_id === userId);

            // LOGIC: If profile doesn't exist, create it (self-healing).
            if (!profile) {
                console.log("No profile found for authenticated user. Auto-creating profile...");
                try {
                    await supabase.from('mvp_profiles').insert([{
                        user_id: userId,
                        full_name: userMetadata?.full_name || `${APP_CONFIG.BRAND_NAME} Client`,
                        email: userMetadata?.email || '',
                        kyc_level: 0
                    }]);
                } catch (createErr: any) {
                    if (createErr.message?.includes('23505') || createErr.message?.includes('duplicate') || createErr.message?.includes('unique constraint')) {
                        console.warn('Profile already exists (race with trigger), re-reading...');
                    } else {
                        throw createErr;
                    }
                }
                const { data: updatedProfiles } = await supabase
                    .from('mvp_profiles')
                    .select('id,user_id,full_name,email,role,kyc_level,is_suspended,theme,avatar_url,settings')
                    .eq('user_id', userId);
                profile = updatedProfiles?.find((p: any) => p.user_id === userId);
            }

            if (profile) {
                setIsSuspended(profile.is_suspended == "1" || profile.is_suspended == 1 || profile.is_suspended === true);
                if (profile.theme) setIsDarkMode(profile.theme === 'dark');
                setKycLevel(Number(profile.kyc_level) || 0);

                const decodedSettings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
                if (decodedSettings) {
                    const { cardControls: remoteCardControls, ...restSettings } = decodedSettings;
                    setUserSettings(prev => ({ ...prev, ...restSettings }));
                    if (remoteCardControls) setCardControls(remoteCardControls);
                }

                setCurrentUser(prev => {
                    return {
                        id: userId,
                        name: profile.full_name || prev?.name || `${APP_CONFIG.BRAND_NAME} Client`,
                        email: profile.email || prev?.email || '',
                        avatarUrl: prev?.avatarUrl || profile.avatar_url || '',
                        pin: userMetadata?.pin || prev?.pin
                    };
                });
            }

            const [{ data: accRes }, { data: cardRes }, { data: txRes }, { data: assetRes }, { data: notifRes }, { data: msgs }] = await Promise.all([
                supabase.from('mvp_accounts').select('*').eq('user_id', userId),
                supabase.from('mvp_cards').select('*').eq('user_id', userId),
                supabase.from('mvp_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(500),
                supabase.from('mvp_assets').select('*').eq('user_id', userId),
                supabase.from('mvp_notifications').select('id,title,message,type,is_read,created_at').eq('user_id', userId).limit(20),
                supabase.from('mvp_messages').select('id,sender,is_read,ticket_id').eq('user_id', userId).limit(100)
            ]);

            const allMsgs = msgs || [];
            const unread = allMsgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false)).length;
            setUnreadMessages(unread);

            const aiCount = allMsgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false) && (!m.ticket_id || m.ticket_id === "null" || m.ticket_id === 0)).length;
            const supportCount = allMsgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false) && (m.ticket_id && m.ticket_id !== "null" && m.ticket_id !== 0)).length;
            setUnreadAiMessages(aiCount);
            setUnreadSupportMessages(supportCount);

            let finalAccounts = accRes || [];
            let accountsCreated = false;

            // 1. Ensure Checking Account
            if (!finalAccounts.some((a: any) => (a.type || '').toLowerCase() === 'checking')) {
                await supabase.from('mvp_accounts').insert([{
                    user_id: userId,
                    name: 'Main Checking',
                    type: AccountType.CHECKING,
                    balance: 0,
                    account_number: '1000' + Math.floor(Math.random() * 9000000000),
                    color: 'bg-slate-900',
                    is_main: 1
                }]);
                accountsCreated = true;
            }

            // 2. Ensure Savings Account
            if (!finalAccounts.some((a: any) => (a.type || '').toLowerCase() === 'savings')) {
                await supabase.from('mvp_accounts').insert([{
                    user_id: userId,
                    name: 'Growth Savings',
                    type: AccountType.SAVINGS,
                    balance: 0,
                    account_number: '2000' + Math.floor(Math.random() * 9000000000),
                    color: 'bg-emerald-600',
                    is_main: 0
                }]);
                accountsCreated = true;
            }

            if (accountsCreated) {
                const { data: freshAccs } = await supabase.from('mvp_accounts').select('*').eq('user_id', userId);
                finalAccounts = freshAccs || [];
            }

            setAccounts(finalAccounts.map((a: any) => ({
                ...a,
                accountNumber: a.account_number,
                balance: Number(a.balance),
                is_main: a.is_main == 1 || a.is_main === true || a.is_main == "1"
            })));

            if (cardRes) {
                const formattedCards = cardRes.map((c: any) => ({
                    ...c,
                    id: Number(c.id),
                    isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                }));
                formattedCards.sort((a: any, b: any) => {
                    const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === APP_CONFIG.PREMIUM_CARD_NAME;
                    const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === APP_CONFIG.PREMIUM_CARD_NAME;
                    if (defA && !defB) return -1;
                    if (!defA && defB) return 1;
                    return 0;
                });
                setCards(formattedCards);
            }

            if (txRes) setTransactions(txRes.map((t: any) => ({ ...t, amount: Number(t.amount) })));
            if (assetRes) setAssets(assetRes.map((a: any) => ({
                ...a,
                isPositive: a.is_positive == "1" || a.is_positive == 1 || a.is_positive === true,
                amount: Number(a.amount),
                shares: Number(a.shares),
                growth: Number(a.growth || 0)
            })));
            if (notifRes) {
                setNotifications(notifRes.map((n: any) => ({ ...n, is_read: n.is_read == "1" || n.is_read == 1 || n.is_read === true })));
                setNotificationsSynced(true);
            }

        } catch (error: any) {
            console.error("Error fetching user data:", error);

            // FIX: Handle spurious AUTH_SESSION_EXPIRED by verifying session existence
            if (error.message === 'AUTH_SESSION_EXPIRED' || error.message?.includes('AUTH_SESSION_LOST')) {
                const { data } = await supabase.auth.getSession();
                // Only force sign out if session is truly null. If token is valid, it might be a temp glitch.
                if (!data.session) {
                    initRef.current = null;
                    await supabase.auth.signOut();
                    setCurrentUser(null);
                    setCurrentView('signin');
                    window.location.hash = '';
                    localStorage.removeItem('supabase.auth.token');
                } else {
                    console.warn("Recovered from false positive AUTH_SESSION_EXPIRED");
                }
            }
        } finally {
            setLoadingData(false);
        }
    }, []);

    const refreshNotifications = useCallback(async () => {
        if (!currentUser) return;
        try {
            const { data } = await supabase.from('mvp_notifications').select('id,title,message,type,is_read,created_at').eq('user_id', currentUser.id).limit(20);
            if (data) {
                setNotifications(data.map((n: any) => ({ ...n, is_read: n.is_read == "1" || n.is_read == 1 || n.is_read === true })));
                setNotificationsSynced(true);
            }
        } catch (e) { }
    }, [currentUser]);

    // Tracks user IDs that have already passed the maintenance admin check
    const maintenanceVerifiedRef = useRef<string | null>(null);

    // Tracks when we are signing out a suspended user so SIGNED_OUT doesn't reset the view
    const suspendingRef = useRef<string | null>(null);

    useEffect(() => {
        const handleSession = async (session: any, event?: string) => {
            if (isLoggingOut.current) return;

            // TOKEN_REFRESHED fires ~1s after SIGNED_IN — if this admin was already verified,
            // skip re-running the maintenance check to avoid wrongly signing them out
            if (session?.user && maintenanceVerifiedRef.current === session.user.id) {
                return;
            }

            // Fetch fresh settings directly (don't rely on stale globalSettings state)
            let maintenanceMode = false;
            try {
                const { data: settings } = await supabase.from('mvp_app_settings').select('maintenance_mode').eq('id', 1).single();
                maintenanceMode = settings?.maintenance_mode == "1" || settings?.maintenance_mode == 1 || settings?.maintenance_mode === true;
                await fetchGlobalSettings(); // Update state too for UI
            } catch (e) {
                console.warn('[Maintenance] Failed to fetch settings:', e);
            }

            if (session?.user) {
                const email = session.user.email?.toLowerCase();
                let isAdmin = email === APP_CONFIG.ADMIN_EMAILS[0] || email === 'akugbof@gmail.com';

                if (!isAdmin) {
                    try {
                        const { data: profiles } = await supabase.from('mvp_profiles').select('id,user_id,role').limit(1000);
                        const profile = (profiles || []).find((p: any) => p.user_id === session.user.id);
                        if (profile?.role === 'admin') isAdmin = true;
                        console.log('[Maintenance] Profile check:', { userId: session.user.id, role: profile?.role, isAdmin });
                    } catch (err) {
                        console.error('[Maintenance] Profile read error:', err);
                    }
                }

                // During maintenance, non-admins should NOT be logged in
                // Auth.tsx shows them a modal, but we must also block state update here
                if (maintenanceMode && !isAdmin) {
                    console.log('[Maintenance] Blocking non-admin user state update:', session.user.email);
                    setShowMaintenanceModal(true);
                    setCurrentView('signin');
                    setLoadingAuth(false);
                    return; // Don't set user state - they're not really logged in
                }

                if (maintenanceMode && isAdmin) {
                    console.log('[Maintenance] Allowing admin login:', session.user.email);
                    maintenanceVerifiedRef.current = session.user.id; // Mark verified — prevents re-check on TOKEN_REFRESHED
                }

                // Block Google OAuth sign-in from login page if no profile exists
                const authIntent = localStorage.getItem('lennox_auth_intent');
                if (authIntent === 'signin') {
                    const { data: existingProfiles } = await supabase
                        .from('mvp_profiles')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .limit(1);
                    if (!existingProfiles || existingProfiles.length === 0) {
                        // User clicked "Sign in with Google" on login page but has no account
                        await supabase.auth.signOut();
                        localStorage.removeItem('lennox_auth_intent');
                        setAuthErrorMessage('No account exists with this email. Please sign up first.');
                        setCurrentView('signin');
                        setLoadingAuth(false);
                        return;
                    }
                }
                localStorage.removeItem('lennox_auth_intent');

                // Check if user is suspended - block login immediately
                try {
                    const { data: suspProfiles } = await supabase
                        .from('mvp_profiles')
                        .select('is_suspended')
                        .eq('user_id', session.user.id)
                        .limit(1);
                    const suspProfile = suspProfiles?.[0];
                    const isUserSuspended = suspProfile?.is_suspended == "1" || suspProfile?.is_suspended == 1 || suspProfile?.is_suspended === true;
                    if (isUserSuspended) {
                        // Sign out cleanly; suspendingRef prevents SIGNED_OUT from resetting the view
                        suspendingRef.current = session.user.id;
                        await supabase.auth.signOut();
                        setShowSuspendedModal(true);
                        setCurrentView('signin');
                        setLoadingAuth(false);
                        return;
                    }
                } catch (err) {
                    console.error('[Auth] Suspension check error:', err);
                }

                const hasPin = session.user.user_metadata?.pin;
                if (!hasPin) {
                    setIsAccountIncomplete(true);
                    setRawSessionUser(session.user);
                    setLoadingAuth(false);
                    return;
                }
                setIsAccountIncomplete(false);

                setCurrentUser(prev => {
                    return {
                        id: session.user.id,
                        name: session.user.user_metadata?.full_name || prev?.name || session.user.email?.split('@')[0] || APP_CONFIG.BANK_NAME + ' Client',
                        email: session.user.email || prev?.email || '',
                        avatarUrl: prev?.avatarUrl || session.user.user_metadata?.avatar_url || '',
                        pin: session.user.user_metadata?.pin || prev?.pin
                    };
                });

                setIsAdminMode(isAdmin);
                if (currentView === 'signin' || currentView === 'signup') setCurrentView('home');
                setLoadingAuth(false);
                if (event === 'SIGNED_IN') {
                    window.location.hash = 'dashboard';
                    setRoute('dashboard');
                }
                fetchAllUserData(session.user.id, session.user.user_metadata);
            } else {
                if (!currentUser && !isAdminMode) setLoadingAuth(false);
            }
        };
        supabase.auth.getSession().then(({ data: { session } }) => handleSession(session, 'INITIAL_SESSION'));
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                if (suspendingRef.current) {
                    // Suspension sign-out: clear auth state but preserve hash/view so the modal stays visible
                    suspendingRef.current = null;
                    setCurrentUser(null);
                    setIsPinVerified(false);
                    maintenanceVerifiedRef.current = null;
                    return;
                }
                setCurrentUser(null);
                setLoadingAuth(false);
                setIsPinVerified(false);
                maintenanceVerifiedRef.current = null; // Reset on logout
                // Don't reset showMaintenanceModal here - let it persist so user sees why they were logged out
                window.location.hash = '';
                return;
            }
            handleSession(session, event);
        });
        return () => subscription.unsubscribe();
    }, [fetchAllUserData, fetchGlobalSettings]);

    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(() => {
            if (document.hidden) return;
            refreshNotifications();
            fetchGlobalSettings();

            // Use Supabase directly — MVP API is broken (404)
            supabase.from('mvp_transactions').select('*').eq('user_id', currentUser.id).order('date', { ascending: false }).limit(20)
                .then(({ data: txs }) => {
                    if (!txs) return;
                    const newTxs = txs.map((t: any) => ({ ...t, amount: Number(t.amount) }));
                    setTransactions(prev => {
                        const uniquePrev = prev.filter(p => {
                            const idMatch = newTxs.some(n => n.id === p.id);
                            if (idMatch) return false;
                            const uuidMatch = newTxs.some(n => n.uuid && (n.uuid === p.id || n.uuid === p.uuid));
                            if (uuidMatch) return false;
                            return true;
                        });
                        return [...newTxs, ...uniquePrev].slice(0, 100);
                    });
                });

            supabase.from('mvp_accounts').select('id,balance,account_number,is_main,type,name').eq('user_id', currentUser.id)
                .then(({ data: accs }) => {
                    if (accs && accs.length > 0) setAccounts(accs.map((a: any) => ({
                        ...a,
                        accountNumber: a.account_number,
                        balance: Number(a.balance),
                        is_main: a.is_main == 1 || a.is_main === true || a.is_main === "1"
                    })));
                });

            refreshMessageCounts();

        }, 60000); // 60s to reduce egress (was 15000)
        return () => clearInterval(interval);
    }, [currentUser, refreshNotifications, fetchGlobalSettings, refreshMessageCounts]);

    // Initialize theme from localStorage on mount (before user profile loads)
    // Default to light mode; only use saved preference if explicitly set
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                setIsDarkMode(true);
            } else {
                // Default to light for new visitors and returning users without explicit preference
                setIsDarkMode(false);
                localStorage.setItem('theme', 'light');
            }
        } catch { /* localStorage not available */ }
    }, []);

    useEffect(() => {
        if (isDarkMode || isAdminMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode, isAdminMode]);

    const toggleTheme = async () => {
        if (isAdminMode) return;
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        const themeValue = newMode ? 'dark' : 'light';
        // Always save to localStorage so non-logged-in users and fallback work
        try { localStorage.setItem('theme', themeValue); } catch { /* ignore */ }
        if (currentUser) {
            const { data: profiles } = await supabase.from('mvp_profiles').select('id,user_id').eq('user_id', currentUser.id);
            const profile = (profiles || [])[0];
            if (profile) await supabase.from('mvp_profiles').update({ theme: themeValue }).eq('id', profile.id);
        }
    };

    const handleLogout = async () => {
        isLoggingOut.current = true; // LOCK AUTH HANDLER
        setIsPinVerified(false);
        initRef.current = null;

        // Immediate UI Feedback
        setCurrentUser(null);
        setCurrentView('home');
        setRoute('dashboard');
        window.location.hash = '';

        try {
            // Attempt clean sign out
            await supabase.auth.signOut();
        } catch (e) {
            // Suppress errors during logout
        }

        // Clear state
        setIsAdminMode(false);
        setIsDarkMode(false);
        setIsAccountIncomplete(false);
        setIsSuspended(false);
        setRawSessionUser(null);
        localStorage.removeItem('supabase.auth.token');

        // Unlock after delay
        setTimeout(() => {
            isLoggingOut.current = false;
        }, 1000);
    };

    async function updateBalanceInStateAndDb(amount: number) {
        if (globalSettings.disableTransactions) return; // Prevent balance change on forced failure
        const activeAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
        if (!activeAccount) return;
        const newBalance = activeAccount.balance + amount;
        setAccounts(prev => prev.map(acc => acc.id === activeAccount.id ? { ...acc, balance: newBalance } : acc));
        // Use Supabase directly — MVP API is broken (404)
        const { error } = await supabase
            .from('mvp_accounts')
            .update({ balance: newBalance })
            .eq('id', activeAccount.id);
        if (error) console.error('[TopUp] Balance update failed:', error.message);
    }

    function addTransactionToStateAndDb(amount: number, description: string, type: TransactionType, category: string, status: TransactionStatus = 'Success', skipEmail: boolean = false) {
        if (!currentUser || accounts.length === 0) return;
        const activeAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
        const txId = generateUUID();

        const now = new Date();
        const date = now.toISOString().slice(0, 19).replace('T', ' ');

        let finalStatus = status;
        let finalDescription = description;

        if (globalSettings.disableTransactions) {
            finalStatus = 'Failed';
            finalDescription = `${description} – Connection Timeout`;
        }

        setTransactions(prev => {
            // Prevent duplicates: Check if a similar transaction was added in the last 5 seconds
            const duplicate = prev.find(t =>
                t.amount === amount &&
                t.description === finalDescription &&
                new Date(t.date).getTime() > Date.now() - 5000
            );
            if (duplicate) return prev;

            if (prev.some(t => t.id === txId)) return prev;
            return [{ id: txId, uuid: txId, account_id: activeAccount.id, amount, description: finalDescription, type, category, status: finalStatus, date }, ...prev];
        });

        // Move side effects to useEffect or ensure they only run once
        // For now, we'll check if the transaction is likely a duplicate before running side effects
        const isDuplicate = transactions.some(t =>
            t.amount === amount &&
            t.description === finalDescription &&
            new Date(t.date).getTime() > Date.now() - 5000
        );

        if (isDuplicate) return;

        const isSuccessLike = finalStatus === 'Success' || finalStatus === 'Pending' || finalStatus === 'Processing' || finalStatus === 'On Hold';
        if (isSuccessLike) {
            // Use Supabase directly — MVP API is broken (404)
        supabase.from('mvp_notifications').insert([{
            user_id: currentUser.id,
            title: amount > 0 ? 'Money Received' : 'Transaction Alert',
            message: amount > 0 ? `You received $${Math.abs(amount).toLocaleString()} from ${finalDescription}.` : `You paid $${Math.abs(amount).toLocaleString()} to ${finalDescription}.`,
            type: 'money',
            is_read: false
        }]).then(() => refreshNotifications());

            // Trigger Transaction Email (skip if caller requested, e.g. PayPal transfers)
            if (!skipEmail && globalSettings.emailNotifications && currentUser.email) {
                const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
                const { subject, content } = getEmailTemplate('transaction', {
                    amount: `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString()}`,
                    to_name: finalDescription,
                    date: now.toLocaleString(),
                    ref_id: txId,
                    status: finalStatus
                }, preferredLang);
                mvp.sendEmail(currentUser.email, subject, content, 'Transaction Alert').catch(console.error);
            }

        } else if (finalStatus === 'Failed' && globalSettings.disableTransactions) {
            supabase.from('mvp_notifications').insert([{
                user_id: currentUser.id,
                title: 'Transaction Failed',
                message: `Your payment to ${description} failed due to a network connection timeout. Please try again.`,
                type: 'alert',
                is_read: false
            }]).then(() => refreshNotifications());
        }

        // Use Supabase directly — MVP API is broken (404)
        supabase.from('mvp_transactions').insert([{
            uuid: txId,
            user_id: currentUser.id,
            account_id: activeAccount.id,
            amount,
            description: finalDescription,
            type,
            category,
            status: finalStatus,
            date
        }]).then(({ error }) => {
            if (error) console.error("[TopUp] Failed to persist transaction:", error.message);
        });
    }

    const sendOtpToUser = async () => {
        if (!currentUser || !currentUser.email) return null;
        // Trigger Supabase OTP (Magic Link / Code)
        try {
            const { error } = await supabase.auth.signInWithOtp({ email: currentUser.email });
            if (error) throw error;
            return "SUPABASE_VERIFY"; // Signal to UI that we are using server-side verification
        } catch (e) {
            console.error("OTP Send Failed", e);
            // Fallback to current MVP email if Supabase is not configured for this
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
            const { subject, content } = getEmailTemplate('otp', { otp: otp, name: currentUser.name || 'User' }, preferredLang);
            await mvp.sendEmail(currentUser.email, subject, content, 'Security').catch(console.error);
            return otp;
        }
    };

    const verifyOtpForUser = async (token: string): Promise<boolean> => {
        if (!currentUser?.email) return false;
        try {
            // Verify Supabase OTP
            const { data, error } = await supabase.auth.verifyOtp({
                email: currentUser.email,
                token,
                type: 'email'
            });

            if (error || !data.session) {
                // If Supabase valid failed, check if it matches "local" format (if we fell back)
                // But we can't check local variable here easily unless we store it.
                // For now, assume Supabase is primary.
                console.warn("Verify OTP failed:", error?.message);
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    if (loadingAuth || loadingSettings) return <GlobalLoader />;

    // Maintenance mode no longer blocks the login page - check happens at login attempt in Auth.tsx

    if (isSuspended && currentUser && !isAdminMode) return <SuspendedScreen user={currentUser} onLogout={handleLogout} />;

    if (isAccountIncomplete && rawSessionUser) {
        return <CompleteRegistration user={rawSessionUser} onComplete={() => {
            supabase.auth.refreshSession().then(({ data: { session } }) => {
                if (session) {
                    setIsAccountIncomplete(false);
                    setRawSessionUser(null);
                    setCurrentUser({ id: session.user.id, name: session.user.user_metadata?.full_name || APP_CONFIG.BANK_NAME, email: session.user.email || '', avatarUrl: '' });
                    initRef.current = null;
                    fetchAllUserData(session.user.id, session.user.user_metadata);
                }
            });
        }} />;
    }



    // Admin login route — must be checked before !currentUser so it works even when a user is already logged in
    if (currentView === 'admin_login') {
        if (currentUser && isAdminMode) {
            return (
                <div className="relative">
                    {globalSettings.maintenanceMode && <div className="bg-amber-500/90 text-white px-4 py-1 text-center text-xs font-bold uppercase tracking-widest sticky top-0 z-[100] backdrop-blur-md">Maintenance Mode Active</div>}
                    <AdminDashboard onLogout={handleLogout} onExitAdmin={handleLogout} userAvatar={currentUser.avatarUrl} />
                </div>
            );
        }
        return <AdminLoginScreen logoUrl={globalSettings.siteLogo} siteName={globalSettings.siteName} onBack={() => { setCurrentView('home'); window.location.hash = ''; }} />;
    }

    // Public live chat route (accessible without login)
    if (route === 'livechat') return <LiveChat />;

    if (!currentUser) {
        if (currentView === 'home') return <HomePage logoUrl={globalSettings.siteLogo} siteName={globalSettings.siteName} onNavigate={(p, e) => {
            window.location.hash = p;
            if (e) setPrefilledEmail(e);
        }} />;
        if (currentView === 'support') return <PublicSupport onBack={() => setCurrentView('signin')} initialSubject={supportInitialSubject} />;
        // Pass authErrorMessage to Auth component so it can display "Account not found..."
        return <Auth logoUrl={globalSettings.siteLogo} siteName={globalSettings.siteName} type={currentView as 'signin' | 'signup'} authFeedback={authErrorMessage} initialEmail={prefilledEmail} allowSignup={globalSettings.allowRegistration} maintenanceMode={globalSettings.maintenanceMode} showMaintenanceModal={showMaintenanceModal} showSuspendedModal={showSuspendedModal} onAuthSuccess={() => navigate('dashboard')} onSwitch={(view) => { setShowMaintenanceModal(false); setShowSuspendedModal(false); window.location.hash = view; }} onShowMaintenance={() => { setShowMaintenanceModal(true); }} onContactSupport={(subject) => { setSupportInitialSubject(subject || 'General Inquiry'); setCurrentView('support'); window.location.hash = 'support'; }} onLogout={handleLogout} />;
    }

    if (isAdminMode) return (
        <div className="relative">
            {globalSettings.maintenanceMode && <div className="bg-amber-500/90 text-white px-4 py-1 text-center text-xs font-bold uppercase tracking-widest sticky top-0 z-[100] backdrop-blur-md">Maintenance Mode Active</div>}
            <AdminDashboard onLogout={handleLogout} onExitAdmin={handleLogout} userAvatar={currentUser.avatarUrl} />
        </div>
    );

    const handleUpdatePin = async (newPin: string) => {
        if (!currentUser) return false;
        try {
            const { error } = await supabase.auth.updateUser({
                data: { pin: newPin }
            });
            if (error) throw error;

            setCurrentUser(prev => prev ? { ...prev, pin: newPin } : null);
            setIsPinVerified(true); // Auto-verify if they just reset it
            return true;
        } catch (e) {
            console.error("Failed to update PIN", e);
            return false;
        }
    };

    return (
        <Layout
            currentPath={route} onNavigate={navigate} onLogout={handleLogout} user={currentUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} isModalOpen={isModalOpen} notifications={notifications}
            onMarkRead={async (id) => {
                if (!currentUser) return;
                const { error } = await supabase.from('mvp_notifications').update({ is_read: true }).eq('id', id).eq('user_id', currentUser.id);
                if (error) {
                    console.error('[MarkRead] Supabase update failed:', error.message);
                } else {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                }
            }}
            onClearNotifications={async () => {
                if (!currentUser) { console.warn('[ClearNotifications] No currentUser'); return; }
                const ids = notifications.map(n => n.id);
                console.log('[ClearNotifications] Deleting', ids.length, 'notifications for user', currentUser.id);
                setNotifications([]); // Optimistic clear
                // Try delete by user_id first
                const { error: err1 } = await supabase.from('mvp_notifications').delete().eq('user_id', currentUser.id);
                if (err1) {
                    console.error('[ClearNotifications] Delete by user_id failed:', err1.message);
                    // Fallback: delete by specific ids
                    const { error: err2 } = await supabase.from('mvp_notifications').delete().in('id', ids);
                    if (err2) console.error('[ClearNotifications] Delete by ids also failed:', err2.message);
                    else console.log('[ClearNotifications] Delete by ids succeeded');
                } else {
                    console.log('[ClearNotifications] Delete by user_id succeeded');
                }
                // Verify by re-fetching
                const { data: remaining } = await supabase.from('mvp_notifications').select('id').eq('user_id', currentUser.id);
                console.log('[ClearNotifications] Remaining notifications after delete:', remaining?.length || 0, remaining);
            }}
            messageBadge={unreadAiMessages}
            supportBadge={unreadSupportMessages}
            notificationsSynced={notificationsSynced}
            logoUrl={globalSettings.siteLogo}
            siteName={globalSettings.siteName}
        >
            {/* PIN Verification Overlay */}
            {currentUser && !isAdminMode && !isPinVerified && (
                <PinVerificationModal
                    isOpen={true}
                    expectedPin={currentUser.pin || ''}
                    onSuccess={() => setIsPinVerified(true)}
                    title="Security Verification"
                    subtitle="Enter your PIN to access your dashboard."
                    email={currentUser.email}
                    onSendOtp={sendOtpToUser}
                    onVerifyOtp={verifyOtpForUser}
                    onUpdatePin={handleUpdatePin}
                    onLogout={handleLogout}
                />
            )}

            {/* Limit Exceeded Modal */}
            <LimitExceededModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                currentUsage={limitModalType === 'daily' ? dailyUsage : monthlyUsage}
                limit={limitModalType === 'daily' ? currentLimits.daily : currentLimits.monthly}
                type={limitModalType}
                kycLevel={kycLevel}
            />

            {loadingData ? (
                <GlobalLoader />
            ) : (
                (() => {
                    switch (route) {
                        case 'dashboard': return <Dashboard
                            accounts={accounts}
                            transactions={transactions}
                            cards={cards}
                            assets={assets}
                            onToggleBalance={toggleBalanceVisibility}
                            isBalanceHidden={isBalanceHidden}
                            onCancelTransaction={(id) => supabase.from('mvp_transactions').update({ status: 'Cancelled' }).eq('id', id).then(() => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Cancelled' } : t)))}
                            onQuickAction={(a) => {
                                const map: any = { wallet: 'wallet', transfer: 'transfers', topup: 'topup', request: 'request', billpay: 'billpay', more: 'more' };
                                navigate(map[a] || a);
                            }} />;
                        case 'wallet': return <Accounts
                            onNavigate={navigate}
                            user={currentUser}
                            isBalanceHidden={isBalanceHidden}
                            onSendOtp={sendOtpToUser}
                            onVerifyOtp={verifyOtpForUser}
                            onUpdatePin={handleUpdatePin}
                            accounts={accounts}
                            cards={cards}
                            onAddCard={async (t, n, h, e, p, c) => {
                                const gradient = 'from-blue-600 to-indigo-600';
                                // Bypass broken MVP API - use Supabase directly (RLS allows user_id matching)
                                const { data: newCard, error } = await supabase
                                    .from('mvp_cards')
                                    .insert([{
                                        user_id: currentUser.id,
                                        type: t,
                                        number: n,
                                        holder: h.toUpperCase(),
                                        expiry: e,
                                        pin: p || 'RESET',
                                        cvv: c || '',
                                        is_frozen: !p,
                                        gradient,
                                        shadow: 'shadow-blue-500/30'
                                    }])
                                    .select()
                                    .single();

                                if (error) {
                                    console.error('[Card] Direct insert failed:', error.message);
                                    return { success: false, message: error.message };
                                }

                                if (newCard) {
                                    // Refresh cards from Supabase directly
                                    const { data: freshCards } = await supabase
                                        .from('mvp_cards')
                                        .select('*')
                                        .eq('user_id', currentUser.id);

                                    if (freshCards) {
                                        const formatted = freshCards.map((c: any) => ({
                                            ...c,
                                            id: Number(c.id),
                                            isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                                        }));
                                        formatted.sort((a: any, b: any) => {
                                            const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === APP_CONFIG.PREMIUM_CARD_NAME;
                                            const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === APP_CONFIG.PREMIUM_CARD_NAME;
                                            if (defA && !defB) return -1;
                                            if (!defA && defB) return 1;
                                            return 0;
                                        });
                                        setCards(formatted);
                                    }

                                    // Send Card Activity Email
                                    if (globalSettings.emailNotifications && currentUser.email) {
                                        const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
                                        const { subject, content } = getEmailTemplate('card', {
                                            user_name: currentUser.name,
                                            card_last4: n.slice(-4),
                                            action: 'Added New Card'
                                        }, preferredLang);
                                        mvp.sendEmail(currentUser.email, subject, content, 'Card Services').catch(console.error);
                                    }
                                }
                                return { success: true };
                            }}
                            onFreezeCard={async (id) => {
                                const card = cards.find(c => c.id === id);
                                if (card) {
                                    const newStatus = !card.isFrozen;
                                    // Use Supabase directly — MVP API is broken (404)
                                    const { error } = await supabase.from('mvp_cards').update({ is_frozen: newStatus }).eq('id', id);
                                    if (error) {
                                        console.error('[FreezeCard] Failed:', error.message);
                                        return;
                                    }
                                    setCards(prev => prev.map(c => c.id === id ? { ...c, isFrozen: newStatus } : c));

                                    // Send Card Activity Email
                                    if (globalSettings.emailNotifications && currentUser.email) {
                                        const action = newStatus ? 'Frozen' : 'Unfrozen';
                                        const preferredLang = localStorage.getItem('preferredLanguage') || 'en';
                                        const { subject, content } = getEmailTemplate('card', {
                                            user_name: currentUser.name,
                                            card_last4: card.number.slice(-4),
                                            action: `${action} Card`
                                        }, preferredLang);
                                        mvp.sendEmail(currentUser.email, subject, content, 'Card Services').catch(console.error);
                                    }
                                }
                            }}
                            onDeleteCard={async (id) => {
                                // Use Supabase directly — MVP API is broken (404)
                                const { error } = await supabase.from('mvp_cards').delete().eq('id', id);
                                if (!error) {
                                    setCards(prev => prev.filter(c => c.id !== id));
                                    return { success: true };
                                }
                                console.error('[DeleteCard] Failed:', error.message);
                                return { success: false, message: error.message };
                            }}
                            onChangePin={async (id, newPin) => {
                                // Use Supabase directly — MVP API is broken (404)
                                const { error } = await supabase.from('mvp_cards').update({ pin: newPin }).eq('id', id);
                                if (!error) {
                                    setCards(prev => prev.map(c => c.id === id ? { ...c, pin: newPin } : c));
                                } else {
                                    console.error('[ChangePin] Failed:', error.message);
                                }
                            }}
                            onReplaceCard={async (id) => {
                                if (globalSettings.disableTransactions) {
                                    addTransactionToStateAndDb(-5, 'Card Replacement Fee', TransactionType.PAYMENT, 'Service Fee');
                                    return 'ERROR';
                                }
                                const activeAccount = accounts.find(a => a.is_main) || accounts[0];
                                if (!activeAccount || activeAccount.balance < 5) return 'INSUFFICIENT_FUNDS';

                                try {
                                    await updateBalanceInStateAndDb(-5);
                                    await addTransactionToStateAndDb(-5, 'Card Replacement Fee', TransactionType.PAYMENT, 'Service Fee');

                                    const newNum = Math.floor(1000 + Math.random() * 9000).toString();
                                    // Use Supabase directly — MVP API is broken (404)
                                    const { error } = await supabase.from('mvp_cards').update({ number: newNum, is_frozen: true, pin: 'RESET' }).eq('id', id);
                                    if (error) throw new Error(error.message);

                                    setCards(prev => prev.map(c => c.id === id ? { ...c, number: newNum, isFrozen: true, pin: 'RESET' } : c));
                                    return 'SUCCESS';
                                } catch (e) {
                                    return 'ERROR';
                                }
                            }}
                            onTopUp={async (amt, status) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                if (status === 'Success') await updateBalanceInStateAndDb(amt);
                                await addTransactionToStateAndDb(amt, 'Wallet Top Up', TransactionType.DEPOSIT, 'Deposit', status);
                                return true;
                            }}
                            cardControls={cardControls}
                            onUpdateControls={(c) => {
                                const updated = { ...cardControls, ...c };
                                setCardControls(updated);
                                supabase.from('mvp_profiles').select('id').eq('user_id', currentUser.id).single().then(({ data: p }) => {
                                    if (p) supabase.from('mvp_profiles').update({ settings: JSON.stringify({ ...updated, cardControls: updated }) }).eq('id', p.id).then();
                                });
                            }}
                            kycLevel={kycLevel}
                            onModalChange={setIsModalOpen}
                            onProvisionDefault={async (customPin) => {
                                if (!currentUser) return { success: false, error: 'User not initialized' };

                                try {
                                    const holderName = (currentUser.name || APP_CONFIG.BANK_NAME + ' MEMBER').toUpperCase();
                                    const futureDate = new Date();
                                    futureDate.setFullYear(futureDate.getFullYear() + 3);
                                    const exp = `${String(futureDate.getMonth() + 1).padStart(2, '0')}/${String(futureDate.getFullYear()).slice(-2)}`;

                                    const finalPin = customPin || '0000';

                                    const payload = {
                                        user_id: currentUser.id,
                                        type: APP_CONFIG.PREMIUM_CARD_NAME,
                                        number: '4' + Math.floor(Math.random() * 1000000000000000).toString().slice(0, 15),
                                        holder: holderName,
                                        expiry: exp,
                                        pin: finalPin,
                                        cvv: Math.floor(Math.random() * 900 + 100).toString(),
                                        is_frozen: 0,
                                        is_default: 1,
                                        gradient: 'from-gray-900 to-gray-800',
                                        shadow: 'shadow-gray-900/50'
                                    };

                                    const { error: cardErr } = await supabase.from('mvp_cards').insert([payload]);

                                    if (!cardErr) {
                                        const { data: freshCards } = await supabase.from('mvp_cards').select('*');
                                        if (freshCards) {
                                            const formatted = freshCards.map((c: any) => ({
                                                ...c,
                                                id: Number(c.id),
                                                isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                                            }));
                                            // SORT
                                            formatted.sort((a: any, b: any) => {
                                                const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === APP_CONFIG.PREMIUM_CARD_NAME;
                                                const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === APP_CONFIG.PREMIUM_CARD_NAME;
                                                if (defA && !defB) return -1;
                                                if (!defA && defB) return 1;
                                                return 0;
                                            });
                                            setCards(formatted);
                                        }
                                        return { success: true };
                                    }
                                    return { success: false, error: res?.error || "Failed to create system card" };
                                } catch (e: any) {
                                    return { success: false, error: e.message };
                                }
                            }}
                        />;
                        case 'transactions': return <Transactions transactions={transactions} onModalChange={setIsModalOpen} onRecordDownload={(s) => setDownloadedStatements(p => [s, ...p])} />;
                        case 'statistics': return <Statistics transactions={transactions} accounts={accounts} />;
                        case 'transfers': return <Transfers
                            user={currentUser}
                            accounts={accounts}
                            isBalanceHidden={isBalanceHidden}
                            maxLimit={globalSettings.enableDailyLimit ? globalSettings.maxTxLimit : Infinity}
                            shouldFail={globalSettings.disableTransactions}
                            kycLevel={kycLevel}
                            dailyLimit={currentLimits.daily}
                            dailyUsage={dailyUsage}
                            onSendOtp={sendOtpToUser}
                            onUpdatePin={handleUpdatePin}
                            defaultTransferStatus={globalSettings.defaultTransferStatus}
                            onTransfer={async (fid, tid, amt, note, skipEmail, txStatus) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                const status = txStatus || globalSettings.defaultTransferStatus || 'Success';
                                if (status === 'Success') {
                                    updateBalanceInStateAndDb(-amt);
                                }
                                addTransactionToStateAndDb(-amt, `Transfer to ${tid}`, TransactionType.TRANSFER_OUT, 'Transfer', status, skipEmail);
                                return true;
                            }}
                            onBack={() => navigate('dashboard')}
                        />;
                        case 'topup': return <TopUp
                            user={currentUser}
                            onSendOtp={sendOtpToUser}
                            onUpdatePin={handleUpdatePin}
                            accounts={accounts}
                            cards={cards}
                            transactions={transactions}
                            onChangePin={async (id, newPin) => {
                                await supabase.from('mvp_cards').update({ pin: newPin }).eq('id', id);
                                setCards(prev => prev.map(c => c.id === id ? { ...c, pin: newPin } : c));
                            }}
                            onTopUp={async (amt, status) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                if (status === 'Success') await updateBalanceInStateAndDb(amt);
                                await addTransactionToStateAndDb(amt, 'Wallet Top Up', TransactionType.DEPOSIT, 'Deposit', status);
                                return true;
                            }} onBack={() => navigate('dashboard')} />;
                        case 'request': return <RequestMoney
                            transactions={transactions}
                            shouldFail={globalSettings.disableTransactions}
                            onRequest={(amt, name, note) => {
                                addTransactionToStateAndDb(
                                    amt,
                                    `Request: ${name}`,
                                    TransactionType.TRANSFER_IN,
                                    'Request',
                                    globalSettings.disableTransactions ? 'Failed' : 'Pending'
                                );
                            }}
                            onBack={() => navigate('dashboard')}
                        />;
                        case 'billpay': return <BillPay
                            user={currentUser}
                            accounts={accounts}
                            isBalanceHidden={isBalanceHidden}
                            transactions={transactions}
                            maxLimit={globalSettings.enableDailyLimit ? globalSettings.maxTxLimit : Infinity}
                            shouldFail={globalSettings.disableTransactions}
                            kycLevel={kycLevel}
                            dailyLimit={currentLimits.daily}
                            dailyUsage={dailyUsage}
                            onSendOtp={sendOtpToUser}
                            onUpdatePin={handleUpdatePin}
                            onPay={async (biller, amt) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                updateBalanceInStateAndDb(-amt);
                                addTransactionToStateAndDb(-amt, `Bill Pay: ${biller}`, TransactionType.PAYMENT, 'Bills');
                                return true;
                            }}
                            onBack={() => navigate('dashboard')}
                        />;
                        case 'more': return <MoreActions onBack={() => navigate('dashboard')} onNavigate={navigate} />;
                        case 'check-deposit': return <CheckDeposit onBack={() => navigate('more')} limit={currentLimits.daily} />;
                        case 'statements': return <Statements statements={downloadedStatements} onBack={() => navigate('more')} />;
                        case 'atm-locator': return <AtmLocator onBack={() => navigate('more')} />;
                        case 'scan-pay': return <ScanPay onBack={() => navigate('dashboard')} />;
                        case 'recurring': return <Recurring transactions={transactions.filter(t => t.status === 'Scheduled')} onBack={() => navigate('more')} />;
                        case 'help-center': return <HelpCenter onBack={() => navigate('more')} />;
                        case 'contact-us': return <ContactUs user={currentUser!} unreadCount={unreadSupportMessages} onBack={() => navigate('more')} onNavigate={navigate} onAuthError={(e) => { console.error(e); handleLogout(); }} onRefreshCounts={refreshMessageCounts} />;
                        case 'message': return <AiAssistant user={currentUser!} accounts={accounts} transactions={transactions} onNavigate={navigate} onRefreshCounts={refreshMessageCounts} />;
                        case 'kyc': return <KycVerification
                            userId={currentUser.id}
                            kycLevel={kycLevel}
                            onNavigate={navigate}
                            dailyUsage={dailyUsage}
                            weeklyUsage={weeklyUsage}
                            monthlyUsage={monthlyUsage}
                            dailyLimit={currentLimits.daily}
                            weeklyLimit={currentLimits.weekly}
                            monthlyLimit={currentLimits.monthly}
                        />;
                        case 'investments': return <Investments
                            assets={assets}
                            totalPortfolio={assets.reduce((s, a) => {
                                const growth = Number(a.growth) || 0;
                                const isPositive = a.is_positive == (1 as any) || a.is_positive === true || a.is_positive === '1';
                                const currentValue = Number(a.amount) * (1 + (isPositive ? growth : -growth) / 100);
                                return s + currentValue;
                            }, 0)}
                            walletBalance={accounts.find(a => a.is_main)?.balance || accounts[0]?.balance || 0}
                            isBalanceHidden={isBalanceHidden}
                            user={currentUser}
                            onSendOtp={sendOtpToUser}
                            onUpdatePin={handleUpdatePin}
                            onBuyAsset={async (symbol, name, amount, price) => {
                                if (!currentUser) return false;

                                const absAmount = Math.abs(amount);
                                // Validate investment against transaction limits
                                const { allowed, type } = checkTransactionLimit(absAmount);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }

                                try {
                                    const numAmount = Number(amount);
                                    if (isNaN(numAmount)) throw new Error("Invalid amount");

                                    if (globalSettings.disableTransactions) {
                                        addTransactionToStateAndDb(-numAmount, numAmount > 0 ? `Investment: ${symbol}` : `Sold: ${symbol}`, numAmount > 0 ? TransactionType.PURCHASE : TransactionType.DEPOSIT, 'Investments');
                                        return true;
                                    }

                                    updateBalanceInStateAndDb(-numAmount);
                                    addTransactionToStateAndDb(-numAmount, numAmount > 0 ? `Investment: ${symbol}` : `Sold: ${symbol}`, numAmount > 0 ? TransactionType.PURCHASE : TransactionType.DEPOSIT, 'Investments');

                                    const shareDelta = numAmount / price;
                                    const existing = assets.find(a => a.symbol === symbol);

                                    if (existing) {
                                        const newShares = (existing.shares || 0) + shareDelta;
                                        const newAmount = (existing.amount || 0) + numAmount;

                                        await supabase.from('mvp_assets').update({ shares: newShares, amount: newAmount }).eq('id', existing.id);
                                        setAssets(prev => prev.map(a => a.id === existing.id ? { ...a, shares: newShares, amount: newAmount } : a));
                                    } else if (numAmount > 0) {
                                        const payload = {
                                            user_id: currentUser.id,
                                            symbol,
                                            name,
                                            shares: shareDelta,
                                            amount: numAmount,
                                            growth: 0,
                                            is_positive: 1
                                        };
                                        const { data: res, error } = await supabase.from('mvp_assets').insert([payload]).select('id');
                                        if (!error && res) {
                                            setAssets(prev => [...prev, { ...payload, id: res[0]?.id, isPositive: true } as Asset]);
                                        }
                                    }
                                    return true;
                                } catch (e) {
                                    console.error("Investment Error", e);
                                    return false;
                                }
                            }} onModalChange={setIsModalOpen} />;
                        case 'settings': return <Settings user={currentUser} settings={userSettings} onUpdateSettings={(s) => {
                            const updated = { ...userSettings, ...s };
                            setUserSettings(updated);
                            // Fix: Added missing quote for columns property in mvp.read
                            supabase.from('mvp_profiles').select('id').eq('user_id', currentUser.id).single().then(({ data: p }) => {
                                if (p) supabase.from('mvp_profiles').update({ settings: JSON.stringify({ ...updated, cardControls }) }).eq('id', p.id).then();
                            });
                        }} onLogout={handleLogout} />;
                        case 'profile': return <Profile user={currentUser} onProfileUpdate={(data) => setCurrentUser(prev => prev ? ({ ...prev, ...data }) : null)} />;
                        default: return <Dashboard accounts={accounts} transactions={transactions} cards={cards} assets={assets} />;
                    }
                })()
            )}

        </Layout>
    );
}

export default App;