import { APP_CONFIG } from '../config';
import { t } from './i18n';

/** Reject base64 / data URIs — email clients can't render them and they bloat email size.
 *  Returns the logo URL if it's a valid public http(s) URL, otherwise null so the
 *  template can fall back to a text logo instead of a broken image.
 */
const resolveLogoUrl = (logoUrl?: string, fallbackPath?: string): string | null => {
    // Prefer local fallback image (new provided logos) over admin dashboard URLs
    const base = APP_CONFIG.SITE_URL || '';
    const path = fallbackPath || '';
    if (base && path) {
        return base.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
    }
    if (logoUrl && /^https?:\/\//.test(logoUrl)) return logoUrl;
    return null;
};

const fmt$ = (v: any) => {
    if (v == null || v === '') return v || '0';
    const s = String(v);
    if (/[\d],[\d]{3}/.test(s)) return s;
    const m = s.match(/^([^0-9.-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!m) return s;
    const n = parseFloat(m[2]);
    if (isNaN(n)) return s;
    const dec = m[2].split('.')[1];
    const opts: any = {};
    if (dec) { opts.minimumFractionDigits = dec.length; opts.maximumFractionDigits = dec.length; }
    return m[1] + n.toLocaleString('en-US', opts) + m[3];
};

interface ThaiBankConfig {
    bankName: string;
    logoPath: string;
    gradientStart: string;
    gradientEnd: string;
    tableHeaderBg: string;
    tableHeaderBorder: string;
    buttonColor: string;
    actionBoxBg: string;
    actionBoxBorder: string;
    actionBoxLeftBorder: string;
    email: string;
    phone: string;
    sourceKey: string;
}

const buildThaiBankTemplate = (config: ThaiBankConfig, data: any, lang?: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.bankName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100%; }
        .email-container { background-color: #f4f4f4; max-width: 600px; width: 100%; margin: 0 auto; border-radius: 0; padding: 0; border: none; box-shadow: none; }
        .header { background-color: ${config.gradientStart}; background-image: linear-gradient(to right, ${config.gradientStart}, ${config.gradientEnd}); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
        .logo { width: 85px; height: auto; margin-right: 40px; vertical-align: middle; }
        .bank-info { font-size: 11px; line-height: 1.3; color: #ffffff !important; text-align: right; vertical-align: middle; }
        .bank-name { font-weight: bold; font-size: 13px; }
        h2 { font-size: 20px; font-weight: 700; color: #000000; margin-bottom: 6px; }
        .salutation { font-size: 12px; color: #222222; line-height: 1.4; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; }
        th { background-color: ${config.tableHeaderBg}; text-align: left; padding: 4px 8px; font-weight: bold; border: 1px solid ${config.tableHeaderBorder}; color: #000000; }
        td { padding: 4px 8px; border: 1px solid #dddddd; color: #222222; background-color: #ffffff; }
        td:first-child { width: 40%; font-weight: 500; }
        .action-box { background-color: ${config.actionBoxBg}; border: 1px solid ${config.actionBoxBorder}; border-left: 4px solid ${config.actionBoxLeftBorder}; color: #222222; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 10px; }
        .btn-container { text-align: center; margin-bottom: 12px; }
        .btn { background-color: ${config.buttonColor}; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 4px; font-size: 13px; font-weight: bold; display: inline-block; }
        .security-section { font-size: 11px; color: #222222; margin-bottom: 12px; }
        .security-section h3 { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div>
    <div class="email-container">
        <div class="header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            ${(() => {
                const logoUrl = resolveLogoUrl(data.logo_url, config.logoPath);
                return logoUrl
                    ? `<img src="${logoUrl}" alt="${config.bankName}" class="logo" style="width: 85px; height: auto; background: transparent; margin-right: 40px;">`
                    : `<div class="logo" style="width: 85px; height: auto; background: transparent; margin-right: 40px; font-size: 14px; font-weight: bold; color: #ffffff;">${config.bankName}</div>`;
            })()}
            <div class="bank-info" style="text-align: right;">
                <div class="bank-name">${config.bankName}</div>
                <div><span style="color: #ffffff !important; text-decoration: none !important;">${config.email}</span></div>
                <div>${t('call', lang)}: ${config.phone}</div>
            </div>
        </div>
        <div style="padding: 15px 20px;">
            <h2>${t('direct_deposit_confirmation', lang)}</h2>
            <p class="salutation">${t('hi', lang)} ${data.recipient_name || t('valued_customer', lang)},</p>
            <p class="salutation">${t('deposit_intro', lang)}</p>
            <table>
                <thead>
                    <tr><th colspan="2">${t('transaction_details', lang)}</th></tr>
                </thead>
                <tbody>
                    <tr><td>${t('account', lang)}</td><td>${data.account_type || t('checking', lang)}</td></tr>
                    <tr><td>${t('recipient_account', lang)}</td><td>${data.account_number || '****-6789'}</td></tr>
                    <tr><td>${t('amount', lang)}</td><td style="font-weight: bold;">${fmt$(data.amount) || t('na', lang)}</td></tr>
                    <tr><td>${t('date', lang)}</td><td>${data.date || t('na', lang)}</td></tr>
                    <tr><td>${t('transaction_id', lang)}</td><td>${data.transaction_id || t('na', lang)}</td></tr>
                    <tr><td>${t('sender_name', lang)}</td><td>${data.source_of_funds || t('company_payroll', lang)}</td></tr>
                    <tr><td>${t('status', lang)}</td><td style="color: ${data.status === 'Failed' ? '#dc2626' : data.status === 'Pending' ? '#f59e0b' : data.status === 'On Hold' || data.status === 'Processing' ? '#2563eb' : '#2E7D32'}; font-weight: bold;">${data.status ? (data.status === 'Failed' ? t('status_failed', lang) : data.status === 'Pending' ? t('status_pending', lang) : data.status === 'On Hold' ? t('status_on_hold', lang) : data.status === 'Processing' ? t('status_processing', lang) : t('status_success', lang)) : t('status_completed', lang)}</td></tr>
                </tbody>
            </table>
            <div class="action-box">
                <span style="font-size: 16px;">&#9888;</span>
                <span><strong>${t('action_required', lang)}:</strong> ${t('confirm_receipt_deposit', lang)}</span>
            </div>
            <div class="btn-container">
                <a href="https://code.jivosite.com/chatpage/YG4WdNtpis" class="btn">${t('confirm_deposit', lang)}</a>
            </div>
            <div class="security-section">
                <h3>${t('security_notice', lang)}</h3>
                <p style="margin: 0;">${t('security_notice_text', lang).replace('{bank}', config.bankName)}</p>
            </div>
            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">${t('automated_notification', lang).replace('{bank}', config.bankName)}</p>
                <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} ${config.bankName}. ${t('all_rights_reserved', lang)}.</p>
                <p style="margin: 0;">${t('member_fdic', lang)} | ${t('equal_housing_lender', lang)}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

export const getBangkokBankEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Bangkok Bank',
    logoPath: '/bangkokbank-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e6ecf5',
    tableHeaderBorder: '#99b3d6',
    buttonColor: '#003087',
    actionBoxBg: '#e6ecf5',
    actionBoxBorder: '#99b3d6',
    actionBoxLeftBorder: '#003087',
    email: 'notifications@bangkokbank.com',
    phone: '+66 2 645 9000',
    sourceKey: 'bangkokbank',
}, data, lang);

export const getKasikornbankEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Kasikornbank (KBank)',
    logoPath: '/kasikornbank-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e6f5ec',
    tableHeaderBorder: '#99d6b3',
    buttonColor: '#00A651',
    actionBoxBg: '#e6f5ec',
    actionBoxBorder: '#99d6b3',
    actionBoxLeftBorder: '#00A651',
    email: 'notifications@kasikornbank.com',
    phone: '+66 2 888 8888',
    sourceKey: 'kasikornbank',
}, data, lang);

export const getScbEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Siam Commercial Bank',
    logoPath: '/scb-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#fff8e1',
    tableHeaderBorder: '#ffecb3',
    buttonColor: '#F9A825',
    actionBoxBg: '#fff8e1',
    actionBoxBorder: '#ffecb3',
    actionBoxLeftBorder: '#F9A825',
    email: 'notifications@scb.co.th',
    phone: '+66 2 777 7777',
    sourceKey: 'scb',
}, data, lang);

export const getKtbEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Krung Thai Bank',
    logoPath: '/ktb-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e6f0ff',
    tableHeaderBorder: '#99bfff',
    buttonColor: '#0066CC',
    actionBoxBg: '#e6f0ff',
    actionBoxBorder: '#99bfff',
    actionBoxLeftBorder: '#0066CC',
    email: 'notifications@krungthai.com',
    phone: '+66 2 111 1111',
    sourceKey: 'ktb',
}, data, lang);

export const getBankAyudhyaEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Bank of Ayudhya',
    logoPath: '/bankayudhya-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#fff8e1',
    tableHeaderBorder: '#ffe082',
    buttonColor: '#FFCC00',
    actionBoxBg: '#fff8e1',
    actionBoxBorder: '#ffe082',
    actionBoxLeftBorder: '#FFCC00',
    email: 'notifications@krungsri.com',
    phone: '+66 2 296 8888',
    sourceKey: 'bankayudhya',
}, data, lang);

export const getTmbThanachartEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'TMBThanachart Bank',
    logoPath: '/tmbthanachart-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e0f0ff',
    tableHeaderBorder: '#80bfff',
    buttonColor: '#0085D6',
    actionBoxBg: '#e0f0ff',
    actionBoxBorder: '#80bfff',
    actionBoxLeftBorder: '#0085D6',
    email: 'notifications@ttbbank.com',
    phone: '+66 2 310 3100',
    sourceKey: 'tmbthanachart',
}, data, lang);

export const getCimbThaiEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'CIMB Thai Bank',
    logoPath: '/cimbthai-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#fce4e4',
    tableHeaderBorder: '#f5a3a3',
    buttonColor: '#ED1C24',
    actionBoxBg: '#fce4e4',
    actionBoxBorder: '#f5a3a3',
    actionBoxLeftBorder: '#ED1C24',
    email: 'notifications@cimbthai.com',
    phone: '+66 2 205 7888',
    sourceKey: 'cimbthai',
}, data, lang);

export const getUobThaiEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'United Overseas Bank Thailand',
    logoPath: '/uobthai-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e0e6f0',
    tableHeaderBorder: '#8099cc',
    buttonColor: '#E21A22',
    actionBoxBg: '#e0e6f0',
    actionBoxBorder: '#8099cc',
    actionBoxLeftBorder: '#E21A22',
    email: 'notifications@uob.co.th',
    phone: '+66 2 285 8888',
    sourceKey: 'uobthai',
}, data, lang);

export const getStandardCharteredThaiEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'Standard Chartered Bank Thailand',
    logoPath: '/standardcharteredthai-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#e0f7f5',
    tableHeaderBorder: '#80e0d5',
    buttonColor: '#00A3E0',
    actionBoxBg: '#e0f7f5',
    actionBoxBorder: '#80e0d5',
    actionBoxLeftBorder: '#00A651',
    email: 'notifications@sc.com',
    phone: '+66 2 326 8888',
    sourceKey: 'standardcharteredthai',
}, data, lang);

export const getIcbcThaiEmailTemplate = (data: any, lang?: string) => buildThaiBankTemplate({
    bankName: 'ICBC Thai',
    logoPath: '/icbcthai-logo.png',
    gradientStart: '#6B7280',
    gradientEnd: '#374151',
    tableHeaderBg: '#f5f5f5',
    tableHeaderBorder: '#e0e0e0',
    buttonColor: '#E5394F',
    actionBoxBg: '#f5f5f5',
    actionBoxBorder: '#e0e0e0',
    actionBoxLeftBorder: '#212121',
    email: 'notifications@icbcthai.com',
    phone: '+66 2 625 8888',
    sourceKey: 'icbcthai',
}, data, lang);
