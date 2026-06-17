
import { supabase } from './supabase';
import { APP_CONFIG } from '../config';

const BASE_URL = APP_CONFIG.API_BASE_URL;

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

async function getAuthToken(retries = 3): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
        return data.session.access_token;
    }

    for (let i = 0; i < retries; i++) {
        try {
            const { data: refresh, error } = await supabase.auth.refreshSession();
            if (refresh.session?.access_token) {
                return refresh.session.access_token;
            }
            const { data: recheck } = await supabase.auth.getSession();
            if (recheck.session?.access_token) {
                return recheck.session.access_token;
            }
            if (error && i > 0) console.warn(`[Auth] Refresh attempt ${i + 1} failed:`, error.message);
        } catch (e) {
            if (i > 0) console.warn(`[Auth] Refresh attempt ${i + 1} exception:`, e);
        }
        if (i < retries - 1) await new Promise(r => setTimeout(r, 200 * (i + 1)));
    }
    return null;
}

async function fetchWithRetry(url: string, options: any, retries = 3, timeout = 60000): Promise<Response> {
    let lastError;
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(id);
            if (!res.ok && res.status >= 500) {
                const errText = await res.text().catch(() => '');
                throw new Error(`HTTP ${res.status}: ${errText.substring(0, 200)}`);
            }
            return res;
        } catch (e: any) {
            clearTimeout(id);
            console.warn(`[Network] Attempt ${i + 1} failed: ${e.message}`);

            if (e.name === 'AbortError') {
                lastError = new Error("Request timed out (Backend Unresponsive)");
            } else if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
                lastError = new Error("Network Error: Unable to reach server. Check connection or AdBlock.");
            } else {
                lastError = e;
            }

            // Backoff: 1s, 2s, 3s...
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw lastError || new Error("Network request failed");
}

async function request(payload: any): Promise<any> {
    const isPublicTable = ['mvp_app_settings', 'mvp_waitlist'].includes(payload.table);
    const isRead = payload.op === 'read';
    let token = null;

    // Public operations that don't require authentication (OTP flows, email sending)
    const PUBLIC_OPS = ['send_email', 'store_otp', 'verify_otp', 'reset_password', 'confirm_email', 'create_confirmed_user'];
    const isPublicOp = PUBLIC_OPS.includes(payload.op);

    // Always fetch auth token for WRITE operations (update/create/delete),
    // even on "public" tables — the PHP backend requires auth for mutations.
    // Only skip token for READ operations on public tables, or for designated public ops.
    const needsAuth = (!isPublicTable || !isRead) && !isPublicOp;
    if (needsAuth) {
        token = await getAuthToken();
        if (!token) {
            const { data } = await supabase.auth.getSession();
            if (data.session?.access_token) {
                token = data.session.access_token;
            } else if (!isPublicTable) {
                // Only hard-fail non-public tables; public writes will attempt anyway
                throw new Error("AUTH_SESSION_EXPIRED");
            }
        }
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let fetchUrl = BASE_URL;
    let options: RequestInit = {};

    if (isRead) {
        const params = new URLSearchParams();
        Object.keys(payload).forEach(key => {
            if (payload[key] !== undefined && payload[key] !== null) {
                params.append(key, String(payload[key]));
            }
        });
        params.append('_', String(Date.now()));
        fetchUrl = `${BASE_URL}?${params.toString()}`;
        options = { method: 'GET', headers };
    } else {
        options = {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    }

    try {
        const retries = payload._retries !== undefined ? payload._retries : 3;
        const timeout = payload._timeout !== undefined ? payload._timeout : 60000;
        const response = await fetchWithRetry(fetchUrl, options, retries, timeout);
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(`HTTP Error ${response.status}: ${errText.substring(0, 100)}`);
        }
        const text = await response.text();
        if (!text) return isRead ? [] : { success: true };
        let json;
        try {
            json = JSON.parse(text);
        } catch (e) {
            if (isRead) return [];
            console.error("[MVP API] JSON Parse Error. Response Start:", text.substring(0, 150));
            throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }

        if (json && json.error) throw new Error(json.error);
        return json;
    } catch (error: any) {
        if (error.message === 'AUTH_SESSION_EXPIRED') throw error;
        // Only suppress errors for READ operations — write errors must always propagate
        // so the UI can correctly report when a save fails.
        if (isRead) {
            console.warn(`[MVP API] Suppressed read error for ${payload.table}:`, error.message);
            return [];
        }
        console.warn(`[MVP API] ${payload.op} ${payload.table} failed:`, error.message);
        throw error;
    }
}

export const mvp = {
    read: async (table: string, useMe: boolean = true, config?: { columns?: string, limit?: number, offset?: number, user_id?: string }) => {
        const payload: any = {
            op: 'read',
            table: `mvp_${table}`,
            columns: config?.columns,
            limit: config?.limit,
            offset: config?.offset
        };
        if (useMe) payload.user_id = 'ME';
        else if (config?.user_id) payload.user_id = config.user_id;
        const res = await request(payload);
        return Array.isArray(res) ? res : [];
    },
    create: async (table: string, data: any) => request({ op: 'create', table: `mvp_${table}`, data }),
    update: async (table: string, id: string | number, data: any) => request({ op: 'update', table: `mvp_${table}`, id: String(id), data }),
    delete: async (table: string, id: string | number) => request({ op: 'delete', table: `mvp_${table}`, id: String(id) }),
    getSettings: async () => {
        try {
            const results = await request({ op: 'read', table: 'mvp_app_settings', limit: 1 });
            console.log('[mvp.getSettings] raw results:', results);
            return results && results.length > 0 ? results[0] : { maintenance_mode: 0, allow_registration: 1, max_transaction_limit: 50000 };
        } catch (e: any) {
            console.error('[mvp.getSettings] failed:', e.message);
            return { maintenance_mode: 0, allow_registration: 1, max_transaction_limit: 50000 };
        }
    },
    sendEmail: async (to: string, subject: string, htmlBody: string, fromName?: string) => {
        // Validate recipient looks like an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            console.warn(`[MVP Email] Skipped: recipient "${to}" is not a valid email address.`);
            return { success: false, skipped: true, error: `Invalid email address: ${to}` };
        }
        try {
            const payload = { op: 'send_email', to, subject, body: htmlBody, from_name: fromName || APP_CONFIG.BANK_NAME, _timeout: 12000, _retries: 1 };
            const res = await request(payload);
            console.log(`[MVP Email] Response for ${to}:`, res);
            return res;
        } catch (error: any) {
            console.warn("[MVP Email] Failed to send:", error);
            return { success: false, error: error?.message || 'Failed to send email' };
        }
    },
    storeOtp: async (email: string, code: string, otp_type: 'signup' | 'recovery' | 'pin_verify') => {
        return request({ op: 'store_otp', email, code, otp_type });
    },
    verifyOtp: async (email: string, code: string, otp_type: 'signup' | 'recovery' | 'pin_verify') => {
        return request({ op: 'verify_otp', email, code, otp_type });
    },
    resetPassword: async (email: string, new_password: string, otp_code: string) => {
        return request({ op: 'reset_password', email, new_password, otp_code });
    },
    createConfirmedUser: async (email: string, password: string, otp_code: string, user_metadata?: any) => {
        return request({ op: 'create_confirmed_user', email, password, otp_code, user_metadata });
    },
    confirmEmail: async (email: string, otp_code: string) => {
        return request({ op: 'confirm_email', email, otp_code });
    }
};
