// src/App.jsx - PASTE THIS ENTIRE CONTENT
import { useEffect, useState } from 'react';

// Reusable form component for both Create and Update
function PotatoForm({ initial = null, onSaved, onCancel }) {
  // States initialized from 'initial' prop for Update, or empty/default for Create
  const [name, setName] = useState(initial?.name ?? '');
  const [weight, setWeight] = useState(initial?.weight_kg ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? '');
  // Ensures date is in 'YYYY-MM-DD' format if available
  const [harvest_date, setHarvestDate] = useState(initial?.harvest_date?.slice(0, 10) ?? '');
  const [is_organic, setIsOrganic] = useState(initial?.is_organic ?? false);
  const [loading, setLoading] = useState(false);
  
  // Determine if we are updating (PATCH) or creating (POST)
  const method = initial ? 'PATCH' : 'POST';

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    
    // Payload sent to the Netlify Function
    const payload = { 
      name, 
      weight_kg: Number(weight), 
      quantity: Number(quantity), 
      harvest_date, 
      is_organic 
    };
    
    // Determine the correct Netlify function endpoint
    const url = initial 
      ? `/.netlify/functions/updatePotato?id=${initial.id}` 
      : '/.netlify/functions/createPotato';
      
    // Call the Netlify Function (your backend!)
    const res = await fetch(url, { 
      method, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      // Show validation or DB errors from the function
      return alert('Error Saving Potato: ' + JSON.stringify(data.details || data.error));
    }
    
    // Call the parent component's handler to refresh the list
    onSaved(data);
  }

  return (
    <form onSubmit={submit} style={{ padding: '20px', border: '1px solid #ccc', margin: '10px 0' }}>
      <h3>{initial ? `Edit Potato #${initial.id}` : 'Create New Potato'}</h3>
      <div><label>Name: <input value={name} onChange={e => setName(e.target.value)} required maxLength={50} /></label></div>
      <div><label>Weight (kg): <input type="number" step="0.001" value={weight} onChange={e => setWeight(e.target.value)} required min="0" /></label></div>
      <div><label>Quantity: <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" /></label></div>
      <div><label>Harvest date: <input type="date" value={harvest_date} onChange={e => setHarvestDate(e.target.value)} required /></label></div>
      <div><label><input type="checkbox" checked={is_organic} onChange={e => setIsOrganic(e.target.checked)} /> Organic</label></div>
      <div style={{ marginTop: '10px' }}>
        <button type="submit" disabled={loading}>{initial ? 'Update Potato' : 'Create Potato'}</button>
        {onCancel && <button type="button" onClick={onCancel} disabled={loading} style={{ marginLeft: '10px' }}>Cancel</button>}
      </div>
    </form>
  );
}

export default function App() {
  const [potatoes, setPotatoes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  // READ function: Fetches the list of potatoes
  async function load() {
    setLoadingList(true);
    // Calls your netlify/functions/listPotatoes.js file
    const res = await fetch('/.netlify/functions/listPotatoes');
    const data = await res.json();
    setPotatoes(Array.isArray(data) ? data : []);
    setLoadingList(false);
  }

  // Load the list when the component first mounts
  useEffect(() => { load(); }, []);

  // Handler runs after a Create or Update operation
  async function handleSaved(newRow) {
    await load(); // Reload the list to show the new/updated data
    setEditing(null); // Close edit form
    setShowForm(false); // Close create form
  }

  // DELETE function: Removes a potato record
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to permanently delete potato record #' + id + '?')) return;
    
    // Calls your netlify/functions/deletePotato.js file
    const res = await fetch(`/.netlify/functions/deletePotato?id=${id}`, { method: 'DELETE' });
    
    if (!res.ok) {
      const data = await res.json();
      return alert('Delete failed: ' + JSON.stringify(data));
    }
    
    await load(); // Reload the list
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🥔 Potato Inventory Manager (CRUD App)</h1>
      <p>This application demonstrates **C.R.U.D.** functionality using **React (Frontend)**, **Netlify Functions (Backend/API)**, and **Supabase (PostgreSQL Database)**.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => { setEditing(null); setShowForm(s => !s); }} style={{ padding: '10px 15px' }}>
          {showForm ? 'Cancel Creation' : '+ Add New Potato Entry'}
        </button>
      </div>

      {/* Renders the Create form if 'Add' button is clicked */}
      {showForm && <PotatoForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />}
      
      {/* Renders the Edit form if an 'Edit' button is clicked */}
      {editing && <PotatoForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />}

      <hr style={{ margin: '20px 0' }}/>
      
      <h2>Inventory List</h2>
      
      {loadingList && <p>Loading potato inventory...</p>}
      
      {!loadingList && potatoes.length === 0 && <p>No potatoes in inventory. Use the button above to add one!</p>}

      {!loadingList && potatoes.length > 0 && (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>ID</th>
              <th>Name (String)</th>
              <th>Weight (Decimal)</th>
              <th>Quantity (Integer)</th>
              <th>Harvest (Date)</th>
              <th>Organic (Boolean)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {potatoes.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{Number(p.weight_kg).toFixed(3)} kg</td>
                <td>{p.quantity}</td>
                <td>{p.harvest_date?.slice(0, 10)}</td>
                <td>{p.is_organic ? '✅ Yes' : '❌ No'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => { setEditing(p); setShowForm(false); }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}