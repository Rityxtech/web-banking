
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { APP_CONFIG } from '../config';
import { Account, Transaction, User as UserType } from '../types';
import { createFinancialChat, sendMessageToAssistant } from '../services/geminiService';
import { Chat } from '@google/genai';
import { Send, Bot, User, Sparkles, Headphones, ShieldAlert, ArrowRight, Loader2, Cpu, X, CheckCircle, Database, Terminal, RefreshCw, Power, Paperclip } from 'lucide-react';
import { mvp, fileToBase64 } from '../services/mvpService';
import { supabase } from '../services/supabase';

interface Message {
    id: string;
    sender: 'user' | 'ai' | 'admin';
    text: string;
    ticket_id?: number | string | null;
    created_at: string;
    isRead?: number | boolean;
    isTemp?: boolean;
    client_id?: string; // Added for robust deduplication
}

interface AiAssistantProps {
    user: UserType;
    accounts: Account[];
    transactions: Transaction[];
    onNavigate?: (path: string) => void;
    onAuthError?: (error: any) => void;
    onRefreshCounts?: () => void;
}

interface DiagnosticState {
    lastFetchCount: number;
    lastFetchTime: string;
    lastWriteStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR';
    lastWriteError: string | null;
    userId: string;
    persistenceCheck: 'WAITING' | 'PASSED' | 'FAILED';
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ user, accounts, transactions, onNavigate, onAuthError, onRefreshCounts }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasTicketIdCol, setHasTicketIdCol] = useState(true);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diag, setDiag] = useState<DiagnosticState>({
        lastFetchCount: 0,
        lastFetchTime: 'NEVER',
        lastWriteStatus: 'IDLE',
        lastWriteError: null,
        userId: user.id,
        persistenceCheck: 'WAITING'
    });

    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // LOGIC: State Machine for Support Handover
    const isHumanSupportActive = useMemo(() => {
        let lastReqIndex = -1;
        let lastResIndex = -1;
        let lastAdminIndex = -1;

        messages.forEach((m, i) => {
            const text = (m.text || '').toUpperCase();
            if (text.includes("USER_REQUESTED_LIVE_CHAT")) lastReqIndex = i;
            if (text.includes("SESSION_RESOLVED_AI_RESUMED")) lastResIndex = i;
            if (m.sender === 'admin') lastAdminIndex = i;
        });

        if (lastResIndex > lastReqIndex) return false;
        if (lastReqIndex > lastResIndex) return true;
        if (lastResIndex === -1 && lastAdminIndex > -1) return true;

        return false;
    }, [messages]);

    useEffect(() => {
        isMounted.current = true;
        loadMessages();
        chatSession.current = createFinancialChat(accounts, transactions);
        const interval = setInterval(() => {
            if (!document.hidden && isMounted.current) loadMessages();
        }, 5000);
        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [accounts, transactions, user.id]);

    const markAsRead = async (msgList: Message[]) => {
        if (!isMounted.current) return;
        const unread = msgList.filter(m => m.sender !== 'user' && (m.isRead == 0 || m.isRead === false));
        if (unread.length === 0) return;

        try {
            const ids = unread.filter(m => m.id && !m.id.startsWith('temp')).map(m => m.id);
            if (ids.length > 0) {
                const { error } = await supabase.from('mvp_messages').update({ is_read: 1 }).in('id', ids);
                if (error) console.error('Mark read failed:', error.message);
            }

            if (onRefreshCounts && isMounted.current) onRefreshCounts();
        } catch (err) {
            console.error("Failed to mark messages as read", err);
        }
    };

    const loadMessages = async () => {
        if (!isMounted.current) return;
        try {
            const columns = hasTicketIdCol
                ? 'id,text,sender,created_at,is_read,ticket_id,user_id,client_id'
                : 'id,text,sender,created_at,is_read,user_id,client_id';

            const { data } = await supabase.from('mvp_messages').select(columns).limit(200);

            if (!isMounted.current) return;

            if (data) {
                const remoteMessages = data
                    .filter((m: any) => {
                        const tId = m.ticket_id;
                        return !tId || tId === "null" || tId === "NULL" || tId === 0 || tId === "0";
                    })
                    .map((m: any) => ({
                        ...m,
                        id: String(m.id),
                        isRead: m.is_read // Map DB field to local interface
                    }));

                setDiag(prev => ({
                    ...prev,
                    lastFetchCount: remoteMessages.length,
                    lastFetchTime: new Date().toLocaleTimeString(),
                    persistenceCheck: remoteMessages.length > 0 ? 'PASSED' : prev.persistenceCheck
                }));

                setMessages(prev => {
                    const remoteClientIds = new Set(remoteMessages.map((rm: any) => rm.client_id).filter(Boolean));
                    const remoteTexts = new Set(remoteMessages.map((rm: any) => rm.text));

                    // Improved Deduplication: Check both client_id (robust) and text content (legacy/fallback)
                    const unsyncedTemps = prev.filter(m => {
                        if (!m.isTemp) return false; // Remove old remotes, replaced by new ones
                        if (remoteClientIds.has(m.id)) return false; // Matched by ID (Preferred)
                        if (remoteTexts.has(m.text)) return false; // Matched by content (Fallback)
                        return true; // Keep pending temp
                    });

                    const combined = [...remoteMessages, ...unsyncedTemps];

                    if (combined.length === 0) {
                        return [{
                            id: 'init',
                            sender: 'ai',
                            text: "Hello! I'm {APP_CONFIG.BRAND_NAME}, your AI strategist. How can I help you manage your accounts today?",
                            created_at: new Date().toISOString(),
                            isRead: 1
                        }];
                    }

                    const sorted = combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                    markAsRead(sorted);

                    return sorted;
                });
            }
        } catch (err: any) {
            if (!isMounted.current) return;
            if (err.message?.includes('ticket_id') || err.message?.includes('Unknown column')) {
                setHasTicketIdCol(false);
                return;
            }
            if (err.message === 'AUTH_SESSION_EXPIRED' || err.message?.includes('AUTH_SESSION_LOST')) {
                if (onAuthError) onAuthError(err);
                return;
            }
            setDiag(prev => ({ ...prev, lastWriteError: `FETCH_FAULT: ${err.message}` }));
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const triggerHumanHandover = async () => {
        setIsTyping(true);
        const aiHandoverText = "One moment... I'm connecting you with a human support agent. Please stay on this window; one of our team members will be with you shortly.";
        const adminSignalText = "USER_REQUESTED_LIVE_CHAT: This user requires immediate human assistance.";

        const aiMsg: Message = {
            id: `temp-ai-h-${Date.now()}`,
            sender: 'ai',
            text: aiHandoverText,
            created_at: new Date().toISOString(),
            isTemp: true,
            isRead: 1
        };
        setMessages(prev => [...prev, aiMsg]);

        try {
            await supabase.from('mvp_messages').insert([{
                user_id: user.id,
                text: aiHandoverText,
                sender: 'ai',
                ticket_id: null
            }]);

            await supabase.from('mvp_messages').insert([{
                user_id: user.id,
                text: adminSignalText,
                sender: 'user',
                ticket_id: null
            }]);

            if (isMounted.current) setDiag(prev => ({ ...prev, lastWriteStatus: 'SUCCESS' }));
        } catch (e: any) {
            if (isMounted.current) setDiag(prev => ({ ...prev, lastWriteStatus: 'ERROR', lastWriteError: e.message }));
        } finally {
            if (isMounted.current) {
                setIsTyping(false);
                setTimeout(loadMessages, 1000);
            }
        }
    };

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || !chatSession.current || isTyping) return;

        if (!messageText) setInput('');

        // Check for support keywords
        const supportKeywords = ['support', 'human', 'agent', 'talk to', 'speak to', 'representative', 'person', 'help me please'];
        const needsHandover = !isHumanSupportActive && supportKeywords.some(keyword => textToSend.toLowerCase().includes(keyword));

        const tempId = `temp-u-${Date.now()}`;
        const userMsg: Message = {
            id: tempId,
            sender: 'user',
            text: textToSend,
            created_at: new Date().toISOString(),
            isTemp: true,
            isRead: 1
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setDiag(prev => ({ ...prev, lastWriteStatus: 'PENDING', lastWriteError: null }));

        try {
            const payload: any = {
                user_id: user.id,
                text: textToSend,
                sender: 'user',
                client_id: tempId // Send correlation ID to backend
            };
            if (hasTicketIdCol) payload.ticket_id = null;

            const { error: userMsgErr } = await supabase.from('mvp_messages').insert([payload]);

            if (userMsgErr) {
                throw new Error("Persistence node rejected user message write: " + userMsgErr.message);
            }

            if (needsHandover) {
                await triggerHumanHandover();
                return;
            }

            if (isHumanSupportActive) {
                if (isMounted.current) {
                    setIsTyping(false);
                    setDiag(prev => ({ ...prev, lastWriteStatus: 'SUCCESS' }));
                }
                return;
            }

            const responseText = await sendMessageToAssistant(chatSession.current, textToSend);

            const aiMsg: Message = {
                id: `temp-ai-${Date.now()}`,
                sender: 'ai',
                text: responseText,
                created_at: new Date().toISOString(),
                isTemp: true,
                isRead: 1
            };
            if (isMounted.current) setMessages(prev => [...prev, aiMsg]);

            const aiPayload: any = {
                user_id: user.id,
                text: responseText,
                sender: 'ai'
            };
            if (hasTicketIdCol) aiPayload.ticket_id = null;

            const { error: aiMsgErr } = await supabase.from('mvp_messages').insert([aiPayload]);

            if (isMounted.current) {
                if (!aiMsgErr) {
                    setDiag(prev => ({ ...prev, lastWriteStatus: 'SUCCESS' }));
                } else {
                    setDiag(prev => ({ ...prev, lastWriteStatus: 'ERROR', lastWriteError: "AI response failed to persist." }));
                }
            }

        } catch (e: any) {
            if (isMounted.current) {
                setDiag(prev => ({ ...prev, lastWriteStatus: 'ERROR', lastWriteError: e.message }));
                if (e.message === 'AUTH_SESSION_EXPIRED' || e.message?.includes('AUTH_SESSION_LOST')) {
                    if (onAuthError) onAuthError(e);
                    return;
                }
            }
        } finally {
            if (isMounted.current) {
                setIsTyping(false);
                setTimeout(loadMessages, 1000);
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && file.size > 2 * 1024 * 1024) {
                alert("Image size must be under 2MB");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            if (isVideo && file.size > 5 * 1024 * 1024) {
                alert("Video size must be under 5MB");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            if (!isImage && !isVideo) {
                alert("Only images and videos are supported");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setIsTyping(true);
            try {
                const base64 = await fileToBase64(file);
                const mediaMsg = `[MEDIA:${file.type}]${base64}`;
                await handleSend(mediaMsg);
            } catch (err) {
                console.error("File upload error", err);
                setIsTyping(false);
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
        return text;
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden animate-fade-in shadow-soft relative">

            {showDiagnostics && (
                <div className="absolute inset-x-2 top-14 z-[50] bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Terminal size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Registry Node Diagnostic</span>
                        </div>
                        <button onClick={() => setShowDiagnostics(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-2 font-mono text-[10px]">
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">USER_NODE:</span>
                            <span className="text-blue-300 truncate max-w-[150px]">{diag.userId}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">BOT_STATE:</span>
                            <span className={isHumanSupportActive ? 'text-amber-400' : 'text-emerald-400'}>{isHumanSupportActive ? 'SILENCED (HUMAN ACTIVE)' : 'OPERATIONAL'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">LAST_FETCH:</span>
                            <span className="text-emerald-400">{diag.lastFetchTime} ({diag.lastFetchCount} records)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">WRITE_STATUS:</span>
                            <span className={`${diag.lastWriteStatus === 'SUCCESS' ? 'text-emerald-400' : diag.lastWriteStatus === 'ERROR' ? 'text-red-400' : 'text-amber-400'}`}>
                                {diag.lastWriteStatus}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">PERSISTENCE:</span>
                            <span className={diag.persistenceCheck === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}>{diag.persistenceCheck}</span>
                        </div>
                        {diag.lastWriteError && (
                            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20 text-red-300 leading-tight">
                                CRITICAL_FAULT: {diag.lastWriteError}
                                <p className="mt-1 text-slate-500">Possible Reason: LocalStorage Auth lost or PHP endpoint timed out.</p>
                            </div>
                        )}
                        <div className="pt-2 flex gap-2">
                            <button onClick={loadMessages} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] text-white flex items-center gap-1">
                                <RefreshCw size={10} /> Sync Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 md:p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner"><Bot size={16} /></div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{APP_CONFIG.BRAND_NAME} Assistant</h2>
                        <div className="flex items-center gap-1">
                            <span className={`w-1 h-1 rounded-full ${isHumanSupportActive ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
                            <p className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase tracking-widest">
                                {isHumanSupportActive ? 'Human Support Active' : 'Live Chat Active'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowDiagnostics(!showDiagnostics)}
                        className={`p-1.5 rounded-lg transition-all ${showDiagnostics ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600'}`}
                        title="Open Debug Terminal"
                    >
                        <Cpu size={14} className={diag.lastWriteStatus === 'ERROR' ? 'animate-pulse text-red-500' : ''} />
                    </button>
                    {!isHumanSupportActive && (
                        <button
                            onClick={triggerHumanHandover}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-900/30 shadow-sm"
                        >
                            Human Support
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-4 pt-2 space-y-[5px] bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar">
                {messages.map((msg) => {
                    if (msg.text?.includes("USER_REQUESTED_LIVE_CHAT")) return null;
                    if (msg.text?.includes("SESSION_RESOLVED_AI_RESUMED") || msg.text?.includes("USER_TERMINATED_SESSION")) {
                        return (
                            <div key={msg.id} className="flex justify-center py-2 animate-in fade-in zoom-in duration-500">
                                <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                                    <CheckCircle size={10} className="text-emerald-600" />
                                    <span className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">
                                        {msg.text.includes("USER") ? "Session Ended • AI Resumed" : "Support Resolved • AI Resumed"}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : msg.sender === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                                {msg.sender === 'user' ? <User size={10} /> : msg.sender === 'admin' ? <Headphones size={10} /> : <Sparkles size={10} />}
                            </div>
                            <div className={`w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl text-[12px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : msg.sender === 'admin' ? 'bg-purple-600 text-white rounded-tl-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                                {msg.sender === 'admin' && <p className="text-[7px] font-black uppercase opacity-60 mb-0.5">{APP_CONFIG.BRAND_NAME} Support</p>}
                                {renderMessageContent(msg.text)}
                                <div className="flex justify-end items-center gap-1 mt-0.5">
                                    <p className="text-[7px] opacity-40 font-medium">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    {msg.isTemp && <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-400 shadow-sm"><Sparkles size={10} /></div>
                        <div className="bg-white dark:bg-slate-800 px-2 py-1.5 rounded-xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm w-max animate-in fade-in slide-in-from-left-2">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2 max-w-full mx-auto w-full">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
                        disabled={isTyping}
                    >
                        <Paperclip size={16} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                        placeholder={isHumanSupportActive ? "Talking with {APP_CONFIG.BRAND_NAME} Support..." : "Ask {APP_CONFIG.BRAND_NAME} AI..."}
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:text-white text-[12px] shadow-inner transition-all"
                        disabled={isTyping}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
