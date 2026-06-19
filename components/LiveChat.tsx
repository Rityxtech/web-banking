import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { Send, MessageCircle, User, Mail, Loader2, CheckCheck, Paperclip } from 'lucide-react';
import { APP_CONFIG } from '../config';
import { fileToBase64 } from '../services/mvpService';
import type { LiveChatRoom, LiveChatMessage } from '../types';

const STORAGE_KEY = 'live_chat_session';

export const LiveChat: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [room, setRoom] = useState<LiveChatRoom | null>(null);
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [source, setSource] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Try to restore session from URL params or localStorage on mount
    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const urlEmail = params.get('email');
        const urlSource = params.get('source') || '';
        if (urlSource) setSource(urlSource);

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const session = JSON.parse(saved);
                if (session.email && session.roomId) {
                    setEmail(session.email);
                    setName(session.name || '');
                    if (session.source) setSource(session.source);
                    restoreRoom(session.email, session.roomId);
                    return;
                }
            }
        } catch { /* ignore */ }

        if (urlEmail) {
            setEmail(urlEmail);
        }
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Poll messages when room exists
    useEffect(() => {
        if (!room) return;
        loadMessages(room.id);
        const interval = setInterval(() => loadMessages(room.id), 3000);
        return () => clearInterval(interval);
    }, [room?.id]);

    // Heartbeat: update last_active_at while user is in chat
    useEffect(() => {
        if (!room) return;
        const updateActive = () => {
            supabase.from('mvp_live_chat_rooms').update({ last_active_at: new Date().toISOString() }).eq('id', room.id).then(() => {});
        };
        updateActive();
        const heartbeat = setInterval(updateActive, 5000);
        const onActivity = () => updateActive();
        window.addEventListener('mousemove', onActivity);
        window.addEventListener('keydown', onActivity);
        window.addEventListener('touchstart', onActivity);
        return () => {
            clearInterval(heartbeat);
            window.removeEventListener('mousemove', onActivity);
            window.removeEventListener('keydown', onActivity);
            window.removeEventListener('touchstart', onActivity);
        };
    }, [room?.id]);

    const restoreRoom = async (userEmail: string, roomId: number) => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('mvp_live_chat_rooms')
                .select('*')
                .eq('id', roomId)
                .eq('user_email', userEmail)
                .single();
            if (data) {
                setRoom(data as LiveChatRoom);
                const updates: any = { last_active_at: new Date().toISOString() };
                if (source && !data.source_template) updates.source_template = source;
                await supabase.from('mvp_live_chat_rooms').update(updates).eq('id', roomId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (roomId: number) => {
        try {
            const { data, error } = await supabase
                .from('mvp_live_chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            if (data) {
                setMessages(data as LiveChatMessage[]);
                // Mark admin messages as read when user views them
                const unreadAdmin = data.filter((m: any) => m.sender_type === 'admin' && !m.is_read);
                if (unreadAdmin.length > 0) {
                    const ids = unreadAdmin.map((m: any) => m.id);
                    const { error: readErr } = await supabase.from('mvp_live_chat_messages').update({ is_read: true }).in('id', ids);
                    if (readErr) {
                        console.error('[LiveChat] Failed to mark admin messages as read:', readErr);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load messages:', e);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !name.trim()) return;
        setJoining(true);
        setError('');

        try {
            // Look for existing open room by email
            const { data: existing } = await supabase
                .from('mvp_live_chat_rooms')
                .select('*')
                .eq('user_email', email.trim())
                .eq('status', 'open')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            let roomData: LiveChatRoom | null = null;
            if (existing) {
                roomData = existing as LiveChatRoom;
                const updates: any = {};
                if (roomData.user_name !== name.trim()) updates.user_name = name.trim();
                if (source && !roomData.source_template) updates.source_template = source;
                if (Object.keys(updates).length > 0) {
                    await supabase.from('mvp_live_chat_rooms').update(updates).eq('id', roomData.id);
                    if (updates.user_name) roomData.user_name = name.trim();
                    if (updates.source_template) roomData.source_template = source;
                }
            } else {
                const insertData: any = {
                    user_email: email.trim(),
                    user_name: name.trim(),
                    status: 'open'
                };
                if (source) insertData.source_template = source;
                const { data: created, error: createErr } = await supabase
                    .from('mvp_live_chat_rooms')
                    .insert([insertData])
                    .select('*')
                    .single();
                if (createErr) throw createErr;
                roomData = created as LiveChatRoom;
            }

            if (roomData) {
                setRoom(roomData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    email: email.trim(),
                    name: name.trim(),
                    roomId: roomData.id,
                    source: source || roomData.source_template || ''
                }));
                // Mark user as active immediately upon joining
                await supabase.from('mvp_live_chat_rooms').update({ last_active_at: new Date().toISOString() }).eq('id', roomData.id);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to start chat. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? input).trim();
        if (!text || !room) return;
        setInput('');

        try {
            await supabase.from('mvp_live_chat_messages').insert([{
                room_id: room.id,
                sender_type: 'user',
                sender_name: name || email,
                text: text,
                is_read: false
            }]);

            // Update room last_message_at
            await supabase
                .from('mvp_live_chat_rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', room.id);

            await loadMessages(room.id);
        } catch (e) {
            console.error('Failed to send message:', e);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room) return;
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert('Only images and videos are supported');
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            const mediaMsg = `[MEDIA:${file.type}]${base64}`;
            await handleSend(mediaMsg);
        } catch (err) {
            console.error('File upload error', err);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderMessageContent = (text: string) => {
        const mediaMatch = text.match(/^\[MEDIA:(.*?)\](.*)$/s);
        if (mediaMatch) {
            const type = mediaMatch[1];
            const data = mediaMatch[2];
            if (type.startsWith('image/')) {
                return <img src={data} alt="uploaded" className="max-w-full rounded-lg" style={{ maxHeight: '200px' }} />;
            } else if (type.startsWith('video/')) {
                return <video src={data} controls className="max-w-full rounded-lg" style={{ maxHeight: '200px' }} />;
            }
        }
        return <span className="whitespace-pre-wrap">{text}</span>;
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ── Join screen ──
    if (!room) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={28} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Live Support</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We&apos;re here to help. Start a chat below.</p>
                        </div>

                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={joining}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                {joining ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                                Start Chat
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <a href="/" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                &larr; Back to {APP_CONFIG.BANK_NAME}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Chat screen ──
    return (
        <div className="h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <CheckCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">Support Team</h2>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 md:space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet. Say hello!</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] ${msg.sender_type === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                    msg.sender_type === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                                }`}
                            >
                                {renderMessageContent(msg.text)}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                                {formatTime(msg.created_at)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 md:p-4">
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
                        title="Upload image or video"
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors flex items-center justify-center shadow-md shadow-blue-600/10"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
