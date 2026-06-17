/**
 * ============================================================
 *  BANK SCRIPT — CENTRAL CONFIGURATION
 *  Dynamically reflects the admin-set site name everywhere.
 * ============================================================
 */

// ─── Mutable runtime state (updated by admin settings) ─────
let _siteName = 'Veltrix Bank';
let _siteLogo = '';
let _siteUrl = '';

// Try to restore from localStorage on module load
try {
    const storedName = localStorage.getItem('site_name');
    const storedLogo = localStorage.getItem('site_logo');
    const storedUrl = localStorage.getItem('site_url');
    if (storedName) _siteName = storedName;
    if (storedLogo) _siteLogo = storedLogo;
    if (storedUrl) _siteUrl = storedUrl;
} catch { /* localStorage not available */ }

/**
 * Call this from App.tsx whenever globalSettings changes
 * so the entire app reflects the admin-set site name.
 */
export function setSiteConfig(name: string, logo?: string, url?: string) {
    _siteName = name;
    if (logo !== undefined) _siteLogo = logo;
    if (url !== undefined) _siteUrl = url;
    try {
        localStorage.setItem('site_name', name);
        if (logo !== undefined) localStorage.setItem('site_logo', logo);
        if (url !== undefined) localStorage.setItem('site_url', url);
    } catch { /* localStorage not available */ }

    // Update Open Graph / Twitter Card meta tags dynamically
    try {
        const updateMeta = (selector: string, attr: string, value: string) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute(attr, value);
        };

        document.title = name + ' — Secure Online Banking';
        updateMeta('meta[property="og:title"]', 'content', name + ' — Secure Online Banking');
        updateMeta('meta[property="og:site_name"]', 'content', name);
        updateMeta('meta[name="twitter:title"]', 'content', name + ' — Secure Online Banking');

        const desc = 'Experience secure, seamless, and intelligent banking with ' + name + '. Manage your finances, transfer funds, invest, and grow your wealth — anytime, anywhere.';
        updateMeta('meta[property="og:description"]', 'content', desc);
        updateMeta('meta[name="twitter:description"]', 'content', desc);
        updateMeta('meta[name="description"]', 'content', desc);

        if (logo) {
            updateMeta('meta[property="og:image"]', 'content', logo);
            updateMeta('meta[name="twitter:image"]', 'content', logo);
        }

        updateMeta('meta[property="og:url"]', 'content', APP_CONFIG.SITE_URL);
    } catch { /* document not available */ }
}

export function getSiteName(): string { return _siteName; }
export function getSiteLogo(): string { return _siteLogo; }

// Helper: extract first word for short brand references
function firstWord(name: string): string {
    return name.split(' ')[0] || name;
}

// Helper: derive domain from site name (e.g. "VeltrixBank" → "veltrixbank.com")
function derivedDomain(name: string): string {
    const word = firstWord(name).toLowerCase();
    if (word.endsWith('bank')) return 'www.' + word + '.com';
    return 'www.' + word + 'bank.com';
}

export const APP_CONFIG = {
    // ─── Branding (getters = reactive at runtime) ────────────
    get BANK_NAME() { return _siteName; },
    get BRAND_NAME() { return firstWord(_siteName); },
    get COMPANY_NAME() { return firstWord(_siteName) + ' Meridian Holdings'; },
    get LEGAL_ENTITY() { return firstWord(_siteName) + ' Invest LLC'; },
    get SUPPORT_EMAIL() { return 'support@' + derivedDomain(_siteName); },
    get SITE_URL() {
        if (_siteUrl) return _siteUrl;
        try {
            if (typeof window !== 'undefined' && window.location?.origin) {
                return window.location.origin;
            }
        } catch { /* SSR / no window */ }
        return 'https://' + derivedDomain(_siteName);
    },

    // ─── Security ────────────────────────────────────────────
    get ADMIN_EMAILS() { return ['admin@' + derivedDomain(_siteName)]; },

    // ─── Product / Feature Naming ────────────────────────────
    get AI_ASSISTANT_NAME() { return firstWord(_siteName); },
    get PREMIUM_CARD_NAME() { return firstWord(_siteName) + ' Black'; },
    get CHECKING_PRODUCT_NAME() { return firstWord(_siteName) + ' Checking'; },
    get SAVINGS_PRODUCT_NAME() { return firstWord(_siteName) + ' Elite'; },
    get INVEST_PRODUCT_NAME() { return firstWord(_siteName) + ' Invest'; },

    // ─── Backend ─────────────────────────────────────────────
    API_BASE_URL: '/api/db',

    // ─── localStorage / sessionStorage key prefixes ──────────
    STORAGE_PREFIX: 'lennox_',
};
