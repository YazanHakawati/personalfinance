import { useEffect, useState } from 'react';
import { loadAll, save } from './storage.js';
import Dashboard from './components/Dashboard.jsx';
import AddEntry from './components/AddEntry.jsx';
import Loans from './components/Loans.jsx';
import Settings from './components/Settings.jsx';

const PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'add', label: 'Add Entry' },
  { key: 'loans', label: 'Loans' },
  { key: 'settings', label: 'Settings' }
];

export default function App() {
  const [data, setData] = useState(loadAll);
  const [page, setPage] = useState('dashboard');

  useEffect(() => { save('income', data.income); }, [data.income]);
  useEffect(() => { save('expenses', data.expenses); }, [data.expenses]);
  useEffect(() => { save('loans', data.loans); }, [data.loans]);
  useEffect(() => { save('settings', data.settings); }, [data.settings]);

  const addItem = (key, item) => {
    setData(d => ({ ...d, [key]: [...d[key], item] }));
    if (key !== 'settings') setPage('dashboard');
  };

  const updateItem = (key, item) => {
    setData(d => ({ ...d, [key]: d[key].map(x => x.id === item.id ? item : x) }));
  };

  const deleteItem = (key, id) => {
    if (!confirm('Delete this entry?')) return;
    setData(d => ({ ...d, [key]: d[key].filter(x => x.id !== id) }));
  };

  const saveSettings = (settings) => {
    setData(d => ({ ...d, settings }));
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Personal<span className="accent">Finance</span></h1>
        {PAGES.map(p => (
          <button
            key={p.key}
            className={`nav-item ${page === p.key ? 'active' : ''}`}
            onClick={() => setPage(p.key)}
          >
            <span className="dot" />{p.label}
          </button>
        ))}
      </aside>
      <main className="main">
        {page === 'dashboard' && (
          <Dashboard
            income={data.income}
            expenses={data.expenses}
            loans={data.loans}
            settings={data.settings}
            onDelete={deleteItem}
          />
        )}
        {page === 'add' && <AddEntry onAdd={addItem} />}
        {page === 'loans' && (
          <Loans
            loans={data.loans}
            settings={data.settings}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {page === 'settings' && (
          <Settings settings={data.settings} onSave={saveSettings} />
        )}
      </main>
    </div>
  );
}
