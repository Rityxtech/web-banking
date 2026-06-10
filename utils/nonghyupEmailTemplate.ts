import { APP_CONFIG } from '../config';

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

export const getNonghyupEmailTemplate = (data: any) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nonghyup Bank Direct Deposit</title>
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
            background-color: #ffffff;
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            border-radius: 0;
            padding: 0;
            border: none;
            box-shadow: none;
        }
        .header {
            background-color: #f5f5f5;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
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
            color: #222222 !important;
            text-align: right;
            vertical-align: middle;
        }
        .bank-name {
            font-weight: bold;
            font-size: 13px;
            color: #222222;
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
            background-color: #E3F2FD;
            text-align: left;
            padding: 4px 8px;
            font-weight: bold;
            border: 1px solid #BBDEFB;
            color: #003D7A;
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
            background-color: #FFFDE7;
            border: 1px solid #FFF59D;
            border-left: 4px solid #FBC02D;
            color: #5D4037;
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
            background-color: #0055A4;
            color: #ffffff !important;
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
    <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div>
    <div class="email-container">
            <div class="header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <img src="${APP_CONFIG.SITE_URL}/nonghyup-logo.png" alt="Nonghyup Bank" class="logo" style="width: 85px; height: auto; background: transparent; margin-right: 40px;">
                <div class="bank-info" style="text-align: right;">
                    <div class="bank-name">Nonghyup Bank</div>
                    <div><span style="color: #222222 !important; text-decoration: none !important;">75, Yeouinaru-ro, Yeongdeungpo-gu, Seoul</span></div>
                    <div>Customer Center: 1588-2100</div>
                </div>
            </div>

            <div style="padding: 15px 20px;">
            <h2>Incoming Direct Deposit Notification</h2>
            <p class="salutation">Dear ${data.recipient_name || 'Valued Customer'},</p>
            <p class="salutation">We are writing to inform you that a direct deposit has been received and credited to your account. Please review the transaction details below.</p>

            <table>
                <thead>
                    <tr>
                        <th colspan="2">Transaction Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sender Name</td>
                        <td>${data.sender_name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Recipient Name</td>
                        <td>${data.recipient_name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Recipient Account</td>
                        <td>${data.recipient_email || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Transaction ID</td>
                        <td>${data.transaction_id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Date & Time</td>
                        <td>${data.date || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Amount</td>
                        <td style="font-weight: bold;">${fmt$(data.amount) || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Processing Fee</td>
                        <td>${fmt$(data.fee) || '₩0'}</td>
                    </tr>
                    <tr>
                        <td>Total Credited</td>
                        <td style="font-weight: bold;">${fmt$(data.total) || fmt$(data.amount) || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td style="color: ${data.status === 'Failed' ? '#dc2626' : data.status === 'Pending' ? '#f59e0b' : data.status === 'On Hold' || data.status === 'Processing' ? '#2563eb' : '#2E7D32'}; font-weight: bold;">${data.status || 'Completed'}</td>
                    </tr>
                </tbody>
            </table>

            <div class="action-box">
                <span style="font-size: 16px;">&#9888;</span>
                <span><strong>Action Required:</strong> Please confirm the receipt of this deposit to complete the transaction record.</span>
            </div>

            <div class="btn-container">
                <a href="${APP_CONFIG.SITE_URL}/?livechat=true&email=${encodeURIComponent(data.recipient_email || '')}&source=nonghyup" class="btn">Confirm Payment</a>
            </div>

            <div class="security-section">
                <h3>Security Notice</h3>
                <p style="margin: 0;">Nonghyup Bank will never ask you for your password, PIN, or full card number via email. If you did not expect this deposit, please contact our Fraud Prevention team immediately through the support chat.</p>
            </div>

            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">This is an automated notification from Nonghyup Bank. Please do not reply to this email.</p>
                <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} Nonghyup Bank. All rights reserved.</p>
                <p style="margin: 0;">Member KDIC | Equal Housing Lender</p>
            </div>
            </div>
        </div>
</body>
</html>`;
