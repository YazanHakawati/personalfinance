import { useMemo, useState } from 'react';
import {
  EXPENSE_TYPES,
  currentCycleIncome,
  spentInCycle,
  spentToday,
  dailyAllowance,
  daysUntilNextSalary,
  nextSalaryDate,
  lastSalaryDate,
  bucketSpend,
  budgetLimits,
  unpaidLoansNextMonth,
  fmtMoney
} from '../budget.js';
import Alerts from './Alerts.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard({ income, expenses, loans, settings, onDelete }) {
  const currency = settings.currency;

  const inc = currentCycleIncome(income);
  const spent = spentInCycle(expenses, income);
  const today = spentToday(expenses);
  const allowance = dailyAllowance(income, expenses);
  const days = daysUntilNextSalary(income);
  const nextDate = nextSalaryDate(income);
  const lastDate = lastSalaryDate(income);

  const buckets = bucketSpend(expenses, income, loans);
  const limits = budgetLimits(income, settings);
  const dueLoans = unpaidLoansNextMonth(loans);

  // Filters
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState('all');
  const [day, setDay] = useState('all');
  const [type, setType] = useState('all');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');

  const filtered = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        if (year !== 'all' && String(d.getFullYear()) !== year) return false;
        if (month !== 'all' && String(d.getMonth()) !== month) return false;
        if (day !== 'all' && String(d.getDate()) !== day) return false;
        if (type !== 'all' && e.type !== type) return false;
        const v = Number(e.amount);
        if (minVal && v < Number(minVal)) return false;
        if (maxVal && v > Number(maxVal)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, year, month, day, type, minVal, maxVal]);

  const filteredTotal = filtered.reduce((s, e) => s + Number(e.amount || 0), 0);

  const years = useMemo(() => {
    const set = new Set([String(now.getFullYear())]);
    expenses.forEach(e => set.add(String(new Date(e.date).getFullYear())));
    income.forEach(i => set.add(String(new Date(i.date).getFullYear())));
    return Array.from(set).sort();
  }, [expenses, income]);

  const allowanceStatus = allowance !== null && today > allowance ? 'bad' : (allowance !== null && today > allowance * 0.85 ? 'warn' : 'good');

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        {lastDate
          ? `Cycle: ${lastDate.toLocaleDateString()} → ${nextDate ? nextDate.toLocaleDateString() : '—'} · ${days} day${days === 1 ? '' : 's'} left`
          : 'Add an income entry to start a budget cycle.'}
      </p>

      <Alerts income={income} expenses={expenses} loans={loans} settings={settings} />

      <div className="cards">
        <div className="card">
          <div className="label">Cycle Income</div>
          <div className="value">{fmtMoney(inc, currency)}</div>
          <div className="sub">Since last salary</div>
        </div>
        <div className="card">
          <div className="label">Cycle Spend</div>
          <div className="value">{fmtMoney(spent, currency)}</div>
          <div className="sub">{inc > 0 ? `${Math.round((spent / inc) * 100)}% of income` : '—'}</div>
        </div>
        <div className={`card ${allowanceStatus}`}>
          <div className="label">Today's Spend</div>
          <div className="value">{fmtMoney(today, currency)}</div>
          <div className="sub">
            {allowance !== null
              ? `Daily allowance: ${fmtMoney(allowance, currency)}`
              : 'Add income to compute allowance'}
          </div>
        </div>
        <div className="card">
          <div className="label">Remaining</div>
          <div className="value">{fmtMoney(Math.max(0, inc - spent), currency)}</div>
          <div className="sub">{days ? `Over ${days} day${days === 1 ? '' : 's'}` : '—'}</div>
        </div>
        <div className="card">
          <div className="label">Loans Due Next Month</div>
          <div className="value">{fmtMoney(dueLoans.reduce((s, l) => s + Number(l.monthlyPayment || 0), 0), currency)}</div>
          <div className="sub">{dueLoans.length} loan{dueLoans.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div className="section">
        <h2>Budget Buckets (this cycle)</h2>
        <div className="row">
          {['housing', 'savings', 'loans', 'living'].map(k => {
            const labels = { housing: 'Housing', savings: 'Savings', loans: 'Loans', living: 'Living Expenses' };
            const used = buckets[k];
            const limit = limits[k];
            const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
            const cls = k === 'savings' ? '' : (pct > 100 ? 'bad' : pct > 85 ? 'warn' : 'good');
            return (
              <div key={k} className="bucket">
                <div className="top">
                  <span className="name">{labels[k]}</span>
                  <span className="pct">{settings.budget[k]}%</span>
                </div>
                <div className="amounts">
                  <span className="used">{fmtMoney(used, currency)}</span>
                  <span style={{ color: 'var(--muted)' }}> / {fmtMoney(limit, currency)}</span>
                </div>
                <div className="bar"><div className={cls} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h2>Expenses</h2>
        <div className="toolbar">
          <div style={{ width: 110 }}>
            <label>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="all">All</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ width: 130 }}>
            <label>Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)}>
              <option value="all">All</option>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div style={{ width: 100 }}>
            <label>Day</label>
            <select value={day} onChange={e => setDay(e.target.value)}>
              <option value="all">All</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ width: 160 }}>
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="all">All</option>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ width: 110 }}>
            <label>Min Value</label>
            <input type="number" value={minVal} onChange={e => setMinVal(e.target.value)} placeholder="0" />
          </div>
          <div style={{ width: 110 }}>
            <label>Max Value</label>
            <input type="number" value={maxVal} onChange={e => setMaxVal(e.target.value)} placeholder="∞" />
          </div>
          <div className="spacer" />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Filtered total</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{fmtMoney(filteredTotal, currency)}</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">No expenses match your filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Note</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td><span className="tag">{e.type}</span></td>
                  <td>{e.note || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{fmtMoney(e.amount, currency)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="danger" onClick={() => onDelete('expenses', e.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section">
        <h2>Income History</h2>
        {income.length === 0 ? (
          <div className="empty">No income recorded yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Note</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...income].sort((a, b) => new Date(b.date) - new Date(a.date)).map(i => (
                <tr key={i.id}>
                  <td>{new Date(i.date).toLocaleDateString()}</td>
                  <td><span className="tag income">{i.type}</span></td>
                  <td>{i.note || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{fmtMoney(i.amount, currency)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="danger" onClick={() => onDelete('income', i.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
