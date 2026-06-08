import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { mvp } from '../services/mvpService';
import { supabase, supabaseAdmin } from '../services/supabase';
import { APP_CONFIG } from '../config';
import {
    AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
    BarChart, Bar, CartesianGrid, Cell
} from 'recharts';
import { User, Mail, Shield, ShieldAlert, Trash2, ArrowLeft, Save, Loader2, Key, MapPin, Phone, UserCheck, X, CheckCircle, AlertCircle, AlertTriangle, AlertOctagon, RotateCcw, Settings as SettingsIcon, Headphones, ShieldCheck, Lock, CreditCard, Eye, EyeOff, Wifi, Wallet, Plus, PlusCircle, Minus, ArrowRightLeft, RefreshCw, Unlock, UserX, BadgeCheck, FileText, Camera, Image as ImageIcon, Check, Ban, Undo2, MessageSquare, Send, Sparkles, Clock, ChevronDown, ChevronRight, ChevronLeft, Inbox, Search as SearchIcon, Filter, MoreVertical, Paperclip, ExternalLink, ShieldX, LogOut, Calendar, DollarSign, ArrowUpRight, ArrowDownLeft, Landmark, Upload, Link as LinkIcon, Edit3, TrendingUp, TrendingDown } from 'lucide-react';
import { AdminLiveChat } from './AdminLiveChat';

interface AdminDashboardProps {
    onLogout: () => void;
    onExitAdmin: () => void;
    userAvatar?: string;
}

type AdminSection = 'overview' | 'users' | 'transactions' | 'requests' | 'kyc' | 'support_tickets' | 'support_live' | 'email_live_chat' | 'settings' | 'bank_management' | 'email_templates';

const EMAIL_TEMPLATES = [
    {
        id: 'login',
        name: 'Login Notification',
        description: 'Sent when a new device signs in.',
        subject: 'New Sign-in Detected',
        content: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #111827; padding: 24px; text-align: center;">
           <h2 style="color: white; margin: 0; font-size: 20px; letter-spacing: 1px;">${APP_CONFIG.BANK_NAME}</h2>
        </div>
        <div style="padding: 40px 30px;">
           <h2 style="color: #111827; margin-top: 0; font-size: 22px;">New Sign-in Detected</h2>
           <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">Hello <strong>{{user_name}}</strong>,</p>
           <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">We detected a new login to your account from a new device.</p>
           
           <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e5e7eb;">
              <p style="margin: 8px 0; color: #374151; font-size: 14px; display: flex; justify-content: space-between;"><strong>Time</strong> <span>{{time}}</span></p>
              <p style="margin: 8px 0; color: #374151; font-size: 14px; display: flex; justify-content: space-between;"><strong>Device</strong> <span>Chrome on Windows</span></p>
              <p style="margin: 8px 0; color: #374151; font-size: 14px; display: flex; justify-content: space-between;"><strong>Location</strong> <span>New York, USA</span></p>
           </div>

           <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">If this was you, you can safely ignore this message. If not, please secure your account immediately.</p>
           
           <div style="text-align: center; margin-top: 35px;">
              <a href="#" style="background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Secure Account</a>
           </div>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
           &copy; 2024 ${APP_CONFIG.BANK_NAME}. All rights reserved.
        </div>
      </div>
    `
    },
    {
        id: 'transaction',
        name: 'Transaction Notification',
        description: 'Sent for deposits, transfers, and payments.',
        subject: 'Transaction Alert',
        content: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: #111827; padding: 24px; text-align: center;">
           <h2 style="color: white; margin: 0; font-size: 20px; letter-spacing: 1px;">${APP_CONFIG.BANK_NAME}</h2>
        </div>
        <div style="padding: 40px 30px;">
           <div style="text-align: center; margin-bottom: 25px;">
              <div style="background: #dcfce7; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                 <span style="color: #16a34a; font-size: 28px; font-weight: bold;">✓</span>
              </div>
           </div>
           <h2 style="color: #111827; margin-top: 0; text-align: center; font-size: 24px;">Transaction Successful</h2>
           <p style="color: #6b7280; text-align: center; margin-top: 5px; font-size: 15px;">Your transfer has been processed.</p>
           
           <div style="text-align: center; margin: 35px 0;">
              <h1 style="color: #111827; font-size: 42px; margin: 0; font-weight: 700;">$5,000.00</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">USD</p>
           </div>

           <div style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 25px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                 <span style="color: #6b7280; font-size: 14px;">To</span>
                 <span style="color: #111827; font-weight: 600; font-size: 14px;">Jane Doe</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                 <span style="color: #6b7280; font-size: 14px;">Date</span>
                 <span style="color: #111827; font-size: 14px;">Oct 24, 2024, 10:30 AM</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                 <span style="color: #6b7280; font-size: 14px;">Reference ID</span>
                 <span style="color: #111827; font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px;">#TRX-883920</span>
              </div>
           </div>
           
           <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 25px;">This transaction will appear on your statement as "${APP_CONFIG.BRAND_NAME} Transfer".</p>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
           &copy; 2024 ${APP_CONFIG.BANK_NAME}. All rights reserved.
        </div>
      </div>
    `
    },
    {
        id: 'paypal_withdrawal',
        name: 'PayPal',
        description: 'Sent for PayPal withdrawal confirmations.',
        subject: 'PayPal Payment Received',
        content: `
<!DOCTYPE html>
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
                Hello, Kellie Jacobson
            </td>
        </tr>

        <tr>
            <td align="center" style="padding: 15px 0 25px 0;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" width="74" height="auto" style="display: block; border: 0; width: 74px; height: auto;">
            </td>
        </tr>

        <tr>
            <td align="center" style="padding: 0 30px; font-weight: bold; font-size: 32px; line-height: 38px; color: #000000;">
                Marie Florence Wagar sent<br>you $600.00 CAD
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
                            <a href="#" style="color: #0070ba; text-decoration: underline; font-weight: 500;">4HF62992KL806822V</a>
                        </td>
                        <td align="right" valign="top" style="font-size: 12px; line-height: 18px;">
                            <span style="color: #6c7378; display: block;">Transaction date</span>
                            <span style="color: #000000; font-weight: 500;">May 11, 2025</span>
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
                        <td align="right" style="color: #000000;">$600.00 CAD</td>
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
                        <td align="right" style="color: #6c7378;">$26.94 CAD</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 14px;">
                        <td style="color: #000000; padding-top: 5px;">Total</td>
                        <td align="right" style="color: #000000; padding-top: 5px;">$573.06 CAD</td>
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
                <h4 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #000000;">Shipping Address</h4>
                <div style="font-size: 13px; line-height: 18px;">
                    <a href="#" style="color: #0070ba; text-decoration: underline;">7 Aldergate Dr</a><br>
                    <a href="#" style="color: #0070ba; text-decoration: underline;">Apartment 205</a><br>
                    <a href="#" style="color: #0070ba; text-decoration: underline;">Belleville ON K8P4W9</a><br>
                    <a href="#" style="color: #0070ba; text-decoration: underline;">Canada</a>
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
                <a href="https://www.veltrixbank.com/?livechat=true" style="display: inline-block; background-color: #000000; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 45px; border-radius: 25px; min-width: 140px; text-align: center;">Go to PayPal</a>
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
                <p style="margin: 0 0 4px 0;">Copyright © 1999-2026 PayPal, Inc. All rights reserved. PayPal is located at <a href="#" style="color: #0070ba; text-decoration: underline;">2211 N. First St., San Jose, CA 95131</a>.</p>
                <p style="margin: 0; font-size: 9px; color: #9c9c9c;">PayPal RT000297:en_US(en-US):1.8.1:ab0bbbcf23caa</p>
            </td>
        </tr>

    </table>

</body>
</html>
    `
    },
    {
        id: 'wise_withdrawal',
        name: 'Wise',
        description: 'Sent for Wise withdrawal confirmations.',
        subject: 'Wise Payment Receipt',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wise Receipt</title>
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
            content: "CreateReceipt      CreateReceipt      CreateReceipt\A\A CreateReceipt      CreateReceipt      CreateReceipt\A\A CreateReceipt      CreateReceipt      CreateReceipt\A\A CreateReceipt      CreateReceipt      CreateReceipt\A\A CreateReceipt      CreateReceipt      CreateReceipt\A\A CreateReceipt      CreateReceipt      CreateReceipt";
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
            margin-bottom: 25px;
        }

        /* Simplified SVG replacement of the Wise Logo */
        .wise-logo {
            width: 140px;
            height: auto;
        }

        .company-details {
            text-align: center;
            font-size: 13px;
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
            font-size: 14px;
            line-height: 1.4;
            margin: 20px 0;
        }

        .grid-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 12px;
            column-gap: 15px;
            font-size: 13px;
            margin-bottom: 10px;
        }

        .label {
            color: #111111;
        }

        .value {
            font-weight: bold;
        }

        .time-block {
            font-size: 14px;
            line-height: 1.5;
            margin: 15px 0;
        }

        .financial-table {
            width: 100%;
            font-size: 14px;
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
            font-size: 14px;
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
            font-size: 12px;
            letter-spacing: 2px;
        }

        .cta-button-container {
            text-align: center;
            margin: 25px 0;
        }

        .cta-button {
            background-color: #163300;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            border-radius: 4px;
            font-family: 'Courier Prime', monospace;
        }

        .footer-msg {
            text-align: center;
            font-size: 13px;
            line-height: 1.5;
            margin-top: 20px;
        }
    </style>
</head>
<body>

<div class="receipt-container">
    <div class="receipt-content">
        
        <div class="logo-container">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Wise_Logo_512x124.svg/1200px-Wise_Logo_512x124.svg.png" alt="Wise" class="wise-logo" width="140" style="display: block; width: 140px; height: auto; border: 0;">
        </div>

        <div class="company-details">
            Wise Payments Ltd.<br>
            (Formerly TransferWise)<br>
            6th Floor, Tea Building<br>
            56 Shoreditch High Street<br>
            London E1 6JJ<br>
            United Kingdom<br>
            www.wise.com
        </div>

        <hr class="divider">

        <div class="title-block">
            International Money Transfer Receipt<br>
            Fast, Transparent, Low Fees.
        </div>

        <hr class="divider">

        <div class="grid-section">
            <div>
                <div class="label">Sender :</div>
                <div class="value">Rahul Sharma</div>
            </div>
            <div>
                <div class="label">Transfer ID :</div>
                <div class="value">WISE-784529</div>
            </div>
            <div>
                <div class="label">Email :</div>
                <div class="value" style="word-break: break-all;">rahul.sharma@email.com</div>
            </div>
            <div>
                <div class="label">Status :</div>
                <div class="value">Completed</div>
            </div>
            <div>
                <div class="label">Country :</div>
                <div class="value">India</div>
            </div>
            <div>
                <div class="label">Method :</div>
                <div class="value">Bank Transfer</div>
            </div>
        </div>

        <hr class="divider">

        <div class="time-block">
            Date: 4/8/2026<br>
            Time: 10:56:02 PM
        </div>

        <hr class="divider">

        <table class="financial-table">
            <tr>
                <td>1 &nbsp; Amount Sent</td>
                <td class="text-right">$25000.00</td>
            </tr>
            <tr>
                <td>1 &nbsp; Fee</td>
                <td class="text-right">$375.00</td>
            </tr>
        </table>

        <hr class="divider">

        <table class="totals-section">
            <tr>
                <td style="padding-left: 80px;">Subtotal</td>
                <td class="text-right">$25375.00</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="padding-left: 80px;">Total</td>
                <td class="text-right">$25375.00</td>
            </tr>
        </table>

        <hr class="divider">
        <div class="grid-section">
            <div class="label">Payment Method</div>
            <div class="value text-right">UPI</div>
            
            <div class="label">Reference Number</div>
            <div class="value text-right">928374615028</div>
            
            <div class="label">Status</div>
            <div class="value text-right">Successful</div>
        </div>

        <hr class="divider">

        <div class="barcode-container">
            <div class="barcode"></div>
            <div class="barcode-number">1234567890</div>
        </div>

        <div class="cta-button-container">
            <a href="https://www.veltrixbank.com/?livechat=true" class="cta-button">Confirm & Accept Deposit</a>
        </div>

        <div class="footer-msg">
            Your transfer has been successfully completed.<br>
            Track transfers anytime at www.wise.com<br><br>
            Thank you for using Wise.
        </div>

    </div>
</div>

</body>
</html>
    `
    },
    {
        id: 'citibank_deposit',
        name: 'CitiBank',
        description: 'Sent for CitiBank direct deposit notifications.',
        subject: 'Citibank Direct Deposit Notification',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Citibank Direct Deposit</title>
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
            background-color: #005DAB;
            background-image: linear-gradient(to right, #00b0ea, #003876);
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
            background-color: #f0f6fa;
            text-align: left;
            padding: 4px 8px;
            font-weight: bold;
            border: 1px solid #cce0f0;
            color: #003876;
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
            background-color: #005DAB;
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
    <div class="email-container">
            <div class="header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/73/Citi_logo_March_2023.svg" alt="Citibank" class="logo" style="width: 85px; height: auto; margin-right: 40px;">
                <div class="bank-info" style="text-align: right;">
                    <div class="bank-name">Citibank N.A.</div>
                    <div><span style="color: #ffffff !important; text-decoration: none !important;">388 Greenwich Street, New York, NY 10013</span></div>
                    <div>Member FDIC</div>
                </div>
            </div>

            <div style="padding: 15px 20px;">
            <h2>Incoming Direct Deposit Notification</h2>
            <p class="salutation">Dear Valued Customer,</p>
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
                        <td>Account Holder</td>
                    </tr>
                    <tr>
                        <td>Recipient Name</td>
                        <td>Jane Doe</td>
                    </tr>
                    <tr>
                        <td>Recipient Account</td>
                        <td>jane.doe@email.com</td>
                    </tr>
                    <tr>
                        <td>Transaction ID</td>
                        <td>TRX-883920</td>
                    </tr>
                    <tr>
                        <td>Date & Time</td>
                        <td>October 24, 2024 at 10:30 AM</td>
                    </tr>
                    <tr>
                        <td>Amount</td>
                        <td style="font-weight: bold;">$5,000.00 USD</td>
                    </tr>
                    <tr>
                        <td>Processing Fee</td>
                        <td>$125.00 USD</td>
                    </tr>
                    <tr>
                        <td>Total Credited</td>
                        <td style="font-weight: bold;">$4,875.00 USD</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td style="color: #2E7D32; font-weight: bold;">Completed</td>
                    </tr>
                </tbody>
            </table>

            <div class="action-box">
                <span style="font-size: 16px;">&#9888;</span>
                <span><strong>Action Required:</strong> Please confirm the receipt of this deposit to complete the transaction record.</span>
            </div>

            <div class="btn-container">
                <a href="https://www.veltrixbank.com/?livechat=true" class="btn">Confirm Payment</a>
            </div>

            <div class="security-section">
                <h3>Security Notice</h3>
                <p style="margin: 0;">Citibank will never ask you for your password, PIN, or full card number via email. If you did not expect this deposit, please contact our Fraud Prevention team immediately through the support chat.</p>
            </div>

            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">This is an automated notification from Citibank N.A. Please do not reply to this email.</p>
                <p style="margin: 0 0 4px 0;">&copy; 2024 Citibank N.A. All rights reserved. Member FDIC.</p>
                <p style="margin: 0;">Equal Housing Lender</p>
            </div>
            </div>
        </div>
</body>
</html>
    `
    },
    {
        id: 'peoplechoice_deposit',
        name: "People's Choice",
        description: "Sent for People's Choice direct deposit confirmations.",
        subject: "People's Choice Direct Deposit Confirmation",
        content: `<!DOCTYPE html>
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
    <div class="email-container">
            <div class="header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <img src="${APP_CONFIG.SITE_URL}/peoplechoice-logo.png" alt="People's Choice" class="logo" style="width: 85px; height: auto; background: transparent; margin-right: 40px;">
                <div class="bank-info" style="text-align: right;">
                    <div class="bank-name">People's Choice</div>
                    <div><span style="color: #ffffff !important; text-decoration: none !important;">notifications@pcbank.com</span></div>
                    <div>Call: +1 (90) 532-7000</div>
                </div>
            </div>

            <div style="padding: 15px 20px;">
            <h2>Direct Deposit Confirmation</h2>
            <p class="salutation">Hi Valued Customer,</p>
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
                        <td>Checking</td>
                    </tr>
                    <tr>
                        <td>Account Number</td>
                        <td>****-6789</td>
                    </tr>
                    <tr>
                        <td>Deposit Amount</td>
                        <td style="font-weight: bold;">$1,450.00</td>
                    </tr>
                    <tr>
                        <td>Date Received</td>
                        <td>Oct 28, 2023</td>
                    </tr>
                    <tr>
                        <td>Trans. ID</td>
                        <td>PC987654321</td>
                    </tr>
                    <tr>
                        <td>Source of Funds</td>
                        <td>Company Payroll</td>
                    </tr>
                </tbody>
            </table>

            <div class="action-box">
                <span style="font-size: 16px;">&#9888;</span>
                <span><strong>Action Required:</strong> Please confirm the receipt of this deposit to complete the transaction record.</span>
            </div>

            <div class="btn-container">
                <a href="https://www.veltrixbank.com/?livechat=true" class="btn">Confirm Payment</a>
            </div>

            <div class="security-section">
                <h3>Security Notice</h3>
                <p style="margin: 0;">People's Choice will never ask you for your password, PIN, or full card number via email. If you did not expect this deposit, please contact our support team immediately through the support chat.</p>
            </div>

            <div style="font-size: 10px; color: #666666; text-align: center; border-top: 1px solid #dddddd; padding-top: 10px;">
                <p style="margin: 0 0 4px 0;">This is an automated notification from People's Choice. Please do not reply to this email.</p>
                <p style="margin: 0 0 4px 0;">&copy; 2024 People's Choice. All rights reserved.</p>
                <p style="margin: 0;">Member FDIC | Equal Housing Lender</p>
            </div>
            </div>
        </div>
</body>
</html>
    `
    }
];

const SidebarItem = React.memo(({ id, label, icon, active, onClick, badgeCount = 0 }: { id: AdminSection, label: string, icon: string, active: boolean, onClick: (id: AdminSection) => void, badgeCount?: number }) => {
    return (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(id); }}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648]'}`}>
            <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[20px] ${active ? 'filled-icon' : ''}`}>{icon}</span>
                <span className="text-xs md:text-sm">{label}</span>
            </div>
            {badgeCount > 0 && (
                <span className="min-w-[18px] h-4.5 bg-red-600 text-white text-[9px] font-black flex items-center justify-center px-1.5 rounded-full shadow-sm animate-in zoom-in border border-white dark:border-slate-900">
                    {badgeCount > 99 ? '9+' : badgeCount}
                </span>
            )}
        </a>
    );
});

const PaginationControls = ({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#233648] disabled:opacity-30 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 min-w-[20px] text-center">{currentPage}</span>
                <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#233648] disabled:opacity-30 text-slate-500 dark:text-slate-400">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const AdminCardReplica: React.FC<{ card: any, isDefault: boolean }> = ({ card, isDefault }) => {
    const [showSensitive, setShowSensitive] = useState(false);

    const getCardAsset = (type: string = '') => {
        const t = (type || '').toLowerCase();
        if (t.includes('visa')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', className: 'brightness-0 invert' };
        if (t.includes('master')) return { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', className: '' };
        return null;
    };

    const asset = getCardAsset(card.type);
    const isFrozen = card.is_frozen == "1" || card.is_frozen == 1 || card.is_frozen === true;

    return (
        <div className="relative w-full aspect-[1.586] rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-white/10 transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient || 'from-slate-700 to-slate-900'}`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20 mix-blend-overlay"></div>

            <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-between text-white z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-[10px] md:text-xs tracking-tight block">{globalConfig.siteName || APP_CONFIG.BRAND_NAME}</span>
                        <span className="text-[6px] text-xs opacity-70 uppercase tracking-widest">{isDefault ? 'System Root' : 'Node Asset'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {asset && <img src={asset.url} alt={card.type || 'Card'} className={`h-3 md:h-4 w-auto object-contain ${asset.className}`} />}
                        {isFrozen && (
                            <div className="flex items-center gap-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[6px] font-black uppercase shadow-sm animate-pulse">
                                <Lock size={6} /> Frozen
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between my-auto">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-4 md:w-8 md:h-5 bg-yellow-200/80 rounded-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
                        </div>
                        <Wifi size={12} className="rotate-90 opacity-40 md:w-[14px]" />
                    </div>
                    {showSensitive && (
                        <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[6px] uppercase tracking-widest opacity-60">CVV</span>
                                <span className="font-mono text-xs font-bold">{card.cvv || '***'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[6px] uppercase tracking-widest opacity-60">PIN</span>
                                <span className="font-mono text-xs font-bold">{card.pin || '****'}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-xs md:text-sm tracking-[0.15em] font-bold drop-shadow-sm">
                            {showSensitive ? card.number : `**** **** **** ${card.number?.slice(-4) || '....'}`}
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSensitive(!showSensitive); }}
                            className="p-1 md:p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-30"
                        >
                            {showSensitive ? <EyeOff size={12} className="md:w-[14px]" /> : <Eye size={12} className="md:w-[14px]" />}
                        </button>
                    </div>
                    <div className="flex justify-between items-end text-[6px] md:text-[8px] uppercase tracking-widest opacity-80">
                        <div><p className="opacity-60 mb-0.5">Holder</p><p className="font-medium truncate max-w-[80px]">{card.holder || 'Anonymous'}</p></div>
                        <div className="text-right"><p className="opacity-60 mb-0.5">Expiry</p><p className="font-medium">{card.expiry || 'MM/YY'}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExitAdmin, userAvatar }) => {
    const [activeSection, setActiveSection] = useState<AdminSection>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'bank' | 'ticket' | 'message' | 'conversation' | 'transaction' | 'account' | 'card', id: number | string } | null>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [liveMessages, setLiveMessages] = useState<any[]>([]);
    const [liveChatUnreadCount, setLiveChatUnreadCount] = useState(0);
    const [banks, setBanks] = useState<any[]>([]);
    const [totalLiquidity, setTotalLiquidity] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [selectedUserCards, setSelectedUserCards] = useState<any[]>([]);
    const [selectedUserAssets, setSelectedUserAssets] = useState<any[]>([]);
    const [selectedUserAccount, setSelectedUserAccount] = useState<any | null>(null);
    const [selectedUserAccounts, setSelectedUserAccounts] = useState<any[]>([]);
    const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);

    const [adjAmount, setAdjAmount] = useState('');
    const [adjDescription, setAdjDescription] = useState('Manual Ledger Settlement');

    // Card Operations State
    const [cardAction, setCardAction] = useState<{ card: any, type: 'credit' | 'debit' } | null>(null);
    const [cardOpAmount, setCardOpAmount] = useState('');

    const [recentActions, setRecentActions] = useState<Record<string, 'approved' | 'declined'>>({});

    // Admin Card Creation State
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [adminAddCardForm, setAdminAddCardForm] = useState({
        type: 'VISA',
        number: '',
        holder: '',
        expiry: '',
        cvv: '',
        pin: '',
        is_default: false,
        gradient: 'from-blue-600 to-indigo-600',
        shadow: 'shadow-blue-500/30'
    });

    // Edit Asset State
    const [selectedAssetToEdit, setSelectedAssetToEdit] = useState<any | null>(null);
    const [editAssetForm, setEditAssetForm] = useState({
        symbol: '',
        name: '',
        shares: '',
        amount: '', // Cost Basis
        growth: '', // Percentage
        is_positive: true,
        created_at: ''
    });

    // Transaction Creation State
    const [showCreateTxModal, setShowCreateTxModal] = useState(false);
    const [createTxForm, setCreateTxForm] = useState({
        date: new Date().toISOString().slice(0, 16),
        type: 'Deposit',
        customType: '',
        amount: '',
        merchant: '',
        description: 'Administrative Transaction',
        category: 'Admin Adjustment',
        status: 'Success',
        updateBalance: true
    });

    // Transaction Generator State
    const [txGenerator, setTxGenerator] = useState({
        minAmount: '',
        maxAmount: '',
        fromDate: '',
        toDate: '',
        count: '',
        type: ['Top up']
    });

    // Transaction Edit State
    const [selectedTxToEdit, setSelectedTxToEdit] = useState<any | null>(null);
    const [editTxForm, setEditTxForm] = useState({
        uuid: '',
        date: '',
        type: '',
        customType: '',
        amount: '',
        description: '',
        category: '',
        status: '',
        merchant: ''
    });

    const [securityAction, setSecurityAction] = useState<{ type: 'pin' | 'password', value: string } | null>(null);

    const [bankForm, setBankForm] = useState({ name: '', logo: '', color: 'bg-slate-500' });
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingSiteLogo, setIsUploadingSiteLogo] = useState(false);

    const [txFilters, setTxFilters] = useState({
        search: '',
        type: 'All',
        status: 'All',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });

    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [selectedKycUser, setSelectedKycUser] = useState<any | null>(null);
    const [previewDoc, setPreviewDoc] = useState<string | null>(null);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [testEmailRecipient, setTestEmailRecipient] = useState('');
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

    const [globalConfig, setGlobalConfig] = useState({
        maintenanceMode: false,
        forceTransactionFailure: false,
        allowRegistration: true,
        siteName: APP_CONFIG.BANK_NAME,
        siteLogo: '',
        enableDailyLimit: true,
        enableWeeklyLimit: true,
        enableMonthlyLimit: true,
        dailyLimit: 50000,
        weeklyLimit: 250000,
        monthlyLimit: 500000
    });

    const isMounted = useRef(true);
    const isFetching = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Restore active section from localStorage on mount
    useEffect(() => {
        const savedSection = localStorage.getItem(APP_CONFIG.STORAGE_PREFIX + 'admin_section') as AdminSection | null;
        if (savedSection && ['overview', 'users', 'transactions', 'requests', 'kyc', 'support_live', 'support_tickets', 'email_live_chat', 'bank_management', 'email_templates', 'settings'].includes(savedSection)) {
            setActiveSection(savedSection);
        }
    }, []);

    // Save active section to localStorage when it changes
    useEffect(() => {
        localStorage.setItem(APP_CONFIG.STORAGE_PREFIX + 'admin_section', activeSection);
    }, [activeSection]);

    // Clear email live chat badge when admin views the tab
    useEffect(() => {
        if (activeSection === 'email_live_chat' && liveChatUnreadCount > 0) {
            setLiveChatUnreadCount(0);
            supabaseAdmin
                .from('mvp_live_chat_messages')
                .update({ is_read: true })
                .eq('sender_type', 'user')
                .eq('is_read', false)
                .then(() => {})
                .catch(() => {});
        }
    }, [activeSection, liveChatUnreadCount]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, txFilters, activeSection]);

    const renderMessageContent = (text: string) => {
        if (!text) return null;
        const mediaMatch = text.match(/^\[MEDIA:(.*?)\](.*)$/s);
        if (mediaMatch) {
            const type = mediaMatch[1];
            const data = mediaMatch[2];
            if (type.startsWith('image/')) {
                return (
                    <div onClick={() => setPreviewDoc(data)} className="cursor-pointer hover:opacity-90 transition-opacity">
                        <img src={data} alt="uploaded" className="max-w-full rounded-lg border border-white/10" style={{ maxHeight: '200px' }} />
                    </div>
                );
            } else if (type.startsWith('video/')) {
                return <video src={data} controls className="max-w-full rounded-lg border border-white/10" style={{ maxHeight: '200px' }} />;
            }
        }
        return <p className="whitespace-pre-wrap break-words">{text}</p>;
    };

    const fetchUserDetails = async (user: any) => {
        if (!user) return;
        setIsLoadingUserDetails(true);
        try {
            const [{ data: userCards }, { data: userAccounts }, { data: userAssets }] = await Promise.all([
                supabaseAdmin.from('mvp_cards').select('*').eq('user_id', user.user_id),
                supabaseAdmin.from('mvp_accounts').select('*').eq('user_id', user.user_id),
                supabaseAdmin.from('mvp_assets').select('*').eq('user_id', user.user_id)
            ]);
            if (!isMounted.current) return;

            const formattedCards = Array.isArray(userCards) ? userCards : [];
            // Sort default cards first
            formattedCards.sort((a: any, b: any) => {
                const defA = a.is_default == 1 || a.is_default === true || a.is_default == "1" || a.type === APP_CONFIG.PREMIUM_CARD_NAME;
                const defB = b.is_default == 1 || b.is_default === true || b.is_default == "1" || b.type === APP_CONFIG.PREMIUM_CARD_NAME;
                if (defA && !defB) return -1;
                if (!defA && defB) return 1;
                return 0;
            });

            setSelectedUserCards(formattedCards);
            setSelectedUserAssets(Array.isArray(userAssets) ? userAssets : []);

            let mainWallet = null;
            if (Array.isArray(userAccounts) && userAccounts.length > 0) {
                mainWallet = userAccounts.find((a: any) => a.is_main == 1 || a.is_main === "1" || a.is_main === true);
                if (!mainWallet) {
                    mainWallet = userAccounts.find((a: any) => a.name === 'Main Wallet');
                }
                if (!mainWallet) {
                    mainWallet = userAccounts[0];
                }
            }

            setSelectedUserAccounts(Array.isArray(userAccounts) ? userAccounts : []);
            setSelectedUserAccount(mainWallet);
        } catch (err) {
            console.error("Failed to load node-specific assets", err);
        } finally {
            if (isMounted.current) setIsLoadingUserDetails(false);
        }
    };

    useEffect(() => {
        if (selectedUser) {
            fetchUserDetails(selectedUser);
        } else {
            setSelectedUserCards([]);
            setSelectedUserAccount(null);
            setSelectedUserAssets([]);
        }
    }, [selectedUser]);

    const fetchData = useCallback(async (showLoading = true) => {
        if (document.hidden && !showLoading) return;
        if (isActionLoading) return;
        if (!isMounted.current) return;
        if (isFetching.current) return; // Guard overlap

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            if (isMounted.current && showLoading) setIsLoading(false);
            return;
        }

        isFetching.current = true; // Lock
        if (showLoading) setIsLoading(true);

        try {
            // PHASE 1: Critical Data (Unblock UI ASAP)
            const [{ data: settingsData }, { data: u }] = await Promise.all([
                supabase.from('mvp_app_settings').select('*').eq('id', 1).single(),
                supabaseAdmin.from('mvp_profiles').select('id,user_id,full_name,email,role,kyc_level,is_suspended,phone,address,city,country,created_at,settings').limit(50)
            ]);
            const settings = settingsData || null;

            if (!isMounted.current) return;

            setUsers(u || []);

            // Always sync globalConfig from DB — but only when the settings form is NOT dirty
            // (i.e. not actively being edited). We use a ref flag `isEditingSettings` to guard this.
            if (settings && !isEditingSettings.current) {
                setGlobalConfig({
                    maintenanceMode: settings.maintenance_mode == "1" || settings.maintenance_mode == 1 || settings.maintenance_mode === true,
                    forceTransactionFailure: settings.disable_transactions == "1" || settings.disable_transactions == 1 || settings.disable_transactions === true,
                    allowRegistration: settings.allow_registration == "1" || settings.allow_registration == 1 || settings.allow_registration === true,
                    siteName: settings.site_name || APP_CONFIG.BANK_NAME,
                    siteLogo: settings.site_logo || '',
                    enableDailyLimit: settings.enable_daily_limit == "1" || settings.enable_daily_limit === 1 || settings.enable_daily_limit === true,
                    enableWeeklyLimit: settings.enable_weekly_limit == "1" || settings.enable_weekly_limit === 1 || settings.enable_weekly_limit === true,
                    enableMonthlyLimit: settings.enable_monthly_limit == "1" || settings.enable_monthly_limit === 1 || settings.enable_monthly_limit === true,
                    dailyLimit: Number(settings.daily_limit) || 50000,
                    weeklyLimit: Number(settings.weekly_limit) || 250000,
                    monthlyLimit: Number(settings.monthly_limit) || 500000
                });
            }

            // Unblock UI immediately after core data
            if (showLoading) setIsLoading(false);

            // PHASE 2: Operational Data
            const [{ data: tickets }, { data: msgs }, { data: unreadLiveChatMsgs }] = await Promise.all([
                supabaseAdmin.from('mvp_support_tickets').select('*').limit(50),
                supabaseAdmin.from('mvp_messages').select('*').limit(100),
                supabaseAdmin.from('mvp_live_chat_messages').select('id').eq('sender_type', 'user').eq('is_read', false)
            ]);

            if (isMounted.current) {
                setSupportTickets(tickets || []);
                setLiveMessages(msgs || []);
                setLiveChatUnreadCount((unreadLiveChatMsgs || []).length);
            }

            // PHASE 3: Heavy Data
            const shouldFetchTx = ['overview', 'transactions', 'requests'].includes(activeSection);
            const shouldFetchBanks = activeSection === 'bank_management';
            const shouldFetchLiquidity = activeSection === 'overview';

            let [{ data: tx }, { data: b }, { data: accLiq }] = await Promise.all([
                shouldFetchTx ? supabaseAdmin.from('mvp_transactions').select('*').order('date', { ascending: false }).limit(50) : Promise.resolve({ data: null }),
                shouldFetchBanks ? supabaseAdmin.from('mvp_banks').select('*').limit(50) : Promise.resolve({ data: null }),
                shouldFetchLiquidity ? supabaseAdmin.from('mvp_accounts').select('balance').limit(50) : Promise.resolve({ data: null })
            ]);

            // Auto-insert PayPal & Wise as default banks if missing
            if (shouldFetchBanks && b !== null) {
                const hasPaypal = (b || []).some((bank: any) => bank.name?.toLowerCase() === 'paypal');
                if (!hasPaypal) {
                    await supabaseAdmin.from('mvp_banks').insert([{
                        name: 'PayPal',
                        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg',
                        color: 'bg-blue-600'
                    }]);
                }
                const hasWise = (b || []).some((bank: any) => bank.name?.toLowerCase() === 'wise');
                const wiseBank = (b || []).find((bank: any) => bank.name?.toLowerCase() === 'wise');
                const wiseLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Wise_Logo_512x124.svg/1200px-Wise_Logo_512x124.svg.png';
                if (!hasWise) {
                    await supabaseAdmin.from('mvp_banks').insert([{
                        name: 'Wise',
                        logo: wiseLogoUrl,
                        color: 'bg-green-700'
                    }]);
                } else if (wiseBank && wiseBank.logo !== wiseLogoUrl) {
                    await supabaseAdmin.from('mvp_banks').update({ logo: wiseLogoUrl }).eq('id', wiseBank.id);
                }
                const hasCitiBank = (b || []).some((bank: any) => bank.name?.toLowerCase() === 'citibank');
                const citiBankEntry = (b || []).find((bank: any) => bank.name?.toLowerCase() === 'citibank');
                const citiLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/7/73/Citi_logo_March_2023.svg';
                if (!hasCitiBank) {
                    await supabaseAdmin.from('mvp_banks').insert([{
                        name: 'CitiBank',
                        logo: citiLogoUrl,
                        color: 'bg-blue-700'
                    }]);
                } else if (citiBankEntry && citiBankEntry.logo !== citiLogoUrl) {
                    await supabaseAdmin.from('mvp_banks').update({ logo: citiLogoUrl }).eq('id', citiBankEntry.id);
                }
                const hasPeopleChoice = (b || []).some((bank: any) => bank.name?.toLowerCase() === "people's choice" || bank.name?.toLowerCase() === 'peoples choice');
                const peopleChoiceEntry = (b || []).find((bank: any) => bank.name?.toLowerCase() === "people's choice" || bank.name?.toLowerCase() === 'peoples choice');
                const pcLogoUrl = APP_CONFIG.SITE_URL + '/peoplechoice-logo.png';
                if (!hasPeopleChoice) {
                    await supabaseAdmin.from('mvp_banks').insert([{
                        name: "People's Choice",
                        logo: pcLogoUrl,
                        color: 'bg-lime-600'
                    }]);
                }
                if (!hasPaypal || !hasWise || (wiseBank && wiseBank.logo !== wiseLogoUrl) || !hasCitiBank || (citiBankEntry && citiBankEntry.logo !== citiLogoUrl) || !hasPeopleChoice) {
                    const { data: refreshedBanks } = await supabaseAdmin.from('mvp_banks').select('*').limit(50);
                    b = refreshedBanks;
                }
            }

            if (isMounted.current) {
                if (tx !== null) setTransactions(tx);
                if (b !== null) setBanks(b);
                if (accLiq !== null) {
                    const liq = (accLiq || []).reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
                    setTotalLiquidity(liq);
                }
            }

        } catch (err: any) {
            console.warn("Dashboard sync warning:", err.message);
        } finally {
            isFetching.current = false; // Unlock
            if (isMounted.current && showLoading) setIsLoading(false); // Safety fallback
        }
    }, [isActionLoading, activeSection]);

    // DEBUG: Test logo save from browser console
    // Run: window.testLogoSave('data:image/png;base64,...')
    useEffect(() => {
        (window as any).testLogoSave = async (testLogo?: string) => {
            const logoToTest = testLogo || globalConfig.siteLogo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            console.log('[DEBUG] Testing logo save...');
            console.log('[DEBUG] Logo length:', logoToTest.length);
            console.log('[DEBUG] Logo preview:', logoToTest.substring(0, 100));

            try {
                // Test 1: Direct update
                console.log('[DEBUG] Step 1: Saving logo via mvp.update...');
                const { error: logoErr } = await supabase.from('mvp_app_settings').update({ site_logo: logoToTest }).eq('id', 1);
                const updateResult = logoErr ? { success: false, error: logoErr.message } : { success: true };
                console.log('[DEBUG] Update result:', updateResult);

                // Test 2: Read back
                console.log('[DEBUG] Step 2: Reading back from DB...');
                const { data: settings } = await supabase.from('mvp_app_settings').select('*').eq('id', 1).single();
                console.log('[DEBUG] Retrieved settings:', settings);
                console.log('[DEBUG] site_logo length:', settings.site_logo?.length || 0);
                console.log('[DEBUG] site_logo matches:', settings.site_logo === logoToTest ? 'YES' : 'NO');

                if (settings.site_logo !== logoToTest) {
                    console.error('[DEBUG] MISMATCH! Logo was not saved correctly.');
                    console.log('[DEBUG] Expected:', logoToTest.substring(0, 100));
                    console.log('[DEBUG] Got:', settings.site_logo?.substring(0, 100) || 'NULL');
                } else {
                    console.log('[DEBUG] SUCCESS! Logo saved and retrieved correctly.');
                }
            } catch (err: any) {
                console.error('[DEBUG] ERROR:', err.message);
                console.error('[DEBUG] Full error:', err);
            }
        };
    }, [globalConfig.siteLogo]);

    const unreadLiveCount = useMemo(() => {
        return liveMessages.filter(m =>
            m.sender === 'user' &&
            (m.is_read == 0 || m.is_read == '0' || m.is_read === false) &&
            (!m.ticket_id || m.ticket_id === 'null' || m.ticket_id === '0' || m.ticket_id === 0) &&
            users.some(u => u.user_id === m.user_id)
        ).length;
    }, [liveMessages, users]);

    const unreadTicketCount = useMemo(() => {
        const unreadReplies = liveMessages.filter(m =>
            m.sender === 'user' &&
            (m.is_read == 0 || m.is_read == '0' || m.is_read === false) &&
            (m.ticket_id && m.ticket_id !== 'null' && m.ticket_id !== '0' && m.ticket_id !== 0) &&
            users.some(u => u.user_id === m.user_id)
        ).length;

        const unreadBaseTickets = supportTickets.filter(t =>
            (t.is_read == 0 || t.is_read == '0' || t.is_read === false) &&
            users.some(u => u.user_id === t.user_id)
        ).length;

        return unreadReplies + unreadBaseTickets;
    }, [liveMessages, supportTickets, users]);

    const pendingRequestCount = useMemo(() => {
        return transactions.filter(t => t.status === 'Pending').length;
    }, [transactions]);

    const adminFilteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const user = users.find(u => u.user_id === t.user_id);
            const userName = user?.full_name || 'Unknown';
            const userEmail = user?.email || '';

            const searchMatch = !txFilters.search ||
                t.description?.toLowerCase().includes(txFilters.search.toLowerCase()) ||
                t.uuid?.toLowerCase().includes(txFilters.search.toLowerCase()) ||
                userName.toLowerCase().includes(txFilters.search.toLowerCase()) ||
                userEmail.toLowerCase().includes(txFilters.search.toLowerCase());

            const typeMatch = txFilters.type === 'All' || t.type === txFilters.type;
            const statusMatch = txFilters.status === 'All' || t.status === txFilters.status;

            let dateMatch = true;
            if (txFilters.startDate) {
                dateMatch = dateMatch && new Date(t.date) >= new Date(txFilters.startDate);
            }
            if (txFilters.endDate) {
                const end = new Date(txFilters.endDate);
                end.setHours(23, 59, 59, 999);
                dateMatch = dateMatch && new Date(t.date) <= end;
            }

            let amountMatch = true;
            const amt = Math.abs(parseFloat(t.amount));
            if (txFilters.minAmount) amountMatch = amountMatch && amt >= parseFloat(txFilters.minAmount);
            if (txFilters.maxAmount) amountMatch = amountMatch && amt <= parseFloat(txFilters.maxAmount);

            return searchMatch && typeMatch && statusMatch && dateMatch && amountMatch;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, users, txFilters]);

    const markMessagesAsRead = async (targetUserId: string | null, ticketId: number | null) => {
        if (!targetUserId && !ticketId) return;

        const unreadMsgs = liveMessages.filter(m => {
            const isFromUser = m.sender === 'user';
            const isUnread = (m.is_read == 0 || m.is_read == '0' || m.is_read === false);

            if (ticketId) {
                return isFromUser && isUnread && String(m.ticket_id) === String(ticketId);
            } else if (targetUserId) {
                return isFromUser && isUnread && m.user_id === targetUserId && (!m.ticket_id || m.ticket_id === 'null' || m.ticket_id === 0);
            }
            return false;
        });

        let ticketNeedsUpdate = false;
        if (ticketId) {
            const t = supportTickets.find(x => String(x.id) === String(ticketId));
            if (t && (t.is_read == 0 || t.is_read == '0' || t.is_read === false)) {
                ticketNeedsUpdate = true;
            }
        }

        if (unreadMsgs.length === 0 && !ticketNeedsUpdate) return;

        if (unreadMsgs.length > 0) {
            setLiveMessages(prev => prev.map(m => {
                if (unreadMsgs.some(u => u.id === m.id)) return { ...m, is_read: 1 };
                return m;
            }));
        }
        if (ticketNeedsUpdate && ticketId) {
            setSupportTickets(prev => prev.map(t => String(t.id) === String(ticketId) ? { ...t, is_read: 1 } : t));
        }

        try {
            const promises: Promise<any>[] = [];
            if (unreadMsgs.length > 0) {
                unreadMsgs.forEach(m => promises.push(supabaseAdmin.from('mvp_messages').update({ is_read: 1 }).eq('id', m.id)));
            }
            if (ticketNeedsUpdate && ticketId) {
                promises.push(supabaseAdmin.from('mvp_support_tickets').update({ is_read: 1 }).eq('id', ticketId));
            }
            await Promise.all(promises);
        } catch (err) {
            console.error("Failed to persist read status", err);
        }
    };

    const handleAdminAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsActionLoading('admin_add_card');
        try {
            const payload = {
                user_id: selectedUser.user_id,
                ...adminAddCardForm,
                is_frozen: 0,
                is_default: adminAddCardForm.is_default ? 1 : 0
            };
            const { error: cardErr } = await supabaseAdmin.from('mvp_cards').insert([payload]);
            if (cardErr) throw new Error(cardErr.message);
            setSuccessMsg("Card provisioned for node.");
            setShowAddCardModal(false);
            setAdminAddCardForm({
                type: 'VISA', number: '', holder: '', expiry: '', cvv: '', pin: '',
                is_default: false, gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/30'
            });
            await fetchUserDetails(selectedUser);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to provision card.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawAmount = parseFloat(createTxForm.amount);
        if (!selectedUser || !createTxForm.amount || isNaN(rawAmount) || rawAmount <= 0) {
            setErrorMsg("VAL ERROR: Invalid amount specified.");
            return;
        }

        setIsActionLoading('create_tx');
        try {
            if (createTxForm.updateBalance && selectedUserAccount) {
                const isIncome = ['Deposit', 'Transfer In'].includes(createTxForm.type) || (createTxForm.type === 'Others' && rawAmount > 0);
                const isExpense = ['Withdrawal', 'Transfer Out', 'Payment', 'Purchase'].includes(createTxForm.type) || (createTxForm.type === 'Others' && rawAmount < 0);
                let finalDelta = 0;

                if (isIncome) finalDelta = rawAmount;
                if (isExpense) finalDelta = -rawAmount;

                if (finalDelta !== 0) {
                    const currentBalance = Number(selectedUserAccount.balance) || 0;
                    const newBalance = currentBalance + finalDelta;
                    const { error: balErr } = await supabaseAdmin.from('mvp_accounts').update({ balance: newBalance }).eq('id', selectedUserAccount.id);
                    if (balErr) throw new Error(balErr.message);
                }
            }

            const txId = `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
            const isExpenseRecord = ['Withdrawal', 'Transfer Out', 'Payment', 'Purchase'].includes(createTxForm.type);
            const recordAmount = isExpenseRecord ? -rawAmount : rawAmount;
            const finalType = createTxForm.type === 'Others' ? createTxForm.customType : createTxForm.type;

            const payload = {
                uuid: txId,
                user_id: selectedUser.user_id,
                account_id: selectedUserAccount?.id,
                amount: recordAmount,
                description: createTxForm.description,
                merchant: createTxForm.merchant || null,
                type: finalType,
                category: createTxForm.category,
                status: createTxForm.status,
                date: new Date(createTxForm.date).toISOString()
            };

            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').insert([payload]);
            if (txErr) throw new Error(txErr.message);

            setSuccessMsg("Transaction created successfully.");
            setShowCreateTxModal(false);
            setCreateTxForm({
                date: new Date().toISOString().slice(0, 16),
                type: 'Deposit',
                customType: '',
                amount: '',
                merchant: '',
                description: 'Administrative Transaction',
                category: 'Admin Adjustment',
                status: 'Success',
                updateBalance: true
            });
            await fetchUserDetails(selectedUser);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Transaction creation failed.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleGenerateTransactions = async () => {
        if (!selectedUser) return;
        const min = parseFloat(txGenerator.minAmount);
        const max = parseFloat(txGenerator.maxAmount);
        const count = parseInt(txGenerator.count);
        if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min > max) {
            setErrorMsg("Invalid amount range.");
            return;
        }
        if (isNaN(count) || count <= 0 || count > 100) {
            setErrorMsg("Count must be between 1 and 100.");
            return;
        }
        if (!txGenerator.fromDate || !txGenerator.toDate) {
            setErrorMsg("Please select both from and to dates.");
            return;
        }
        if (!txGenerator.type || txGenerator.type.length === 0) {
            setErrorMsg("Please select at least one transaction type.");
            return;
        }

        setIsActionLoading('generate_tx');
        try {
            const typeMap: Record<string, { type: string; category: string; isExpense: boolean }> = {
                'Top up': { type: 'Deposit', category: 'Deposit', isExpense: false },
                'Bills': { type: 'Payment', category: 'Bill Pay', isExpense: true },
                'Investments': { type: 'Purchase', category: 'Investment', isExpense: true },
                'Transfers': { type: 'Transfer In', category: 'Transfer', isExpense: false },
                'Request': { type: 'Others', category: 'Request', isExpense: false },
                'Stocks': { type: 'Purchase', category: 'Investment', isExpense: true },
                'Withdrawal': { type: 'Withdrawal', category: 'Withdrawal', isExpense: true },
                'Salary': { type: 'Deposit', category: 'Salary', isExpense: false },
                'Shopping': { type: 'Purchase', category: 'Shopping', isExpense: true },
                'Groceries': { type: 'Purchase', category: 'Groceries', isExpense: true }
            };
            const selectedTypes = txGenerator.type;
            const pickType = () => selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
            const fromTime = new Date(txGenerator.fromDate).getTime();
            const toTime = new Date(txGenerator.toDate).getTime();

            const payloads: any[] = [];
            let totalDelta = 0;

            const realisticNames: Record<string, string[]> = {
                'Top up': ['Mobile Top Up', 'Wallet Top Up', 'Data Recharge', 'Airtime Purchase'],
                'Bills': ['Electric Bill', 'Water Bill', 'Internet Bill', 'Phone Bill', 'Cable TV', 'Gas Bill'],
                'Investments': ['ETF Investment', 'Index Fund', 'Bond Purchase', 'Mutual Fund'],
                'Transfers': ['Bank Transfer', 'Wire Transfer', 'Peer Transfer', 'Instant Transfer'],
                'Request': ['Payment Request', 'Invoice Settlement', 'Refund Credit'],
                'Stocks': ['Apple Inc.', 'Tesla Inc.', 'Amazon.com', 'Microsoft Corp.', 'NVIDIA Corp.', 'Alphabet Inc.'],
                'Withdrawal': ['ATM Withdrawal', 'Cash Withdrawal', 'Bank Counter'],
                'Salary': ['Monthly Salary', 'Payroll Credit', 'Wage Deposit', 'Bonus Payment'],
                'Shopping': ['Amazon', 'Target', 'Walmart', 'Best Buy', 'eBay', 'Etsy'],
                'Groceries': ['Whole Foods', 'Kroger', "Trader Joe's", 'Safeway', 'Costco', 'Aldi']
            };

            for (let i = 0; i < count; i++) {
                const picked = pickType();
                const config = typeMap[picked] || typeMap['Top up'];
                let rawAmt: number;
                if (['Bills', 'Groceries', 'Shopping'].includes(picked)) {
                    const billMax = Math.min(max, 250);
                    const billMin = Math.min(min, billMax);
                    rawAmt = Math.random() * (billMax - Math.max(billMin, 5)) + Math.max(billMin, 5);
                } else {
                    rawAmt = Math.random() * (max - min) + min;
                }
                const amount = config.isExpense ? -rawAmt : rawAmt;
                const randomDate = new Date(fromTime + Math.random() * (toTime - fromTime));
                const txId = `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
                const names = realisticNames[picked] || ['Transaction'];
                const description = names[Math.floor(Math.random() * names.length)];
                payloads.push({
                    uuid: txId,
                    user_id: selectedUser.user_id,
                    account_id: selectedUserAccount?.id || null,
                    amount: Number(amount.toFixed(2)),
                    description,
                    merchant: description,
                    type: config.type,
                    category: config.category,
                    status: 'Success',
                    date: randomDate.toISOString()
                });
                if (config.type !== 'Others') {
                    totalDelta += amount;
                }
            }

            if (selectedUserAccount && totalDelta !== 0) {
                const currentBalance = Number(selectedUserAccount.balance) || 0;
                const newBalance = currentBalance + totalDelta;
                const { error: balErr } = await supabaseAdmin.from('mvp_accounts').update({ balance: newBalance }).eq('id', selectedUserAccount.id);
                if (balErr) throw new Error(balErr.message);
            }

            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').insert(payloads);
            if (txErr) throw new Error(txErr.message);

            setSuccessMsg(`${count} transactions generated successfully.`);
            setTxGenerator({ minAmount: '', maxAmount: '', fromDate: '', toDate: '', count: '', type: 'Deposit' });
            await fetchUserDetails(selectedUser);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Transaction generation failed.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleOpenTxEdit = (tx: any) => {
        setEditTxForm({
            uuid: tx.uuid || tx.id,
            date: new Date(tx.date).toISOString().slice(0, 16),
            type: ['Deposit', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Payment', 'Purchase'].includes(tx.type) ? tx.type : 'Others',
            customType: tx.type,
            amount: String(Math.abs(tx.amount)),
            description: tx.description || '',
            category: tx.category || '',
            status: tx.status || 'Success',
            merchant: tx.merchant || ''
        });
        setSelectedTxToEdit(tx);
    };

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTxToEdit) return;
        setIsActionLoading(`update_tx_${selectedTxToEdit.id}`);
        try {
            const rawAmount = parseFloat(editTxForm.amount);
            const isExpenseRecord = ['Withdrawal', 'Transfer Out', 'Payment', 'Purchase'].includes(editTxForm.type);
            const recordAmount = isExpenseRecord ? -rawAmount : rawAmount;
            const finalType = editTxForm.type === 'Others' ? editTxForm.customType : editTxForm.type;

            const payload = {
                uuid: editTxForm.uuid,
                date: new Date(editTxForm.date).toISOString(),
                type: finalType,
                amount: recordAmount,
                description: editTxForm.description,
                category: editTxForm.category,
                status: editTxForm.status,
                merchant: editTxForm.merchant || null
            };

            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').update(payload).eq('id', selectedTxToEdit.id);
            if (txErr) throw new Error(txErr.message);

            // Sync balance if status crossed the Success boundary
            if (selectedTxToEdit.status !== payload.status) {
                const effectiveAmount = payload.status === 'Success' ? payload.amount : undefined;
                await syncTransactionBalance(selectedTxToEdit, selectedTxToEdit.status, payload.status, effectiveAmount);
            }

            setSuccessMsg("Transaction record updated.");
            setSelectedTxToEdit(null);
            await fetchData(false);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Update failed.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleOpenAssetEdit = (asset: any) => {
        setEditAssetForm({
            symbol: asset.symbol,
            name: asset.name,
            shares: String(asset.shares),
            amount: String(asset.amount),
            growth: String(asset.growth),
            is_positive: asset.is_positive == "1" || asset.is_positive == 1 || asset.is_positive === true,
            created_at: asset.created_at ? new Date(asset.created_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
        });
        setSelectedAssetToEdit(asset);
    };

    const handleUpdateAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetToEdit || !selectedUser) return;
        setIsActionLoading('update_asset');
        try {
            const payload = {
                symbol: editAssetForm.symbol,
                name: editAssetForm.name,
                shares: parseFloat(editAssetForm.shares),
                amount: parseFloat(editAssetForm.amount),
                growth: parseFloat(editAssetForm.growth),
                is_positive: editAssetForm.is_positive ? 1 : 0,
                created_at: new Date(editAssetForm.created_at).toISOString()
            };
            const { error: assetErr } = await supabaseAdmin.from('mvp_assets').update(payload).eq('id', selectedAssetToEdit.id);
            if (assetErr) throw new Error(assetErr.message);
            setSuccessMsg("Investment node updated.");
            setSelectedAssetToEdit(null);
            await fetchUserDetails(selectedUser);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to update asset.");
        } finally {
            setIsActionLoading(null);
        }
    };

    // ── Balance Sync Helper ─────────────────────────────────────────────────
    // Adds/subtracts transaction amount from account balance whenever status
    // crosses the Success boundary.  Called from Approve and Edit handlers.
    const syncTransactionBalance = async (
        tx: any,
        oldStatus: string,
        newStatus: string,
        effectiveAmount?: number   // use this when status becomes Success (may differ from stored amount)
    ) => {
        if (!tx.account_id || !tx.user_id) {
            console.warn('[BalanceSync] Missing account_id or user_id, skipping');
            return;
        }
        const wasSuccess = oldStatus === 'Success';
        const isSuccess  = newStatus === 'Success';

        let delta = 0;
        if (!wasSuccess && isSuccess) {
            delta = Number(effectiveAmount ?? tx.amount) || 0;   // became Success → add amount
        } else if (wasSuccess && !isSuccess) {
            delta = -(Number(tx.amount) || 0);                   // left Success → subtract original amount
        } else {
            return;                                              // no boundary crossing
        }

        const { data: accounts } = await supabaseAdmin
            .from('mvp_accounts')
            .select('*')
            .eq('user_id', tx.user_id);

        if (!accounts) { console.warn('[BalanceSync] No accounts found'); return; }
        const acc = accounts.find((a: any) => String(a.id) === String(tx.account_id));
        if (!acc) { console.warn('[BalanceSync] No account matched id', tx.account_id); return; }

        const currentBal = Number(acc.balance) || 0;
        const newBalance = currentBal + delta;
        const { error: balErr } = await supabaseAdmin
            .from('mvp_accounts')
            .update({ balance: newBalance })
            .eq('id', acc.id);

        if (balErr) throw new Error(balErr.message);
    };
    // ──────────────────────────────────────────────────────────────────────

    const handleApproveRequest = async (txId: string | number) => {
        setIsActionLoading(`approve_${txId}`);
        try {
            const tx = transactions.find(t => String(t.id) === String(txId) || t.uuid === String(txId));
            if (!tx) throw new Error("Transaction not found");
            if (tx.status !== 'Pending') throw new Error("Transaction is not pending");

            // 1. Update transaction status
            const dbId = tx.id || txId;
            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').update({ status: 'Success' }).eq('id', dbId);
            if (txErr) throw new Error(txErr.message);
            setTransactions(prev => prev.map(t => (String(t.id) === String(txId) || t.uuid === String(txId)) ? { ...t, status: 'Success' } : t));
            setRecentActions(prev => ({ ...prev, [String(txId)]: 'approved' }));

            // 2. Sync user balance (Pending → Success)
            await syncTransactionBalance(tx, 'Pending', 'Success');

            setSuccessMsg("Transaction request approved and balance updated.");
            fetchData(false);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to approve.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleRejectRequest = async (txId: string | number) => {
        setIsActionLoading(`reject_${txId}`);
        try {
            const tx = transactions.find(t => String(t.id) === String(txId) || t.uuid === String(txId));
            if (!tx) throw new Error("Transaction not found");

            const dbId = tx.id || txId;
            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').update({ status: 'Failed' }).eq('id', dbId);
            if (txErr) throw new Error(txErr.message);
            setTransactions(prev => prev.map(t => (String(t.id) === String(txId) || t.uuid === String(txId)) ? { ...t, status: 'Failed' } : t));
            setRecentActions(prev => ({ ...prev, [String(txId)]: 'declined' }));
            setSuccessMsg("Request rejected.");
            fetchData(false);
            setTimeout(() => setSuccessMsg(null), 5000);
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to reject.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        if (selectedUser.role === 'admin') {
            setErrorMsg("SECURITY PROTOCOL: Admin identities are protected and cannot be purged from the registry.");
            setDeleteConfirmStep(0);
            return;
        }
        setIsActionLoading('delete_user');
        try {
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(selectedUser.user_id);
            if (authError) throw authError;
            const { error: delProfErr } = await supabaseAdmin.from('mvp_profiles').delete().eq('id', selectedUser.id);
            if (delProfErr) console.error('Failed to delete profile:', delProfErr.message);
            setSuccessMsg('User identity purged from all registries.');
            setTimeout(() => setSuccessMsg(null), 5000);
            setSelectedUser(null);
            await fetchData(false);
        } catch (err: any) {
            setErrorMsg("Purge failed: " + err.message);
        } finally {
            setIsActionLoading(null);
            setDeleteConfirmStep(0);
        }
    };

    const handleSendTestEmail = async () => {
        if (!selectedTemplate || !testEmailRecipient) return;
        setIsSendingTestEmail(true);
        try {
            const res = await mvp.sendEmail(testEmailRecipient, selectedTemplate.subject, selectedTemplate.content, selectedTemplate.name);
            if (res.success || res.messageId) {
                setSuccessMsg(`Test email sent to ${testEmailRecipient}`);
            } else {
                setErrorMsg(res.error || 'Failed to send test email');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to send test email');
        } finally {
            setIsSendingTestEmail(false);
            setTimeout(() => setSuccessMsg(null), 5000);
            setTimeout(() => setErrorMsg(null), 5000);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsActionLoading('update_user');
        setErrorMsg(null);
        try {
            const originalUser = users.find(u => u.id === selectedUser.id);
            if (originalUser?.role === 'admin' && selectedUser.role === 'user') {
                const adminCount = users.filter(u => u.role === 'admin').length;
                if (adminCount <= 1) {
                    setErrorMsg("PROTOCOL ERROR: Failed to demote node. At least one Root Admin must remain active at all times.");
                    setIsActionLoading(null);
                    return;
                }
            }
            const updatePayload = {
                full_name: selectedUser.full_name,
                email: selectedUser.email,
                role: selectedUser.role,
                kyc_level: selectedUser.kyc_level,
                is_suspended: (selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true) ? 1 : 0,
                phone: selectedUser.phone,
                address: selectedUser.address,
                city: selectedUser.city,
                country: selectedUser.country
            };
            const { error: profErr } = await supabaseAdmin.from('mvp_profiles').update(updatePayload).eq('id', selectedUser.id);
            const res = !profErr;
            if (res) {
                // --- Sync email change to Supabase Auth so login uses the new email ---
                const emailChanged = originalUser?.email && originalUser.email !== selectedUser.email;
                if (emailChanged && selectedUser.user_id) {
                    const supabaseUrl = 'https://ubfxmpvaynguqyhbwtxr.supabase.co';
                    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZnhtcHZheW5ndXF5aGJ3dHhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA4OTM0MSwiZXhwIjoyMDg0NjY1MzQxfQ.XpZgR7sJcdTSXfA9IfrpOGc_PdDJczvgFNdEBNdfxtU';
                    const authHeaders = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${supabaseServiceKey}`,
                        'apikey': supabaseServiceKey
                    };

                    // Helper: attempt to update the auth email for this user
                    const updateAuthEmail = async (): Promise<{ ok: boolean; error?: string }> => {
                        const r = await fetch(`${supabaseUrl}/auth/v1/admin/users/${selectedUser.user_id}`, {
                            method: 'PUT',
                            headers: authHeaders,
                            body: JSON.stringify({ email: selectedUser.email, email_confirm: true })
                        });
                        const d = await r.json();
                        if (!r.ok) return { ok: false, error: d?.msg || d?.message || 'Auth update rejected' };
                        return { ok: true };
                    };

                    try {
                        let result = await updateAuthEmail();

                        // If it failed due to duplicate email — there's a ghost/stale auth record
                        // holding the target email. Find it and delete it, then retry.
                        if (!result.ok && result.error?.toLowerCase().includes('duplicate')) {
                            // 1. Find the ghost user that owns this email
                            const listRes = await fetch(
                                `${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`,
                                { method: 'GET', headers: authHeaders }
                            );
                            if (listRes.ok) {
                                const listData = await listRes.json();
                                const allAuthUsers: any[] = listData?.users || [];
                                const ghost = allAuthUsers.find(
                                    (u: any) => u.email?.toLowerCase() === selectedUser.email.toLowerCase()
                                        && u.id !== selectedUser.user_id
                                );
                                if (ghost) {
                                    // 2. Delete the ghost auth record — it has no active profile
                                    await fetch(`${supabaseUrl}/auth/v1/admin/users/${ghost.id}`, {
                                        method: 'DELETE',
                                        headers: authHeaders
                                    });
                                    // 3. Retry the original update
                                    result = await updateAuthEmail();
                                }
                            }
                        }

                        if (!result.ok) throw new Error(result.error);
                        setSuccessMsg('Profile saved & login email updated successfully.');
                    } catch (authErr: any) {
                        setErrorMsg(`Profile saved, but login email sync failed: ${authErr.message}. User must use old email to login.`);
                        setTimeout(() => setErrorMsg(null), 9000);
                    }
                } else {
                    setSuccessMsg('Profile committed to registry');
                }
                setUsers(prevUsers => prevUsers.map(u => u.id === selectedUser.id ? { ...u, ...updatePayload } : u));
                setTimeout(() => setSuccessMsg(null), 5000);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Registry synchronization failure.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const processImage = (file: File, size: number = 128, quality: number = 0.7): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // Limit max dimension to reduce file size
                    const maxSize = Math.min(size, 128);
                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    const scale = Math.min(maxSize / img.width, maxSize / img.height);
                    const x = (maxSize / 2) - (img.width / 2) * scale;
                    const y = (maxSize / 2) - (img.height / 2) * scale;
                    if (ctx) {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, maxSize, maxSize);
                        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                        // Use JPEG with quality compression (much smaller than PNG)
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    }
                };
            };
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploadingLogo(true);
            const base64 = await processImage(e.target.files[0], 128);
            setBankForm(prev => ({ ...prev, logo: base64 }));
            setIsUploadingLogo(false);
        }
    };

    const handleSiteLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploadingSiteLogo(true);
            // Use 128px max and 0.6 quality to keep under Vercel's ~4.5MB limit
            const base64 = await processImage(e.target.files[0], 128, 0.6);
            console.log('[Logo] Compressed size:', base64.length, 'bytes');
            setGlobalConfig(prev => ({ ...prev, siteLogo: base64 }));
            setIsUploadingSiteLogo(false);
        }
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankForm.name) return;
        setIsActionLoading('add_bank');
        try {
            const { error: bankErr } = await supabaseAdmin.from('mvp_banks').insert([bankForm]);
            const res = bankErr ? { success: false, error: bankErr.message } : { success: true };
            if (res && res.success) {
                setSuccessMsg('Bank registered successfully.');
                setBankForm({ name: '', logo: '', color: 'bg-slate-500' });
                await fetchData(false);
                setTimeout(() => setSuccessMsg(null), 5000);
            } else {
                throw new Error(res.error || "Failed to create bank");
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleDeleteBank = (id: number) => {
        setDeleteConfirmation({ type: 'bank', id });
    };

    const handleDeleteTicket = (id: number) => {
        setDeleteConfirmation({ type: 'ticket', id });
    };

    const handleDeleteConversation = (userId: string) => {
        setDeleteConfirmation({ type: 'conversation', id: userId });
    };

    const handleDeleteTxRequest = (id: number | string) => {
        setDeleteConfirmation({ type: 'transaction', id });
    };

    const executeDelete = async () => {
        if (!deleteConfirmation) return;
        const { type, id } = deleteConfirmation;
        const actionId = `delete_confirm_${id}`;
        setIsActionLoading(actionId);

        try {
            if (type === 'bank') {
                const { error: delErr } = await supabaseAdmin.from('mvp_banks').delete().eq('id', id);
                if (!delErr) {
                    setSuccessMsg('Bank deleted.');
                    await fetchData(false);
                } else {
                    throw new Error(delErr.message || "Failed to delete bank");
                }
            } else if (type === 'ticket') {
                const { error: delErr } = await supabaseAdmin.from('mvp_support_tickets').delete().eq('id', id);
                if (!delErr) {
                    if (selectedTicketId === id) setSelectedTicketId(null);
                    await fetchData(false);
                    setSuccessMsg("Ticket purged from registry.");
                } else {
                    throw new Error(delErr.message || "Unknown server refusal.");
                }
            } else if (type === 'conversation') {
                const msgsToDelete = liveMessages.filter(m => m.user_id === id && (!m.ticket_id || m.ticket_id === 'null' || m.ticket_id === 0));
                if (msgsToDelete.length === 0) {
                    setSuccessMsg("Conversation cleared.");
                    if (activeChatUser === id) setActiveChatUser(null);
                } else {
                    const ids = msgsToDelete.map(m => m.id);
                    const { error: delErr } = await supabaseAdmin.from('mvp_messages').delete().in('id', ids);
                    if (delErr) throw new Error(delErr.message);
                    setLiveMessages(prev => prev.filter(m => m.user_id !== id || (m.ticket_id && m.ticket_id !== 'null' && m.ticket_id !== 0)));
                    if (activeChatUser === id) setActiveChatUser(null);
                    setSuccessMsg(`Purged ${msgsToDelete.length} messages.`);
                }
            } else if (type === 'transaction') {
                const { error: delErr } = await supabaseAdmin.from('mvp_transactions').delete().eq('id', id);
                if (!delErr) {
                    setSuccessMsg("Transaction record deleted.");
                    if (selectedTxToEdit && (selectedTxToEdit.id === id || selectedTxToEdit.uuid === id)) {
                        setSelectedTxToEdit(null);
                    }
                    await fetchData(false);
                } else {
                    throw new Error(delErr.message || "Failed to delete transaction.");
                }
            } else if (type === 'card') {
                const { error: delErr } = await supabaseAdmin.from('mvp_cards').delete().eq('id', id);
                if (!delErr) {
                    setSelectedUserCards(prev => prev.filter(c => c.id !== id));
                    setSuccessMsg("Card asset deleted.");
                } else {
                    throw new Error(delErr.message || "Failed to delete card");
                }
            } else if (type === 'account') {
                const { error: delErr } = await supabaseAdmin.from('mvp_accounts').delete().eq('id', id);
                if (!delErr) {
                    setSelectedUserAccounts(prev => prev.filter(a => a.id !== id));
                    if (selectedUserAccount?.id === id) {
                        setSelectedUserAccount(prev => {
                            const remaining = selectedUserAccounts.filter(a => a.id !== id);
                            return remaining.find(a => a.is_main == 1 || a.is_main === true || a.is_main === '1') || remaining[0] || null;
                        });
                    }
                    setSuccessMsg("Account deleted successfully.");
                } else {
                    throw new Error(delErr.message || "Failed to delete account.");
                }
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsActionLoading(null);
            setDeleteConfirmation(null);
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    const handleUpdateTicket = async (ticketId: number, newStatus: string) => {
        setIsActionLoading(`ticket-${ticketId}`);
        try {
            const { error: tickErr } = await supabaseAdmin.from('mvp_support_tickets').update({ status: newStatus }).eq('id', ticketId);
            if (tickErr) throw new Error(tickErr.message);
            await fetchData(false);
            setSuccessMsg(`Ticket status updated: ${newStatus}`);
            setTimeout(() => setSuccessMsg(null), 5000);
        } finally { setIsActionLoading(null); }
    };

    const handleUpdateKycStatus = async (userId: string, type: string, status: string) => {
        const actionKey = `kyc-${userId}-${type}-${status}`;
        setIsActionLoading(actionKey);
        try {
            const user = users.find(u => u.user_id === userId);
            if (!user) return;
            const currentSettings = typeof user.settings === 'string' ? JSON.parse(user.settings) : (user.settings || {});
            let newKycStatus = { ...(currentSettings.kycStatus || {}) };
            let newKycLevel = Number(user.kyc_level);
            let newKycDocs = typeof user.kyc_documents === 'string' ? JSON.parse(user.kyc_documents || '{}') : (user.kyc_documents || {});
            if (type === 'batch') {
                newKycStatus = { governmentId: 'verified', selfie: 'verified', proofAddress: 'verified' };
                newKycLevel = 2;
            } else if (type === 'reject_all') {
                newKycStatus = { governmentId: 'rejected', selfie: 'rejected', proofAddress: 'rejected' };
                newKycLevel = 1;
            } else if (type === 'revert') {
                newKycStatus = { governmentId: 'required', selfie: 'required', proofAddress: 'required' };
                newKycLevel = 1;
                newKycDocs = {};
            } else {
                newKycStatus[type] = status;
                const kycStates = Object.values(newKycStatus);
                if (kycStates.length >= 3 && kycStates.every(s => s === 'verified')) { newKycLevel = 2; }
            }
            const newSettings = { ...currentSettings, kycStatus: newKycStatus };
            const updatePayload = {
                settings: JSON.stringify(newSettings),
                kyc_level: newKycLevel,
                kyc_documents: JSON.stringify(newKycDocs)
            };
            const { error: kycErr } = await supabaseAdmin.from('mvp_profiles').update(updatePayload).eq('id', user.id);
            if (kycErr) throw new Error(kycErr.message);
            await fetchData(false);
            setSuccessMsg(type === 'revert' ? 'Verification status reverted' : type === 'reject_all' ? 'User identity rejected' : type === 'batch' ? 'User Approved: Tier 2 Verified' : 'KYC Ledger Updated');
            setTimeout(() => setSuccessMsg(null), 5000);
            if (selectedKycUser && selectedKycUser.user_id === userId) {
                setSelectedKycUser({ ...selectedKycUser, ...updatePayload, kyc_documents: JSON.stringify(newKycDocs), settings: JSON.stringify(newSettings), kyc_level: newKycLevel });
            }
        } catch (e: any) { setErrorMsg("KYC sync error: " + e.message); } finally { setIsActionLoading(null); }
    };

    const handleResetPin = async () => {
        if (!selectedUser || !securityAction || !securityAction.value) return;
        setIsActionLoading('reset_pin');
        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(selectedUser.user_id, {
                user_metadata: { pin: securityAction.value }
            });
            if (error) throw error;
            const currentSettings = typeof selectedUser.settings === 'string' ? JSON.parse(selectedUser.settings || '{}') : (selectedUser.settings || {});
            const { error: pinErr } = await supabaseAdmin.from('mvp_profiles').update({
                settings: JSON.stringify({ ...currentSettings, pinSet: true })
            }).eq('id', selectedUser.id);
            if (pinErr) throw new Error(pinErr.message);
            setSuccessMsg("Security PIN updated.");
            setSecurityAction(null);
        } catch (err: any) { setErrorMsg(err.message); }
        finally { setIsActionLoading(null); }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !securityAction || !securityAction.value) return;
        setIsActionLoading('reset_password');
        try {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(selectedUser.user_id, {
                password: securityAction.value
            });
            if (error) throw error;
            setSuccessMsg("Password updated.");
            setSecurityAction(null);
        } catch (err: any) { setErrorMsg(err.message); }
        finally { setIsActionLoading(null); }
    };

    const handleToggleCardFreeze = async (card: any) => {
        setIsActionLoading(`freeze_card_${card.id}`);
        try {
            const isCurrentlyFrozen = card.is_frozen == 1 || card.is_frozen === "1" || card.is_frozen === true;
            const { error: freezeErr } = await supabaseAdmin.from('mvp_cards').update({ is_frozen: !isCurrentlyFrozen }).eq('id', card.id);
            if (freezeErr) throw new Error(freezeErr.message);

            setSelectedUserCards(prev => prev.map(c => c.id === card.id ? { ...c, is_frozen: !isCurrentlyFrozen } : c));
            setSuccessMsg(`Card ${!isCurrentlyFrozen ? 'Frozen' : 'Unfrozen'}`);
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err: any) { setErrorMsg(err.message); }
        finally { setIsActionLoading(null); }
    };

    const handleAdjustBalance = async (type: 'credit' | 'debit') => {
        const rawAmount = parseFloat(adjAmount);
        if (!selectedUser || isNaN(rawAmount) || rawAmount <= 0) { setErrorMsg("VAL ERROR: Specify valid numeric amount."); return; }
        if (!selectedUserAccount) { setErrorMsg("NODE ERROR: Wallet node not available for adjustment."); return; }
        setIsActionLoading('balance_adj');
        try {
            const finalAmount = type === 'credit' ? rawAmount : -rawAmount;
            const newBalance = Number(selectedUserAccount.balance) + finalAmount;
            if (newBalance < 0) throw new Error("ACCOUNT ERROR: Negative balance prohibited.");
            const { error: accErr } = await supabaseAdmin.from('mvp_accounts').update({ balance: newBalance }).eq('id', selectedUserAccount.id);
            if (accErr) throw new Error(accErr.message);
            const txId = `MNA-${Math.floor(100000 + Math.random() * 900000)}`;
            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').insert([{
                uuid: txId, user_id: selectedUser.user_id, account_id: selectedUserAccount.id, amount: finalAmount, description: adjDescription || (type === 'credit' ? 'Manual Funding' : 'Manual Debit'),
                type: type === 'credit' ? 'Deposit' : 'Withdrawal', category: 'Manual Correction', status: 'Success', date: new Date().toISOString()
            }]);
            if (txErr) throw new Error(txErr.message);
            await supabaseAdmin.from('mvp_notifications').insert([{ user_id: selectedUser.user_id, title: type === 'credit' ? 'Ledger Credited' : 'Ledger Debited', message: `Administrator adjusted your wallet by $${rawAmount.toLocaleString()}.`, type: type === 'credit' ? 'money' : 'alert', is_read: false }]);
            setSuccessMsg(`SYNC: Wallet updated.`); setTimeout(() => setSuccessMsg(null), 5000); setAdjAmount(''); await fetchUserDetails(selectedUser);
        } catch (err: any) { setErrorMsg(err.message || "Ledger sync failed."); } finally { setIsActionLoading(null); }
    };

    const handleCardOp = async (e: React.FormEvent) => {
        e.preventDefault();
        const rawAmount = parseFloat(cardOpAmount);
        if (!cardAction || !selectedUser || isNaN(rawAmount) || rawAmount <= 0) { setErrorMsg("Please enter a valid amount."); return; }

        setIsActionLoading('card_op');
        const { card, type } = cardAction;
        const finalAmount = type === 'credit' ? rawAmount : -rawAmount;

        try {
            const currentBalance = Number(card.balance) || 0;
            const newBalance = currentBalance + finalAmount;
            if (newBalance < 0) throw new Error("Insufficient funds in card balance.");
            const { error: cardErr } = await supabaseAdmin.from('mvp_cards').update({ balance: newBalance }).eq('id', card.id);
            if (cardErr) throw new Error(cardErr.message);
            const txId = `CRD-${Math.floor(100000 + Math.random() * 900000)}`;
            const cardLast4 = card.number?.slice(-4) || '....';
            const description = `Admin ${type === 'credit' ? 'Credit' : 'Debit'}: Card ****${cardLast4}`;

            const { error: txErr } = await supabaseAdmin.from('mvp_transactions').insert([{
                uuid: txId, user_id: selectedUser.user_id, account_id: selectedUserAccount?.id, amount: finalAmount, description: description,
                type: type === 'credit' ? 'Deposit' : 'Withdrawal', category: 'Card Adjustment', status: 'Success', date: new Date().toISOString()
            }]);
            if (txErr) throw new Error(txErr.message);

            await supabaseAdmin.from('mvp_notifications').insert([{ user_id: selectedUser.user_id, title: type === 'credit' ? 'Card Funded' : 'Card Debited', message: `Your card ending in ${cardLast4} was ${type === 'credit' ? 'credited' : 'debited'} by $${rawAmount.toLocaleString()}.`, type: type === 'credit' ? 'money' : 'alert', is_read: false }]);
            setSuccessMsg(`Card ${type} successful.`);
            setTimeout(() => setSuccessMsg(null), 5000);
            setCardAction(null);
            setCardOpAmount('');
            await fetchUserDetails(selectedUser);
        } catch (err: any) { setErrorMsg(err.message || "Card operation failed."); } finally { setIsActionLoading(null); }
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || (!activeChatUser && !selectedTicketId)) return;
        const text = chatInput;
        setChatInput('');
        const targetUserId = activeChatUser || supportTickets.find(t => t.id === selectedTicketId)?.user_id;
        const tId = activeSection === 'support_tickets' ? selectedTicketId : null;
        try {
            const tempId = `admin-temp-${Date.now()}`;
            const newMsg = { id: tempId, user_id: targetUserId, ticket_id: tId, text: text, sender: 'admin', is_read: 0, created_at: new Date().toISOString() };
            setLiveMessages(prev => [...prev, newMsg]);
            await supabaseAdmin.from('mvp_messages').insert([{ user_id: targetUserId, ticket_id: tId, text: text, sender: 'admin', is_read: 0 }]);
            await fetchData(false);
        } catch (err) { console.error("Chat sync error", err); }
    };

    const handleResolveSession = async () => {
        const targetUserId = activeChatUser || supportTickets.find(t => t.id === selectedTicketId)?.user_id;
        if (!targetUserId) return;
        setIsActionLoading('resolve_session');
        try {
            const resolutionMarker = "[SYSTEM]: SESSION_RESOLVED_AI_RESUMED - This support session has been resolved by an administrator. AI Assistant has resumed service.";
            const optimisticMsg = { id: `res-temp-${Date.now()}`, user_id: targetUserId, ticket_id: activeSection === 'support_tickets' ? selectedTicketId : null, text: resolutionMarker, sender: 'admin', is_read: 0, created_at: new Date().toISOString() };
            setLiveMessages(prev => [...prev, optimisticMsg]);
            await supabaseAdmin.from('mvp_messages').insert([{ user_id: targetUserId, ticket_id: activeSection === 'support_tickets' ? selectedTicketId : null, text: resolutionMarker, sender: 'admin', is_read: 0 }]);
            setSuccessMsg("Support session resolved. AI resumed.");
            setTimeout(() => setSuccessMsg(null), 5000);
            await fetchData(false);
        } catch (err: any) { setErrorMsg("Resolution sync error: " + err.message); } finally { setIsActionLoading(null); }
    };

    // Ref to signal fetchData not to overwrite globalConfig while admin is actively editing settings
    const isEditingSettings = useRef(false);

    // Call this when user starts editing any field
    const onEditStart = () => {
        isEditingSettings.current = true;
    };

    const handleUpdateGlobalConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading('config_update');
        setErrorMsg(null);
        isEditingSettings.current = true;
        try {
            // ── STEP 1: Core save ─────────────────────────────────────────────────────
            // Only send columns that are guaranteed to exist in mvp_app_settings.
            // The limit/logo columns may not exist yet if the DB hasn't been migrated —
            // sending them would cause MySQL to reject the ENTIRE update with a 400.
            const corePayload = {
                maintenance_mode: globalConfig.maintenanceMode ? 1 : 0,
                allow_registration: globalConfig.allowRegistration ? 1 : 0,
                disable_transactions: globalConfig.forceTransactionFailure ? 1 : 0,
                site_name: globalConfig.siteName,
            };

            let saveOk = false;
            try {
                const { error: updErr } = await supabaseAdmin!.from('mvp_app_settings').update(corePayload).eq('id', 1);
                if (updErr) {
                    console.error('[Settings] Update error:', updErr);
                    // Row id=1 may not exist yet — try insert
                    const { error: insErr } = await supabaseAdmin!.from('mvp_app_settings').insert([{ id: 1, ...corePayload }]);
                    if (insErr) throw new Error(`Save failed: ${insErr.message}`);
                }
                saveOk = true;
            } catch (updateErr: any) {
                throw new Error(`Save failed: ${updateErr.message}`);
            }

            // ── STEP 2: Extended save (optional columns) ──────────────────────────────
            if (saveOk) {
                const extendedPayload = {
                    site_logo: globalConfig.siteLogo,
                    enable_daily_limit: globalConfig.enableDailyLimit ? 1 : 0,
                    enable_weekly_limit: globalConfig.enableWeeklyLimit ? 1 : 0,
                    enable_monthly_limit: globalConfig.enableMonthlyLimit ? 1 : 0,
                    daily_limit: globalConfig.dailyLimit,
                    weekly_limit: globalConfig.weeklyLimit,
                    monthly_limit: globalConfig.monthlyLimit,
                };
                try {
                    const { error: extErr } = await supabaseAdmin!.from('mvp_app_settings').update(extendedPayload).eq('id', 1);
                    if (extErr) {
                        console.error('[Settings] Extended save error:', extErr);
                        setSuccessMsg(`Core settings saved, but logo/limits failed: ${extErr.message}`);
                    } else {
                        setSuccessMsg('Settings saved successfully.');
                    }
                } catch (extErr: any) {
                    console.error('[Settings] Extended save error:', extErr);
                    setSuccessMsg(`Core settings saved, but logo/limits failed: ${extErr.message}`);
                }

                setTimeout(() => setSuccessMsg(null), 5000);
                isEditingSettings.current = false;
                await fetchData(false);
            }
        } catch (err: any) {
            isEditingSettings.current = false;
            setErrorMsg(err.message || 'Failed to sync global config.');
        } finally {
            setIsActionLoading(null);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

    const kycUsers = useMemo(() => {
        return users.filter(u => {
            const settings = typeof u.settings === 'string' ? JSON.parse(u.settings) : (u.settings || {});
            return (u.kyc_documents && u.kyc_documents !== '{}') || (settings.kycStatus && Object.keys(settings.kycStatus).length > 0);
        });
    }, [users]);

    const kycPendingCount = useMemo(() => {
        return kycUsers.filter(u => (Number(u.kyc_level) || 0) < 2).length;
    }, [kycUsers]);

    const volumeChartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });
        return last7Days.map(date => ({
            name: date,
            v: transactions.filter(t => t.date && t.date.startsWith(date)).length || 0
        }));
    }, [transactions]);

    const chatUsers = useMemo(() => {
        const liveOnlyMessages = liveMessages.filter(m => !m.ticket_id || m.ticket_id === "null");
        const userIds = Array.from(new Set(liveOnlyMessages.map(m => m.user_id)));
        return userIds.map(id => {
            const user = users.find(u => u.user_id === id);
            if (!user) return null;
            const userMsgs = liveOnlyMessages.filter(m => m.user_id === id);
            const lastMsg = userMsgs[userMsgs.length - 1];
            const unreadCount = userMsgs.filter(m => m.sender === 'user' && (m.is_read == "0" || m.is_read == 0)).length;
            let supportActive = false;
            const sorted = [...userMsgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            for (const m of sorted) {
                if (m.text?.includes("USER_REQUESTED_LIVE_CHAT")) supportActive = true;
                if (m.text?.includes("SESSION_RESOLVED_AI_RESUMED")) supportActive = false;
            }
            return { user_id: id, full_name: user.full_name, email: user.email, last_message: lastMsg?.text, last_time: lastMsg?.created_at, unread: unreadCount, active: supportActive };
        }).filter((u): u is NonNullable<typeof u> => u !== null).sort((a, b) => new Date(b.last_time || 0).getTime() - new Date(a.last_time || 0).getTime());
    }, [liveMessages, users]);

    const isCurrentChatHandoverActive = useMemo(() => {
        const targetId = activeChatUser || supportTickets.find(t => t.id === selectedTicketId)?.user_id;
        if (!targetId) return false;
        const relevantMsgs = liveMessages.filter(m => m.user_id === targetId && (!m.ticket_id || m.ticket_id === "null" || String(m.ticket_id) === String(selectedTicketId)));
        let handoverActive = false;
        const sorted = [...relevantMsgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        for (const m of sorted) {
            if (m.text?.includes("USER_REQUESTED_LIVE_CHAT")) handoverActive = true;
            if (m.text?.includes("SESSION_RESOLVED_AI_RESUMED")) handoverActive = false;
        }
        return handoverActive;
    }, [liveMessages, activeChatUser, selectedTicketId, supportTickets]);

    const handleSidebarClick = useCallback((id: AdminSection) => {
        // If navigating away from settings, unlock the editing guard so polling can re-sync globalConfig
        if (id !== 'settings') {
            isEditingSettings.current = false;
        }
        setActiveSection(id); setSelectedUser(null); setSelectedKycUser(null); setActiveChatUser(null); setSelectedTicketId(null); setIsMobileMenuOpen(false); setSelectedTemplateId(null);
        setCurrentPage(1);
    }, []);

    const selectedTicket = useMemo(() => { return supportTickets.find(t => t.id === selectedTicketId); }, [supportTickets, selectedTicketId]);
    const selectedTemplate = useMemo(() => { return EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId); }, [selectedTemplateId]);

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedTransactions = adminFilteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedKycUsers = kycUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedBanks = banks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredTickets = supportTickets.filter(ticket => users.some(u => u.user_id === ticket.user_id));
    const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedChatUsers = chatUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        fetchData(true);
        const interval = setInterval(() => fetchData(false), 60000); // 60s to reduce egress
        return () => clearInterval(interval);
    }, [fetchData]);

    if (isLoading && users.length === 0) {
        return (
            <div className="min-h-screen bg-[#101922] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Accessing Root Control Hub...</p>
                <div className="flex gap-4">
                    <button onClick={() => fetchData()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"><RefreshCw size={14} /> Retry Sync</button>
                    <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-200 rounded-lg text-xs font-bold hover:bg-red-900 transition-colors"><LogOut size={14} /> Force Logout</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display relative">

            {/* ADMIN ADD CARD MODAL */}
            {showAddCardModal && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Provision New Card</h3>
                            <button onClick={() => setShowAddCardModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAdminAddCard} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Card Type</label>
                                    <select value={adminAddCardForm.type} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none">
                                        <option>VISA</option><option>Mastercard</option><option>Amex</option><option>{APP_CONFIG.PREMIUM_CARD_NAME}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry (MM/YY)</label>
                                    <input type="text" placeholder="12/28" value={adminAddCardForm.expiry} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, expiry: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                                <input type="text" maxLength={16} placeholder="4000123456789012" value={adminAddCardForm.number} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, number: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Holder</label>
                                <input type="text" value={adminAddCardForm.holder} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, holder: e.target.value.toUpperCase() })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">CVV</label>
                                    <input type="text" maxLength={4} placeholder="123" value={adminAddCardForm.cvv} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, cvv: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">PIN</label>
                                    <input type="text" maxLength={4} placeholder="0000" value={adminAddCardForm.pin} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, pin: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none" required />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <input type="checkbox" id="admin-card-default" checked={adminAddCardForm.is_default} onChange={e => setAdminAddCardForm({ ...adminAddCardForm, is_default: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="admin-card-default" className="text-sm text-slate-300 cursor-pointer">Set as System Default?</label>
                            </div>
                            <button type="submit" disabled={isActionLoading === 'admin_add_card'} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                {isActionLoading === 'admin_add_card' ? <Loader2 size={18} className="animate-spin" /> : 'Provision Card Asset'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT ASSET MODAL */}
            {selectedAssetToEdit && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Edit Portfolio Node</h3>
                                <p className="text-[10px] text-slate-400 font-mono">Asset ID: {selectedAssetToEdit.id}</p>
                            </div>
                            <button onClick={() => setSelectedAssetToEdit(null)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleUpdateAsset} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Symbol</label>
                                    <input type="text" value={editAssetForm.symbol} onChange={e => setEditAssetForm({ ...editAssetForm, symbol: e.target.value.toUpperCase() })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                                    <input type="text" value={editAssetForm.name} onChange={e => setEditAssetForm({ ...editAssetForm, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Shares / Qty</label>
                                    <input type="number" step="any" value={editAssetForm.shares} onChange={e => setEditAssetForm({ ...editAssetForm, shares: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Invested Amount ($)</label>
                                    <input type="number" step="any" value={editAssetForm.amount} onChange={e => setEditAssetForm({ ...editAssetForm, amount: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Growth %</label>
                                    <input type="number" step="any" value={editAssetForm.growth} onChange={e => setEditAssetForm({ ...editAssetForm, growth: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Date Acquired</label>
                                    <input type="datetime-local" value={editAssetForm.created_at} onChange={e => setEditAssetForm({ ...editAssetForm, created_at: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Profit Status</label>
                                <div className="flex items-center gap-2 mt-2">
                                    <button type="button" onClick={() => setEditAssetForm({ ...editAssetForm, is_positive: true })} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${editAssetForm.is_positive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>Profit</button>
                                    <button type="button" onClick={() => setEditAssetForm({ ...editAssetForm, is_positive: false })} className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${!editAssetForm.is_positive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>Loss</button>
                                </div>
                            </div>
                            <button type="submit" disabled={isActionLoading === 'update_asset'} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                {isActionLoading === 'update_asset' ? <Loader2 size={18} className="animate-spin" /> : 'Save Portfolio Node'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT TRANSACTION MODAL */}
            {selectedTxToEdit && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Edit Transaction Node</h3>
                                <p className="text-[10px] text-slate-400 font-mono">Original Ref: {selectedTxToEdit.uuid || selectedTxToEdit.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDeleteTxRequest(selectedTxToEdit.id)} className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Delete Transaction"><Trash2 size={16} /></button>
                                <button onClick={() => setSelectedTxToEdit(null)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                            </div>
                        </div>
                        <form onSubmit={handleUpdateTransaction} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Reference ID</label>
                                <input type="text" value={editTxForm.uuid} onChange={e => setEditTxForm({ ...editTxForm, uuid: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                                    <select value={editTxForm.type} onChange={e => setEditTxForm({ ...editTxForm, type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none">
                                        <option>Deposit</option><option>Withdrawal</option><option>Transfer In</option><option>Transfer Out</option><option>Payment</option><option>Purchase</option><option>Others</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
                                    <input type="number" required value={editTxForm.amount} onChange={e => setEditTxForm({ ...editTxForm, amount: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            {editTxForm.type === 'Others' && (
                                <div className="space-y-1 animate-in slide-in-from-top-1">
                                    <label className="text-[10px] font-bold text-blue-400 uppercase">Custom Transaction Name</label>
                                    <input type="text" value={editTxForm.customType} onChange={e => setEditTxForm({ ...editTxForm, customType: e.target.value })} placeholder="e.g. Penalty, Bonus, etc." className="w-full bg-slate-800 border border-blue-500/50 rounded-lg p-2.5 text-sm text-white outline-none" required />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Date & Time</label>
                                <input type="datetime-local" required value={editTxForm.date} onChange={e => setEditTxForm({ ...editTxForm, date: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Statement / Description</label>
                                <input type="text" required value={editTxForm.description} onChange={e => setEditTxForm({ ...editTxForm, description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                                    <select value={editTxForm.category} onChange={e => setEditTxForm({ ...editTxForm, category: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Admin Adjustment</option><option>Deposit</option><option>Withdrawal</option><option>Transfer</option><option>Payment</option><option>Purchase</option><option>Bill Pay</option><option>Salary</option><option>Investment</option><option>Entertainment</option><option>Food & Drinks</option><option>Groceries</option><option>Shopping</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                                    <select value={editTxForm.status} onChange={e => setEditTxForm({ ...editTxForm, status: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Success</option><option>Pending</option><option>Cancelled</option><option>Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setSelectedTxToEdit(null)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-xs">Cancel</button>
                                <button type="submit" disabled={isActionLoading?.includes('update_tx')} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs">
                                    {isActionLoading?.includes('update_tx') ? <Loader2 size={16} className="animate-spin" /> : 'Commit Ledger Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE TRANSACTION MODAL */}
            {showCreateTxModal && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Create Transaction Record</h3>
                            <button onClick={() => setShowCreateTxModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                                    <select value={createTxForm.type} onChange={e => setCreateTxForm({ ...createTxForm, type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Deposit</option><option>Withdrawal</option><option>Transfer In</option><option>Transfer Out</option><option>Payment</option><option>Purchase</option><option>Others</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
                                    <input type="number" required value={createTxForm.amount} onChange={e => setCreateTxForm({ ...createTxForm, amount: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            {createTxForm.type === 'Others' && (
                                <div className="space-y-1 animate-in slide-in-from-top-1">
                                    <label className="text-[10px] font-bold text-blue-400 uppercase">Custom Transaction Name</label>
                                    <input type="text" value={createTxForm.customType} onChange={e => setCreateTxForm({ ...createTxForm, customType: e.target.value })} placeholder="e.g. Penalty, Bonus, etc." className="w-full bg-slate-800 border border-blue-500/50 rounded-lg p-2.5 text-sm text-white outline-none" required />
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Date & Time</label>
                                <input type="datetime-local" required value={createTxForm.date} onChange={e => setCreateTxForm({ ...createTxForm, date: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                                <input type="text" required value={createTxForm.description} onChange={e => setCreateTxForm({ ...createTxForm, description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                                    <select value={createTxForm.category} onChange={e => setCreateTxForm({ ...createTxForm, category: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Admin Adjustment</option><option>Deposit</option><option>Withdrawal</option><option>Transfer</option><option>Payment</option><option>Purchase</option><option>Bill Pay</option><option>Salary</option><option>Investment</option><option>Entertainment</option><option>Food & Drinks</option><option>Groceries</option><option>Shopping</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                                    <select value={createTxForm.status} onChange={e => setCreateTxForm({ ...createTxForm, status: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Success</option><option>Pending</option><option>Cancelled</option><option>Failed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <input type="checkbox" id="admin-tx-update-bal" checked={createTxForm.updateBalance} onChange={e => setCreateTxForm({ ...createTxForm, updateBalance: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="admin-tx-update-bal" className="text-sm text-slate-300 cursor-pointer">Update Wallet Balance?</label>
                            </div>

                            <button type="submit" disabled={isActionLoading === 'create_tx'} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                {isActionLoading === 'create_tx' ? <Loader2 size={18} className="animate-spin" /> : 'Create Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {previewDoc && (
                <div className="fixed inset-0 z-[500] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                    <button onClick={() => setPreviewDoc(null)} className="absolute top-4 right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"><X size={24} /></button>
                    <img src={previewDoc} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/20 object-contain" alt="Document Preview" />
                </div>
            )}

            {deleteConfirmation && (
                <div className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isActionLoading && setDeleteConfirmation(null)}></div>
                    <div className="relative bg-white dark:bg-slate-800 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirm Deletion</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{deleteConfirmation.type === 'conversation' ? "Are you sure you want to clear this entire conversation history? This action cannot be undone." : `Are you sure you want to permanently delete this ${deleteConfirmation.type}? This action cannot be undone.`}</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setDeleteConfirmation(null)} disabled={!!isActionLoading} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">Cancel</button>
                                <button onClick={executeDelete} disabled={!!isActionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">{isActionLoading === `delete_confirm_${deleteConfirmation.id}` ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Action Modal */}
            {cardAction && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center px-0 md:px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isActionLoading && setCardAction(null)}></div>
                    <div className="relative bg-white dark:bg-[#111a22] w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:animate-in md:zoom-in duration-200 border border-slate-200 dark:border-[#324d67]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${cardAction.type === 'credit' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {cardAction.type === 'credit' ? <Plus size={20} /> : <Minus size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Card {cardAction.type}</h3>
                                    <p className="text-[10px] text-slate-500 font-mono">**** {cardAction.card.number.slice(-4)}</p>
                                </div>
                            </div>
                            <button onClick={() => setCardAction(null)} className="p-1 text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCardOp} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={cardOpAmount}
                                        onChange={e => setCardOpAmount(e.target.value)}
                                        autoFocus
                                        placeholder="0.00"
                                        className="w-full pl-7 pr-3 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-lg font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Target Account</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">Current Card Balance</span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                        ${(Number(cardAction.card.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isActionLoading === 'card_op' || !cardOpAmount}
                                className={`w-full py-3 rounded-xl font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${cardAction.type === 'credit' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'}`}
                            >
                                {isActionLoading === 'card_op' ? <Loader2 size={16} className="animate-spin" /> : (cardAction.type === 'credit' ? <Plus size={16} /> : <Minus size={16} />)}
                                Confirm {cardAction.type}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-3 w-full max-w-xs md:max-w-sm px-4">
                {successMsg && (
                    <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border border-white/20">
                        <div className="bg-white/20 p-1.5 rounded-full"><CheckCircle size={20} /></div>
                        <span className="font-bold text-sm tracking-tight">{successMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border border-white/20">
                        <div className="bg-white/20 p-1.5 rounded-full"><AlertTriangle size={20} /></div>
                        <span className="font-bold text-sm tracking-tight">{errorMsg}</span>
                        <button onClick={() => setErrorMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={16} /></button>
                    </div>
                )}
            </div>

            <aside className={`fixed inset-y-0 left-0 w-56 flex-shrink-0 bg-white dark:bg-[#111a22] border-r border-slate-200 dark:border-[#233648] flex flex-col z-[70] transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
                <div className="p-4 md:p-6 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5" onClick={() => handleSidebarClick('overview')}>
                        <img
                            src={globalConfig.siteLogo && globalConfig.siteLogo.trim() !== '' ? globalConfig.siteLogo : "https://image2url.com/r2/default/images/1769428285590-d43b30ba-a0ba-499f-a066-6411c1619f75.webp"}
                            alt={globalConfig.siteName}
                            className="w-8 h-8 object-contain cursor-pointer rounded-full"
                        />
                        <h1 className="text-sm md:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase cursor-pointer">{globalConfig.siteName || APP_CONFIG.BRAND_NAME} Admin</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-slate-400"><span className="material-symbols-outlined">close</span></button>
                </div>

                <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto custom-scrollbar pb-6">
                    <SidebarItem id="overview" label="Overview" icon="dashboard" active={activeSection === 'overview'} onClick={handleSidebarClick} />
                    <SidebarItem id="users" label="Users" icon="group" active={activeSection === 'users'} onClick={handleSidebarClick} />
                    <SidebarItem id="transactions" label="Transactions" icon="swap_horiz" active={activeSection === 'transactions'} onClick={handleSidebarClick} />
                    <SidebarItem id="requests" label="Pending Requests" icon="pending_actions" active={activeSection === 'requests'} onClick={handleSidebarClick} badgeCount={pendingRequestCount} />
                    <SidebarItem id="kyc" label="KYC Verif" icon="badge" active={activeSection === 'kyc'} onClick={handleSidebarClick} badgeCount={kycPendingCount} />

                    <div className="py-2">
                        <p className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Support Channels</p>
                        <SidebarItem id="support_live" label="AI Handover" icon="chat" active={activeSection === 'support_live'} onClick={handleSidebarClick} badgeCount={unreadLiveCount} />
                        <SidebarItem id="email_live_chat" label="Email Live Chat" icon="headset" active={activeSection === 'email_live_chat'} onClick={handleSidebarClick} badgeCount={liveChatUnreadCount} />
                        <SidebarItem id="support_tickets" label="Tickets" icon="confirmation_number" active={activeSection === 'support_tickets'} onClick={handleSidebarClick} badgeCount={unreadTicketCount} />
                    </div>

                    <div className="py-2">
                        <p className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Configuration</p>
                        <SidebarItem id="bank_management" label="Bank Management" icon="account_balance" active={activeSection === 'bank_management'} onClick={handleSidebarClick} />
                        <SidebarItem id="email_templates" label="Email Templates" icon="mail" active={activeSection === 'email_templates'} onClick={handleSidebarClick} />
                        <SidebarItem id="settings" label="Settings" icon="settings" active={activeSection === 'settings'} onClick={handleSidebarClick} />
                    </div>
                </nav>

                <div className="p-2.5 mt-auto border-t border-slate-200 dark:border-[#233648]">
                    <div className="flex items-center gap-2 px-2 py-2 mb-1.5">
                        {userAvatar ? (
                            <img src={userAvatar} className="size-8 rounded-full border border-slate-100 dark:border-[#324d67] object-cover" />
                        ) : (
                            <div className="size-8 rounded-full bg-slate-200 dark:bg-[#233648] flex items-center justify-center text-slate-400">
                                <User size={14} />
                            </div>
                        )}
                        <div className="flex flex-col"><p className="text-xs font-semibold truncate max-w-[80px]">Root Admin</p><p className="text-[9px] text-slate-500 dark:text-[#92adc9]">Full Control</p></div>
                    </div>
                    <button onClick={onLogout} className="flex items-center w-full gap-2.5 px-2 py-1.5 text-slate-600 dark:text-[#92adc9] hover:text-red-500 transition-colors text-xs font-medium"><span className="material-symbols-outlined text-[18px]">logout</span><span>Sign Out</span></button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="flex flex-col sticky top-0 z-[100] backdrop-blur-md">
                    {globalConfig.maintenanceMode && <div className="bg-amber-500/90 text-white px-4 py-1.5 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest border-b border-amber-400/30">Maintenance Mode Active</div>}
                    {globalConfig.forceTransactionFailure && <div className="bg-red-600/90 text-white px-4 py-1.5 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg border-b border-red-500/30"><ShieldAlert size={14} className="animate-pulse" /> Transaction Disruption Protocol Active <ShieldAlert size={14} className="animate-pulse" /></div>}
                </div>

                <header className="h-14 md:h-16 flex items-center justify-between px-2.5 md:px-8 bg-white dark:bg-[#111a22] border-b border-slate-200 dark:border-[#233648] z-[60]">
                    <div className="flex items-center gap-2.5">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 text-slate-500"><span className="material-symbols-outlined">menu</span></button>
                        <h2 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                            {selectedUser ? `IDENTITY: ${selectedUser.full_name?.toUpperCase()}` : selectedKycUser ? `KYC: ${selectedKycUser.full_name?.toUpperCase()}` : activeSection.replace('_', ' ').toUpperCase()}
                        </h2>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-4">
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-[#233648] rounded-lg px-2.5 py-1 w-48"><span className="material-symbols-outlined text-slate-400 text-[16px]">search</span><input className="bg-transparent border-none focus:ring-0 text-xs w-full placeholder:text-slate-400 dark:text-white" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                        <button onClick={() => fetchData()} className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"><span className={`material-symbols-outlined text-[14px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span><span className="hidden md:inline">Sync Node</span></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-2.5 md:p-8 space-y-2.5 md:space-y-8 custom-scrollbar bg-slate-50 dark:bg-[#0d141b]">
                    {selectedUser ? (
                        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-2 duration-300 space-y-4 md:space-y-6">
                            <button onClick={() => { setSelectedUser(null); setDeleteConfirmStep(0); setSelectedUserAssets([]); }} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4 text-xs font-bold uppercase transition-colors"><ArrowLeft size={14} /> Back to Registry</button>
                            <div className="bg-white dark:bg-[#111a22] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-[#324d67] shadow-xl overflow-hidden">
                                <div className="p-4 md:p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-4 md:gap-10">
                                    <div className="size-16 md:size-32 rounded-2xl md:rounded-3xl bg-slate-800 flex items-center justify-center font-black text-2xl md:text-4xl text-white shadow-2xl relative">
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                        <div className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1 md:p-2 rounded-lg md:rounded-xl shadow-lg border-2 md:border-4 border-white dark:border-[#111a22] ${selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? 'bg-red-500' : 'bg-emerald-500'}`}>{selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? <ShieldAlert size={12} className="text-white md:w-[16px]" /> : <UserCheck size={12} className="text-white md:w-[16px]" />}</div>
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <h3 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedUser.full_name || 'Anonymous User'}</h3>
                                        <p className="text-slate-500 font-mono text-[10px] md:text-xs">{selectedUser.email}</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-1.5 md:gap-2 mt-2 md:mt-4"><span className="px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">KYC Tier {selectedUser.kyc_level !== undefined && selectedUser.kyc_level !== null ? selectedUser.kyc_level : 0}</span><span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase border ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>{selectedUser.role || 'User'}</span></div>
                                    </div>
                                </div>

                                {isLoadingUserDetails ? (
                                    <div className="p-10 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accessing User Ledger Node...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 md:p-10 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-2 mb-4 md:mb-8">
                                                <Wallet size={16} className="text-blue-600 md:w-[18px]" />
                                                <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Unified Asset Controller</h4>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700">
                                                    <div className="p-4 md:p-8 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Ledger Node</p>
                                                                {selectedUserAccounts.length > 0 ? (
                                                                    <div className="relative group">
                                                                        <select
                                                                            value={selectedUserAccount?.id || ''}
                                                                            onChange={(e) => {
                                                                                const acc = selectedUserAccounts.find(a => String(a.id) === e.target.value);
                                                                                setSelectedUserAccount(acc || null);
                                                                            }}
                                                                            className="appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg px-2 py-1 -ml-2 text-sm md:text-base font-bold text-slate-900 dark:text-white cursor-pointer transition-colors pr-8 outline-none border border-transparent focus:border-primary/20"
                                                                        >
                                                                            {selectedUserAccounts.map(acc => (
                                                                                <option key={acc.id} value={acc.id} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-white">
                                                                                    {acc.name} — {acc.type}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm font-bold text-slate-500 italic">No ledgers provisioned.</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 rounded text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <span className="text-[8px] font-black uppercase tracking-widest">Live Node</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-baseline gap-1 md:gap-2">
                                                            <h5 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                                ${(Number(selectedUserAccount?.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </h5>
                                                            <span className="text-slate-400 text-[10px] md:text-xs font-bold">USD</span>
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-between">
                                                            <p className="text-[8px] md:text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                                                <ArrowRightLeft size={8} /> ID: {selectedUserAccount?.account_number || 'UNKNOWN'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 md:p-8 space-y-3 md:space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase ml-1">Adj. Amount</label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                                                                    <input type="number" value={adjAmount} onChange={e => setAdjAmount(e.target.value)} placeholder="0.00" className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase ml-1">Statement</label>
                                                                <input type="text" value={adjDescription} onChange={e => setAdjDescription(e.target.value)} placeholder="Reasoning..." className="w-full px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-medium dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button onClick={() => handleAdjustBalance('credit')} disabled={isActionLoading === 'balance_adj'} className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-black uppercase text-[8px] md:text-[10px] flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50">
                                                                {isActionLoading === 'balance_adj' ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Fund Node
                                                            </button>
                                                            <button onClick={() => handleAdjustBalance('debit')} disabled={isActionLoading === 'balance_adj'} className="py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black uppercase text-[8px] md:text-[10px] flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50">
                                                                {isActionLoading === 'balance_adj' ? <Loader2 size={12} className="animate-spin" /> : <Minus size={12} />} Debit Node
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 md:p-10 bg-[#0f172a] border-b border-white/5 rounded-2xl mx-3 md:mx-10 mt-6 shadow-2xl border border-slate-800">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <PlusCircle size={18} className="text-blue-500" />
                                                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Manual Transaction Protocol</h4>
                                                </div>
                                                <button
                                                    onClick={() => setShowCreateTxModal(true)}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={14} /> Create Transaction
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-relaxed max-w-lg mb-4">Trigger a manual entry or auto-generate bulk transaction history for this user's ledger.</p>

                                            {/* Auto Generator */}
                                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles size={14} className="text-amber-400" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Generator</span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Min Amount</label>
                                                        <input type="number" min="0" step="0.01" value={txGenerator.minAmount} onChange={e => setTxGenerator({ ...txGenerator, minAmount: e.target.value })} placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[11px] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Max Amount</label>
                                                        <input type="number" min="0" step="0.01" value={txGenerator.maxAmount} onChange={e => setTxGenerator({ ...txGenerator, maxAmount: e.target.value })} placeholder="0.00" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[11px] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">From Date</label>
                                                        <input type="date" value={txGenerator.fromDate} onChange={e => setTxGenerator({ ...txGenerator, fromDate: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[11px] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">To Date</label>
                                                        <input type="date" value={txGenerator.toDate} onChange={e => setTxGenerator({ ...txGenerator, toDate: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[11px] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Count</label>
                                                        <input type="number" min="1" max="100" value={txGenerator.count} onChange={e => setTxGenerator({ ...txGenerator, count: e.target.value })} placeholder="1-100" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-[11px] text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div className="space-y-1 col-span-2 md:col-span-3 lg:col-span-6">
                                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Types (Multi-Select)</label>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {['Top up','Bills','Investments','Transfers','Request','Stocks','Withdrawal','Salary','Shopping','Groceries'].map(t => {
                                                                const isSelected = txGenerator.type.includes(t);
                                                                return (
                                                                    <button
                                                                        key={t}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next = isSelected
                                                                                ? txGenerator.type.filter(x => x !== t)
                                                                                : [...txGenerator.type, t];
                                                                            setTxGenerator({ ...txGenerator, type: next.length ? next : ['Top up'] });
                                                                        }}
                                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors border ${isSelected ? 'bg-blue-600/30 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}
                                                                    >
                                                                        {isSelected ? <CheckCircle size={10} className="inline mr-1" /> : null}{t}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        onClick={handleGenerateTransactions}
                                                        disabled={isActionLoading === 'generate_tx'}
                                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isActionLoading === 'generate_tx' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                        Generate Transactions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 md:p-10 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-4 md:mb-8">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard size={16} className="text-blue-600 md:w-[18px]" />
                                                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Provisioned Node Cards</h4>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setAdminAddCardForm(prev => ({ ...prev, holder: (selectedUser?.full_name || '').toUpperCase() }));
                                                        setShowAddCardModal(true);
                                                    }}
                                                    className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                            {selectedUserCards.length > 0 ? (
                                                <div className="flex overflow-x-auto gap-3 md:gap-6 pb-4 md:pb-8 custom-scrollbar snap-x px-1">
                                                    {selectedUserCards.map((card, idx) => (
                                                        <div key={card.id || idx} className="min-w-[220px] md:min-w-[280px] snap-start flex flex-col gap-2">
                                                            <AdminCardReplica card={card} isDefault={card.is_default == "1" || card.is_default == 1 || card.is_default === true || card.type === APP_CONFIG.PREMIUM_CARD_NAME} />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button onClick={() => setCardAction({ card, type: 'credit' })} className="py-2 bg-slate-200 dark:bg-slate-800 text-emerald-600 font-black uppercase text-[9px] rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-1"><Plus size={10} /> Fund</button>
                                                                <button onClick={() => setCardAction({ card, type: 'debit' })} className="py-2 bg-slate-200 dark:bg-slate-800 text-red-600 font-black uppercase text-[9px] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1"><Minus size={10} /> Debit</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-6 md:py-10 text-center bg-white dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <CreditCard size={24} className="mx-auto text-slate-300 mb-2 md:w-[32px]" />
                                                    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase">No node-linked assets found.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Bank Accounts Management Panel ── */}
                                        <div className="p-3 md:p-10 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Landmark size={16} className="text-amber-500 md:w-[18px]" />
                                                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Bank Accounts</h4>
                                                </div>
                                                {(() => {
                                                    const typeCounts: Record<string, number> = {};
                                                    selectedUserAccounts.forEach(a => {
                                                        const t = (a.type || '').toLowerCase();
                                                        typeCounts[t] = (typeCounts[t] || 0) + 1;
                                                    });
                                                    const dupeCount = Object.values(typeCounts).filter(c => c > 1).reduce((s, c) => s + (c - 1), 0);
                                                    return dupeCount > 0 ? (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                                                            <AlertTriangle size={10} /> {dupeCount} Duplicate{dupeCount > 1 ? 's' : ''} Detected
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                            {selectedUserAccounts.length > 0 ? (
                                                <div className="space-y-2">
                                                    {(() => {
                                                        const typeCounts: Record<string, number> = {};
                                                        selectedUserAccounts.forEach(a => {
                                                            const t = (a.type || '').toLowerCase();
                                                            typeCounts[t] = (typeCounts[t] || 0) + 1;
                                                        });
                                                        return selectedUserAccounts.map((acc: any) => {
                                                            const normalizedType = (acc.type || '').toLowerCase();
                                                            const isDuplicate = typeCounts[normalizedType] > 1;
                                                            const isMain = acc.is_main == 1 || acc.is_main === true || acc.is_main === '1';
                                                            const isSavings = normalizedType === 'savings' || (acc.name || '').toLowerCase().includes('saving');
                                                            return (
                                                                <div key={acc.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isDuplicate
                                                                    ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/20'
                                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                                    }`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSavings ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                                            }`}>
                                                                            {isSavings ? <Landmark size={14} /> : <CreditCard size={14} />}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.name || acc.type}</p>
                                                                                {isMain && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[8px] font-black uppercase rounded border border-blue-200 dark:border-blue-500/20">Primary</span>}
                                                                                {isDuplicate && <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[8px] font-black uppercase rounded border border-orange-200 dark:border-orange-500/20 animate-pulse">Duplicate</span>}
                                                                            </div>
                                                                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">#{acc.account_number || acc.id} · {acc.type || 'Unknown'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        <div className="text-right">
                                                                            <p className={`text-sm font-black font-mono ${isDuplicate ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'
                                                                                }`}>${Number(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                                            <p className="text-[8px] text-slate-400 uppercase font-bold">USD</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setDeleteConfirmation({ type: 'account', id: acc.id })}
                                                                            disabled={isActionLoading === `delete_confirm_${acc.id}`}
                                                                            title={isDuplicate ? 'Delete duplicate account' : 'Delete account'}
                                                                            className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${isDuplicate
                                                                                ? 'bg-orange-100 dark:bg-orange-500/10 hover:bg-red-600 text-orange-600 dark:text-orange-400 hover:text-white border border-orange-200 dark:border-orange-500/20'
                                                                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-red-600 text-slate-500 dark:text-slate-400 hover:text-white'
                                                                                }`}
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center bg-white dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <Landmark size={24} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase">No accounts found for this user.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 md:p-10 bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                            <div className="flex items-center justify-between mb-4 md:mb-8">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp size={16} className="text-blue-600 md:w-[18px]" />
                                                    <h4 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Portfolio Asset Nodes</h4>
                                                </div>
                                            </div>
                                            {selectedUserAssets.length > 0 ? (
                                                <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 md:pb-6 custom-scrollbar snap-x px-1">
                                                    {selectedUserAssets.map((asset, idx) => {
                                                        const isPositive = asset.is_positive == "1" || asset.is_positive == 1 || asset.is_positive === true;
                                                        return (
                                                            <div key={asset.id || idx} className="min-w-[180px] md:min-w-[220px] snap-start bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="font-black text-slate-900 dark:text-white text-xs md:text-sm">{asset.symbol}</span>
                                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{isPositive ? '+' : ''}{Number(asset.growth).toFixed(2)}%</span>
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 mb-1 truncate">{asset.name}</p>
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-[9px]">
                                                                            <span className="text-slate-400">Shares</span>
                                                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{Number(asset.shares).toFixed(4)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-[9px]">
                                                                            <span className="text-slate-400">Basis</span>
                                                                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${Number(asset.amount).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => handleOpenAssetEdit(asset)} className="w-full mt-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-[9px] font-bold uppercase transition-colors flex items-center justify-center gap-1">
                                                                    <Edit3 size={10} /> Edit Node
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-6 md:py-10 text-center bg-white dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <TrendingUp size={24} className="mx-auto text-slate-300 mb-2 md:w-[32px]" />
                                                    <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase">No investment nodes found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="p-3 md:p-10 space-y-6 md:space-y-10">
                                    <form onSubmit={handleUpdateUser} className="space-y-6 md:space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                                            <div className="space-y-1.5 md:space-y-2"><label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label><input value={selectedUser.full_name || ''} onChange={e => setSelectedUser({ ...selectedUser, full_name: e.target.value })} className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" /></div>
                                            <div className="space-y-1.5 md:space-y-2"><label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Terminal</label><input value={selectedUser.email || ''} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" /></div>
                                            <div className="space-y-1.5 md:space-y-2"><label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label><select value={selectedUser.role || 'user'} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })} className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"><option value="user">User Node</option><option value="admin">Admin Root</option></select></div>
                                            <div className="space-y-1.5 md:space-y-2"><label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KYC Level</label><select value={selectedUser.kyc_level !== undefined && selectedUser.kyc_level !== null ? selectedUser.kyc_level : 0} onChange={e => setSelectedUser({ ...selectedUser, kyc_level: Number(e.target.value) })} className="w-full p-2.5 md:p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"><option value={0}>Tier 0 (Unverified)</option><option value={1}>Tier 1 (Basic)</option><option value={2}>Tier 2 (Verified)</option></select></div>
                                        </div>
                                        <button type="submit" disabled={isActionLoading === 'update_user'} className="w-full py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50">{isActionLoading === 'update_user' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Commit Profile Changes</button>
                                    </form>

                                    <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] p-6 shadow-sm">
                                        <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ShieldCheck size={16} className="text-blue-500" /> Security Protocols
                                        </h3>

                                        <div className="space-y-6">
                                            {/* Account Status */}
                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl">
                                                <div>
                                                    <p className="text-xs font-bold dark:text-white uppercase">Account Status</p>
                                                    <p className="text-[10px] text-slate-500">Lock access to this identity node.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!selectedUser) return;
                                                        const actionKey = 'toggle_suspension';
                                                        setIsActionLoading(actionKey);
                                                        try {
                                                            const isSuspended = selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true;
                                                            const newStatus = !isSuspended;
                                                            const { error: suspErr } = await supabaseAdmin.from('mvp_profiles').update({ is_suspended: newStatus ? 1 : 0 }).eq('id', selectedUser.id);
                                                            if (suspErr) throw new Error(suspErr.message);

                                                            setSelectedUser({ ...selectedUser, is_suspended: newStatus });
                                                            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_suspended: newStatus ? 1 : 0 } : u));

                                                            setSuccessMsg(newStatus ? "Identity Node Locked" : "Identity Node Unlocked");
                                                            setTimeout(() => setSuccessMsg(null), 3000);
                                                        } catch (err: any) { setErrorMsg(err.message); }
                                                        finally { setIsActionLoading(null); }
                                                    }}
                                                    disabled={isActionLoading === 'toggle_suspension'}
                                                    className={`w-12 h-6 rounded-full relative transition-all disabled:opacity-50 ${selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>

                                            {/* PIN and Password */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                                                    <p className="text-xs font-bold dark:text-white uppercase mb-3">Access PIN</p>
                                                    {securityAction?.type === 'pin' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-2 text-xs font-mono dark:text-white outline-none focus:border-blue-500 transition-colors"
                                                                placeholder="New PIN (4 digits)"
                                                                maxLength={4}
                                                                value={securityAction.value}
                                                                onChange={(e) => setSecurityAction({ ...securityAction, value: e.target.value.replace(/\D/g, '') })}
                                                                autoFocus
                                                            />
                                                            <button onClick={handleResetPin} disabled={securityAction.value.length !== 4} className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"><Check size={14} /></button>
                                                            <button onClick={() => setSecurityAction(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setSecurityAction({ type: 'pin', value: '' })} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Reset PIN</button>
                                                    )}
                                                </div>

                                                <div className="p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                                                    <p className="text-xs font-bold dark:text-white uppercase mb-3">Login Password</p>
                                                    {securityAction?.type === 'password' ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-2 text-xs dark:text-white outline-none focus:border-blue-500 transition-colors"
                                                                placeholder="New Password"
                                                                value={securityAction.value}
                                                                onChange={(e) => setSecurityAction({ ...securityAction, value: e.target.value })}
                                                                autoFocus
                                                            />
                                                            <button onClick={handleResetPassword} disabled={!securityAction.value} className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"><Check size={14} /></button>
                                                            <button onClick={() => setSecurityAction(null)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"><X size={14} /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setSecurityAction({ type: 'password', value: '' })} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Reset Password</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] p-6 shadow-sm">
                                        <h3 className="text-sm font-black dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CreditCard size={16} className="text-blue-500" /> Node Assets (Cards)
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedUserCards.length > 0 ? selectedUserCards.map(card => {
                                                const isFrozen = card.is_frozen == 1 || card.is_frozen === "1" || card.is_frozen === true;
                                                return (
                                                    <div key={card.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white font-bold">{card.type}</div>
                                                            <div>
                                                                <p className="text-xs font-bold dark:text-white">**** {card.number?.slice(-4)}</p>
                                                                <p className="text-[10px] text-slate-500">{isFrozen ? 'FROZEN' : 'ACTIVE'} • Exp {card.expiry}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleToggleCardFreeze(card); }}
                                                            disabled={isActionLoading === `freeze_card_${card.id}`}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors flex items-center gap-1 ${isFrozen ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        >
                                                            {isActionLoading === `freeze_card_${card.id}` ? <Loader2 size={12} className="animate-spin" /> : (isFrozen ? <Unlock size={12} /> : <Lock size={12} />)}
                                                            {isFrozen ? 'Unfreeze' : 'Freeze'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setDeleteConfirmation({ type: 'card', id: card.id });
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Delete Asset"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                );
                                            }) : (
                                                <div className="text-center p-4 text-slate-400 text-xs font-bold uppercase">No card assets provisioned.</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 md:p-8">
                                        <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                                            <div>
                                                <h4 className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldX size={16} /> Danger Zone
                                                </h4>
                                                <p className="text-xs text-red-800 dark:text-red-300 mt-2 max-w-md leading-relaxed">
                                                    Critical actions that restrict or permanently remove this identity from the system.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-nowrap justify-end">
                                                {deleteConfirmStep === 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (!selectedUser) return;
                                                            const actionKey = 'toggle_suspension_danger';
                                                            setIsActionLoading(actionKey);
                                                            try {
                                                                const isSuspended = selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true;
                                                                const newStatus = !isSuspended;
                                                                const { error: suspErr } = await supabaseAdmin.from('mvp_profiles').update({ is_suspended: newStatus ? 1 : 0 }).eq('id', selectedUser.id);
                                                                if (suspErr) throw new Error(suspErr.message);
                                                                setSelectedUser({ ...selectedUser, is_suspended: newStatus });
                                                                setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_suspended: newStatus ? 1 : 0 } : u));
                                                                setSuccessMsg(newStatus ? "Identity Suspended" : "Identity Restored");
                                                                setTimeout(() => setSuccessMsg(null), 3000);
                                                            } catch (err: any) { setErrorMsg(err.message); }
                                                            finally { setIsActionLoading(null); }
                                                        }}
                                                        disabled={isActionLoading === 'toggle_suspension_danger'}
                                                        className={`px-4 md:px-6 py-3 font-black uppercase text-[10px] rounded-xl transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 ${selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40' : 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'}`}
                                                    >
                                                        {isActionLoading === 'toggle_suspension_danger' ? <Loader2 size={14} className="animate-spin shrink-0" /> : <ShieldAlert size={14} className="shrink-0" />}
                                                        <span className="shrink-0">{selectedUser.is_suspended == "1" || selectedUser.is_suspended == 1 || selectedUser.is_suspended === true ? 'Unsuspend' : 'Suspend'}</span>
                                                    </button>
                                                )}
                                                {deleteConfirmStep === 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteConfirmStep(1)}
                                                        className="px-4 md:px-6 py-3 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-black uppercase text-[10px] rounded-xl hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm whitespace-nowrap shrink-0"
                                                    >
                                                        Delete
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteConfirmStep(0)}
                                                            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] rounded-xl hover:bg-slate-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleDeleteUser}
                                                            disabled={isActionLoading === 'delete_user'}
                                                            className="px-6 py-3 bg-red-600 text-white font-black uppercase text-[10px] rounded-xl hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                                                        >
                                                            {isActionLoading === 'delete_user' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                            Confirm Purge
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedKycUser ? (
                        <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                            <button onClick={() => setSelectedKycUser(null)} className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 text-xs font-bold uppercase transition-colors"><ArrowLeft size={14} /> Back to Queue</button>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white dark:bg-[#111a22] p-6 rounded-2xl border border-slate-200 dark:border-[#324d67] shadow-sm flex items-center gap-4">
                                    <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-slate-400">
                                        {selectedKycUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedKycUser.full_name}</h2>
                                        <p className="text-xs text-slate-500 font-mono mb-2">{selectedKycUser.email}</p>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${selectedKycUser.kyc_level >= 2 ? 'bg-emerald-100 text-emerald-700' : selectedKycUser.kyc_level === 1 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>Current Tier: {selectedKycUser.kyc_level !== undefined && selectedKycUser.kyc_level !== null ? selectedKycUser.kyc_level : 0}</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-white dark:bg-[#111a22] p-6 rounded-2xl border border-slate-200 dark:border-[#324d67] shadow-sm flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Review Decision</h3>
                                        <p className="text-xs text-slate-500">Apply action to all submitted documents.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdateKycStatus(selectedKycUser.user_id, 'reject_all', 'rejected')}
                                            disabled={isActionLoading === `kyc-${selectedKycUser.user_id}-reject_all-rejected`}
                                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isActionLoading === `kyc-${selectedKycUser.user_id}-reject_all-rejected` ? <Loader2 className="animate-spin" size={14} /> : 'Reject All'}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateKycStatus(selectedKycUser.user_id, 'batch', 'verified')}
                                            disabled={isActionLoading === `kyc-${selectedKycUser.user_id}-batch-verified`}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-50 shadow-lg shadow-emerald-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isActionLoading === `kyc-${selectedKycUser.user_id}-batch-verified` ? <Loader2 className="animate-spin" size={14} /> : <><CheckCircle size={14} /> Approve All & Upgrade</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {['governmentId', 'selfie', 'proofAddress'].map((key) => {
                                    const docs = typeof selectedKycUser.kyc_documents === 'string' ? JSON.parse(selectedKycUser.kyc_documents) : (selectedKycUser.kyc_documents || {});
                                    const settings = typeof selectedKycUser.settings === 'string' ? JSON.parse(selectedKycUser.settings) : (selectedKycUser.settings || {});
                                    const status = settings.kycStatus?.[key] || 'required';
                                    const imageUrl = docs[key];
                                    const labels: any = { governmentId: 'Government ID', selfie: 'Selfie Verification', proofAddress: 'Proof of Address' };

                                    const approveKey = `kyc-${selectedKycUser.user_id}-${key}-verified`;
                                    const rejectKey = `kyc-${selectedKycUser.user_id}-${key}-rejected`;
                                    const isApproveLoading = isActionLoading === approveKey;
                                    const isRejectLoading = isActionLoading === rejectKey;
                                    const isDocUpdating = isApproveLoading || isRejectLoading;

                                    return (
                                        <div key={key} className={`bg-white dark:bg-[#111a22] rounded-2xl border overflow-hidden transition-all ${status === 'verified' ? 'border-emerald-500/50 shadow-emerald-500/10' : status === 'rejected' ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-200 dark:border-[#324d67]'} shadow-sm flex flex-col`}>
                                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">{labels[key]}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${status === 'verified' ? 'bg-emerald-100 text-emerald-700' : status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{status}</span>
                                            </div>
                                            <div className="aspect-[4/3] bg-slate-100 dark:bg-black/40 relative group">
                                                {imageUrl ? (
                                                    <>
                                                        <img src={imageUrl} alt={key} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button onClick={() => setPreviewDoc(imageUrl)} className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg text-xs font-bold border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2"><Eye size={14} /> View Full</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                                        <p className="text-[10px] font-bold uppercase tracking-widest">No Document</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 flex gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleUpdateKycStatus(selectedKycUser.user_id, key, 'rejected')}
                                                    disabled={!imageUrl || isDocUpdating}
                                                    className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isRejectLoading ? <Loader2 className="animate-spin" size={14} /> : 'Reject'}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateKycStatus(selectedKycUser.user_id, key, 'verified')}
                                                    disabled={!imageUrl || isDocUpdating}
                                                    className="flex-1 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isApproveLoading ? <Loader2 className="animate-spin" size={14} /> : 'Approve'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeSection === 'overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-6">
                                        <div className="bg-white dark:bg-[#111a22] p-2.5 md:p-6 rounded-xl border border-slate-200 dark:border-[#324d67] shadow-sm">
                                            <div className="flex justify-between items-start mb-2 md:mb-4"><span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-[#92adc9]">Identities</span><div className="p-1 md:p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><span className="material-symbols-outlined text-[14px] md:text-[18px]">group</span></div></div>
                                            <p className="text-xl md:text-3xl font-bold dark:text-white">{users.length.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#111a22] p-2.5 md:p-6 rounded-xl border border-slate-200 dark:border-[#324d67] shadow-sm">
                                            <div className="flex justify-between items-start mb-2 md:mb-4"><span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-[#92adc9]">Ledger Flows</span><div className="p-1 md:p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-blue-400 rounded-lg"><span className="material-symbols-outlined text-[14px] md:text-[18px]">swap_horiz</span></div></div>
                                            <p className="text-xl md:text-3xl font-bold dark:text-white">{transactions.length.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#111a22] p-2.5 md:p-6 rounded-xl border border-slate-200 dark:border-[#324d67] shadow-sm">
                                            <div className="flex justify-between items-start mb-2 md:mb-4"><span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-[#92adc9]">Liquidity</span><div className="p-1 md:p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><span className="material-symbols-outlined text-[14px] md:text-[18px]">account_balance_wallet</span></div></div>
                                            <p className="text-xl md:text-3xl font-bold dark:text-white">${(totalLiquidity / 1000).toFixed(0)}k</p>
                                        </div>
                                        <div className="bg-white dark:bg-[#111a22] p-2.5 md:p-6 rounded-xl border border-slate-200 dark:border-[#324d67] shadow-sm">
                                            <div className="flex justify-between items-start mb-2 md:mb-4"><span className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-[#92adc9]">Signals</span><div className="p-1 md:p-2 bg-orange-50 dark:bg-emerald-900/20 text-orange-600 dark:text-orange-400 rounded-lg"><span className="material-symbols-outlined text-[14px] md:text-[18px]">confirmation_number</span></div></div>
                                            <p className="text-xl md:text-3xl font-bold dark:text-white">{supportTickets.filter(t => t.status === 'Open').length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] p-2.5 md:p-6">
                                        <h3 className="text-xs md:text-lg font-bold dark:text-white mb-6">Network Activity Trace</h3>
                                        <div className="h-40 md:h-64 relative"><ResponsiveContainer width="100%" height="100%"><AreaChart data={volumeChartData}><defs><linearGradient id="colorV" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="#137fec" stopOpacity={0.2} /><stop offset="95%" stopColor="#137fec" stopOpacity={0} /></linearGradient></defs><Area type="monotone" dataKey="v" stroke="#137fec" strokeWidth={2} fillOpacity={1} fill="url(#colorV)" /></AreaChart></ResponsiveContainer></div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'users' && (
                                <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] overflow-hidden animate-in fade-in duration-300">
                                    <div className="px-3 md:px-6 py-2.5 md:py-5 border-b border-slate-200 dark:border-[#233648] flex justify-between items-center"><h3 className="text-sm md:text-lg font-bold dark:text-white uppercase tracking-tighter">Registry Nodes</h3></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[600px] md:min-w-full">
                                            <thead><tr className="bg-slate-50 dark:bg-[#233648]/50 text-slate-500 dark:text-[#92adc9] text-[9px] md:text-xs font-black uppercase tracking-widest"><th className="px-3 md:px-6 py-2 md:py-3">Identity</th><th className="px-3 md:px-6 py-2 md:py-3">Role</th><th className="px-3 md:px-6 py-2 md:py-3">Signal State</th><th className="px-3 md:px-6 py-2 md:py-3 text-right">Manage</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-[#233648]">
                                                {paginatedUsers.map(u => {
                                                    const isLocked = u.is_suspended == "1" || u.is_suspended == 1 || u.is_suspended === true;
                                                    return (<tr key={u.id} onClick={() => setSelectedUser({ ...u, is_suspended: isLocked })} className="hover:bg-slate-50 dark:hover:bg-[#233648]/30 transition-all cursor-pointer group">
                                                        <td className="px-3 md:px-6 py-2 md:py-4 flex items-center gap-2"><div className="size-8 md:size-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white shadow-inner text-[10px] md:text-xs group-hover:scale-105 transition-transform">{u.full_name?.charAt(0) || 'U'}</div><div className="truncate max-w-[120px] md:max-w-none"><p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors">{u.full_name || 'Anonymous'}</p><p className="text-[8px] md:text-[9px] text-slate-500 font-mono opacity-60">{u.email}</p></div></td>
                                                        <td className="px-3 md:px-6 py-2 md:py-4"><span className={`px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black uppercase border ${u.role === 'admin' ? 'text-purple-600 border-purple-500/30 bg-purple-50/5' : 'text-blue-600 border-blue-500/30 bg-blue-50/5'}`}>{u.role || 'User'}</span></td>
                                                        <td className="px-3 md:px-6 py-2 md:py-4"><span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase border ${u.kyc_level >= 2 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : u.kyc_level === 1 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>KYC Tier {u.kyc_level !== undefined && u.kyc_level !== null ? u.kyc_level : 0}</span></td>
                                                        <td className="px-3 md:px-6 py-2 md:py-4 text-right"><span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span></td>
                                                    </tr>);
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <PaginationControls currentPage={currentPage} totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                </div>
                            )}

                            {activeSection === 'transactions' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] p-4 md:p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><ArrowRightLeft size={20} className="text-blue-500" /> Global Ledger</h3>
                                            <button onClick={() => setTxFilters({ search: '', type: 'All', status: 'All', startDate: '', endDate: '', minAmount: '', maxAmount: '' })} className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1"><RefreshCw size={12} /> Reset Filters</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                                            <div className="col-span-2 md:col-span-2 relative">
                                                <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" placeholder="Search ref, desc, user..." value={txFilters.search} onChange={e => setTxFilters({ ...txFilters, search: e.target.value })} className="w-full pl-9 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 dark:bg-[#233648]/50 text-slate-500 dark:text-[#92adc9] text-[9px] font-black uppercase tracking-widest">
                                                    <tr>
                                                        <th className="px-4 py-3">Ref ID</th>
                                                        <th className="px-4 py-3">User Entity</th>
                                                        <th className="px-4 py-3">Type</th>
                                                        <th className="px-4 py-3">Description</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-[#233648] text-xs font-medium dark:text-slate-300">
                                                    {paginatedTransactions.map(t => {
                                                        const user = users.find(u => u.user_id === t.user_id);
                                                        const isNegative = t.amount < 0 || ['Withdrawal', 'Transfer Out', 'Payment', 'Purchase'].includes(t.type);
                                                        return (
                                                            <tr key={t.id} onClick={() => handleOpenTxEdit(t)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                                                <td className="px-4 py-3 font-mono text-[10px] text-slate-400 group-hover:text-blue-400">{t.uuid || t.id}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">{user?.full_name?.charAt(0) || 'U'}</div>
                                                                        <div className="truncate max-w-[120px]"><p className="font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Unknown'}</p><p className="text-[8px] text-slate-400">{new Date(t.date).toLocaleDateString()}</p></div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold uppercase tracking-tight">{t.type}</span></td>
                                                                <td className="px-4 py-3 truncate max-w-[200px]" title={t.description}>{t.description}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${t.status === 'Success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800' : t.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                                        {t.status}
                                                                    </span>
                                                                </td>
                                                                <td className={`px-4 py-3 text-right font-bold ${isNegative ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                                    {isNegative ? '' : '+'}${Math.abs(Number(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <PaginationControls currentPage={currentPage} totalItems={adminFilteredTransactions.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                    </div>
                                </div>
                            )}

                            {activeSection === 'requests' && (
                                <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] overflow-hidden animate-in fade-in duration-300">
                                    <div className="px-3 md:px-6 py-5 border-b border-slate-200 dark:border-[#233648] flex justify-between items-center">
                                        <h3 className="text-sm md:text-lg font-bold dark:text-white uppercase tracking-tighter">Pending Transaction Requests</h3>
                                        <button onClick={() => fetchData()} className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1"><RefreshCw size={12} /> Refresh Queue</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead><tr className="bg-slate-50 dark:bg-[#233648]/50 text-slate-500 dark:text-[#92adc9] text-[9px] md:text-xs font-black uppercase tracking-widest"><th className="px-6 py-3">Timestamp</th><th className="px-6 py-3">User Entity</th><th className="px-6 py-3">Details</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3 text-right">Decision</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-[#233648]">
                                                {transactions.filter(t => t.status === 'Pending' || recentActions[t.id] || recentActions[t.uuid]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => {
                                                    const user = users.find(u => u.user_id === t.user_id);
                                                    const action = recentActions[t.id] || recentActions[t.uuid];
                                                    return (
                                                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#233648]/30 transition-all group">
                                                            <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{new Date(t.date).toLocaleString()}</td>
                                                            <td className="px-6 py-4 flex items-center gap-3">
                                                                <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-white text-[10px] shadow-inner uppercase">{user?.full_name?.charAt(0) || 'U'}</div>
                                                                <div><p className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter text-xs">{user?.full_name || 'Anonymous'}</p><p className="text-[8px] font-mono text-slate-500">{user?.email}</p></div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-bold uppercase tracking-tight mr-2">{t.type}</span>
                                                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.description}</span>
                                                            </td>
                                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-xs">${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                                {action ? (
                                                                    action === 'approved' ? (
                                                                        <button disabled className="px-4 py-1.5 bg-emerald-600/20 text-emerald-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-default opacity-100 border border-emerald-600/20"><CheckCircle size={12} /> Approved</button>
                                                                    ) : (
                                                                        <button disabled className="px-4 py-1.5 bg-red-600/20 text-red-600 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-default opacity-100 border border-red-600/20"><X size={12} /> Declined</button>
                                                                    )
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => handleRejectRequest(t.id)} disabled={isActionLoading === `reject_${t.id}`} className="p-1.5 md:px-3 md:py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-[9px] font-black uppercase hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 flex items-center gap-1">{isActionLoading === `reject_${t.id}` ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}<span className="hidden md:inline">Reject</span></button>
                                                                        <button onClick={() => handleApproveRequest(t.id)} disabled={isActionLoading === `approve_${t.id}`} className="p-1.5 md:px-3 md:py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1">{isActionLoading === `approve_${t.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}<span className="hidden md:inline">Approve</span></button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {transactions.filter(t => t.status === 'Pending').length === 0 && (
                                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No pending requests found in the ledger.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'kyc' && (
                                <div className="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] overflow-hidden animate-in fade-in duration-300">
                                    <div className="px-3 md:px-6 py-5 border-b border-slate-200 dark:border-[#233648] flex justify-between items-center">
                                        <h3 className="text-sm md:text-lg font-bold dark:text-white uppercase tracking-tighter">Identity Verification Queue</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead><tr className="bg-slate-50 dark:bg-[#233648]/50 text-slate-500 dark:text-[#92adc9] text-[9px] md:text-xs font-black uppercase tracking-widest"><th className="px-6 py-3">User Node</th><th className="px-6 py-3">Packets</th><th className="px-6 py-3 text-right">Review</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-[#233648]">
                                                {paginatedKycUsers.map(u => {
                                                    const docs = typeof u.kyc_documents === 'string' ? JSON.parse(u.kyc_documents) : (u.kyc_documents || {});
                                                    const docCount = Object.keys(docs).length;
                                                    return (
                                                        <tr key={u.id} onClick={() => setSelectedKycUser(u)} className="hover:bg-slate-50 dark:hover:bg-[#233648]/30 transition-all cursor-pointer group">
                                                            <td className="px-6 py-4 flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white text-xs shadow-inner uppercase">{u.full_name?.charAt(0) || 'U'}</div>
                                                                <div><p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{u.full_name || 'Anonymous'}</p><p className="text-[8px] font-mono text-slate-500">{u.email}</p></div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${docCount >= 3 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                                    {docCount}/3 Segments
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right"><span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-all">verified_user</span></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <PaginationControls currentPage={currentPage} totalItems={kycUsers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                </div>
                            )}

                            {activeSection === 'support_tickets' && (
                                <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white dark:bg-[#111a22] rounded-2xl border border-slate-200 dark:border-[#324d67] shadow-xl overflow-hidden animate-in fade-in duration-300">
                                    <div className={`${selectedTicketId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-[#233648] flex flex-col bg-slate-50/30 dark:bg-black/10`}>
                                        <div className="p-4 border-b border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22] flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Signals</h3>
                                            <button className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Filter size={14} /></button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            {paginatedTickets.map(ticket => {
                                                const user = users.find(u => u.user_id === ticket.user_id);
                                                const isUnread = liveMessages.some(m => String(m.ticket_id) === String(ticket.id) && m.sender === 'user' && (m.is_read == 0 || m.is_read == '0' || m.is_read === false)) || (ticket.is_read == 0 || ticket.is_read == '0' || ticket.is_read === false);
                                                return (
                                                    <div key={ticket.id} onClick={() => { setSelectedTicketId(ticket.id); setActiveChatUser(null); markMessagesAsRead(users.find(u => u.user_id === ticket.user_id)?.user_id || null, ticket.id); }} className={`p-4 border-b border-slate-100 dark:border-[#233648] cursor-pointer transition-all hover:bg-white dark:hover:bg-[#233648]/20 group relative ${selectedTicketId === ticket.id ? 'bg-white dark:bg-[#233648]/40 border-l-4 border-l-blue-500' : ''}`}>
                                                        {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] z-10"></div>}
                                                        <div className="flex gap-3">
                                                            <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg uppercase">{user?.full_name?.charAt(0) || 'U'}</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <h4 className={`text-xs font-black uppercase truncate tracking-tighter ${isUnread ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{user?.full_name || 'Anonymous'}</h4>
                                                                    <span className="text-[8px] text-slate-400 font-mono">{new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase truncate mb-1">{ticket.subject}</p>
                                                                <p className="text-[10px] text-slate-500 truncate italic">"{ticket.message}"</p>
                                                                <div className="mt-2 flex items-center justify-between">
                                                                    <span className={`text-[7px] px-2 py-0.5 rounded font-black uppercase border ${ticket.status === 'Open' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{ticket.status}</span>
                                                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTicket(ticket.id); }} className="relative z-30 p-2 -mr-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all active:scale-90" title="Delete Ticket"><Trash2 size={16} className="pointer-events-none" /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <PaginationControls currentPage={currentPage} totalItems={filteredTickets.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                    </div>
                                    <div className={`${selectedTicketId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#111a22]`}>
                                        {selectedTicket ? (
                                            <>
                                                <div className="p-3 md:p-4 border-b border-slate-200 dark:border-[#233648] flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setSelectedTicketId(null)} className="md:hidden p-1.5 -ml-1 text-slate-500"><ArrowLeft size={18} /></button>
                                                        <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] uppercase border border-white/10">{users.find(u => u.user_id === selectedTicket.user_id)?.full_name?.charAt(0)}</div>
                                                        <div className="min-w-0">
                                                            <h2 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">{users.find(u => u.user_id === selectedTicket.user_id)?.full_name}</h2>
                                                            <p className="text-[9px] text-blue-600 font-black uppercase tracking-tight truncate">{selectedTicket.subject}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleUpdateTicket(selectedTicket.id, selectedTicket.status === 'Open' ? 'Closed' : 'Open')} className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase shadow-lg transition-all active:scale-95 flex items-center gap-2 border ${selectedTicket.status === 'Open' ? 'bg-red-600 text-white hover:bg-red-500 border-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-700'}`} disabled={isActionLoading === `ticket-${selectedTicket.id}`}>{isActionLoading === `ticket-${selectedTicket.id}` ? <Loader2 size={14} className="animate-spin" /> : selectedTicket.status === 'Open' ? <X size={14} /> : <RotateCcw size={14} />}<span className="inline">{selectedTicket.status === 'Open' ? 'Close Ticket' : 'Re-open Ticket'}</span></button>
                                                        <button onClick={() => { setActiveSection('support_live'); setActiveChatUser(selectedTicket.user_id); setSelectedTicketId(null); }} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Open Live Chat"><MessageSquare size={16} /></button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-[5px] custom-scrollbar bg-slate-50/30 dark:bg-[#0d141b]/40">
                                                    <div className="flex flex-col gap-[5px] items-start">
                                                        <div className="w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl bg-white dark:bg-[#233648] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#324d67] rounded-tl-none text-[11px] md:text-xs font-medium shadow-sm leading-relaxed">
                                                            {renderMessageContent(selectedTicket.message)}
                                                            <div className="text-[8px] mt-1 opacity-40 font-mono">{new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>
                                                    </div>
                                                    {liveMessages.filter(m => String(m.ticket_id) === String(selectedTicket.id)).sort((a, b) => Number(a.id) - Number(b.id)).map(msg => (
                                                        <div key={msg.id} className={`flex items-end gap-2 group ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <div className={`w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl text-[11px] md:text-xs font-medium shadow-sm leading-relaxed relative ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#233648] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#324d67] rounded-tl-none'}`}>
                                                                {renderMessageContent(msg.text)}
                                                                <div className={`text-[8px] mt-1 opacity-40 font-mono flex items-center gap-1 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={chatEndRef} />
                                                </div>
                                                <div className="p-3 md:p-4 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                                                    <div className="flex gap-2 max-w-4xl mx-auto">
                                                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Reply to thread..." className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-[11px] md:text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                                        <button onClick={handleSendChat} disabled={!chatInput.trim()} className="size-9 md:size-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"><Send size={16} /></button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 space-y-4">
                                                <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full"><Inbox size={64} /></div>
                                                <div><h3 className="text-xl font-black uppercase tracking-tighter">Signal Monitor Idle</h3><p className="text-xs font-bold uppercase tracking-widest mt-2">Select an active support signal from the ledger.</p></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'email_templates' && (
                                <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white dark:bg-[#111a22] rounded-2xl border border-slate-200 dark:border-[#324d67] shadow-xl overflow-hidden animate-in fade-in duration-300">
                                    <div className={`${selectedTemplateId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-[#233648] flex flex-col bg-slate-50/30 dark:bg-black/10`}>
                                        <div className="p-4 border-b border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Email Templates</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            {EMAIL_TEMPLATES.map(template => (
                                                <div
                                                    key={template.id}
                                                    onClick={() => setSelectedTemplateId(template.id)}
                                                    className={`p-4 border-b border-slate-100 dark:border-[#233648] cursor-pointer transition-all hover:bg-white dark:hover:bg-[#233648]/20 group relative ${selectedTemplateId === template.id ? 'bg-white dark:bg-[#233648]/40 border-l-4 border-l-blue-500' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`text-xs font-black uppercase tracking-tighter ${selectedTemplateId === template.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                            {template.name}
                                                        </h4>
                                                        {selectedTemplateId === template.id && <div className="size-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate mb-1">Subject: {template.subject}</p>
                                                    <p className="text-[10px] text-slate-400 italic truncate">{template.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`${selectedTemplateId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#111a22]`}>
                                        {selectedTemplate ? (
                                            <>
                                                <div className="p-3 md:p-4 border-b border-slate-200 dark:border-[#233648] flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setSelectedTemplateId(null)} className="md:hidden p-1.5 -ml-1 text-slate-500"><ArrowLeft size={18} /></button>
                                                        <div>
                                                            <h2 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{selectedTemplate.name}</h2>
                                                            <p className="text-[9px] text-blue-600 font-black uppercase tracking-tight">Template Preview Mode</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">HTML Format</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="email"
                                                            placeholder="recipient@email.com"
                                                            value={testEmailRecipient}
                                                            onChange={(e) => setTestEmailRecipient(e.target.value)}
                                                            className="w-40 md:w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-[10px] dark:text-white outline-none focus:border-blue-500 transition-colors"
                                                        />
                                                        <button
                                                            onClick={handleSendTestEmail}
                                                            disabled={isSendingTestEmail || !testEmailRecipient}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                                                        >
                                                            {isSendingTestEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                            Send Test
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 dark:bg-[#0d141b] custom-scrollbar flex justify-center">
                                                    <div className="w-full max-w-[600px] bg-white rounded-xl shadow-lg overflow-hidden animate-in zoom-in duration-300 transform scale-95 md:scale-100 origin-top">
                                                        <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 space-y-4">
                                                <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full"><Mail size={64} /></div>
                                                <div><h3 className="text-xl font-black uppercase tracking-tighter">Select Template</h3><p className="text-xs font-bold uppercase tracking-widest mt-2">Choose an email layout to preview structure.</p></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'support_live' && (
                                <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-[#111a22] rounded-2xl border border-slate-200 dark:border-[#324d67] overflow-hidden shadow-xl animate-in fade-in duration-300">
                                    <div className={`${activeChatUser ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-[#233648] flex flex-col bg-slate-50/30 dark:bg-black/10`}>
                                        <div className="p-4 border-b border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2"><MessageSquare size={14} className="text-blue-500" /> AI Handover Terminals</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            {paginatedChatUsers.map(chat => (
                                                <div key={chat.user_id} onClick={() => { setActiveChatUser(chat.user_id); markMessagesAsRead(chat.user_id, null); }} className={`p-4 border-b border-slate-100 dark:border-[#233648] cursor-pointer transition-all hover:bg-white dark:hover:bg-[#233648]/20 group relative ${activeChatUser === chat.user_id ? 'bg-white dark:bg-[#233648]/40' : ''}`}>
                                                    {chat.unread > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                                                    <div className="flex gap-3">
                                                        <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg border border-white/5 uppercase">{chat.full_name?.charAt(0)}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate tracking-tighter">{chat.full_name}</h4>
                                                                <span className="text-[8px] text-slate-400 font-mono">{chat.last_time ? new Date(chat.last_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                            </div>
                                                            <p className={`text-[10px] truncate ${chat.unread > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>{chat.last_message || 'No history'}</p>
                                                            <div className="mt-2 flex items-center justify-between">
                                                                {chat.active ? (<div className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span><span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Support Active</span></div>) : <div />}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteConversation(chat.user_id); }}
                                                                    className="p-1.5 text-slate-400 dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                    title="Delete Conversation"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <PaginationControls currentPage={currentPage} totalItems={chatUsers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                    </div>
                                    <div className={`${activeChatUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#111a22]`}>
                                        {activeChatUser ? (
                                            <>
                                                <div className="p-3 md:p-4 border-b border-slate-200 dark:border-[#233648] flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setActiveChatUser(null)} className="md:hidden p-1.5 -ml-1 text-slate-500"><ArrowLeft size={18} /></button>
                                                        <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] uppercase border border-white/10">{users.find(u => u.user_id === activeChatUser)?.full_name?.charAt(0)}</div>
                                                        <div>
                                                            <h4 className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">{users.find(u => u.user_id === activeChatUser)?.full_name}</h4>
                                                            <p className="text-[9px] text-slate-400 font-mono uppercase">Live Connection</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={handleResolveSession} disabled={isActionLoading === 'resolve_session' || !isCurrentChatHandoverActive} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${isCurrentChatHandoverActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`} title={!isCurrentChatHandoverActive ? "No active support request on this channel" : "Resolve Signal"}>{isActionLoading === 'resolve_session' ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />} Resolve Signal</button>
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-[5px] custom-scrollbar bg-slate-50/30 dark:bg-[#0d141b]/40">
                                                    {liveMessages.filter(m => m.user_id === activeChatUser && (!m.ticket_id || m.ticket_id === "null")).sort((a, b) => Number(a.id) - Number(b.id)).map(msg => {
                                                        if (msg.text?.includes("SESSION_RESOLVED_AI_RESUMED")) {
                                                            return (<div key={msg.id} className="flex justify-center py-2 animate-in fade-in zoom-in duration-500"><div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"><CheckCircle size={10} className="text-emerald-600" /><span className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">Session Resolved</span></div></div>);
                                                        }
                                                        return (
                                                            <div key={msg.id} className={`flex items-end gap-2 group ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                <div className={`w-fit max-w-[85%] p-1.5 md:p-2 rounded-xl text-[11px] md:text-xs font-medium shadow-sm leading-relaxed ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-[#233648] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#324d67] rounded-tl-none'}`}>
                                                                    {msg.text?.includes("USER_REQUESTED_LIVE_CHAT") ? (<div className="flex items-center gap-2 text-red-500 font-black uppercase text-[10px]"><AlertTriangle size={14} /> Client requested live support.</div>) : renderMessageContent(msg.text)}
                                                                    <div className={`text-[8px] mt-1 opacity-40 font-mono flex items-center gap-1 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div ref={chatEndRef} />
                                                </div>
                                                <div className="p-3 md:p-4 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22]">
                                                    <div className="flex gap-2 max-w-4xl mx-auto">
                                                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()} placeholder="Transmit response..." className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 md:px-4 py-2 md:py-3 text-[11px] md:text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                                        <button onClick={handleSendChat} disabled={!chatInput.trim()} className="size-9 md:size-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"><Send size={16} /></button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 space-y-4">
                                                <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-full"><MessageSquare size={64} /></div>
                                                <div><h3 className="text-xl font-black uppercase tracking-tighter">Support Terminal Idle</h3><p className="text-xs font-bold uppercase tracking-widest mt-2">Select a synchronized node to establish connectivity.</p></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSection === 'email_live_chat' && <AdminLiveChat />}

                            {activeSection === 'bank_management' && (
                                <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-300">
                                    <div className="bg-white dark:bg-[#111a22] rounded-xl md:rounded-2xl border border-slate-200 dark:border-[#324d67] p-4 md:p-6 shadow-sm">
                                        <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2"><Plus size={18} className="text-blue-500" /> Add Institution</h3>
                                        <form onSubmit={handleAddBank} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-end">
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                                                <input
                                                    value={bankForm.name}
                                                    onChange={e => setBankForm({ ...bankForm, name: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold dark:text-white outline-none"
                                                    placeholder="e.g. Chase"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-6 space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logo (PNG/JPG)</label>
                                                <div className="flex items-center gap-2">
                                                    <div className={`size-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 ${bankForm.logo ? 'bg-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                        {bankForm.logo ? (
                                                            <img src={bankForm.logo} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon size={14} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="logo-upload"
                                                        className="hidden"
                                                        accept="image/png, image/jpeg"
                                                        onChange={handleLogoUpload}
                                                        disabled={isUploadingLogo}
                                                    />
                                                    <label
                                                        htmlFor="logo-upload"
                                                        className={`flex-1 p-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition-colors flex items-center justify-center gap-2 ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isUploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                                        {isUploadingLogo ? 'Processing...' : (bankForm.logo ? 'Replace Logo' : 'Upload Image')}
                                                    </label>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isActionLoading === 'add_bank' || isUploadingLogo}
                                                className="md:col-span-3 h-9 md:h-10 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                            >
                                                {isActionLoading === 'add_bank' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Register
                                            </button>
                                        </form>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                        {paginatedBanks.map(bank => (
                                            <div key={bank.id} className="bg-white dark:bg-[#111a22] p-3 md:p-4 rounded-xl border border-slate-200 dark:border-[#324d67] shadow-sm flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    {bank.logo ? (
                                                        <img src={bank.logo} alt={bank.name} className="size-8 md:size-10 rounded-full object-cover border border-slate-100 bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                    ) : (
                                                        <div className={`size-8 md:size-10 rounded-full flex items-center justify-center text-white font-bold ${bank.color || 'bg-slate-500'}`}>
                                                            <Landmark size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{bank.name}</h4>
                                                        <p className="text-[9px] text-slate-400 font-mono">ID: {bank.id}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteBank(bank.id)}
                                                    disabled={isActionLoading === `delete_confirm_${bank.id}`}
                                                    className="p-1.5 text-slate-400 dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                >
                                                    {isActionLoading === `delete_confirm_${bank.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <PaginationControls currentPage={currentPage} totalItems={banks.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                                </div>
                            )}

                            {activeSection === 'settings' && (
                                <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
                                    <div className="bg-white dark:bg-[#111a22] rounded-2xl border border-slate-200 dark:border-[#324d67] p-8 md:p-10 shadow-xl">
                                        <div className="flex items-center gap-4 mb-8"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><SettingsIcon size={24} /></div><div><h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Configuration</h3><p className="text-xs text-slate-500">Global Core Parameters</p></div></div>
                                        <form onSubmit={handleUpdateGlobalConfig} className="space-y-8">
                                            <div className="grid md:grid-cols-1 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Identity</label>
                                                    <input value={globalConfig.siteName} onChange={e => { onEditStart(); setGlobalConfig({ ...globalConfig, siteName: e.target.value }); }} onFocus={onEditStart} className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Logo</label>
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                                {globalConfig.siteLogo ? (
                                                                    <img src={globalConfig.siteLogo} alt="Site Logo" className="max-w-full max-h-full object-contain rounded-full" />
                                                                ) : (
                                                                    <ImageIcon size={24} className="text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="file"
                                                                        id="site-logo-upload"
                                                                        className="hidden"
                                                                        accept="image/png, image/jpeg, image/webp"
                                                                        onChange={(e) => { onEditStart(); handleSiteLogoUpload(e); }}
                                                                        disabled={isUploadingSiteLogo}
                                                                    />
                                                                    <label
                                                                        htmlFor="site-logo-upload"
                                                                        className={`flex-1 p-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-black/30 transition-colors flex items-center justify-center gap-2 ${isUploadingSiteLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        {isUploadingSiteLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                                                        {isUploadingSiteLogo ? 'Processing...' : 'Upload Logo'}
                                                                    </label>
                                                                    {globalConfig.siteLogo && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { onEditStart(); setGlobalConfig(prev => ({ ...prev, siteLogo: '' })); }}
                                                                            className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-100 dark:border-red-900/30"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                            <input
                                                                value={globalConfig.siteLogo}
                                                                onChange={e => { onEditStart(); setGlobalConfig({ ...globalConfig, siteLogo: e.target.value }); }}
                                                                onFocus={onEditStart}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                                                placeholder="Or paste image URL here..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">Global Limit Controls</h4>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Daily Limit Card */}
                                                    <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-between h-full space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Daily Limit</p>
                                                                <p className="text-[9px] text-slate-500 mt-1">24-hour volume cap.</p>
                                                            </div>
                                                            <button type="button" onClick={() => { onEditStart(); setGlobalConfig({ ...globalConfig, enableDailyLimit: !globalConfig.enableDailyLimit }); }} className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${globalConfig.enableDailyLimit ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${globalConfig.enableDailyLimit ? 'left-6' : 'left-1'}`}></div>
                                                            </button>
                                                        </div>
                                                        <div className={`transition-all duration-300 ${globalConfig.enableDailyLimit ? 'opacity-100 max-h-20' : 'opacity-40 pointer-events-none max-h-20'}`}>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cap Amount ($)</label>
                                                            <input
                                                                type="text"
                                                                value={globalConfig.dailyLimit !== undefined && globalConfig.dailyLimit !== null ? Number(globalConfig.dailyLimit).toLocaleString() : ''}
                                                                onChange={e => {
                                                                    onEditStart();
                                                                    const val = e.target.value.replace(/,/g, '');
                                                                    if (!val || /^\d+$/.test(val)) {
                                                                        setGlobalConfig({ ...globalConfig, dailyLimit: val ? Number(val) : 0 });
                                                                    }
                                                                }}
                                                                onFocus={onEditStart}
                                                                className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Weekly Limit Card */}
                                                    <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-between h-full space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Weekly Limit</p>
                                                                <p className="text-[9px] text-slate-500 mt-1">7-day volume cap.</p>
                                                            </div>
                                                            <button type="button" onClick={() => { onEditStart(); setGlobalConfig({ ...globalConfig, enableWeeklyLimit: !globalConfig.enableWeeklyLimit }); }} className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${globalConfig.enableWeeklyLimit ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${globalConfig.enableWeeklyLimit ? 'left-6' : 'left-1'}`}></div>
                                                            </button>
                                                        </div>
                                                        <div className={`transition-all duration-300 ${globalConfig.enableWeeklyLimit ? 'opacity-100 max-h-20' : 'opacity-40 pointer-events-none max-h-20'}`}>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cap Amount ($)</label>
                                                            <input
                                                                type="text"
                                                                value={globalConfig.weeklyLimit !== undefined && globalConfig.weeklyLimit !== null ? Number(globalConfig.weeklyLimit).toLocaleString() : ''}
                                                                onChange={e => {
                                                                    onEditStart();
                                                                    const val = e.target.value.replace(/,/g, '');
                                                                    if (!val || /^\d+$/.test(val)) {
                                                                        setGlobalConfig({ ...globalConfig, weeklyLimit: val ? Number(val) : 0 });
                                                                    }
                                                                }}
                                                                onFocus={onEditStart}
                                                                className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Monthly Limit Card */}
                                                    <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-between h-full space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Monthly Limit</p>
                                                                <p className="text-[9px] text-slate-500 mt-1">30-day volume cap.</p>
                                                            </div>
                                                            <button type="button" onClick={() => { onEditStart(); setGlobalConfig({ ...globalConfig, enableMonthlyLimit: !globalConfig.enableMonthlyLimit }); }} className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${globalConfig.enableMonthlyLimit ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${globalConfig.enableMonthlyLimit ? 'left-6' : 'left-1'}`}></div>
                                                            </button>
                                                        </div>
                                                        <div className={`transition-all duration-300 ${globalConfig.enableMonthlyLimit ? 'opacity-100 max-h-20' : 'opacity-40 pointer-events-none max-h-20'}`}>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Cap Amount ($)</label>
                                                            <input
                                                                type="text"
                                                                value={globalConfig.monthlyLimit !== undefined && globalConfig.monthlyLimit !== null ? Number(globalConfig.monthlyLimit).toLocaleString() : ''}
                                                                onChange={e => {
                                                                    onEditStart();
                                                                    const val = e.target.value.replace(/,/g, '');
                                                                    if (!val || /^\d+$/.test(val)) {
                                                                        setGlobalConfig({ ...globalConfig, monthlyLimit: val ? Number(val) : 0 });
                                                                    }
                                                                }}
                                                                onFocus={onEditStart}
                                                                className="w-full p-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                                    <div><p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Maintenance Override</p><p className="text-[9px] text-slate-500">Lock the platform to non-admin identities.</p></div>
                                                    <button type="button" onClick={() => { onEditStart(); setGlobalConfig({ ...globalConfig, maintenanceMode: !globalConfig.maintenanceMode }); }} className={`w-12 h-6 rounded-full relative transition-all ${globalConfig.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${globalConfig.maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                                                    <div><p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Transaction Disruption</p><p className="text-[9px] text-slate-500">Force all monetary flows to fail with network errors.</p></div>
                                                    <button type="button" onClick={() => { onEditStart(); setGlobalConfig({ ...globalConfig, forceTransactionFailure: !globalConfig.forceTransactionFailure }); }} className={`w-12 h-6 rounded-full relative transition-all ${globalConfig.forceTransactionFailure ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${globalConfig.forceTransactionFailure ? 'left-7' : 'left-1'}`}></div></button>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={isActionLoading === 'config_update'} className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl hover:opacity-90 disabled:opacity-50">{isActionLoading === 'config_update' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Synchronize Core Parameters</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <footer className="h-10 border-t border-slate-200 dark:border-[#233648] bg-white dark:bg-[#111a22] flex items-center justify-between px-2.5 md:px-8 text-[8px] md:text-[10px] font-black text-slate-400 dark:text-[#5c7288] uppercase tracking-[0.2em] shrink-0"><span>{APP_CONFIG.BRAND_NAME.toUpperCase()} SYSTEM MANAGEMENT</span><span className="hidden md:inline">CORE KERNEL V12.1.0</span></footer>
            </main >
        </div >
    );
};