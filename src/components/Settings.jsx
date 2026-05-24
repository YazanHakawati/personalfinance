import { useState } from 'react';

export default function Settings({ settings, onSave }) {
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.budget);

  const total = Number(budget.housing) + Number(budget.savings) + Number(budget.loans) + Number(budget.living);

  const save = () => {
    onSave({ ...settings, currency, budget: {
      housing: Number(budget.housing),
      savings: Number(budget.savings),
      loans: Number(budget.loans),
      living: Number(budget.living)
    }});
    alert('Saved.');
  };

  const reset = () => {
    setCurrency('$');
    setBudget({ housing: 30, savings: 10, loans: 20, living: 40 });
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Customize currency symbol and budget percentages.</p>

      <div className="section">
        <h2>Display</h2>
        <div className="form-row">
          <div>
            <label>Currency Symbol</label>
            <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} maxLength={4} />
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Budget Allocation</h2>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 0 }}>
          What percentage of your income should go to each bucket. Total should equal 100%.
        </p>
        <div className="form-row">
          <div>
            <label>Housing (%)</label>
            <input type="number" value={budget.housing} onChange={e => setBudget({ ...budget, housing: e.target.value })} />
          </div>
          <div>
            <label>Savings (%)</label>
            <input type="number" value={budget.savings} onChange={e => setBudget({ ...budget, savings: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Loans (%)</label>
            <input type="number" value={budget.loans} onChange={e => setBudget({ ...budget, loans: e.target.value })} />
          </div>
          <div>
            <label>Living Expenses (%)</label>
            <input type="number" value={budget.living} onChange={e => setBudget({ ...budget, living: e.target.value })} />
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: total === 100 ? 'var(--good)' : 'var(--warn)' }}>
          Total: {total}% {total !== 100 && '(should be 100%)'}
        </div>
        <div className="form-actions">
          <button className="primary" onClick={save}>Save Settings</button>
          <button onClick={reset}>Reset to Defaults</button>
        </div>
      </div>

      <div className="section">
        <h2>Data</h2>
        <p style={{ color: 'var(--muted)', fontSize: 12 }}>
          All data is stored in your browser's localStorage. Clearing browser data will erase your entries.
        </p>
        <div className="form-actions">
          <button className="danger" onClick={() => {
            if (confirm('This will delete ALL your data. Continue?')) {
              localStorage.removeItem('pf_income');
              localStorage.removeItem('pf_expenses');
              localStorage.removeItem('pf_loans');
              localStorage.removeItem('pf_settings');
              location.reload();
            }
          }}>Erase All Data</button>
        </div>
      </div>
    </div>
  );
}
