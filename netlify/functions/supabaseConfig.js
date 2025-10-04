// In createPotato.js
// AND
// In deletePotato.js

const SUPABASE_URL = process.env['https://bjjddiqplwyjwiyjadbk.supabase.co'];
const SUPABASE_SERVICE_ROLE_KEY = process.env['sb_secret_y2TpY7iAa8mCkyku-1ILEg_H-eT5rcb;

const AUTH_HEADERS = {
    // 1. Supabase's Custom API Key Header: Just the key itself
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    
    // 2. Industry Standard Bearer Token Header: Must include "Bearer " prefix
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` 
};

// The './' means "look in the current directory"

// ... your function can now use these imported constants ...


module.exports = {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    AUTH_HEADERS
};