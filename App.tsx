import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Account, Transaction, TransactionType, Card, Asset, User, Notification, TransactionStatus, AccountType } from './types';
import { supabase } from './services/supabase';
import { mvp } from './services/mvpService';
import { Loader2, ShieldCheck, Save, AlertCircle, ShieldAlert, LogOut, Send, CheckCircle, Ticket, Lock, Clock, ChevronRight, MessageSquare, Mail, Key, UserX, AlertTriangle, Ban } from 'lucide-react';
import { getEmailTemplate } from './utils/emailTemplates';
import { APP_CONFIG } from './config';

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


function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- KYC LIMIT CONFIGURATION ---
const KYC_LIMITS = {
    0: { daily: 0, weekly: 0, monthly: 0, label: 'Unverified' },
    1: { daily: 1000, weekly: 5000, monthly: 10000, label: 'Tier 1' },
    2: { daily: 50000, weekly: 250000, monthly: 500000, label: 'Tier 2' }
};

const MaintenanceScreen = ({ onAdminLogin, onLogout, isLoggedIn }: { onAdminLogin: () => void, onLogout?: () => void, isLoggedIn: boolean }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketSent, setTicketSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !message) return;
        setIsSubmitting(true);
        await mvp.create('support_tickets', {
            user_id: 'MAINTENANCE_USER',
            subject: 'Maintenance Query',
            message: `[MAINTENANCE MODE] From: ${email} - ${message}`,
            status: 'Open'
        });
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
            await mvp.create('waitlist', { email });
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
                    alt="Lennox"
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

    useEffect(() => {
        const checkExisting = async () => {
            const tickets = await mvp.read('support_tickets', true, { columns: 'id,subject,status', limit: 10 });
            const appeal = tickets.find((t: any) => t.subject === 'Account Suspension Appeal' && t.status === 'Open');
            if (appeal) setExistingTicket(appeal);
            setIsChecking(false);
        };
        checkExisting();
    }, []);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || existingTicket) return;
        setIsSubmitting(true);
        try {
            const res = await mvp.create('support_tickets', {
                user_id: user.id,
                subject: 'Account Suspension Appeal',
                message: `[LOCKOUT PROTOCOL APPEAL]: ${message}`,
                status: 'Open'
            });
            if (res.success) {
                setExistingTicket({ id: res.id, status: 'Open' });
                setMessage('');
            }
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
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

            const profiles = await mvp.read('profiles', true);
            const existing = profiles.find((p: any) => p.user_id === user.id);
            if (existing) {
                await mvp.update('profiles', existing.id, {
                    settings: JSON.stringify({ pinSet: true })
                });
            } else {
                await mvp.create('profiles', {
                    user_id: user.id,
                    full_name: user.user_metadata?.full_name || APP_CONFIG.BANK_NAME,
                    email: user.email,
                    settings: JSON.stringify({ pinSet: true })
                });
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

function App() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [notificationsSynced, setNotificationsSynced] = useState(false); // Controls Badge Visibility
    const [isSuspended, setIsSuspended] = useState(false);
    const [forceMaintenance, setForceMaintenance] = useState(false);

    const [currentView, setCurrentView] = useState<'home' | 'signin' | 'signup'>(() => {
        const hash = window.location.hash.substring(1);
        if (hash === 'signin' || hash === 'signup') return hash;
        const saved = localStorage.getItem('lennox_view');
        return (saved === 'signin' || saved === 'signup') ? saved : 'home';
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
        return sessionStorage.getItem('lennox_pin_verified') === 'true';
    });

    const setIsPinVerified = (verified: boolean) => {
        setIsPinVerifiedState(verified);
        if (verified) {
            sessionStorage.setItem('lennox_pin_verified', 'true');
        } else {
            sessionStorage.removeItem('lennox_pin_verified');
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
        siteName: 'Lennox Bank',
        siteLogo: '',
        enableDailyLimit: true,
        enableWeeklyLimit: true,
        enableMonthlyLimit: true,
        dailyLimit: 50000,
        weeklyLimit: 250000,
        monthlyLimit: 500000
    });

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadAiMessages, setUnreadAiMessages] = useState(0);
    const [unreadSupportMessages, setUnreadSupportMessages] = useState(0);

    // Global Balance Visibility
    const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
        return localStorage.getItem('lennox_hide_balance') === 'true';
    });

    const toggleBalanceVisibility = useCallback(() => {
        setIsBalanceHidden(prev => {
            const newValue = !prev;
            localStorage.setItem('lennox_hide_balance', String(newValue));
            return newValue;
        });
    }, []);

    const [route, setRoute] = useState(() => window.location.hash.substring(1) || 'dashboard');

    const navigate = useCallback((path: string) => {
        setRoute(path);
        window.location.hash = path;
    }, []);

    // Navigation History Handler
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);

            // AUTH NAVIGATION (Checking !currentUser inside effect creates closure issues, rely on currentView logic)
            if (hash === 'signin' || hash === 'signup') {
                setCurrentView(hash);
                localStorage.setItem('lennox_view', hash);
            } else {
                // For any other hash (including empty, 'home', 'banking', or dashboard routes like 'transactions')
                // We default the view state to 'home'.
                // If logged in: Layout renders based on 'route' (synced below).
                // If logged out: HomePage renders (handling anchors like #banking).
                setCurrentView('home');
                localStorage.setItem('lennox_view', 'home');
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

    // Determine Current Limits based on KYC Level
    // Determine Current Limits based on KYC Level
    const currentLimits = useMemo(() => {
        if (kycLevel === 2) {
            return {
                daily: globalSettings.enableDailyLimit ? (globalSettings.dailyLimit || 50000) : Infinity,
                weekly: globalSettings.enableWeeklyLimit ? (globalSettings.weeklyLimit || 250000) : Infinity,
                monthly: globalSettings.enableMonthlyLimit ? (globalSettings.monthlyLimit || 500000) : Infinity,
                label: 'Tier 2'
            };
        }
        return KYC_LIMITS[kycLevel as 0 | 1 | 2] || KYC_LIMITS[0];
    }, [kycLevel, globalSettings]);

    const checkTransactionLimit = (amount: number): { allowed: boolean; type?: 'daily' | 'weekly' | 'monthly' } => {
        const absAmount = Math.abs(amount);
        // STRICT KYC 0 CHECK
        if (kycLevel === 0) return { allowed: false, type: 'daily' };

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
            const settings = await mvp.getSettings();
            if (settings) {
                const isMaintenance = settings.maintenance_mode == "1" || settings.maintenance_mode == 1 || settings.maintenance_mode === true;
                const isRegAllowed = settings.allow_registration == "1" || settings.allow_registration == 1 || settings.allow_registration === true;
                const isTxDisabled = settings.disable_transactions == "1" || settings.disable_transactions == 1 || settings.disable_transactions === true;

                setGlobalSettings({
                    maintenanceMode: isMaintenance,
                    allowRegistration: isRegAllowed,
                    maxTxLimit: Number(settings.max_transaction_limit) || 50000,
                    emailNotifications: settings.email_notifications == "1" || settings.email_notifications == 1 || settings.email_notifications === true,
                    disableTransactions: isTxDisabled,
                    siteName: settings.site_name || 'Lennox Bank',
                    siteLogo: settings.site_logo || '',
                    enableDailyLimit: settings.enable_daily_limit == "1" || settings.enable_daily_limit === 1 || settings.enable_daily_limit === true,
                    enableWeeklyLimit: settings.enable_weekly_limit == "1" || settings.enable_weekly_limit === 1 || settings.enable_weekly_limit === true,
                    enableMonthlyLimit: settings.enable_monthly_limit == "1" || settings.enable_monthly_limit === 1 || settings.enable_monthly_limit === true,
                    dailyLimit: Number(settings.daily_limit) || 50000,
                    weeklyLimit: Number(settings.weekly_limit) || 250000,
                    monthlyLimit: Number(settings.monthly_limit) || 500000
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
            const msgs = await mvp.read('messages', true, { columns: 'id,sender,is_read,ticket_id', limit: 100 });
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
            const profiles = await mvp.read('profiles', true, { columns: 'id,user_id,full_name,email,role,kyc_level,is_suspended,theme,avatar_url,settings' });
            let profile = profiles.find((p: any) => p.user_id === userId);

            // LOGIC: If profile doesn't exist, create it (self-healing).
            if (!profile) {
                console.log("No profile found for authenticated user. Auto-creating profile...");
                try {
                    await mvp.create('profiles', {
                        user_id: userId,
                        full_name: userMetadata?.full_name || `${APP_CONFIG.BRAND_NAME} Client`,
                        email: userMetadata?.email || '',
                        kyc_level: 0
                    });
                } catch (createErr: any) {
                    // Trigger or race may have already created it — re-read
                    if (createErr.message?.includes('23505') || createErr.message?.includes('duplicate') || createErr.message?.includes('unique constraint')) {
                        console.warn('Profile already exists (race with trigger), re-reading...');
                    } else {
                        throw createErr;
                    }
                }
                const updatedProfiles = await mvp.read('profiles', true, { columns: 'id,user_id,full_name,email,role,kyc_level,is_suspended,theme,avatar_url,settings' });
                profile = updatedProfiles.find((p: any) => p.user_id === userId);
            }

            if (profile) {
                setIsSuspended(profile.is_suspended == "1" || profile.is_suspended == 1 || profile.is_suspended === true);
                if (profile.theme) setIsDarkMode(profile.theme === 'dark');

                // Ensure KYC level defaults to 0 if null/undefined
                setKycLevel(Number(profile.kyc_level) || 0);

                const decodedSettings = typeof profile.settings === 'string' ? JSON.parse(profile.settings) : profile.settings;
                if (decodedSettings) {
                    const { cardControls: remoteCardControls, ...restSettings } = decodedSettings;
                    setUserSettings(prev => ({ ...prev, ...restSettings }));
                    if (remoteCardControls) setCardControls(remoteCardControls);
                }

                setCurrentUser(prev => {
                    if (prev && prev.id === userId && prev.avatarUrl) {
                        return prev;
                    }
                    return {
                        id: userId,
                        name: profile.full_name || prev?.name || `${APP_CONFIG.BRAND_NAME} Client`,
                        email: profile.email || prev?.email || '',
                        avatarUrl: prev?.avatarUrl || profile.avatar_url || '',
                        pin: userMetadata?.pin // Include PIN in user object
                    };
                });
            }

            const [accRes, cardRes, txRes, assetRes, notifRes, msgs] = await Promise.all([
                mvp.read('accounts', true),
                mvp.read('cards', true),
                mvp.read('transactions', true, { limit: 500 }),
                mvp.read('assets', true),
                mvp.read('notifications', true, { columns: 'id,title,message,type,is_read,created_at', limit: 20 }),
                mvp.read('messages', true, { columns: 'id,sender,is_read,ticket_id', limit: 100 })
            ]);

            const unread = msgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false)).length;
            setUnreadMessages(unread);

            // Separate Unread Counts for AI and Support
            const aiCount = msgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false) && (!m.ticket_id || m.ticket_id === "null" || m.ticket_id === 0)).length;
            const supportCount = msgs.filter((m: any) => m.sender !== 'user' && (m.is_read == "0" || m.is_read == 0 || m.is_read === false) && (m.ticket_id && m.ticket_id !== "null" && m.ticket_id !== 0)).length;
            setUnreadAiMessages(aiCount);
            setUnreadSupportMessages(supportCount);

            let finalAccounts = accRes || [];
            let accountsCreated = false;

            // 1. Ensure Checking Account
            if (!finalAccounts.some((a: any) => (a.type || '').toLowerCase() === 'checking')) {
                await mvp.create('accounts', {
                    user_id: userId,
                    name: 'Main Checking',
                    type: AccountType.CHECKING,
                    balance: 0,
                    account_number: '1000' + Math.floor(Math.random() * 9000000000),
                    color: 'bg-slate-900',
                    is_main: 1
                });
                accountsCreated = true;
            }

            // 2. Ensure Savings Account
            if (!finalAccounts.some((a: any) => (a.type || '').toLowerCase() === 'savings')) {
                await mvp.create('accounts', {
                    user_id: userId,
                    name: 'Growth Savings',
                    type: AccountType.SAVINGS,
                    balance: 0,
                    account_number: '2000' + Math.floor(Math.random() * 9000000000),
                    color: 'bg-emerald-600',
                    is_main: 0
                });
                accountsCreated = true;
            }

            if (accountsCreated) {
                finalAccounts = await mvp.read('accounts', true);
            }

            setAccounts(finalAccounts.map((a: any) => ({
                ...a,
                accountNumber: a.account_number,
                balance: Number(a.balance),
                is_main: a.is_main == 1 || a.is_main === true || a.is_main === "1"
            })));

            if (cardRes) {
                const formattedCards = cardRes.map((c: any) => ({
                    ...c,
                    id: Number(c.id),
                    isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                }));

                // SORT: Default cards first
                formattedCards.sort((a: any, b: any) => {
                    const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === 'Lennox Black';
                    const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === 'Lennox Black';
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
                setNotificationsSynced(true); // Notifications loaded and confirmed fresh
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
            const data = await mvp.read('notifications', true, { columns: 'id,title,message,type,is_read,created_at', limit: 20 });
            if (data) {
                setNotifications(data.map((n: any) => ({ ...n, is_read: n.is_read == "1" || n.is_read == 1 || n.is_read === true })));
                setNotificationsSynced(true);
            }
        } catch (e) { }
    }, [currentUser]);

    useEffect(() => {
        const handleSession = async (session: any, error: any = null) => {
            if (isLoggingOut.current) return;

            await fetchGlobalSettings();
            if (session?.user) {
                const email = session.user.email?.toLowerCase();
                let isAdmin = email === 'admin@lennox.bank' || email === 'akugbof@gmail.com';

                if (!isAdmin) {
                    try {
                        const profiles = await mvp.read('profiles', false, { columns: 'id,user_id,role', limit: 1000 });
                        const profile = profiles.find((p: any) => p.user_id === session.user.id);
                        if (profile?.role === 'admin') isAdmin = true;
                        console.log('[Maintenance] Profile check:', { userId: session.user.id, role: profile?.role, isAdmin });
                    } catch (err) {
                        console.error('[Maintenance] Profile read error:', err);
                    }
                }

                if (globalSettings.maintenanceMode && !isAdmin) {
                    console.log('[Maintenance] Blocking non-admin user during maintenance:', session.user.email);
                    await supabase.auth.signOut();
                    setForceMaintenance(true);
                    setCurrentView('home');
                    setLoadingAuth(false);
                    return;
                }

                if (globalSettings.maintenanceMode && isAdmin) {
                    console.log('[Maintenance] Allowing admin login:', session.user.email);
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
                    if (prev && prev.id === session.user.id && prev.avatarUrl) {
                        return prev;
                    }
                    return {
                        id: session.user.id,
                        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Lennox Client',
                        email: session.user.email || '',
                        avatarUrl: prev?.avatarUrl || session.user.user_metadata?.avatar_url || '',
                        pin: session.user.user_metadata?.pin // Include PIN here
                    };
                });

                setIsAdminMode(isAdmin);
                if (currentView === 'signin' || currentView === 'signup') setCurrentView('home');
                setLoadingAuth(false);
                fetchAllUserData(session.user.id, session.user.user_metadata);
            } else {
                if (!currentUser && !isAdminMode) setLoadingAuth(false);
            }
        };
        supabase.auth.getSession().then(({ data: { session }, error }) => handleSession(session, error));
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                setLoadingAuth(false);
                setIsPinVerified(false);
                window.location.hash = '';
            }
            handleSession(session);
        });
        return () => subscription.unsubscribe();
    }, [fetchAllUserData, fetchGlobalSettings, globalSettings.maintenanceMode]);

    useEffect(() => {
        if (!currentUser) return;
        const interval = setInterval(() => {
            if (document.hidden) return;
            refreshNotifications();
            fetchGlobalSettings();

            mvp.read('transactions', true, { limit: 20 })
                .then(txs => setTransactions(prev => {
                    const newTxs = txs.map((t: any) => ({ ...t, amount: Number(t.amount) }));

                    // Filter out any previous transactions that are now present in the new fetch (by ID or UUID)
                    const uniquePrev = prev.filter(p => {
                        // If p has a real ID that matches a new tx ID, it's a duplicate
                        const idMatch = newTxs.some(n => n.id === p.id);
                        if (idMatch) return false;

                        // If p is an optimistic tx (p.id is UUID string) and matches a new tx's UUID
                        const uuidMatch = newTxs.some(n => n.uuid && (n.uuid === p.id || n.uuid === p.uuid));
                        if (uuidMatch) return false;

                        return true;
                    });

                    return [...newTxs, ...uniquePrev].slice(0, 100);
                }))
                .catch(() => { });

            mvp.read('accounts', true, { columns: 'id,balance,account_number,is_main,type,name' })
                .then(accs => {
                    if (accs.length > 0) setAccounts(accs.map((a: any) => ({
                        ...a,
                        accountNumber: a.account_number,
                        balance: Number(a.balance),
                        is_main: a.is_main == 1 || a.is_main === true || a.is_main === "1"
                    })));
                })
                .catch(() => { });

            refreshMessageCounts();

        }, 15000);
        return () => clearInterval(interval);
    }, [currentUser, refreshNotifications, fetchGlobalSettings, refreshMessageCounts]);

    useEffect(() => {
        if (isDarkMode || isAdminMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDarkMode, isAdminMode]);

    const toggleTheme = async () => {
        if (isAdminMode) return;
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (currentUser) {
            const profiles = await mvp.read('profiles', true, { columns: 'id,user_id' });
            const profile = profiles.find((p: any) => p.user_id === currentUser.id);
            if (profile) await mvp.update('profiles', profile.id, { theme: newMode ? 'dark' : 'light' });
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

    function updateBalanceInStateAndDb(amount: number) {
        if (globalSettings.disableTransactions) return; // Prevent balance change on forced failure
        const activeAccount = accounts.find(a => a.is_main) || accounts[0]; // Use Main Wallet
        if (!activeAccount) return;
        const newBalance = activeAccount.balance + amount;
        setAccounts(prev => prev.map(acc => acc.id === activeAccount.id ? { ...acc, balance: newBalance } : acc));
        mvp.update('accounts', activeAccount.id, { balance: newBalance }).then();
    }

    function addTransactionToStateAndDb(amount: number, description: string, type: TransactionType, category: string, status: TransactionStatus = 'Success') {
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

        if (finalStatus === 'Success' || finalStatus === 'Pending') {
            mvp.create('notifications', {
                user_id: currentUser.id,
                title: amount > 0 ? 'Money Received' : 'Transaction Alert',
                message: amount > 0 ? `You received $${Math.abs(amount).toLocaleString()} from ${finalDescription}.` : `You paid $${Math.abs(amount).toLocaleString()} to ${finalDescription}.`,
                type: 'money',
                is_read: false
            }).then(() => refreshNotifications());

            // Trigger Transaction Email
            if (globalSettings.emailNotifications && currentUser.email) {
                const { subject, content } = getEmailTemplate('transaction', {
                    amount: `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString()}`,
                    to_name: finalDescription,
                    date: now.toLocaleString(),
                    ref_id: txId,
                    status: finalStatus
                });
                mvp.sendEmail(currentUser.email, subject, content).catch(console.error);
            }

        } else if (finalStatus === 'Failed' && globalSettings.disableTransactions) {
            mvp.create('notifications', {
                user_id: currentUser.id,
                title: 'Transaction Failed',
                message: `Your payment to ${description} failed due to a network connection timeout. Please try again.`,
                type: 'alert',
                is_read: false
            }).then(() => refreshNotifications());
        }

        mvp.create('transactions', {
            uuid: txId,
            user_id: currentUser.id,
            account_id: activeAccount.id,
            amount,
            description: finalDescription,
            type,
            category,
            status: finalStatus,
            date
        }).then((res) => {
            if (!res.success) console.error("Failed to persist transaction:", res);
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
            const { subject, content } = getEmailTemplate('otp', { otp: otp, name: currentUser.name || 'User' });
            await mvp.sendEmail(currentUser.email, subject, content).catch(console.error);
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
                    setCurrentUser({ id: session.user.id, name: session.user.user_metadata?.full_name || 'Lennox Bank', email: session.user.email || '', avatarUrl: '' });
                    initRef.current = null;
                    fetchAllUserData(session.user.id, session.user.user_metadata);
                }
            });
        }} />;
    }



    if (!currentUser) {
        if (currentView === 'home') return <HomePage logoUrl={globalSettings.siteLogo} siteName={globalSettings.siteName} onNavigate={(p, e) => {
            window.location.hash = p;
            if (e) setPrefilledEmail(e);
        }} />;
        // Pass authErrorMessage to Auth component so it can display "Account not found..."
        return <Auth logoUrl={globalSettings.siteLogo} siteName={globalSettings.siteName} type={currentView as 'signin' | 'signup'} authFeedback={authErrorMessage} initialEmail={prefilledEmail} allowSignup={globalSettings.allowRegistration} maintenanceMode={globalSettings.maintenanceMode} onAuthSuccess={() => navigate('dashboard')} onSwitch={(view) => window.location.hash = view} onShowMaintenance={() => { setForceMaintenance(true); setCurrentView('home'); }} />;
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
            onMarkRead={(id) => mvp.update('notifications', id, { is_read: true }).then(() => setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)))}
            onClearNotifications={async () => {
                const ids = notifications.map(n => n.id);
                setNotifications([]); // Optimistic clear
                for (const id of ids) {
                    try { await mvp.delete('notifications', id); } catch (e) { console.error("Failed to delete notification", id); }
                }
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
                            onCancelTransaction={(id) => mvp.update('transactions', id, { status: 'Cancelled' }).then(() => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Cancelled' } : t)))}
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
                                const res = await mvp.create('cards', {
                                    user_id: currentUser.id,
                                    type: t,
                                    number: n,
                                    holder: h.toUpperCase(),
                                    expiry: e,
                                    pin: p || 'RESET',
                                    cvv: c || '', // Ensure c is passed
                                    is_frozen: !p,
                                    gradient,
                                    shadow: 'shadow-blue-500/30'
                                });

                                if (res.success) {
                                    const freshCards = await mvp.read('cards', true);
                                    if (freshCards) {
                                        const formatted = freshCards.map((c: any) => ({
                                            ...c,
                                            id: Number(c.id),
                                            isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                                        }));
                                        // SORT
                                        formatted.sort((a: any, b: any) => {
                                            const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === 'Lennox Black';
                                            const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === 'Lennox Black';
                                            if (defA && !defB) return -1;
                                            if (!defA && defB) return 1;
                                            return 0;
                                        });
                                        setCards(formatted);
                                    }

                                    // Send Card Activity Email
                                    if (globalSettings.emailNotifications && currentUser.email) {
                                        const { subject, content } = getEmailTemplate('card', {
                                            user_name: currentUser.name,
                                            card_last4: n.slice(-4),
                                            action: 'Added New Card'
                                        });
                                        mvp.sendEmail(currentUser.email, subject, content).catch(console.error);
                                    }
                                }
                                return { success: res.success };
                            }}
                            onFreezeCard={(id) => {
                                const card = cards.find(c => c.id === id);
                                if (card) {
                                    const newStatus = !card.isFrozen;
                                    mvp.update('cards', id, { is_frozen: newStatus }).then(() => {
                                        setCards(prev => prev.map(c => c.id === id ? { ...c, isFrozen: newStatus } : c));

                                        // Send Card Activity Email
                                        if (globalSettings.emailNotifications && currentUser.email) {
                                            const action = newStatus ? 'Frozen' : 'Unfrozen';
                                            const { subject, content } = getEmailTemplate('card', {
                                                user_name: currentUser.name,
                                                card_last4: card.number.slice(-4),
                                                action: `${action} Card`
                                            });
                                            mvp.sendEmail(currentUser.email, subject, content).catch(console.error);
                                        }
                                    });
                                }
                            }}
                            onDeleteCard={async (id) => {
                                const res = await mvp.delete('cards', id);
                                if (res.success) {
                                    setCards(prev => prev.filter(c => c.id !== id));
                                }
                                return res;
                            }}
                            onChangePin={async (id, newPin) => {
                                await mvp.update('cards', id, { pin: newPin });
                                setCards(prev => prev.map(c => c.id === id ? { ...c, pin: newPin } : c));
                            }}
                            onReplaceCard={async (id) => {
                                if (globalSettings.disableTransactions) {
                                    addTransactionToStateAndDb(-5, 'Card Replacement Fee', TransactionType.PAYMENT, 'Service Fee');
                                    return 'ERROR'; // Will show generic error or handle failure
                                }
                                const activeAccount = accounts.find(a => a.is_main) || accounts[0];
                                if (!activeAccount || activeAccount.balance < 5) return 'INSUFFICIENT_FUNDS';

                                try {
                                    updateBalanceInStateAndDb(-5);
                                    addTransactionToStateAndDb(-5, 'Card Replacement Fee', TransactionType.PAYMENT, 'Service Fee');

                                    const newNum = Math.floor(1000 + Math.random() * 9000).toString();
                                    await mvp.update('cards', id, { number: newNum, is_frozen: true, pin: 'RESET' });

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
                                if (status === 'Success') updateBalanceInStateAndDb(amt);
                                addTransactionToStateAndDb(amt, 'Wallet Top Up', TransactionType.DEPOSIT, 'Deposit', status);
                                return true;
                            }}
                            cardControls={cardControls}
                            onUpdateControls={(c) => {
                                const updated = { ...cardControls, ...c };
                                setCardControls(updated);
                                mvp.read('profiles', true, { columns: 'id,user_id' }).then(ps => {
                                    const p = ps.find((x: any) => x.user_id === currentUser.id);
                                    if (p) mvp.update('profiles', p.id, { settings: JSON.stringify({ ...updated, cardControls: updated }) }).then();
                                });
                            }}
                            kycLevel={kycLevel}
                            onModalChange={setIsModalOpen}
                            onProvisionDefault={async (customPin) => {
                                if (!currentUser) return { success: false, error: 'User not initialized' };

                                try {
                                    const holderName = (currentUser.name || 'LENNOX MEMBER').toUpperCase();
                                    const futureDate = new Date();
                                    futureDate.setFullYear(futureDate.getFullYear() + 3);
                                    const exp = `${String(futureDate.getMonth() + 1).padStart(2, '0')}/${String(futureDate.getFullYear()).slice(-2)}`;

                                    const finalPin = customPin || '0000';

                                    const payload = {
                                        user_id: currentUser.id,
                                        type: 'Lennox Black',
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

                                    const res = await mvp.create('cards', payload);

                                    if (res && res.success) {
                                        const freshCards = await mvp.read('cards', true);
                                        if (freshCards) {
                                            const formatted = freshCards.map((c: any) => ({
                                                ...c,
                                                id: Number(c.id),
                                                isFrozen: c.is_frozen == "1" || c.is_frozen == 1 || c.is_frozen === true
                                            }));
                                            // SORT
                                            formatted.sort((a: any, b: any) => {
                                                const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === 'Lennox Black';
                                                const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === 'Lennox Black';
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
                            maxLimit={globalSettings.maxTxLimit}
                            shouldFail={globalSettings.disableTransactions}
                            kycLevel={kycLevel}
                            dailyLimit={currentLimits.daily}
                            dailyUsage={dailyUsage}
                            onSendOtp={sendOtpToUser}
                            onUpdatePin={handleUpdatePin}
                            onTransfer={async (fid, tid, amt, note) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                updateBalanceInStateAndDb(-amt);
                                addTransactionToStateAndDb(-amt, `Transfer to ${tid}`, TransactionType.TRANSFER_OUT, 'Transfer');
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
                                await mvp.update('cards', id, { pin: newPin });
                                setCards(prev => prev.map(c => c.id === id ? { ...c, pin: newPin } : c));
                            }}
                            onTopUp={async (amt, status) => {
                                const { allowed, type } = checkTransactionLimit(amt);
                                if (!allowed) {
                                    setLimitModalType(type || 'daily');
                                    setShowLimitModal(true);
                                    return false;
                                }
                                if (status === 'Success') updateBalanceInStateAndDb(amt);
                                addTransactionToStateAndDb(amt, 'Wallet Top Up', TransactionType.DEPOSIT, 'Deposit', status);
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
                            maxLimit={globalSettings.maxTxLimit}
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

                                        await mvp.update('assets', existing.id, { shares: newShares, amount: newAmount });
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
                                        const res = await mvp.create('assets', payload);
                                        if (res.success) {
                                            setAssets(prev => [...prev, { ...payload, id: res.id, isPositive: true } as Asset]);
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
                            mvp.read('profiles', true, { columns: 'id,user_id' }).then(ps => {
                                const p = ps.find((x: any) => x.user_id === currentUser.id);
                                if (p) mvp.update('profiles', p.id, { settings: JSON.stringify({ ...updated, cardControls }) }).then();
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