// netlify/functions/listPotatoes.js
exports.handler = async function(event) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check for keys (important for local testing)
    if (!SUPABASE_URL || !KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Configuration Error: Supabase keys not set." }) };
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?select=*`, {
      headers: {
        'apikey': KEY,
        'Authorization': `Bearer ${KEY}`
      }
    });
    
    const data = await res.json();
    
    if (!res.ok) {
        return { statusCode: res.status, body: JSON.stringify({ error: 'DB API Error', details: data }) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error('List Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};