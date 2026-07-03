
import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config';
import { ArrowLeft, Search, ChevronDown, Mail, Phone, MessageSquare, Send, Ticket, Clock, CheckCircle, AlertCircle, Loader2, Inbox, ExternalLink, ShieldCheck, ChevronRight, X, Headphones, User, Fingerprint, Paperclip } from 'lucide-react';
import { mvp, fileToBase64 } from '../services/mvpService';
import { User as UserType } from '../types';
import { supabase } from '../services/supabase';

const PageHeader = ({ title, subtitle, onBack }: { title: string, subtitle: string, onBack: () => void }) => (
    <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h2 className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em]">{subtitle}</p>
        </div>
    </div>
);

export const HelpCenter = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <PageHeader title="Help Center" subtitle="Registry Assistance" onBack={onBack} />
            <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Common Protocols</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">How do I reset my PIN?</h4>
                            <p className="text-xs text-slate-500 mt-1">Navigate to Wallet, select the active node card, and trigger 'Change PIN'.</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">What is the daily transfer limit?</h4>
                            <p className="text-xs text-slate-500 mt-1">Tier 1 accounts are capped at $5,000. Verified nodes access Tier 2 limits of $50,000.</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Is my account secure?</h4>
                            <p className="text-xs text-slate-500 mt-1">All data is encrypted with AES-256 protocols and stored on redundant secure clusters.</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Direct Support</h4>
                            <p className="text-xs text-slate-500 mt-1">For urgent inquiries, email us directly at <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">{APP_CONFIG.SUPPORT_EMAIL}</a>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TicketTerminal = ({ ticket, user, onBack, onAuthError, onRefreshCounts }: { ticket: any, user: UserType, onBack: () => void, onAuthError?: (err: any) => void, onRefreshCounts?: () => void }) => {
    const [msgs, setMsgs] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const markAsRead = async (msgList: any[]) => {
        const unread = msgList.filter(m => m.sender === 'admin' && (m.is_read == 0 || m.is_read === false));
        if (unread.length === 0) return;

        try {
            const ids = unread.map(m => m.id);
            if (ids.length > 0) {
                const { error } = await supabase.from('mvp_messages').update({ is_read: 1 }).in('id', ids);
                if (error) console.error('Mark read failed:', error.message);
            }

            if (onRefreshCounts) onRefreshCounts();
        } catch (e) {
            console.error("Failed to mark ticket message as read", e);
        }
    };

    const loadMsgs = async () => {
        try {
            const { data } = await supabase.from('mvp_messages').select('id,text,sender,created_at,ticket_id,is_read').limit(500);
            if (data && Array.isArray(data)) {
                const filtered = data.filter((m: any) =>
                    m.ticket_id && String(m.ticket_id) === String(ticket.id)
                );
                const sorted = filtered.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setMsgs(sorted);
                markAsRead(sorted);
            }
        } catch (e: any) {
            console.error("Signal fetch fault:", e.message);
            if (e.message === 'AUTH_SESSION_EXPIRED' || e.message?.includes('AUTH_SESSION_LOST')) {
                if (onAuthError) onAuthError(e);
            }
        }
    };

    useEffect(() => {
        loadMsgs();
        const interval = setInterval(loadMsgs, 4000);
        return () => clearInterval(interval);
    }, [ticket.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [msgs]);

    const handleSend = async (msgText?: string) => {
        const text = msgText || input;
        if (!text.trim() || sending) return;

        if (!msgText) setInput('');
        setSending(true);

        try {
            const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
            if (authErr || !authUser) {
                console.error("Auth error sending message:", authErr);
                if (onAuthError) onAuthError(authErr || new Error('No authenticated user'));
                return;
            }
            const { error: msgErr } = await supabase.from('mvp_messages').insert([{
                user_id: authUser.id,
                ticket_id: ticket.id,
                text: text,
                sender: 'user'
            }]);

            if (!msgErr) {
                await loadMsgs();
            } else {
                console.error("Message insert error:", msgErr);
            }
        } catch (e: any) {
            console.error("Transmission failed:", e.message);
            if (e.message === 'AUTH_SESSION_EXPIRED' || e.message?.includes('AUTH_SESSION_LOST')) {
                if (onAuthError) onAuthError(e);
            }
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && file.size > 2 * 1024 * 1024) {
                alert("Image size must be under 2MB");
                return;
            }
            if (isVideo && file.size > 5 * 1024 * 1024) {
                alert("Video size must be under 5MB");
                return;
            }
            if (!isImage && !isVideo) {
                alert("Only images and videos are supported");
                return;
            }

            setSending(true);
            try {
                const base64 = await fileToBase64(file);
                const mediaMsg = `[MEDIA:${file.type}]${base64}`;
                await handleSend(mediaMsg);
            } catch (err) {
                console.error("File upload error", err);
                setSending(false);
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const renderMessageContent = (text: string) => {
        const mediaMatch = text.match(/^\[MEDIA:(.*?)\](.*)$/s);
        if (mediaMatch) {
            const type = mediaMatch[1];
            const data = mediaMatch[2];
            if (type.startsWith('image/')) {
                return <img src={data} alt="uploaded" className="max-w-full rounded-lg border border-white/20" style={{ maxHeight: '200px' }} />;
            } else if (type.startsWith('video/')) {
                return <video src={data} controls className="max-w-full rounded-lg border border-white/20" style={{ maxHeight: '200px' }} />;
            }
        }
        return <p className="whitespace-pre-wrap">{text}</p>;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-210px)] md:h-[calc(100vh-180px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-right-4 duration-300 w-full">
            <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Ticket size={20} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[150px] md:max-w-md">{ticket.subject}</h2>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest">Node State: {ticket.status}</p>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Signal Ref</p>
                    <p className="text-[10px] font-mono text-blue-500 font-bold">#{String(ticket.id).padStart(6, '0')}</p>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-4 pt-1 space-y-[5px] custom-scrollbar bg-slate-50/20 dark:bg-slate-950/40"
            >
                <div className="flex flex-col items-center gap-2 mb-1.5 mt-0.5">
                    <div className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-full text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-300 dark:border-slate-700 shadow-sm">
                        Session Initialized • {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="opacity-50 hover:opacity-100 transition-opacity">
                        <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-[9px] text-slate-400 hover:text-blue-500 font-bold underline">Official correspondence: {APP_CONFIG.SUPPORT_EMAIL}</a>
                    </div>
                </div>

                <div className="space-y-[5px]">
                    <div className="flex items-end gap-2 flex-row-reverse">
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500">
                            <User size={10} />
                        </div>
                        <div className="w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl text-[12px] leading-relaxed shadow-md font-medium bg-blue-600 text-white rounded-br-none">
                            {renderMessageContent(ticket.message)}
                            <div className="flex items-center gap-1 mt-0.5 justify-end opacity-40 font-mono text-[8px]">
                                {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <CheckCircle size={8} />
                            </div>
                        </div>
                    </div>

                    {msgs.map((m, i) => {
                        const isMe = m.sender === 'user' || m.sender === 'ME';
                        return (
                            <div key={m.id || i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isMe ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500' : 'bg-blue-600 border-blue-500 text-white'}`}>
                                    {isMe ? <User size={10} /> : <Headphones size={10} />}
                                </div>
                                <div className={`w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl text-[12px] leading-relaxed shadow-md font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                                    {!isMe && <p className="text-[7px] font-black uppercase text-blue-500 mb-0.5 opacity-80">Support Response</p>}
                                    {renderMessageContent(m.text)}
                                    <div className={`flex items-center gap-1 mt-0.5 opacity-40 font-mono text-[8px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <CheckCircle size={8} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                {ticket.status === 'Closed' ? (
                    <div className="py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">This ticket session has been resolved by an administrator.</p>
                    </div>
                ) : (
                    <div className="flex gap-2 max-w-full mx-auto">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                            disabled={sending}
                        >
                            <Paperclip size={16} />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Write a response..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                disabled={sending}
                            />
                            {sending && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || sending}
                            className="p-3 md:px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            <span className="hidden md:inline font-bold uppercase text-xs tracking-widest">Send Signal</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ContactUs = ({ user, unreadCount = 0, onBack, onNavigate, onAuthError, onRefreshCounts }: { user: UserType, unreadCount?: number, onBack: () => void, onNavigate?: (tab: string) => void, onAuthError?: (err: any) => void, onRefreshCounts?: () => void }) => {
    const [activeView, setActiveView] = useState<'compose' | 'tickets'>('compose');
    const [viewingTicket, setViewingTicket] = useState<any | null>(null);
    const [subject, setSubject] = useState('General Inquiry');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const composeFileRef = useRef<HTMLInputElement>(null);

    const fetchTickets = async () => {
        setIsLoadingTickets(true);
        try {
            const { data } = await supabase.from('mvp_support_tickets').select('*').limit(50);
            if (data && Array.isArray(data)) {
                const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setTickets(sorted);
            }
        } catch (e: any) {
            console.error("Registry fetch error:", e.message);
            if (e.message === 'AUTH_SESSION_EXPIRED' || e.message?.includes('AUTH_SESSION_LOST')) {
                if (onAuthError) onAuthError(e);
            }
        } finally {
            setIsLoadingTickets(false);
        }
    };

    useEffect(() => {
        if (activeView === 'tickets') fetchTickets();
    }, [activeView]);

    useEffect(() => {
        const scriptId = 'jivosite-widget-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = '//code.jivosite.com/widget/qtzro7VBOl';
            script.async = true;
            document.head.appendChild(script);
        }
        return () => {
            const existing = document.getElementById(scriptId);
            if (existing) existing.remove();
        };
    }, []);

    const handleSendMessage = async () => {
        if (!message.trim() || !user) return;
        setIsSubmitting(true);
        setError('');
        try {
            const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
            if (authErr || !authUser) {
                setError('Session error. Please log in again.');
                if (onAuthError) onAuthError(authErr || new Error('No authenticated user'));
                return;
            }
            const userId = authUser.id;
            const { data: ticketData, error: ticketErr } = await supabase.from('mvp_support_tickets').insert([{
                user_id: userId,
                subject,
                message,
                status: 'Open'
            }]).select('id');

            if (ticketErr) {
                setError(ticketErr.message || 'Failed to submit ticket. Please try again.');
                console.error("Ticket creation error:", ticketErr);
                return;
            }

            if (ticketData) {
                const newTicketId = ticketData[0]?.id;
                if (attachment && newTicketId) {
                    try {
                        const base64 = await fileToBase64(attachment);
                        const mediaMsg = `[MEDIA:${attachment.type}]${base64}`;
                        await supabase.from('mvp_messages').insert([{
                            user_id: userId,
                            ticket_id: newTicketId,
                            text: mediaMsg,
                            sender: 'user'
                        }]);
                    } catch (attachErr) {
                        console.error("Failed to upload attachment", attachErr);
                    }
                }

                setMessage('');
                setAttachment(null);
                setSuccessMsg('Signal transmitted successfully.');
                setTimeout(() => {
                    setSuccessMsg('');
                    setActiveView('tickets');
                }, 1200);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to submit ticket. Please try again.');
            console.error("Creation fault:", e.message);
            if (e.message === 'AUTH_SESSION_EXPIRED' || e.message?.includes('AUTH_SESSION_LOST')) {
                if (onAuthError) onAuthError(e);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && file.size > 2 * 1024 * 1024) {
                alert("Image size must be under 2MB");
                return;
            }
            if (isVideo && file.size > 5 * 1024 * 1024) {
                alert("Video size must be under 5MB");
                return;
            }
            if (!isImage && !isVideo) {
                alert("Only images and videos are supported");
                return;
            }
            setAttachment(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 animate-fade-in relative">
            <PageHeader title="Support Center" subtitle={viewingTicket ? "Active Signal Terminal" : "Registry Management"} onBack={viewingTicket ? () => setViewingTicket(null) : onBack} />

            {viewingTicket ? (
                <div className="flex-1 p-3 md:p-6 flex flex-col w-full">
                    <TicketTerminal ticket={viewingTicket} user={user} onBack={() => setViewingTicket(null)} onAuthError={onAuthError} onRefreshCounts={onRefreshCounts} />
                </div>
            ) : (
                <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-24 w-full">
                    <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm w-full max-w-sm mx-auto">
                        <button onClick={() => setActiveView('compose')} className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeView === 'compose' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>New Inquiry</button>
                        <button onClick={() => setActiveView('tickets')} className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all relative ${activeView === 'tickets' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                            Track Signals
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-600 text-white text-[9px] font-black flex items-center justify-center px-1 rounded-full border border-white dark:border-slate-800 shadow-sm animate-in zoom-in">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeView === 'compose' ? (
                        <div className="space-y-6 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500">
                            {successMsg && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl flex items-start gap-3 border border-emerald-100 dark:border-emerald-800 shadow-sm animate-in zoom-in">
                                    <CheckCircle size={20} className="shrink-0" />
                                    <div><p className="font-black uppercase tracking-widest mb-1">Transmission Success</p><p className="font-medium opacity-80">{successMsg}</p></div>
                                </div>
                            )}
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-800 shadow-sm animate-in zoom-in">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <div><p className="font-black uppercase tracking-widest mb-1">Transmission Failed</p><p className="font-medium opacity-80">{error}</p></div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-soft space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Inquiry Protocol</label>
                                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                                        <option>General Inquiry</option>
                                        <option>Technical Issue</option>
                                        <option>Transaction Dispute</option>
                                        <option>KYC / Verification</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Signal Data Payload</label>
                                    <div className="relative">
                                        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-4 pb-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder:text-slate-400" placeholder="Provide detailed operational logs..."></textarea>

                                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                            <input type="file" ref={composeFileRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                                            <button
                                                onClick={() => composeFileRef.current?.click()}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                title="Attach Media"
                                            >
                                                <Paperclip size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {attachment && (
                                        <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg max-w-fit">
                                            <Paperclip size={12} className="text-blue-600" />
                                            <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium truncate max-w-[150px]">{attachment.name}</span>
                                            <button onClick={() => setAttachment(null)} className="ml-1 hover:text-red-500"><X size={12} /></button>
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleSendMessage} disabled={isSubmitting || !message.trim()} className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all">
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Transmit Signal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in w-full px-1">
                            {isLoadingTickets && tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                    <Loader2 className="animate-spin text-blue-500" size={32} /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanning Signal Registry...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
                                    <Inbox size={40} className="text-slate-300 mb-6" /><h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">No active signals found</h4>
                                    <p className="text-xs text-slate-400 mb-6">Create a new inquiry to establish technical contact.</p>
                                    <button onClick={() => setActiveView('compose')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">New Inquiry</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {tickets.map((t, i) => (
                                        <div
                                            key={t.id || i}
                                            onClick={() => setViewingTicket(t)}
                                            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500/50 transition-all rounded-2xl p-4 md:p-5 shadow-soft cursor-pointer group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${t.status === 'Open' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                    <Ticket size={20} className="md:w-6 md:h-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h4 className="font-black text-slate-900 dark:text-white text-[11px] md:text-sm uppercase truncate tracking-tight">{t.subject}</h4>
                                                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${t.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                            {t.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] md:max-w-md font-medium italic">"{t.message}"</p>
                                                    <p className="text-[8px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">{new Date(t.created_at).toLocaleDateString()} • NODE: #{String(t.id).padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Correspondence</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Prefer email? Reach us at <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">{APP_CONFIG.SUPPORT_EMAIL}</a>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
