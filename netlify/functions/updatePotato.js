// netlify/updatePotatoes.js

const fetch = require('node-fetch');

// ⬅️ Import only the URL and the new AUTH_HEADERS object
const { 
    SUPABASE_URL, 
    AUTH_HEADERS 
} = require('./supabaseConfig');

function validate(body){
    const errors = [];
    
    if (!body.id || isNaN(Number(body.id))) errors.push('id (integer)');

    if (body.name !== undefined) {
        if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 50) errors.push('name (string)');
    }
    
    if (body.weight_kg !== undefined) {
        const weight = Number(body.weight_kg);
        if (isNaN(weight) || weight < 0) errors.push('weight_kg (decimal)');
    }
    
    if (body.quantity !== undefined) {
        const quantity = Number(body.quantity);
        if (!Number.isInteger(quantity) || quantity < 0) errors.push('quantity (integer)');
    }
    
    if (body.harvest_date !== undefined) {
        if (isNaN(Date.parse(body.harvest_date))) errors.push('harvest_date (date)');
    }

    if (body.is_organic !== undefined) {
        if (typeof body.is_organic !== 'boolean') errors.push('is_organic (boolean)');
    }
    
    const fieldsToUpdate = Object.keys(body).filter(key => key !== 'id').length;
    if (fieldsToUpdate === 0) {
        errors.push('no fields provided for update');
    }

    return { valid: errors.length === 0, errors };
}


exports.handler = async function(event) {
    if (event.httpMethod !== 'PATCH') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const body = JSON.parse(event.body || '{}');
    const v = validate(body);
    
    if (!v.valid) {
        return { statusCode: 400, body: JSON.stringify({ error: 'validation failed', details: v.errors }) };
    }

    if (!SUPABASE_URL || !AUTH_HEADERS) {
        return { statusCode: 500, body: 'Missing Supabase credentials or configuration' };
    }
    
    const recordId = body.id;

    const updatePayload = Object.assign({}, body);
    delete updatePayload.id;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?id=eq.${encodeURIComponent(recordId)}`, {
            method: 'PATCH',
            headers: {
                ...AUTH_HEADERS, // ⬅️ Spread the AUTH_HEADERS
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(updatePayload)
        });

        const data = await res.json();
        if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
        
        return { statusCode: 200, body: JSON.stringify(data[0]) };
    } catch (error) {
        console.error('Fetch Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', details: error.message }) };
    }
};