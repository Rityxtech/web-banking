import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, anonKey);

const TEST_EMAIL = 'frenzyblizz@gmail.com';
const TEST_PASSWORD = '123456';

console.log('\n=== CLEANING UP: Finding all cards for user ===\n');

// Login
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (authError) {
  console.log(`Login failed: ${authError.message}`);
  process.exit(1);
}

const userId = authData.user.id;

// List all cards
const { data: cards, error } = await supabase
  .from('mvp_cards')
  .select('id, number, holder, type, created_at')
  .eq('user_id', userId)
  .order('id', { ascending: true });

if (error) {
  console.log(`Error: ${error.message}`);
} else {
  console.log(`Total cards: ${cards?.length || 0}\n`);
  cards?.forEach((c, i) => {
    console.log(`  ${i + 1}. ID=${c.id} | ${c.type} | ****${c.number?.slice(-4)} | holder="${c.holder}" | created=${c.created_at}`);
  });

  // Identify test cards (holder = 'TEST USER' or number = 4111111111111111)
  const testCards = cards?.filter(c =>
    c.holder === 'TEST USER' ||
    c.holder === 'TEST USER 2' ||
    c.number === '4111111111111111' ||
    c.number === '4111111111111112'
  );

  if (testCards && testCards.length > 0) {
    console.log(`\nFound ${testCards.length} TEST card(s) to delete:`);
    testCards.forEach(c => console.log(`  - ID ${c.id}: ${c.type} ****${c.number?.slice(-4)}`));

    console.log('\nDeleting test cards...');
    for (const card of testCards) {
      const { error: delErr } = await supabase.from('mvp_cards').delete().eq('id', card.id);
      if (delErr) {
        console.log(`  ❌ Failed to delete ID ${card.id}: ${delErr.message}`);
      } else {
        console.log(`  ✅ Deleted ID ${card.id}`);
      }
    }

    // Verify
    const { data: remaining } = await supabase.from('mvp_cards').select('id, number, holder').eq('user_id', userId);
    console.log(`\nRemaining cards: ${remaining?.length || 0}`);
    remaining?.forEach(c => console.log(`  - ID ${c.id}: ${c.type} ****${c.number?.slice(-4)} | holder="${c.holder}"`));
  } else {
    console.log('\nNo test cards found. All cards appear legitimate.');
  }
}

await supabase.auth.signOut();
console.log('\n=== DONE ===');
