/**
 * ============================================================
 *  BANK SCRIPT — CENTRAL CONFIGURATION
 *  Dynamically reflects the admin-set site name everywhere.
 * ============================================================
 */

// ─── Mutable runtime state (updated by admin settings) ─────
let _siteName = 'Lennox Bank';
let _siteLogo = '';

// Try to restore from localStorage on module load
try {
    const storedName = localStorage.getItem('site_name');
    const storedLogo = localStorage.getItem('site_logo');
    if (storedName) _siteName = storedName;
    if (storedLogo) _siteLogo = storedLogo;
} catch { /* localStorage not available */ }

/**
 * Call this from App.tsx whenever globalSettings changes
 * so the entire app reflects the admin-set site name.
 */
export function setSiteConfig(name: string, logo?: string) {
    _siteName = name;
    if (logo !== undefined) _siteLogo = logo;
    try {
        localStorage.setItem('site_name', name);
        if (logo !== undefined) localStorage.setItem('site_logo', logo);
    } catch { /* localStorage not available */ }
}

export function getSiteName(): string { return _siteName; }
export function getSiteLogo(): string { return _siteLogo; }

// Helper: extract first word for short brand references
function firstWord(name: string): string {
    return name.split(' ')[0] || name;
}

// Helper: derive domain from site name (e.g. "VeltrixBank" → "veltrixbank.com")
function derivedDomain(name: string): string {
    return firstWord(name).toLowerCase() + 'bank.com';
}

export const APP_CONFIG = {
    // ─── Branding (getters = reactive at runtime) ────────────
    get BANK_NAME() { return _siteName; },
    get BRAND_NAME() { return firstWord(_siteName); },
    get COMPANY_NAME() { return firstWord(_siteName) + ' Meridian Holdings'; },
    get LEGAL_ENTITY() { return firstWord(_siteName) + ' Invest LLC'; },
    get SUPPORT_EMAIL() { return 'support@' + derivedDomain(_siteName); },
    get SITE_URL() { return 'https://' + derivedDomain(_siteName); },

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
