import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

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
app.use(express.json());

const PUBLIC_TABLES = ['mvp_app_settings', 'mvp_waitlist'];

app.all('/api/db', async (req, res) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const { op, table, data, id, columns, limit, offset, user_id } = params;
    console.log(`[API] ${req.method} ${op} ${table} id=${id || 'none'} data=`, JSON.stringify(data || {}).substring(0, 200));
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
