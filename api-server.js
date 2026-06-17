import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// ─── Resend Email Configuration ────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const DEFAULT_SENDER = process.env.RESEND_SENDER || 'onboarding@resend.dev';

async function sendEmailWithResend(to, subject, html, fromName) {
  const resolvedName = fromName || 'Lennox Bank';
  const fromField = `${resolvedName} <${DEFAULT_SENDER}>`;
  console.log(`[Resend] Sending email to ${to} from="${fromField}"`);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromField,
      to,
      subject,
      html,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Resend error ${res.status}`);
  }
  return data;
}

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PUBLIC_TABLES = ['mvp_app_settings', 'mvp_waitlist'];

app.all('/api/db', async (req, res) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const { op, table, data, id, columns, limit, offset, user_id } = params;
    console.log(`[API] ${req.method} ${op} ${table} id=${id || 'none'} data=`, JSON.stringify(data || {}).substring(0, 200));
    if (!op) {
      return res.status(400).json({ error: 'Missing required field: op' });
    }
    const PUBLIC_OPS = ['send_email', 'store_otp', 'verify_otp', 'reset_password', 'confirm_email', 'create_confirmed_user'];
    if (!PUBLIC_OPS.includes(op) && !table) {
      return res.status(400).json({ error: 'Missing required field: table' });
    }

    const isPublicTable = PUBLIC_TABLES.includes(table);
    const isRead = op === 'read';
    const isPublicOp = PUBLIC_OPS.includes(op);
    const needsAuth = !isPublicTable || !isRead;

    let authToken = req.headers.authorization?.replace('Bearer ', '');

    if (needsAuth && !authToken && !isPublicOp) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let userId = null;
    if (authToken) {
      const { data: { user } } = await supabase.auth.getUser(authToken);
      if (!user) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }
      userId = user.id;
    }

    switch (op) {
      case 'read': {
        let query = supabase.from(table).select(columns || '*');
        if (limit) query = query.limit(limit);
        if (offset) query = query.range(offset, offset + (limit || 10) - 1);
        if (!isPublicTable && userId) {
          const targetUserId = user_id === 'ME' ? userId : user_id;
          if (targetUserId) query = query.eq('user_id', targetUserId);
        }
        const { data: rows, error } = await query;
        if (error) throw error;
        return res.json(rows || []);
      }

      case 'create': {
        const insertData = { ...data };
        if (!isPublicTable && userId) insertData.user_id = userId;
        if (data.created_at === 'NOW') insertData.created_at = new Date().toISOString();
        const { data: rows, error } = await supabase.from(table).insert(insertData).select().single();
        if (error) throw error;
        return res.json(rows);
      }

      case 'update': {
        if (!id) return res.status(400).json({ error: 'Missing id for update' });
        const updateData = { ...data };
        if (data.updated_at === 'NOW') updateData.updated_at = new Date().toISOString();
        const { data: rows, error } = await supabase.from(table).update(updateData).eq('id', id).select().single();
        if (error) throw error;
        return res.json(rows);
      }

      case 'delete': {
        if (!id) return res.status(400).json({ error: 'Missing id for delete' });
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'send_email': {
        const { to, subject, body } = params;
        const bodySize = body ? Buffer.byteLength(body, 'utf8') : 0;
        const totalPayloadSize = req.body ? Buffer.byteLength(JSON.stringify(req.body), 'utf8') : 0;
        console.log(`[API send_email] body=${bodySize}B total=${totalPayloadSize}B to=${to} subject=${subject?.substring(0, 40)}`);
        if (!to || !subject || !body) {
          return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
        }
        if (!RESEND_API_KEY) {
          console.warn('[Resend] Email suppressed: RESEND_API_KEY not configured');
          return res.json({ success: true, message: 'Email suppressed (Resend not configured)' });
        }
        try {
          const info = await sendEmailWithResend(to, subject, body, params.from_name);
          console.log(`[Resend] Email sent to ${to}: ${info.id}`);
          return res.json({ success: true, messageId: info.id });
        } catch (err) {
          console.error('[Resend] Failed to send email:', err.message);
          return res.status(500).json({ error: 'Failed to send email: ' + err.message });
        }
      }

      case 'store_otp': {
        const { email, code, otp_type } = params;
        if (!email || !code || !otp_type) {
          return res.status(400).json({ error: 'Missing required fields: email, code, otp_type' });
        }
        await supabase.from('mvp_otp_codes').delete().eq('email', email).eq('type', otp_type);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        const { error } = await supabase.from('mvp_otp_codes').insert({ email, code, type: otp_type, expires_at: expiresAt });
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'verify_otp': {
        const { email, code, otp_type } = params;
        if (!email || !code || !otp_type) {
          return res.status(400).json({ error: 'Missing required fields: email, code, otp_type' });
        }
        const { data: rows, error } = await supabase
          .from('mvp_otp_codes')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .eq('type', otp_type)
          .gt('expires_at', new Date().toISOString())
          .limit(1);
        if (error) throw error;
        const valid = rows && rows.length > 0;
        if (valid) {
          await supabase.from('mvp_otp_codes').delete().eq('email', email).eq('code', code).eq('type', otp_type);
        }
        return res.json({ valid });
      }

      case 'reset_password': {
        const { email, new_password, otp_code } = params;
        if (!email || !new_password || !otp_code) {
          return res.status(400).json({ error: 'Missing required fields: email, new_password, otp_code' });
        }
        const { data: otpRows } = await supabase
          .from('mvp_otp_codes')
          .select('*')
          .eq('email', email)
          .eq('code', otp_code)
          .eq('type', 'recovery')
          .gt('expires_at', new Date().toISOString())
          .limit(1);
        if (!otpRows || otpRows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        await supabase.from('mvp_otp_codes').delete().eq('email', email).eq('code', otp_code).eq('type', 'recovery');
        const { data: userList, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const user = listErr ? null : userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const userId = user.id;
        const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password: new_password });
        if (updateErr) throw updateErr;
        return res.json({ success: true, message: 'Password updated successfully' });
      }

      case 'confirm_email': {
        const { email, otp_code } = params;
        if (!email || !otp_code) {
          return res.status(400).json({ error: 'Missing required fields: email, otp_code' });
        }
        const { data: otpRows } = await supabase
          .from('mvp_otp_codes')
          .select('*')
          .eq('email', email)
          .eq('code', otp_code)
          .eq('type', 'signup')
          .gt('expires_at', new Date().toISOString())
          .limit(1);
        if (!otpRows || otpRows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        await supabase.from('mvp_otp_codes').delete().eq('email', email).eq('code', otp_code).eq('type', 'signup');
        const { data: userList, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const user = listErr ? null : userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        const userId = user.id;
        const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
        if (updateErr) throw updateErr;
        return res.json({ success: true, message: 'Email confirmed' });
      }

      case 'create_confirmed_user': {
        const { email, password, user_metadata, otp_code } = params;
        if (!email || !password || !otp_code) {
          return res.status(400).json({ error: 'Missing required fields: email, password, otp_code' });
        }
        const { data: otpRows } = await supabase
          .from('mvp_otp_codes')
          .select('*')
          .eq('email', email)
          .eq('code', otp_code)
          .eq('type', 'signup')
          .gt('expires_at', new Date().toISOString())
          .limit(1);
        if (!otpRows || otpRows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired verification code' });
        }
        await supabase.from('mvp_otp_codes').delete().eq('email', email).eq('code', otp_code).eq('type', 'signup');
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: user_metadata || {}
        });
        if (createErr) throw createErr;
        return res.json({ success: true, user: newUser.user });
      }

      default:
        return res.status(400).json({ error: `Unknown operation: ${op}` });
    }
  } catch (error) {
    console.error('API Error:', error?.message || error);
    if (error?.code) console.error('  code:', error.code, 'details:', error.details, 'hint:', error.hint);
    return res.status(500).json({ error: error?.message || error?.details || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log(`Vite will proxy /api/db requests to this server`);
});
