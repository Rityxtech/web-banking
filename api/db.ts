import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  : null;

const PUBLIC_TABLES = ['mvp_app_settings', 'mvp_waitlist'];

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  if (!supabase) {
    return res.status(500).json({ error: 'Backend not configured - missing Supabase credentials' });
  }

  let parsedBody = req.body;
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body format' });
    }
  } else if (!req.body) {
    parsedBody = {};
  }

  const { op, table, data, id, columns, limit, offset, user_id } = parsedBody;
  if (!op || !table) {
    return res.status(400).json({ error: 'Missing required fields: op, table' });
  }

  const isPublicTable = PUBLIC_TABLES.includes(table);
  const isRead = op === 'read';
  const needsAuth = !isPublicTable || !isRead;

  let authToken = req.headers.authorization?.replace('Bearer ', '');

  if (needsAuth && !authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let userId: string | null = null;
  if (authToken) {
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    userId = user.id;
  }

  try {
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

      default:
        return res.status(400).json({ error: `Unknown operation: ${op}` });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') return handleRequest(req, res);
  if (req.method === 'GET') return handleRequest({ ...req, body: { ...req.query, op: 'read' } } as VercelRequest, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
