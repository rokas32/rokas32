// netlify/createPotato.js

const fetch = require('node-fetch');

// ⬅️ Import only the URL and the new AUTH_HEADERS object
const { 
    SUPABASE_URL, 
    AUTH_HEADERS 
} = require('./supabaseConfig'); 

function validate(body){
    const errors = [];
    
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 50) errors.push('name (string)');
    
    const weight = Number(body.weight_kg);
    if (isNaN(weight) || weight < 0) errors.push('weight_kg (decimal)');
    
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) errors.push('quantity (integer)');
    
    if (!body.harvest_date || isNaN(Date.parse(body.harvest_date))) errors.push('harvest_date (date)');

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

    if (!SUPABASE_URL || !AUTH_HEADERS) {
        return { statusCode: 500, body: 'Missing Supabase credentials or configuration' };
    }

    const payload = [{
        name: body.name.trim(),
        weight_kg: Number(body.weight_kg),
        quantity: Number(body.quantity),
        harvest_date: body.harvest_date,
        is_organic: body.is_organic
    }];

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes`, {
            method: 'POST',
            headers: {
                ...AUTH_HEADERS, // ⬅️ Spread the AUTH_HEADERS
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
        
        return { statusCode: 201, body: JSON.stringify(data[0]) };
    } catch (error) {
        console.error('Fetch Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', details: error.message }) };
    }
};