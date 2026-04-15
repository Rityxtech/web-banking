import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { AlertCircle, CheckCircle2, Cpu, Database, Fingerprint, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { APP_CONFIG } from '../../config';

interface CheckItem {
    status: 'pending' | 'ok' | 'warn' | 'error';
    label: string;
}

interface ChecksState {
    session: CheckItem;
    token: CheckItem;
    api: CheckItem;
    schema: CheckItem;
}

interface TerminalDebuggerProps {
    onReady?: (status: boolean) => void;
}

/**
 * Development-only terminal diagnostic overlay.
 * Automatically stripped from production builds.
 */
export const TerminalDebugger: React.FC<TerminalDebuggerProps> = ({ onReady }) => {
    // Development-only tool — never rendered in production builds
    if (!import.meta.env.DEV) return null;

    const [checks, setChecks] = useState<ChecksState>({
        session: { status: 'pending', label: 'Identity Node' },
        token: { status: 'pending', label: 'Auth Token' },
        api: { status: 'pending', label: 'PHP Bridge' },
        schema: { status: 'pending', label: 'SQL Schema' }
    });
    const [isOpen, setIsOpen] = useState(false);
    const [errorLog, setErrorLog] = useState<string | null>(null);

    const runDiagnostics = async () => {
        setChecks({
            session: { status: 'pending', label: 'Identity Node' },
            token: { status: 'pending', label: 'Auth Token' },
            api: { status: 'pending', label: 'PHP Bridge' },
            schema: { status: 'pending', label: 'SQL Schema' }
        });
        setErrorLog(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("IDENTITY_LOST: No active Supabase session.");
            setChecks(prev => ({ ...prev, session: { ...prev.session, status: 'ok' } }));

            const token = session.access_token;
            if (!token) throw new Error("TOKEN_FAULT: Session exists but access_token is null.");
            setChecks(prev => ({ ...prev, token: { ...prev.token, status: 'ok' } }));

            try {
                const res = await fetch(APP_CONFIG.API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ op: 'read', table: 'mvp_app_settings', limit: 1 })
                });

                if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

                const text = await res.text();
                if (text.includes('Fatal error')) throw new Error("API_CRASH: " + text.substring(0, 50));

                try {
                    JSON.parse(text);
                } catch (e) {
                    throw new Error("INVALID_JSON: " + text.substring(0, 50));
                }

                setChecks(prev => ({ ...prev, api: { ...prev.api, status: 'ok' } }));
            } catch (e: any) {
                if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
                    throw new Error("NETWORK_BLOCK: Unable to reach backend (Check AdBlock/DNS)");
                }
                throw new Error("BRIDGE_FAIL: " + e.message);
            }

            try {
                const res = await fetch(APP_CONFIG.API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ op: 'read', table: 'mvp_messages', limit: 1, columns: 'id,ticket_id' })
                });
                const data = await res.json();
                if (data.error && data.error.includes('Unknown column')) throw new Error("SCHEMA_ERROR: 'ticket_id' missing from mvp_messages.");
                setChecks(prev => ({ ...prev, schema: { ...prev.schema, status: 'ok' } }));
            } catch (e: any) {
                setChecks(prev => ({ ...prev, schema: { ...prev.schema, status: 'warn' } }));
                console.warn("Schema check failed, but continuing in legacy mode.");
            }

            if (onReady) onReady(true);
        } catch (err: any) {
            setErrorLog(err.message);
            if (onReady) onReady(false);
            setIsOpen(true);
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'pending') return <Loader2 size={12} className="animate-spin text-slate-400" />;
        if (status === 'ok') return <CheckCircle2 size={12} className="text-emerald-500" />;
        if (status === 'warn') return <AlertCircle size={12} className="text-amber-500" />;
        return <X size={12} className="text-red-500" />;
    };

    if (!isOpen) return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 z-[100] bg-slate-900 text-white p-3 rounded-full shadow-2xl border border-white/10 opacity-40 hover:opacity-100 transition-all hover:scale-110 md:bottom-10"
        >
            <Cpu size={18} className={errorLog ? 'text-red-500 animate-pulse' : 'text-blue-400'} />
        </button>
    );

    const checkList = [checks.session, checks.token, checks.api, checks.schema];

    return (
        <div className="fixed bottom-24 right-6 z-[100] w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 md:bottom-10">
            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <Fingerprint size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">System Diagnostic</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
            </div>

            <div className="p-4 space-y-3">
                {checkList.map((check, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{check.label}</span>
                        <StatusIcon status={check.status} />
                    </div>
                ))}

                {errorLog && (
                    <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-[9px] font-black text-red-500 uppercase mb-1">Diagnostic Fault:</p>
                        <p className="text-[10px] text-red-200/80 leading-tight font-mono break-words">{errorLog}</p>
                    </div>
                )}

                <button
                    onClick={runDiagnostics}
                    className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={10} /> Re-Sync Node
                </button>
            </div>
        </div>
    );
};
