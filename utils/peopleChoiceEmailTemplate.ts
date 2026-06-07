import { APP_CONFIG } from '../config';

export const getPeopleChoiceEmailTemplate = (data: any) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>People's Choice Direct Deposit</title>
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
        .wrapper {
            background-color: #ffffff;
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
            background-color: #9CB828;
            background-image: linear-gradient(to right, #B5D23A, #7A9620);
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo {
            width: 85px;
            height: auto;
            margin-right: 20px;
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
            background-color: #f5f8e6;
            text-align: left;
            padding: 4px 8px;
            font-weight: bold;
            border: 1px solid #d4e09b;
            color: #5a7a10;
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
            background-color: #fff8e6;
            border: 1px solid #ffe5b4;
            border-left: 4px solid #f59e0b;
            color: #855a1f;
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
            background-color: #9CB828;
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
    <div class="wrapper">
        <div class="email-container">
            <div class="header">
                <div class="logo" style="width: 85px; height: 55px; margin-right: 20px; vertical-align: middle; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 120 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="110" height="40" rx="8" ry="8" fill="#E31C25"/>
                        <path d="M 5 35 Q 5 45 15 45 L 25 45 L 20 50 L 15 45" fill="#E31C25"/>
                        <text x="60" y="22" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">People's</text>
                        <text x="60" y="38" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Choice</text>
                    </svg>
                </div>
                <div class="bank-info">
                    <div class="bank-name">People's Choice</div>
                    <div><span style="color: #ffffff !important; text-decoration: none !important;">notifications@pcbank.com</span></div>
                    <div>Call: +1 (90) 532-7000</div>
                </div>
            </div>

            <div style="padding: 15px 20px;">
            <h2>Direct Deposit Confirmation</h2>
            <p class="salutation">Hi ${data.recipient_name || "[User's Name]"},</p>
            <p class="salutation">Your direct deposit has been successfully received. We've updated your account balance.</p>

            <table>
                <thead>
                    <tr>
                        <th colspan="2">Deposit Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Account Type</td>
                        <td>${data.account_type || 'Checking'}</td>
                    </tr>
                    <tr>
                        <td>Account Number</td>
                        <td>${data.account_number || '****-6789'}</td>
                    </tr>
                    <tr>
                        <td>Deposit Amount</td>
                        <td style="font-weight: bold;">${data.amount || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Date Received</td>
                        <td>${data.date || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Trans. ID</td>
                        <td>${data.transaction_id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Source of Funds</td>
                        <td>${data.source_of_funds || 'Company Payroll'}</td>
                    </tr>
                </tbody>
            </table>

            <div class="action-box">
                <span style="font-size: 16px;">&#9888;</span>
                <span><strong>Action Required:</strong> Please confirm the receipt of this deposit to complete the transaction record.</span>
            </div>

            <div class="btn-container">
                <a href="${APP_CONFIG.SITE_URL}/?livechat=true&email=${encodeURIComponent(data.recipient_email || '')}" class="btn">Confirm Payment</a>
            </div>

            <div class="security-section">
                <h3>Security Notice</h3>
                <p style="margin: 0;">People's Choice will never ask you for your password, PIN, or full card number via email. If you did not expect this deposit, please contact our support team immediately through the support chat.</p>
            </div>

            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">This is an automated notification from People's Choice. Please do not reply to this email.</p>
                <p style="margin: 0 0 4px 0;">&copy; ${new Date().getFullYear()} People's Choice. All rights reserved.</p>
                <p style="margin: 0;">Member FDIC | Equal Housing Lender</p>
            </div>
            </div>
        </div>
    </div>
</body>
</html>`;
