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

export const getSnbEmailTemplate = (data: any, lang?: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saudi National Bank (SNB)</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        html, body {
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
        }
        .email-container {
            background-color: #f4f4f4;
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            border-radius: 0;
            padding: 0;
            border: none;
            box-shadow: none;
        }
        .header {
            background-color: #6B7280;
            background-image: linear-gradient(to right, #9CA3AF, #4B5563);
            padding: 12px 20px;
            display: block;
            width: 100%;
        }
        .logo {
            width: 85px;
            height: auto;
            margin-right: 40px;
            vertical-align: middle;
        }
        .bank-info {
            font-size: 11px;
            line-height: 1.3;
            color: #ffffff !important;
            text-align: right;
            vertical-align: middle;
        }
        .bank-name {
            font-weight: bold;
            font-size: 13px;
        }
        h2 {
            font-size: 20px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 6px;
        }
        .salutation {
            font-size: 12px;
            color: #222222;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 10px;
        }
        th {
            background-color: #E8F5E9;
            text-align: left;
            padding: 4px 8px;
            font-weight: bold;
            border: 1px solid #A5D6A7;
            color: #1B5E20;
        }
        td {
            padding: 4px 8px;
            border: 1px solid #dddddd;
            color: #222222;
            background-color: #ffffff;
        }
        td:first-child {
            width: 40%;
            font-weight: 500;
        }
        .action-box {
            background-color: #E8F5E9;
            border: 1px solid #A5D6A7;
            border-left: 4px solid #2E7D32;
            color: #1B5E20;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .btn-container {
            text-align: center;
            margin-bottom: 12px;
        }
        .btn {
            background-color: #2E7D32;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: bold;
            display: inline-block;
        }
        .security-section {
            font-size: 11px;
            color: #222222;
            margin-bottom: 12px;
        }
        .security-section h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff;">
    <!-- SNB-REF-${data.transaction_id || Date.now()} -->
    <div class="email-container">
            <div class="header" style="width: 100%;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td align="left" valign="middle" style="width: 85px; padding: 0 40px 0 0;">
                            ${(() => {
                                const logoUrl = resolveLogoUrl(data.logo_url, '/snb-logo.png');
                                return logoUrl
                                    ? `<img src="${logoUrl}" alt="Saudi National Bank (SNB)" style="width: 85px; height: auto; background: transparent; display: block;">`
                                    : `<div style="width: 85px; height: auto; background: transparent; font-size: 14px; font-weight: bold; color: #ffffff;">SNB</div>`;
                            })()}
                        </td>
                        <td align="right" valign="middle" class="bank-info" style="text-align: right;">
                            <div class="bank-name">Saudi National Bank (SNB)</div>
                            <div><span style="color: #ffffff !important; text-decoration: none !important;">notifications@snb.com</span></div>
                            <div>${t('call', lang)}: +966 (11) 218-6000</div>
                        </td>
                    </tr>
                </table>
            </div>

            <div style="padding: 15px 20px;">
            <p style="font-size: 10px; color: #666666; margin-bottom: 8px;">Ref: ${data.transaction_id || Date.now()}</p>
            <h2>${t('direct_deposit_confirmation', lang)}</h2>
            <p class="salutation">${t('hi', lang)} ${data.recipient_name || t('valued_customer', lang)},</p>
            <p class="salutation">We are pleased to inform you that a deposit has been credited to your Saudi National Bank (SNB) account.</p>

            <table>
                <thead>
                    <tr>
                        <th colspan="2">${t('transaction_details', lang)}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${t('account', lang)}</td>
                        <td>${data.account_type || t('checking', lang)}</td>
                    </tr>
                    <tr>
                        <td>${t('recipient_account', lang)}</td>
                        <td>${data.account_number || '****-6789'}</td>
                    </tr>
                    <tr>
                        <td>${t('amount', lang)}</td>
                        <td style="font-weight: bold;">${fmt$(data.amount) || t('na', lang)}</td>
                    </tr>
                    <tr>
                        <td>${t('date', lang)}</td>
                        <td>${data.date || t('na', lang)}</td>
                    </tr>
                    <tr>
                        <td>${t('transaction_id', lang)}</td>
                        <td>${data.transaction_id || t('na', lang)}</td>
                    </tr>
                    <tr>
                        <td>${t('sender_name', lang)}</td>
                        <td>${data.source_of_funds || t('company_payroll', lang)}</td>
                    </tr>
                    <tr>
                        <td>${t('status', lang)}</td>
                        <td style="color: ${data.status === 'Failed' ? '#dc2626' : data.status === 'Pending' ? '#f59e0b' : data.status === 'On Hold' || data.status === 'Processing' ? '#2563eb' : '#2E7D32'}; font-weight: bold;">${data.status ? (data.status === 'Failed' ? t('status_failed', lang) : data.status === 'Pending' ? t('status_pending', lang) : data.status === 'On Hold' ? t('status_on_hold', lang) : data.status === 'Processing' ? t('status_processing', lang) : t('status_success', lang)) : t('status_completed', lang)}</td>
                    </tr>
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
                <p style="margin: 0;">${t('security_notice_text', lang).replace('{bank}', "Saudi National Bank (SNB)")}</p>
            </div>

            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">${t('automated_notification', lang).replace('{bank}', "Saudi National Bank (SNB)")}</p>
                <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} Saudi National Bank (SNB). ${t('all_rights_reserved', lang)}.</p>
                <p style="margin: 0;">${t('member_fdic', lang)} | ${t('equal_housing_lender', lang)}</p>
            </div>
            </div>
        </div>
</body>
</html>`;
