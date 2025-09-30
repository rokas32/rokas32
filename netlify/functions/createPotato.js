// netlify/functions/createPotato.js
function validate(body){
  const errors = [];
  
  // 1. String Check: name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 50) errors.push('name (string)');
  
  // 2. Decimal/Numeric Check: weight_kg
  const weight = Number(body.weight_kg);
  if (isNaN(weight) || weight < 0) errors.push('weight_kg (decimal)');
  
  // 3. Integer Check: quantity
  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0) errors.push('quantity (integer)');
  
  // 4. Date Check: harvest_date
  if (!body.harvest_date || isNaN(Date.parse(body.harvest_date))) errors.push('harvest_date (date)');

  // 5. Boolean Check: is_organic
  if (typeof body.is_organic !== 'boolean') errors.push('is_organic (boolean)');

  return { valid: errors.length === 0, errors };
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  
  const body = JSON.parse(event.body || '{}');
  const v = validate(body);
  
  if (!v.valid) {
      return { statusCode: 400, body: JSON.stringify({ error: 'validation failed', details: v.errors }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const payload = [{
    name: body.name.trim(),
    weight_kg: Number(body.weight_kg),
    quantity: Number(body.quantity),
    harvest_date: body.harvest_date,
    is_organic: body.is_organic
  }];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
  
  return { statusCode: 201, body: JSON.stringify(data[0]) };
};