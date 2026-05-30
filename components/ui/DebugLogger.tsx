
import React, { useEffect, useState } from 'react';
import { APP_CONFIG } from '../../config';
import { supabase } from '../../services/supabase';
import { mvp } from '../../services/mvpService';
import { X, RefreshCw, Activity, CreditCard, Terminal, MousePointer2 } from 'lucide-react';

declare global {
    interface Window {
        appDebug?: {
            log: (msg: string, type?: 'info' | 'success' | 'error' | 'warn') => void;
        };
    }
}

export const DebugLogger = ({ user }: { user: any }) => {
    // Development-only tool — never rendered in production builds
    if (!import.meta.env.DEV) return null;

    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [clickInspector, setClickInspector] = useState(false);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        let prefix = 'ℹ️';
        if (type === 'success') prefix = '✅';
        if (type === 'error') prefix = '❌';
        if (type === 'warn') prefix = '⚠️';
        setLogs(p => [`[${timestamp}] ${prefix} ${msg}`, ...p]);
    };

    useEffect(() => {
        window.appDebug = { log: addLog };
        return () => { delete window.appDebug; };
    }, []);

    useEffect(() => {
        if (!clickInspector) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const computed = window.getComputedStyle(target);
            const isInteractive = ['BUTTON', 'A', 'INPUT'].includes(target.tagName) || target.closest('button');
            const layerInfo = `Z: ${computed.zIndex === 'auto' ? '0' : computed.zIndex}`;
            const pointerInfo = `Pointer: ${computed.pointerEvents}`;
            let logType: 'warn' | 'error' | 'info' | 'success' = 'info';
            let msg = `🖱️ HIT: <${target.tagName.toLowerCase()}>`;
            if (target.id) msg += ` #${target.id}`;
            if (target.className && typeof target.className === 'string') msg += ` .${target.className.split(' ')[0]}...`;
            msg += ` | ${layerInfo} | ${pointerInfo}`;
            if (target.innerText?.includes('Provision') || target.closest('button')?.innerText?.includes('Provision')) {
                msg += " ✅ TARGET: PROVISION BTN"; logType = 'success';
            } else if (isInteractive) { msg += " (Interactive)"; }
            else { msg += " ⚠️ POSS. OVERLAY"; logType = 'warn'; }
            addLog(msg, logType);
        };
        window.addEventListener('click', handler, true);
        addLog("👁️ CLICK INSPECTOR ACTIVE.", 'warn');
        return () => window.removeEventListener('click', handler, true);
    }, [clickInspector]);

    const fetchCards = async () => {
        if (!user) return;
        try {
            const { data: res } = await supabase.from('mvp_cards').select('*');
            if (Array.isArray(res)) {
                setCards(res);
                addLog(`Card Sync: Found ${res.length} cards.`, 'info');
            } else {
                addLog(`Card Sync Invalid: Expected array, got ${typeof res}`, 'error');
            }
        } catch (e: any) {
            addLog(`Read Failed: ${e.message}`, 'error');
        }
    };

    const runDiagnostics = async () => {
        if (!user) { addLog("No active user session.", 'error'); return; }
        setLoading(true); setLogs([]);
        addLog("🚀 STARTING SYSTEM DIAGNOSTICS...", 'info');
        try {
            addLog("1️⃣ Checking API Health...", 'info');
            const start = Date.now();
            const res = await fetch('https://lennoxmh.com/server/wp-content/plugins/mvp-baas/api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ op: 'health' })
            });
            if (!res.ok) throw new Error(`API HTTP ${res.status}`);
            addLog(`   API Online (${Date.now() - start}ms)`, 'success');

            addLog("2️⃣ Checking 'mvp_cards' Read Access...", 'info');
            const { data: readRes } = await supabase.from('mvp_cards').select('*').limit(1);
            if (!Array.isArray(readRes)) throw new Error("API returned non-array for read op.");
            addLog(`   Read OK. Current count: ${readRes.length}`, 'success');
            addLog("🎉 SYSTEM OPERATIONAL.", 'success');
            fetchCards();
        } catch (e: any) {
            addLog(`🛑 DIAGNOSTIC HALTED: ${e.message}`, 'error');
        } finally { setLoading(false); }
    };

    const forceProvision = async () => {
        if (!user) return;
        setLoading(true);
        addLog(`🔧 FORCING ${APP_CONFIG.BRAND_NAME.toUpperCase()} SYSTEM CARD...`, 'info');
        try {
            const holderName = (user.name || APP_CONFIG.BANK_NAME + ' MEMBER').toUpperCase();
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 3);
            const exp = `${String(futureDate.getMonth() + 1).padStart(2, '0')}/${String(futureDate.getFullYear()).slice(-2)}`;
            const payload = {
                user_id: user.id, type: APP_CONFIG.PREMIUM_CARD_NAME, number: '4' + Math.floor(Math.random() * 1000000000000000).toString().slice(0, 15),
                holder: holderName, expiry: exp, pin: '0000', cvv: Math.floor(Math.random() * 900 + 100).toString(),
                is_frozen: 0, is_default: 1, gradient: 'from-gray-900 to-gray-800', shadow: 'shadow-gray-900/50'
            };
            const { data: res, error } = await supabase.from('mvp_cards').insert([payload]).select('id');
            if (!error && res) {
                addLog(`✅ SUCCESS: ${APP_CONFIG.PREMIUM_CARD_NAME} Created (ID: ${res[0]?.id})`, 'success');
                await fetchCards();
            } else {
                addLog(`❌ FAILED: ${error?.message || JSON.stringify(res)}`, 'error');
            }
        } catch (e: any) { addLog(`❌ EXCEPTION: ${e.message}`, 'error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchCards(); }, [user]);

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-[9999] border-2 border-white/20 hover:scale-110 transition-transform animate-bounce" title="Open System Debugger">
            <Activity size={24} className={cards.length === 0 ? "text-red-500" : "text-emerald-400"} />
            {cards.length === 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span></span>}
        </button>
    );

    return (
        <div className="fixed bottom-6 left-6 w-[450px] max-w-[90vw] bg-[#0d1117] text-white rounded-xl shadow-2xl z-[9999] border border-slate-700 flex flex-col overflow-hidden max-h-[600px] font-sans">
            <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2"><Terminal size={16} className="text-blue-400" /> <span className="font-bold text-xs uppercase tracking-wider text-blue-100">System Inspector</span></div>
                <div className="flex gap-2"><button onClick={fetchCards} className="hover:text-blue-400 transition-colors"><RefreshCw size={16} /></button><button onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors"><X size={16} /></button></div>
            </div>
            <div className="p-3 bg-[#090c10] overflow-y-auto h-64 font-mono text-[10px] space-y-1 border-b border-slate-700 custom-scrollbar">
                {logs.length === 0 && <span className="text-slate-600 italic">Ready to run diagnostics...</span>}
                {logs.map((l, i) => (<div key={i} className={`break-words border-l-2 pl-2 py-0.5 ${l.includes('✅') ? 'border-emerald-500 text-emerald-400' : l.includes('❌') || l.includes('🛑') ? 'border-red-500 text-red-400 bg-red-900/10' : l.includes('⚠️') ? 'border-amber-500 text-amber-400' : 'border-slate-700 text-slate-300'}`}>{l}</div>))}
            </div>
            <div className="bg-slate-800/50 p-3 grid grid-cols-2 gap-2">
                <button onClick={() => setClickInspector(!clickInspector)} className={`px-3 py-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 border uppercase tracking-wide ${clickInspector ? 'bg-amber-600 text-white border-amber-500 animate-pulse' : 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600'}`}><MousePointer2 size={12} /> {clickInspector ? 'Stop Inspector' : 'Start Inspector'}</button>
                <button onClick={runDiagnostics} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-600 uppercase tracking-wide">{loading ? <RefreshCw size={12} className="animate-spin" /> : <Activity size={12} />} Run Sys Check</button>
                <button onClick={forceProvision} disabled={loading} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-3 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20 uppercase tracking-wide"><CreditCard size={12} /> Force System Card (Bypass UI)</button>
            </div>
            <div className="bg-black/40 p-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-700"><span>User: <span className="text-blue-300">{user?.id?.substring(0, 12)}...</span></span><span className={cards.length > 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{cards.length} Cards Found</span></div>
        </div>
    );
};
