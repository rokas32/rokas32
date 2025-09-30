// netlify/functions/updatePotato.js
function validatePartial(body){
  const errors = [];
  if (body.name && (typeof body.name !== 'string' || body.name.trim().length > 50)) errors.push('name');
  if (body.weight_kg !== undefined && (isNaN(Number(body.weight_kg)) || Number(body.weight_kg) < 0)) errors.push('weight_kg');
  if (body.quantity !== undefined && (!Number.isInteger(Number(body.quantity)) || Number(body.quantity) < 0)) errors.push('quantity');
  if (body.harvest_date !== undefined && isNaN(Date.parse(body.harvest_date))) errors.push('harvest_date');
  if (body.is_organic !== undefined && typeof body.is_organic !== 'boolean') errors.push('is_organic');
  return { valid: errors.length === 0, errors };
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'PATCH') return { statusCode: 405, body: 'Method Not Allowed' };
  
  const id = (event.queryStringParameters || {}).id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'missing id' }) };
  
  const body = JSON.parse(event.body || '{}');
  const v = validatePartial(body);
  if (!v.valid) return { statusCode: 400, body: JSON.stringify({ error: 'validation', details: v.errors }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
  return { statusCode: 200, body: JSON.stringify(data[0]) };
};