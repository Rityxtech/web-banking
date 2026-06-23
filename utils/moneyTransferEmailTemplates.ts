import { APP_CONFIG } from '../config';
import { t } from './i18n';

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

interface MoneyTransferConfig {
    brandName: string;
    logoPath: string;
    logoAlt: string;
    companyName: string;
    companyAddress: string[];
    website: string;
    watermarkText: string;
    buttonColor: string;
    sourceKey: string;
}

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

const buildMoneyTransferTemplate = (config: MoneyTransferConfig, data: any, lang?: string) => {
    const watermarkGroup = Array(3).fill(config.watermarkText).join('      ');
    const watermark = Array(6).fill(watermarkGroup).join('\\A\\A ');
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.brandName}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td, th, div, p, a, h1, h2, h3, h4, h5, h6 { font-family: 'Courier New', Courier, monospace !important; }
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #f0f2f5;
            font-family: 'Courier Prime', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            color: #111111;
        }

        .receipt-container {
            background-color: #ffffff;
            width: 400px;
            padding: 40px 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }

        /* Diagonal Watermark Overlay */
        .receipt-container::before {
            content: "${watermark}";
            white-space: pre;
            position: absolute;
            top: -20%;
            left: -20%;
            width: 150%;
            height: 150%;
            transform: rotate(-25deg);
            font-size: 22px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.04);
            pointer-events: none;
            line-height: 2.5;
            z-index: 1;
        }

        /* Content wrapper to stay above watermark background */
        .receipt-content {
            position: relative;
            z-index: 2;
        }

        .logo-container {
            text-align: center;
            margin-bottom: 8px;
        }

        .brand-logo {
            width: 140px;
            height: auto;
        }

        .company-details {
            text-align: center;
            font-size: 20px;
            line-height: 1.4;
            margin-bottom: 20px;
        }

        .divider {
            border: none;
            border-top: 1px dashed #666666;
            margin: 15px 0;
        }

        .title-block {
            text-align: center;
            font-size: 22px;
            line-height: 1.4;
            margin: 20px 0;
        }

        .grid-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 12px;
            column-gap: 15px;
            font-size: 20px;
            margin-bottom: 10px;
        }

        .label {
            color: #111111;
        }

        .value {
            font-weight: bold;
        }

        .time-block {
            font-size: 22px;
            line-height: 1.5;
            margin: 15px 0;
        }

        .financial-table {
            width: 100%;
            font-size: 22px;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .financial-table td {
            padding: 4px 0;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals-section {
            width: 100%;
            font-size: 22px;
            margin: 15px 0;
        }

        .totals-section td {
            padding: 6px 0;
        }

        .barcode-container {
            text-align: center;
            margin: 25px 0 15px 0;
        }

        .barcode {
            width: 240px;
            height: 50px;
            background: repeating-linear-gradient(
                90deg,
                #111,
                #111 2px,
                #fff 2px,
                #fff 4px,
                #111 4px,
                #111 8px,
                #fff 8px,
                #fff 10px
            );
            margin: 0 auto 5px auto;
        }

        .barcode-number {
            font-size: 19px;
            letter-spacing: 2px;
        }

        .footer-msg {
            text-align: center;
            font-size: 20px;
            line-height: 1.5;
            margin-top: 20px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5;">
<div style="display:none;font-size:1px;color:#f0f2f5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div>

<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f2f5;">
    <tr>
        <td align="center" style="padding: 20px;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="400">
            <tr>
            <td align="center" valign="top" width="400">
            <![endif]-->
            <div class="receipt-container" style="margin: 0 auto;">
                <div class="receipt-content">

        <div class="logo-container">
            ${(() => {
                const logoUrl = resolveLogoUrl(data.logo_url, config.logoPath);
                return logoUrl
                    ? `<img src="${logoUrl}" alt="${config.logoAlt}" class="brand-logo" width="340" style="display: block; width: 60%; height: auto; border: 0; border-radius: 0; margin: 0 auto;">`
                    : `<div class="brand-logo" style="width: 60%; margin: 0 auto; text-align: center; font-size: 18px; font-weight: bold; color: #333333; padding: 10px 0;">${config.logoAlt}</div>`;
            })()}
        </div>

        <div class="company-details">
            ${config.companyName}<br>
            ${config.companyAddress.join('<br>')}
        </div>

        <hr class="divider">

        <div class="title-block">
            ${t('international_money_transfer_receipt', lang)}<br>
            ${t('fast_transparent_low_fees', lang)}
        </div>

        <hr class="divider">

        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 20px; margin-bottom: 10px;">
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 7.5px;">
                    <div class="label">${t('sender', lang)} :</div>
                    <div class="value">${data.sender_name}</div>
                </td>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-left: 7.5px;">
                    <div class="label">${t('transaction_id', lang)} :</div>
                    <div class="value">${data.transfer_id}</div>
                </td>
            </tr>
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 7.5px;">
                    <div class="label">${t('recipient_email', lang)} :</div>
                    <div class="value" style="word-break: break-all;">${data.recipient_email}</div>
                </td>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-left: 7.5px;">
                    <div class="label">${t('status', lang)} :</div>
                    <div class="value">${data.status}</div>
                </td>
            </tr>
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 0; padding-right: 7.5px;">
                    <div class="label">${t('country', lang)} :</div>
                    <div class="value">${data.country}</div>
                </td>
                <td width="50%" valign="top" style="padding-bottom: 0; padding-left: 7.5px;">
                    <div class="label">${t('method', lang)} :</div>
                    <div class="value">${data.method}</div>
                </td>
            </tr>
        </table>

        <hr class="divider">

        <div class="time-block">
            ${t('date', lang)}: ${data.date}<br>
            ${t('time', lang)}: ${data.time}
        </div>

        <hr class="divider">

        <table class="financial-table">
            <tr>
                <td>1 &nbsp; ${t('amount', lang)}</td>
                <td class="text-right">${fmt$(data.amount)}</td>
            </tr>
            <tr>
                <td>1 &nbsp; ${t('fee', lang)}</td>
                <td class="text-right">${fmt$(data.fee)}</td>
            </tr>
        </table>

        <hr class="divider">

        <table class="totals-section">
            <tr>
                <td style="padding-left: 80px;">${t('subtotal', lang)}</td>
                <td class="text-right">${fmt$(data.subtotal)}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="padding-left: 80px;">${t('total', lang)}</td>
                <td class="text-right">${fmt$(data.total)}</td>
            </tr>
        </table>

        <hr class="divider">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 20px; margin-bottom: 10px;">
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 7.5px;" class="label">${t('transaction_id', lang)}</td>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-left: 7.5px; text-align: right;" class="value">${data.payment_method || t('na', lang)}</td>
            </tr>
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-right: 7.5px;" class="label">${t('reference_id', lang)}</td>
                <td width="50%" valign="top" style="padding-bottom: 12px; padding-left: 7.5px; text-align: right;" class="value">${data.reference_number || t('na', lang)}</td>
            </tr>
            <tr>
                <td width="50%" valign="top" style="padding-bottom: 0; padding-right: 7.5px;" class="label">${t('status', lang)}</td>
                <td width="50%" valign="top" style="padding-bottom: 0; padding-left: 7.5px; text-align: right; color: ${data.status === 'Failed' ? '#dc2626' : data.status === 'Pending' ? '#f59e0b' : data.status === 'On Hold' || data.status === 'Processing' ? '#2563eb' : '#2E7D32'}; font-weight: bold;" class="value">${data.status ? (data.status === 'Failed' ? t('status_failed', lang) : data.status === 'Pending' ? t('status_pending', lang) : data.status === 'On Hold' ? t('status_on_hold', lang) : data.status === 'Processing' ? t('status_processing', lang) : t('status_success', lang)) : t('status_completed', lang)}</td>
            </tr>
        </table>

        <hr class="divider">

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 15px 0;">
            <tr>
                <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" bgcolor="${config.buttonColor}" style="background-color: ${config.buttonColor}; border-radius: 4px;">
                                <a href="https://code.jivosite.com/chatpage/YG4WdNtpis" target="_blank" style="display: inline-block; padding: 14px 48px; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 4px; font-family: 'Courier Prime', 'Courier New', Courier, monospace;">${t('confirm_accept_deposit', lang)}</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="barcode-container">
            <table border="0" cellpadding="0" cellspacing="0" width="240" height="50" style="width: 240px; height: 50px; margin: 0 auto 5px auto; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                <tr>
                    <td width="4" height="50" bgcolor="#111111" style="width: 4px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#ffffff" style="width: 2px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#111111" style="width: 6px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="3" height="50" bgcolor="#ffffff" style="width: 3px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="8" height="50" bgcolor="#111111" style="width: 8px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#ffffff" style="width: 2px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#111111" style="width: 4px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#ffffff" style="width: 6px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#111111" style="width: 2px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="8" height="50" bgcolor="#ffffff" style="width: 8px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="3" height="50" bgcolor="#111111" style="width: 3px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#ffffff" style="width: 4px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#111111" style="width: 2px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#ffffff" style="width: 6px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#111111" style="width: 4px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#ffffff" style="width: 2px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="8" height="50" bgcolor="#111111" style="width: 8px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="3" height="50" bgcolor="#ffffff" style="width: 3px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#111111" style="width: 6px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#ffffff" style="width: 4px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#111111" style="width: 2px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="8" height="50" bgcolor="#ffffff" style="width: 8px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#111111" style="width: 4px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#ffffff" style="width: 6px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="3" height="50" bgcolor="#111111" style="width: 3px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#ffffff" style="width: 2px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="8" height="50" bgcolor="#111111" style="width: 8px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#ffffff" style="width: 4px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="6" height="50" bgcolor="#111111" style="width: 6px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="2" height="50" bgcolor="#ffffff" style="width: 2px; height: 50px; background-color: #ffffff; line-height: 1px; font-size: 1px;">&nbsp;</td>
                    <td width="4" height="50" bgcolor="#111111" style="width: 4px; height: 50px; background-color: #111111; line-height: 1px; font-size: 1px;">&nbsp;</td>
                </tr>
            </table>
            <div class="barcode-number">${data.barcode_number}</div>
        </div>

        <div class="footer-msg">
            ${data.status === 'Failed' ? t('tx_desc_failed', lang) : data.status === 'Pending' ? t('tx_desc_pending', lang) : data.status === 'On Hold' ? t('tx_desc_onhold', lang) : data.status === 'Processing' ? t('tx_desc_processing', lang) : t('tx_desc_success', lang)}<br>
            ${t('track_transfers_anytime', lang)} ${config.website}<br><br>
            ${t('thank_you_for_using', lang)} ${config.brandName}.
        </div>

                </div>
            </div>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </td>
    </tr>
</table>

</body>
</html>`;
};

export const getWesternUnionEmailTemplate = (data: any, lang?: string) => buildMoneyTransferTemplate({
    brandName: 'Western Union',
    logoPath: '/westernunion-logo.png',
    logoAlt: 'Western Union',
    companyName: 'Western Union Financial Services, Inc.',
    companyAddress: [
        '7001 East Belleview Avenue',
        'Denver, CO 80237',
        'United States',
        'www.westernunion.com'
    ],
    website: 'www.westernunion.com',
    watermarkText: 'WESTERN UNION',
    buttonColor: '#FFD700',
    sourceKey: 'westernunion',
}, data, lang);

export const getMoneyGramEmailTemplate = (data: any, lang?: string) => buildMoneyTransferTemplate({
    brandName: 'MoneyGram',
    logoPath: '/moneygram-logo.png',
    logoAlt: 'MoneyGram',
    companyName: 'MoneyGram International, Inc.',
    companyAddress: [
        '2828 N Harwood Street',
        'Dallas, TX 75201',
        'United States',
        'www.moneygram.com'
    ],
    website: 'www.moneygram.com',
    watermarkText: 'MONEYGRAM',
    buttonColor: '#DA291C',
    sourceKey: 'moneygram',
}, data, lang);
