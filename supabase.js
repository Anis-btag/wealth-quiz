/* =============================================================
   supabase.js  —  YOUR DATABASE CONNECTION
   =============================================================
   
   HOW TO CONNECT:
   1. Go to https://supabase.com and create a free project
   2. In your project, open: Project Settings → API
   3. Copy "Project URL" and paste it below as SUPABASE_URL
   4. Copy "anon / public" key and paste it below as SUPABASE_KEY
   5. Save the file — the leaderboard is now global!

   If you leave these empty the quiz still works,
   but scores will only be saved on the player's own device.
   ============================================================= */

const SUPABASE_URL = 'https://hflrpgdzxlpltkyxvdgo.supabase.co';   // 👈 paste your Project URL here
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbHJwZ2R6eGxwbHRreXh2ZGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODk0NTksImV4cCI6MjA5MDg2NTQ1OX0.CNSF0jOd04ZwtLxWX1awtPP4u5JBsK7Ujb9iZIXEpeI';   // 👈 paste your anon/public key here


/* =============================================================
   DO NOT EDIT BELOW THIS LINE
   Everything below is the Supabase API logic.
   ============================================================= */

/**
 * Returns true if Supabase credentials are configured.
 */
function isSupabaseReady() {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}

/**
 * Save a score to the Supabase leaderboard table.
 * Returns the saved row (with its id) or null if it failed.
 */
async function supabaseSave(name, pct, tier) {
  if (!isSupabaseReady()) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation'   // return the inserted row
      },
      body: JSON.stringify({ name, pct, tier })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;

  } catch (err) {
    console.error('Supabase save error:', err);
    return null;
  }
}

/**
 * Load the top 20 scores from Supabase, sorted best first.
 * Returns an array of row objects or null if it failed.
 */
async function supabaseLoad() {
  if (!isSupabaseReady()) return null;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leaderboard?select=*&order=pct.desc,created_at.asc&limit=20`,
      {
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) return null;
    return await response.json();

  } catch (err) {
    console.error('Supabase load error:', err);
    return null;
  }
}
