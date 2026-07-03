
import React, { useState, useEffect, useRef } from 'react';
import { APP_CONFIG } from '../config';
import { ArrowLeft, Send, Ticket, CheckCircle, Loader2, Inbox, MessageSquare, Clock, ChevronRight, Paperclip, X, Headphones, User, AlertCircle } from 'lucide-react';
import { supabase, supabaseAdmin } from '../services/supabase';
import { fileToBase64 } from '../services/mvpService';

export const PublicSupport = ({ onBack, initialSubject = 'General Inquiry' }: { onBack: () => void; initialSubject?: string }) => {
    const [activeView, setActiveView] = useState<'compose' | 'tickets' | 'detail'>('compose');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState(initialSubject);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<any | null>(null);
    const [ticketMessages, setTicketMessages] = useState<any[]>([]);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [trackEmail, setTrackEmail] = useState('');
    const composeFileRef = useRef<HTMLInputElement>(null);
    const replyFileRef = useRef<HTMLInputElement>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (!error && data?.user) {
                    setHasSession(true);
                    setSessionUserId(data.user.id);
                    setEmail(data.user.email || '');
                    setTrackEmail(data.user.email || '');
                }
            } catch (e) {
                console.error('Failed to load auth user:', e);
            } finally {
                setIsSessionLoading(false);
            }
        };
        loadSession();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticketMessages]);

    const getUserId = () => sessionUserId;

    const findUserByEmail = async (targetEmail: string): Promise<string | null> => {
        if (!supabaseAdmin) return null;
        try {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (error || !data?.users) {
                console.error('Failed to lookup user by email:', error);
                return null;
            }
            const found = data.users.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase());
            return found?.id || null;
        } catch (e) {
            console.error('Error looking up user by email:', e);
            return null;
        }
    };

    const resolveUserId = async (): Promise<{ userId: string | null; client: any }> => {
        const authId = getUserId();
        if (authId) return { userId: authId, client: supabase };
        const targetEmail = (trackEmail || email).trim();
        if (!targetEmail) return { userId: null, client: supabase };
        const foundId = await findUserByEmail(targetEmail);
        return { userId: foundId, client: supabaseAdmin };
    };

    const handleSubmit = async () => {
        setErrorMsg('');
        if (!message.trim()) { setErrorMsg('Please enter a message.'); return; }
        const { userId, client } = await resolveUserId();
        if (!userId) { setErrorMsg('No account found for this email. Please use the email address registered on your account.'); return; }
        setIsSubmitting(true);
        try {
            const payload: any = {
                user_id: userId,
                subject,
                message,
                status: 'Open'
            };
            const { data, error } = await client.from('mvp_support_tickets').insert([payload]).select('id');
            if (!error && data && data.length > 0) {
                const newTicketId = data[0]?.id;
                if (attachment && newTicketId) {
                    try {
                        const base64 = await fileToBase64(attachment);
                        const mediaMsg = `[MEDIA:${attachment.type}]${base64}`;
                        await client.from('mvp_messages').insert([{
                            user_id: userId,
                            ticket_id: newTicketId,
                            text: mediaMsg,
                            sender: 'user'
                        }]);
                    } catch (attachErr) {
                        console.error('Failed to upload attachment', attachErr);
                    }
                }
                setMessage('');
                setAttachment(null);
                setSuccessMsg('Ticket submitted successfully. Reference: #' + String(newTicketId).padStart(6, '0'));
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                setErrorMsg('Failed to submit ticket. ' + (error?.message || 'Please try again or email ' + APP_CONFIG.SUPPORT_EMAIL));
            }
        } catch (e: any) {
            setErrorMsg('Error: ' + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchTickets = async () => {
        setErrorMsg('');
        const { userId, client } = await resolveUserId();
        if (!userId) { setErrorMsg('No account found for this email. Please use the email address registered on your account.'); return; }
        setIsLoadingTickets(true);
        try {
            const { data, error } = await client.from('mvp_support_tickets')
                .select('*')
                .eq('user_id', userId)
                .limit(50);
            if (!error && data) {
                const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setTickets(sorted);
            } else {
                setErrorMsg('Unable to fetch tickets. ' + (error?.message || ''));
            }
        } catch (e: any) {
            setErrorMsg('Error fetching tickets: ' + e.message);
        } finally {
            setIsLoadingTickets(false);
        }
    };

    const loadTicketMessages = async (ticket: any) => {
        setViewingTicket(ticket);
        setActiveView('detail');
        try {
            const { data } = await supabase.from('mvp_messages')
                .select('id,text,sender,created_at,ticket_id,is_read')
                .eq('ticket_id', ticket.id)
                .limit(500);
            if (data) {
                const sorted = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setTicketMessages(sorted);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleReply = async (overrideText?: string) => {
        const text = (overrideText ?? replyText).trim();
        if (!text || !viewingTicket) return;
        const { userId, client } = await resolveUserId();
        if (!userId) {
            setErrorMsg('No account found for this email. Please use the email address registered on your account.');
            return;
        }
        setIsSendingReply(true);
        try {
            await client.from('mvp_messages').insert([{
                user_id: userId,
                ticket_id: viewingTicket.id,
                text: text,
                sender: 'user'
            }]);
            setReplyText('');
            await loadTicketMessages(viewingTicket);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleReplyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !viewingTicket) return;
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert('Only images and videos are supported');
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            const mediaMsg = `[MEDIA:${file.type}]${base64}`;
            await handleReply(mediaMsg);
        } catch (err) {
            console.error('File upload error', err);
        } finally {
            if (replyFileRef.current) replyFileRef.current.value = '';
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
        <div className="min-h-screen bg-[#0B0E14] text-white font-sans">
            <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Ticket size={16} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight">Support Center</h1>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">Account Recovery Portal</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
                    <button onClick={() => { setActiveView('compose'); setErrorMsg(''); }} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeView === 'compose' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                        Submit Ticket
                    </button>
                    <button onClick={() => { setActiveView('tickets'); setErrorMsg(''); }} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all ${activeView === 'tickets' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}>
                        My Tickets
                    </button>
                </div>

                {/* Alerts */}
                {successMsg && (
                    <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-in zoom-in">
                        <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Success</p>
                            <p className="text-xs text-emerald-300/80 mt-1">{successMsg}</p>
                        </div>
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in zoom-in">
                        <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-red-400 uppercase tracking-widest">Error</p>
                            <p className="text-xs text-red-300/80 mt-1">{errorMsg}</p>
                        </div>
                    </div>
                )}

                {/* Compose View */}
                {activeView === 'compose' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        {!hasSession && (
                            <div>
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/30" />
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Inquiry Type</label>
                            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3.5 bg-black/40 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 appearance-none cursor-pointer">
                                <option>General Inquiry</option>
                                <option>Account Suspension Appeal</option>
                                <option>Technical Issue</option>
                                <option>Transaction Dispute</option>
                                <option>KYC / Verification</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Message</label>
                            <div className="relative">
                                <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." className="w-full p-4 pb-10 bg-black/40 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-blue-500 transition-all resize-none placeholder:text-white/30"></textarea>
                                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <input type="file" ref={composeFileRef} className="hidden" accept="image/*,video/*" onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
                                            if (file.type.startsWith('video/') && file.size > 5 * 1024 * 1024) { alert('Video must be under 5MB'); return; }
                                            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { alert('Only images and videos are supported'); return; }
                                            setAttachment(file);
                                        }
                                    }} />
                                    <button onClick={() => composeFileRef.current?.click()} className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-white/10 transition-colors" title="Attach Media">
                                        <Paperclip size={16} />
                                    </button>
                                </div>
                            </div>
                            {attachment && (
                                <div className="mt-2 flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg max-w-fit">
                                    <Paperclip size={12} className="text-blue-400" />
                                    <span className="text-[10px] text-blue-300 font-medium truncate max-w-[150px]">{attachment.name}</span>
                                    <button onClick={() => setAttachment(null)} className="ml-1 hover:text-red-400"><X size={12} /></button>
                                </div>
                            )}
                        </div>
                        <button onClick={handleSubmit} disabled={isSubmitting || isSessionLoading || !message.trim() || (!getUserId() && !email.trim())} className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Submit Ticket
                        </button>
                        <p className="text-center text-[10px] text-white/30 font-medium">
                            Prefer email? <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-blue-400 hover:underline">{APP_CONFIG.SUPPORT_EMAIL}</a>
                        </p>
                    </div>
                )}

                {/* Tickets List View */}
                {activeView === 'tickets' && (
                    <div className="space-y-5 animate-in fade-in">
                        {!hasSession && (
                            <div className="flex gap-2">
                                <input type="email" value={trackEmail} onChange={e => setTrackEmail(e.target.value)} placeholder="Enter your email" className="flex-1 p-3 bg-black/40 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 placeholder:text-white/30" />
                                <button onClick={() => fetchTickets()} disabled={isLoadingTickets || !trackEmail.trim()} className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                                    {isLoadingTickets ? <Loader2 size={14} className="animate-spin" /> : 'Track'}
                                </button>
                            </div>
                        )}
                        {hasSession && (
                            <button onClick={() => fetchTickets()} disabled={isLoadingTickets} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                {isLoadingTickets ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />} Refresh My Tickets
                            </button>
                        )}
                        {isLoadingTickets && tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                                <Loader2 className="animate-spin text-blue-500" size={32} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Loading tickets...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Inbox size={40} className="text-white/20 mb-6" />
                                <h4 className="text-base font-bold text-white mb-2">No tickets found</h4>
                                <p className="text-xs text-white/40 mb-6 max-w-xs">Submit a new inquiry to get assistance from our support team.</p>
                                <button onClick={() => setActiveView('compose')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">New Inquiry</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {tickets.map((t, i) => (
                                    <div key={t.id || i} onClick={() => loadTicketMessages(t)} className="bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all rounded-2xl p-4 cursor-pointer group flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${t.status === 'Open' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30'}`}>
                                                <Ticket size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-black text-white text-xs uppercase truncate tracking-tight">{t.subject}</h4>
                                                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${t.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>{t.status}</span>
                                                </div>
                                                <p className="text-[10px] text-white/40 truncate max-w-[200px] font-medium italic">"{t.message}"</p>
                                                <p className="text-[8px] text-white/30 font-mono mt-1 uppercase tracking-tighter">{new Date(t.created_at).toLocaleDateString()} • #{String(t.id).padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Ticket Detail View */}
                {activeView === 'detail' && viewingTicket && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                        <button onClick={() => { setActiveView('tickets'); setViewingTicket(null); }} className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors">
                            <ArrowLeft size={14} /> Back to tickets
                        </button>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                        <Ticket size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-tighter truncate max-w-[180px]">{viewingTicket.subject}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${viewingTicket.status === 'Open' ? 'bg-emerald-500 animate-pulse' : 'bg-white/30'}`}></span>
                                            <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">{viewingTicket.status}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-mono text-blue-400 font-bold">#{String(viewingTicket.id).padStart(6, '0')}</p>
                            </div>

                            <div ref={scrollRef} className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                    <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/30 uppercase tracking-widest border border-white/10">
                                        Session Initialized • {new Date(viewingTicket.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Original ticket message */}
                                <div className="flex items-end gap-2 flex-row-reverse">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm border bg-white/10 border-white/10 text-white/50">
                                        <User size={10} />
                                    </div>
                                    <div className="w-fit max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed shadow-md font-medium bg-blue-600 text-white rounded-br-none">
                                        {renderMessageContent(viewingTicket.message)}
                                        <div className="flex items-center gap-1 mt-1 justify-end opacity-40 font-mono text-[8px]">
                                            {new Date(viewingTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <CheckCircle size={8} />
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {ticketMessages.map((m, i) => {
                                    const isMe = m.sender === 'user' || m.sender === 'ME';
                                    return (
                                        <div key={m.id || i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isMe ? 'bg-white/10 border-white/10 text-white/50' : 'bg-blue-600 border-blue-500 text-white'}`}>
                                                {isMe ? <User size={10} /> : <Headphones size={10} />}
                                            </div>
                                            <div className={`w-fit max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed shadow-md font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-white border border-white/10 rounded-tl-none'}`}>
                                                {!isMe && <p className="text-[7px] font-black uppercase text-blue-400 mb-0.5 opacity-80">Support Response</p>}
                                                {renderMessageContent(m.text)}
                                                <div className={`flex items-center gap-1 mt-1 opacity-40 font-mono text-[8px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <CheckCircle size={8} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {viewingTicket.status !== 'Closed' && (
                                <div className="p-3 border-t border-white/10 bg-white/5">
                                    <div className="flex gap-2">
                                        <input type="file" ref={replyFileRef} className="hidden" accept="image/*,video/*" onChange={handleReplyFileSelect} />
                                        <button
                                            onClick={() => replyFileRef.current?.click()}
                                            className="p-3 bg-white/10 text-white/50 rounded-xl hover:bg-white/20 transition-colors active:scale-95"
                                            title="Upload image or video"
                                        >
                                            <Paperclip size={16} />
                                        </button>
                                        <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply()} placeholder="Write a reply..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/30" disabled={isSendingReply} />
                                        <button onClick={() => handleReply()} disabled={!replyText.trim() || isSendingReply} className="px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            {isSendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {viewingTicket.status === 'Closed' && (
                                <div className="p-4 border-t border-white/10 text-center">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">This ticket has been resolved.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
