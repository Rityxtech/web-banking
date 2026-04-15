import React, { useState } from 'react';
import { User } from '../types';

interface DebugOverlayProps {
    currentUser: User | null;
    isAdminMode: boolean;
    isPinVerified: boolean;
    location: string;
}

/**
 * Development-only overlay — automatically stripped from production builds.
 * This component is never visible to end-users on a deployed instance.
 */
export const DebugOverlay: React.FC<DebugOverlayProps> = ({ currentUser, isAdminMode, isPinVerified, location }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Only render in Vite development mode — never in production
    if (!import.meta.env.DEV) return null;
    if (!currentUser && !isAdminMode) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-white p-2 rounded-lg text-xs font-mono shadow-xl border border-white/20">
            <div className="flex justify-between items-center gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="font-bold text-emerald-400">DEV</span>
                <span>{isExpanded ? '▼' : '▲'}</span>
            </div>

            {isExpanded && (
                <div className="mt-2 space-y-1">
                    <div>
                        <span className="text-slate-400">User:</span> {currentUser ? currentUser.email : 'None'}
                    </div>
                    <div>
                        <span className="text-slate-400">ID:</span> {currentUser ? currentUser.id.substring(0, 8) + '...' : '-'}
                    </div>
                    <div>
                        <span className="text-slate-400">Admin Mode:</span> <span className={isAdminMode ? "text-emerald-400" : "text-red-400"}>{isAdminMode.toString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">PIN Verified:</span> <span className={isPinVerified ? "text-emerald-400" : "text-red-400"}>{isPinVerified.toString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">Route:</span> {location}
                    </div>
                </div>
            )}
        </div>
    );
};
