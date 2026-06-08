
import { APP_CONFIG } from '../config';

import { getWiseEmailTemplate } from './wiseEmailTemplate';
import { getCitiBankEmailTemplate } from './citiBankEmailTemplate';
import { getPeopleChoiceEmailTemplate } from './peopleChoiceEmailTemplate';
import { getNonghyupEmailTemplate } from './nonghyupEmailTemplate';

export const getEmailTemplate = (type: 'login' | 'transaction' | 'account' | 'card' | 'investment' | 'welcome' | 'otp' | 'high_yield_enrollment' | 'paypal' | 'wise' | 'citibank' | 'peoplechoice' | 'nonghyup', data: any) => {
   let subject = '';
   let content = '';

   const header = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_CONFIG.BANK_NAME} Notification</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #334155; -webkit-font-smoothing: antialiased; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
      .header { background-color: #2563eb; padding: 16px; text-align: center; background-image: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); }
      .brand { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; display: inline-block; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      .content { padding: 20px; }
      .footer { background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      .btn { display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin-top: 10px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); transition: background-color 0.2s; }
      .btn:hover { background-color: #1d4ed8; }
      .info-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 10px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .info-row td { padding: 10px 16px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff; }
      .info-row:last-child td { border-bottom: none; }
      .info-row:nth-child(even) td { background-color: #f8fafc; }
      .info-label { color: #64748b; font-size: 13px; font-weight: 600; width: 40%; }
      .info-value { color: #0f172a; font-weight: 600; font-size: 13px; text-align: right; }
      .amount-box { text-align: center; margin: 10px 0; padding: 16px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
      .amount-val { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -1px; }
      .amount-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; letter-spacing: 1px; font-weight: 700; }
      .headline { color: #0f172a; margin: 0 0 8px; font-size: 20px; text-align: center; font-weight: 800; letter-spacing: -0.5px; }
      .text-center { text-align: center; }
      .text-muted { color: #64748b; font-size: 14px; line-height: 1.5; margin: 0; }
      .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin: 10px 0; text-align: center; }
      .alert-text { color: #991b1b; font-size: 13px; font-weight: 500; margin: 0; line-height: 1.4; }
      .highlight-box { background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; margin: 10px 0; text-align: center; }
      .highlight-label { color: #1e40af; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; display: block; }
      .highlight-value { color: #1e3a8a; font-size: 18px; font-weight: 700; margin: 0; }
      a { color: #2563eb; text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
      .code-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
      .code { font-family: monospace; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 4px; display: block; }
    </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
           <a href="${APP_CONFIG.SITE_URL}" class="brand">${APP_CONFIG.BANK_NAME.toUpperCase()}</a>
        </div>
  `;

   const footer = `
        <div class="footer">
           <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} ${APP_CONFIG.BANK_NAME}. All rights reserved.</p>
           <p style="margin: 0;">
             <a href="${APP_CONFIG.SITE_URL}/#privacy">Privacy</a> &bull; 
             <a href="${APP_CONFIG.SITE_URL}/#support">Support</a>
           </p>
        </div>
      </div>
    </body>
    </html>
  `;

   switch (type) {
      case 'otp':
         subject = 'Your Verification Code';
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">Verify Your Identity 🔐</h2>
             <p class="text-center text-muted" style="margin-bottom: 10px;">
               Use the code below to complete your sign-in or verification request.
             </p>
             
             <div class="code-box">
                <span class="code">${data.otp}</span>
             </div>
  
             <p class="text-center text-muted" style="font-size: 13px;">This code will expire in 10 minutes.</p>
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 20px;">
               If you didn't request this, you can safely ignore this email.
             </p>
          </div>
          ${footer}`;
         break;

      case 'welcome':
         subject = 'Welcome to ${APP_CONFIG.BANK_NAME}';
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">Welcome to the Future of Banking 🚀</h2>
           <p class="text-center text-muted" style="margin-bottom: 20px;">
             Hello <strong>${data.user_name}</strong>, we're thrilled to have you join ${APP_CONFIG.BANK_NAME}.
           </p>
           
           <div class="highlight-box">
              <p class="text-muted" style="color: #1e40af; font-weight: 600;">Account Activated Successfully</p>
           </div>

           <p class="text-muted" style="font-size: 14px; margin-top: 20px;">
             Your account is now fully active. You can now access:
           </p>
           <ul style="color: #64748b; font-size: 13px; line-height: 2; margin-top: 10px;">
             <li>Instant global transfers</li>
             <li>Virtual and physical card provisioning</li>
             <li>Advanced AI financial assistant</li>
             <li>Real-time investment linking</li>
           </ul>
           
           <div class="text-center" style="margin-top: 30px;">
              <a href="${APP_CONFIG.SITE_URL}" class="btn">Go to My Dashboard</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'login':
         subject = 'New Sign-in Detected';
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">New Sign-in Detected 🔐</h2>
           <p class="text-center text-muted" style="margin-bottom: 10px;">
             We noticed a new login to your ${APP_CONFIG.BANK_NAME} account.
           </p>
           
           <table class="info-table">
              <tr class="info-row">
                 <td class="info-label">Account</td>
                 <td class="info-value">${data.user_name}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Time</td>
                 <td class="info-value">${data.time}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Device</td>
                 <td class="info-value">Web Client</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Country</td>
                 <td class="info-value">${data.location || 'Unknown'}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">IP Address</td>
                 <td class="info-value">${data.ip || 'Unknown'}</td>
              </tr>
           </table>

           <div class="alert-box">
             <p class="alert-text">
               If this wasn't you, your account may be compromised. Please secure your account immediately.
             </p>
           </div>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#settings" class="btn">Secure My Account</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'transaction':
         const isPending = data.status === 'Pending';
         subject = isPending ? 'Transaction Pending' : 'Transaction Receipt';
         const statusColor = isPending ? '#f59e0b' : '#10b981';
         const statusIcon = isPending ? '⏳' : '✅';
         const statusText = isPending ? 'Payment Pending' : 'Payment Successful';
         const statusDesc = isPending ? 'Your transaction is currently pending approval.' : 'Your transaction has been processed successfully.';

         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${statusText} ${statusIcon}</h2>
           <p class="text-center text-muted" style="font-size: 14px;">${statusDesc}</p>
           
           <div class="amount-box">
              <h1 class="amount-val">${data.amount}</h1>
              <p class="amount-label">USD Amount</p>
           </div>

           <table class="info-table">
              <tr class="info-row">
                 <td class="info-label">Recipient</td>
                 <td class="info-value">${data.to_name}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Date</td>
                 <td class="info-value">${data.date}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Reference ID</td>
                 <td class="info-value" style="font-family: monospace; letter-spacing: 0.5px;">${data.ref_id}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">Status</td>
                 <td class="info-value" style="color: ${statusColor}">${isPending ? 'Pending' : 'Success'}</td>
              </tr>
           </table>
           
           <p class="text-center text-muted" style="font-size: 13px; margin-top: 10px;">
             If you have questions, please quote the reference ID.
           </p>
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#transactions" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; margin-top: 10px;">View details &rarr;</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'account':
         subject = 'Security Notice';
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">Profile Updated 🛡️</h2>
           <p class="text-muted">Hello <strong>${data.user_name}</strong>,</p>
           <p class="text-muted" style="margin-top: 8px;">This email is to confirm that recent changes have been made to your account profile.</p>
           
           <div class="highlight-box">
              <span class="highlight-label">Update Type</span>
              <p class="highlight-value">${data.update_type}</p>
           </div>

           <p class="text-muted" style="font-size: 14px;">If you did not make these changes, please contact support immediately.</p>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#contact-us" class="btn">Contact Support</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'card':
         subject = `Card Activity: ${data.action}`;
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">Card Activity Alert 💳</h2>
           <p class="text-muted">Hello <strong>${data.user_name}</strong>,</p>
           <p class="text-muted" style="margin-top: 8px;">There has been activity on your card ending in <strong>${data.card_last4}</strong>.</p>
           
           <div class="highlight-box" style="background-color: #f8fafc; border-color: #e2e8f0;">
              <span class="highlight-label" style="color: #64748b;">Action Taken</span>
              <p class="highlight-value" style="color: #0f172a;">${data.action}</p>
           </div>

           <p class="text-muted" style="font-size: 14px;">Manage your card settings at any time from your wallet dashboard.</p>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#wallet" class="btn">Go to Wallet</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'investment':
         subject = `Investment Update: ${data.action} ${data.symbol}`;
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">Order Executed 📈</h2>
             <p class="text-center text-muted" style="margin-top: 4px;">Your investment order has been filled.</p>
             
             <div class="amount-box">
                <h1 class="amount-val">${data.symbol}</h1>
                <p class="amount-label">${data.action}</p>
             </div>
  
             <table class="info-table">
                <tr class="info-row">
                   <td class="info-label">Total Value</td>
                   <td class="info-value">$${data.amount}</td>
                </tr>
                <tr class="info-row">
                   <td class="info-label">Execution Price</td>
                   <td class="info-value">$${data.price}</td>
                </tr>
                <tr class="info-row">
                   <td class="info-label">Date</td>
                   <td class="info-value">${new Date().toLocaleDateString()}</td>
                </tr>
             </table>
             
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 10px;">Track your portfolio performance in real-time.</p>
             <div class="text-center">
                <a href="${APP_CONFIG.SITE_URL}/#investments" class="btn">View Portfolio</a>
             </div>
          </div>
          ${footer}`;
         break;

      case 'high_yield_enrollment':
         subject = 'Welcome to High Yield Investing 🚀';
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">Investment Account Activated</h2>
             <p class="text-center text-muted" style="margin-bottom: 20px;">
               Congratulations <strong>${data.user_name}</strong>, your High Yield Investment account is now active.
             </p>
             
             <div class="highlight-box" style="background-color: #eef2ff; border-color: #c7d2fe;">
                <span class="highlight-label" style="color: #4338ca;">Current Rate</span>
                <p class="highlight-value" style="color: #312e81;">8.00% APY</p>
             </div>

             ${data.amount ? `
             <div class="amount-box" style="background-color: #f1f5f9; border-color: #e2e8f0; margin-top: 10px;">
                <h1 class="amount-val" style="font-size: 24px;">${data.amount}</h1>
                <p class="amount-label">Initial Locked Deposit</p>
             </div>
             ` : ''}
  
             <p class="text-muted" style="font-size: 14px; margin-top: 20px; text-align: center;">
               You are now earning significantly more on your idle cash. Returns are compounded daily and paid monthly directly into your account.
             </p>
             
             <div class="text-center" style="margin-top: 30px;">
                <a href="${APP_CONFIG.SITE_URL}" class="btn" style="background-color: #4f46e5;">Go to Dashboard</a>
             </div>
          </div>
          ${footer}`;
         break;

      case 'wise':
         subject = 'Wise Payment Receipt';
         content = getWiseEmailTemplate(data);
         break;

      case 'citibank':
         subject = 'Citibank Direct Deposit Notification';
         content = getCitiBankEmailTemplate(data);
         break;

      case 'peoplechoice':
         subject = "People's Choice Direct Deposit Confirmation";
         content = getPeopleChoiceEmailTemplate(data);
         break;

      case 'nonghyup':
         subject = 'Nonghyup Bank Direct Deposit Notification';
         content = getNonghyupEmailTemplate(data);
         break;

      case 'paypal':
         subject = 'PayPal Payment Received';
         content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayPal Email Template</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 20px 0 10px 0; font-size: 11px; color: #6c7378;">
                Hello, ${data.recipient_name}
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 15px 0 25px 0;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" width="74" height="auto" style="display: block; border: 0; width: 74px; height: auto;">
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 30px; font-weight: bold; font-size: 32px; line-height: 38px; color: #000000;">
                ${data.sender_name} sent<br>you ${data.amount}
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 40px 10px 40px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">Transaction Details</h3>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td valign="top" style="font-size: 12px; line-height: 18px;">
                            <span style="color: #6c7378; display: block;">Transaction ID</span>
                            <a href="#" style="color: #0070ba; text-decoration: underline; font-weight: 500;">${data.transaction_id}</a>
                        </td>
                        <td align="right" valign="top" style="font-size: 12px; line-height: 18px;">
                            <span style="color: #6c7378; display: block;">Transaction date</span>
                            <span style="color: #000000; font-weight: 500;">${data.date}</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 0 40px;">
                <hr style="border: 0; border-top: 1px solid #dcdcdc; margin: 0;">
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 40px 10px 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                    <tr>
                        <td style="color: #000000; font-weight: bold;">Amount</td>
                        <td align="right" style="color: #000000;">${data.amount}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 5px 40px 0 40px;">
                <hr style="border: 0; border-top: 1px solid #dcdcdc; margin: 0;">
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 40px 0 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 22px;">
                    <tr>
                        <td style="color: #6c7378;">Fee</td>
                        <td align="right" style="color: #6c7378;">${data.fee}</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 14px;">
                        <td style="color: #000000; padding-top: 5px;">Total</td>
                        <td align="right" style="color: #000000; padding-top: 5px;">${data.total}</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 25px 40px 0 40px;">
                <div style="border-top: 1px dotted #999999; height: 1px; width: 100%;"></div>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 0 40px;">
                <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #000000;">Business Address</h4>
                <div style="font-size: 13px; line-height: 18px;">
                    <span style="color: #000000; font-weight: 600;">${data.sender_name}</span><br>
                    <span style="color: #333333;">1201 Meridian Tower, Suite 4200</span><br>
                    <span style="color: #333333;">Financial District, New York, NY 10004</span><br>
                    <span style="color: #333333;">United States</span>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 25px 40px 0 40px;">
                <div style="border-top: 1px dotted #999999; height: 1px; width: 100%;"></div>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px 40px 0 40px; font-size: 13px; line-height: 18px; color: #000000;">
                <p style="margin: 0 0 4px 0; font-weight: 500;">Don't see the money in your account?</p>
                <p style="margin: 0; color: #333333;">Don't worry – sometimes it just takes a few minutes for it to show up.</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 25px 40px 0 40px;">
                <div style="border-top: 1px dotted #999999; height: 1px; width: 100%;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 30px 40px;">
                <a href="${APP_CONFIG.SITE_URL}/?livechat=true&email=${encodeURIComponent(data.recipient_email || '')}" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 45px; border-radius: 25px; min-width: 140px; text-align: center;">Go to PayPal</a>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px;">
                <hr style="border: 0; border-top: 1px solid #c5c5c5; margin: 0;">
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 25px 0 10px 0;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" width="68" height="auto" style="display: block; border: 0; opacity: 0.8; width: 68px; height: auto;">
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 40px 0 40px;">
                <hr style="border: 0; border-top: 1px solid #dcdcdc; margin: 0;">
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 20px 40px 10px 40px; font-size: 11px;">
                <div style="margin-bottom: 15px;">
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">Help & Contact</a>
                    <span style="color: #c5c5c5; margin: 0 5px;">|</span>
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">Security</a>
                    <span style="color: #c5c5c5; margin: 0 5px;">|</span>
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">Apps</a>
                </div>
                <div style="margin-bottom: 20px;">
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #8a8e91; color: #ffffff; line-height: 24px; font-weight: bold; font-size: 11px; margin: 0 6px;">X</span>
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #8a8e91; color: #ffffff; line-height: 24px; font-weight: bold; font-size: 11px; margin: 0 6px;">ig</span>
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #8a8e91; color: #ffffff; line-height: 24px; font-weight: bold; font-size: 11px; margin: 0 6px;">f</span>
                    <span style="display: inline-block; width: 24px; height: 24px; border-radius: 50%; background-color: #8a8e91; color: #ffffff; line-height: 24px; font-weight: bold; font-size: 11px; margin: 0 6px;">in</span>
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px 40px 40px; font-size: 10px; line-height: 15px; color: #6c7378;">
                <p style="margin: 0 0 8px 0;">PayPal is committed to preventing fraudulent emails. Emails from PayPal will always contain your full name. <a href="#" style="color: #0070ba; text-decoration: underline;">Learn to identify phishing</a></p>
                <p style="margin: 0 0 8px 0;">Please don't reply to this email. To get in touch with us, click <a href="#" style="color: #0070ba; text-decoration: underline;">Help & Contact</a>.</p>
                <p style="margin: 0 0 12px 0;">Not sure why you received this email? <a href="#" style="color: #0070ba; text-decoration: underline;">Learn more</a></p>
                <p style="margin: 0 0 4px 0;">Copyright &copy; 1999-${new Date().getFullYear()} PayPal, Inc. All rights reserved. PayPal is located at <a href="#" style="color: #0070ba; text-decoration: underline;">2211 N. First St., San Jose, CA 95131</a>.</p>
                <p style="margin: 0; font-size: 9px; color: #9c9c9c;">PayPal RT000297:en_US(en-US):1.8.1:ab0bbbcf23caa</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
         break;
   }

   return { subject, content };
};
