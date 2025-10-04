// netlify/listPotatoes.js

const fetch = require('node-fetch');

// ⬅️ Import only the URL and the new AUTH_HEADERS object
const { 
    SUPABASE_URL, 
    AUTH_HEADERS 
} = require('./supabaseConfig'); 

exports.handler = async function(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!SUPABASE_URL || !AUTH_HEADERS) {
        return { statusCode: 500, body: 'Missing Supabase credentials or configuration' };
    }

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/potatoes?select=*`, {
            method: 'GET',
            // ⬅️ Use the centralized AUTH_HEADERS object directly
            headers: AUTH_HEADERS 
        });

        const data = await res.json();
        
        if (!res.ok) {
            return { statusCode: res.status, body: JSON.stringify(data) };
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify(data) 
        };
        
    } catch (error) {
        console.error('Fetch Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};