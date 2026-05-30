import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.log('ERROR: VITE_SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const userId = '2502207f-c950-4b6f-ab42-0acfbc4e17dd'; // frenzyblizz@gmail.com

console.log('\n=== ADMIN CLEANUP: Removing test cards ===\n');

const { data: cards, error } = await supabase
  .from('mvp_cards')
  .select('id, number, holder, type, user_id')
  .eq('user_id', userId)
  .order('id', { ascending: true });

if (error) {
  console.log(`Error: ${error.message}`);
} else {
  console.log(`Total cards: ${cards?.length || 0}\n`);
  cards?.forEach((c, i) => {
    console.log(`  ${i + 1}. ID=${c.id} | ${c.type} | ****${c.number?.slice(-4)} | holder="${c.holder}"`);
  });

  // Delete test cards (holder = TEST USER, or number = 4111111111111111/1111)
  const testCards = cards?.filter(c =>
    c.holder === 'TEST USER' ||
    c.holder === 'TEST USER 2' ||
    c.number === '4111111111111111' ||
    c.number === '4111111111111112' ||
    (c.holder === 'TEST' && c.number?.slice(-4) === '1111')
  );

  if (testCards && testCards.length > 0) {
    console.log(`\nFound ${testCards.length} TEST card(s):`);
    testCards.forEach(c => console.log(`  - ID ${c.id}: ${c.type} ****${c.number?.slice(-4)} holder="${c.holder}"`));

    const idsToDelete = testCards.map(c => c.id);
    console.log(`\nDeleting IDs: ${idsToDelete.join(', ')}...`);

    const { error: delErr } = await supabase
      .from('mvp_cards')
      .delete()
      .in('id', idsToDelete);

    if (delErr) {
      console.log(`❌ Delete failed: ${delErr.message}`);
    } else {
      console.log('✅ Deleted successfully');

      // Verify
      const { data: remaining } = await supabase
        .from('mvp_cards')
        .select('id, number, holder, type')
        .eq('user_id', userId)
        .order('id', { ascending: true });

      console.log(`\nRemaining cards: ${remaining?.length || 0}`);
      remaining?.forEach(c => console.log(`  - ID ${c.id}: ${c.type} ****${c.number?.slice(-4)} holder="${c.holder}"`));
    }
  } else {
    console.log('\nNo test cards found.');
  }
}

console.log('\n=== DONE ===');
