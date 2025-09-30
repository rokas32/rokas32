// netlify/functions/deletePotato.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: 'Method Not Allowed' };
  
  const id = (event.queryStringParameters || {}).id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'missing id' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Prefer': 'return=representation'
    }
  });

  const data = await res.json();
  if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
  return { statusCode: 200, body: JSON.stringify({ deleted: data.length, rows: data }) };
};