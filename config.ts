/**
 * ============================================================
 *  BANK SCRIPT — CENTRAL CONFIGURATION
 *  Edit this file to rebrand the entire application.
 * ============================================================
 */

export const APP_CONFIG = {
    // ─── Branding ────────────────────────────────────────────
    /** The name of the bank displayed throughout the app */
    BANK_NAME: 'Lennox Bank',

    /** Short brand name (used in logos, nav, footers) */
    BRAND_NAME: 'Lennox',

    /** Parent company / holding entity name */
    COMPANY_NAME: 'Lennox Meridian Holdings',

    /** Legal fintech disclaimer entity */
    LEGAL_ENTITY: 'Lennox Invest LLC',

    /** Support email shown on the login page and footer */
    SUPPORT_EMAIL: 'support@yourdomain.com',

    // ─── Security ────────────────────────────────────────────
    /**
     * Admin email addresses (users who bypass maintenance mode
     * and can access the Admin Dashboard).
     *
     * IMPORTANT: In a production environment, manage admin roles
     * through the database (profiles.role = 'admin') rather than
     * listing emails here. This list is a client-side fallback.
     *
     * @example ['admin@yourdomain.com']
     */
    ADMIN_EMAILS: ['admin@yourdomain.com'],

    // ─── Product / Feature Naming ────────────────────────────
    /** AI assistant persona name */
    AI_ASSISTANT_NAME: 'Lennox',

    /** Premium card product name */
    PREMIUM_CARD_NAME: 'Lennox Black',

    /** Checking account product name */
    CHECKING_PRODUCT_NAME: 'Lennox Checking',

    /** Savings product name */
    SAVINGS_PRODUCT_NAME: 'Lennox Elite',

    /** Investment product name */
    INVEST_PRODUCT_NAME: 'Lennox Invest',

    // ─── Backend ─────────────────────────────────────────────
    /**
     * Vercel API endpoint for database operations.
     */
    API_BASE_URL: '/api/db',

    // ─── localStorage / sessionStorage key prefixes ──────────
    /** Prefix used for all localStorage keys */
    STORAGE_PREFIX: 'lennox_',
};
