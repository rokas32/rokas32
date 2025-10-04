// netlify/deletePotato.js

const fetch = require('node-fetch');

// ⬅️ Import only the URL and the new AUTH_HEADERS object
const { 
    SUPABASE_URL, 
    AUTH_HEADERS 
} = require('./supabaseConfig');

exports.handler = async function(event) {
    if (event.httpMethod !== 'DELETE') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const id = (event.queryStringParameters || {}).id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'missing id' }) };

    if (!SUPABASE_URL || !AUTH_HEADERS) {
        return { statusCode: 500, body: 'Missing Supabase credentials or configuration' };
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                ...AUTH_HEADERS, // ⬅️ Spread the AUTH_HEADERS
                'Prefer': 'return=representation'
            }
        });

        const data = await res.json();
        if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
        
        return { statusCode: 200, body: JSON.stringify({ deleted: data.length, rows: data }) };
    } catch (error) {
        console.error('Fetch Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', details: error.message }) };
    }
};