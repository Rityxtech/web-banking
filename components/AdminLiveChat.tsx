import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Send, Loader2, MessageSquare, CheckCheck, Mail, User, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import type { LiveChatRoom, LiveChatMessage } from '../types';

export const AdminLiveChat: React.FC = () => {
    const [rooms, setRooms] = useState<LiveChatRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

    // Load all open rooms
    const loadRooms = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('mvp_live_chat_rooms')
                .select('*')
                .in('status', ['open', 'closed'])
                .order('last_message_at', { ascending: false });
            if (error) throw error;
            setRooms(data as LiveChatRoom[] || []);
        } catch (e: any) {
            console.error('Failed to load rooms:', e);
        }
    }, []);

    // Load messages for selected room
    const loadMessages = useCallback(async (roomId: number) => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('mvp_live_chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            setMessages(data as LiveChatMessage[] || []);
        } catch (e: any) {
            console.error('Failed to load messages:', e);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    // Mark messages as read when selecting a room
    const markRoomRead = useCallback(async (roomId: number) => {
        try {
            await supabase
                .from('mvp_live_chat_messages')
                .update({ is_read: true })
                .eq('room_id', roomId)
                .eq('sender_type', 'user')
                .eq('is_read', false);
            // Refresh counts
            await loadRooms();
        } catch (e) {
            console.error('Mark read failed:', e);
        }
    }, [loadRooms]);

    // Initial load
    useEffect(() => {
        loadRooms();
        const interval = setInterval(loadRooms, 5000);
        return () => clearInterval(interval);
    }, [loadRooms]);

    // Poll messages for selected room
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (selectedRoomId) {
            loadMessages(selectedRoomId);
            markRoomRead(selectedRoomId);
            intervalRef.current = setInterval(() => {
                loadMessages(selectedRoomId);
            }, 3000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [selectedRoomId, loadMessages, markRoomRead]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !selectedRoomId) return;
        const text = input.trim();
        setInput('');
        setSending(true);

        try {
            await supabase.from('mvp_live_chat_messages').insert([{
                room_id: selectedRoomId,
                sender_type: 'admin',
                sender_name: 'Support Team',
                text: text,
                is_read: true
            }]);

            await supabase
                .from('mvp_live_chat_rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', selectedRoomId);

            await loadMessages(selectedRoomId);
            await loadRooms();
        } catch (e: any) {
            setError(e.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleCloseRoom = async (roomId: number) => {
        try {
            await supabase
                .from('mvp_live_chat_rooms')
                .update({ status: 'closed' })
                .eq('id', roomId);
            if (selectedRoomId === roomId) setSelectedRoomId(null);
            await loadRooms();
        } catch (e) {
            console.error('Close room failed:', e);
        }
    };

    const unreadCount = (roomId: number) => {
        // Approximate: we can't easily count without querying, so we'll show a dot
        // based on whether the last message is from user and unread
        return 0;
    };

    const formatTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-[#111a22] rounded-2xl border border-slate-200 dark:border-[#324d67] overflow-hidden shadow-xl animate-in fade-in duration-300">
            {/* Chat List */}
            <div className={`${selectedRoomId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-[#233648] flex flex-col bg-slate-50/30 dark:bg-black/10`}>
                <div className="p-4 border-b border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Live Chat Rooms
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Email redirect support sessions</p>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {rooms.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Mail size={18} className="text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">No active chat rooms</p>
                        </div>
                    )}
                    {rooms.map(room => {
                        const lastMsg = messages.filter(m => m.room_id === room.id).slice(-1)[0];
                        return (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoomId(room.id)}
                                className={`p-4 border-b border-slate-100 dark:border-[#233648] cursor-pointer transition-all hover:bg-white dark:hover:bg-[#233648]/20 group relative ${selectedRoomId === room.id ? 'bg-white dark:bg-[#233648]/40' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg border border-white/5 uppercase">
                                        {(room.user_name || room.user_email)?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-tighter">
                                                {room.user_name || room.user_email}
                                            </h4>
                                            <span className="text-[8px] text-slate-400 font-mono">
                                                {formatTime(room.last_message_at)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] truncate text-slate-500 dark:text-slate-400">
                                            {lastMsg ? lastMsg.text : 'No messages yet'}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`size-1.5 rounded-full ${room.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{room.status}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleCloseRoom(room.id); }}
                                                className="p-1.5 text-slate-400 dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Close Room"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`${selectedRoomId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#111a22]`}>
                {selectedRoom ? (
                    <>
                        {/* Header */}
                        <div className="p-3 md:p-4 border-b border-slate-200 dark:border-[#233648] flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedRoomId(null)} className="md:hidden p-1.5 -ml-1 text-slate-500">
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] uppercase border border-white/10">
                                    {(selectedRoom.user_name || selectedRoom.user_email)?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">
                                        {selectedRoom.user_name || selectedRoom.user_email}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 font-mono uppercase flex items-center gap-1">
                                        <Mail size={8} /> {selectedRoom.user_email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCloseRoom(selectedRoom.id)}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg transition-all bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600"
                                >
                                    Close Room
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-[10px] custom-scrollbar bg-slate-50/30 dark:bg-[#0d141b]/40">
                            {loadingMessages && messages.length === 0 && (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                </div>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 group ${msg.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-fit max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.sender_type === 'admin'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-[#233648] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#324d67] rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                        <div className={`text-[10px] mt-1 opacity-50 font-mono flex items-center gap-1 ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {formatTime(msg.created_at)}
                                            {msg.sender_type === 'admin' && <CheckCheck size={10} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 md:p-4 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                            <div className="flex gap-2 max-w-4xl mx-auto">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleSend()}
                                    placeholder="Type your response..."
                                    rows={3}
                                    className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 resize-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || sending}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 active:scale-95"
                                >
                                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 space-y-4">
                        <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <MessageSquare size={64} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Support Terminal Idle</h3>
                            <p className="text-xs font-bold uppercase tracking-widest mt-2">Select a chat room to begin.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
