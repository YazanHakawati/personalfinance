import { useState } from 'react';
import { EXPENSE_TYPES } from '../budget.js';
import { uid } from '../storage.js';

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function AddEntry({ onAdd }) {
  const [kind, setKind] = useState('expense'); // expense | income | loan

  // shared
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // expense
  const [expenseType, setExpenseType] = useState(EXPENSE_TYPES[0]);

  // income
  const [incomeType, setIncomeType] = useState('Salary');

  // loan
  const [loanName, setLoanName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [longevity, setLongevity] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [loanPaid, setLoanPaid] = useState(false);

  const reset = () => {
    setAmount(''); setNote(''); setDate(todayStr());
    setLoanName(''); setLoanAmount(''); setLongevity(''); setMonthlyPayment(''); setLoanPaid(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (kind === 'expense') {
      if (!amount || Number(amount) <= 0) return alert('Enter a valid amount.');
      onAdd('expenses', { id: uid(), type: expenseType, amount: Number(amount), date, note });
    } else if (kind === 'income') {
      if (!amount || Number(amount) <= 0) return alert('Enter a valid amount.');
      onAdd('income', { id: uid(), type: incomeType, amount: Number(amount), date, note });
    } else if (kind === 'loan') {
      if (!loanName) return alert('Enter a loan name.');
      if (!loanAmount || Number(loanAmount) <= 0) return alert('Enter a valid loan amount.');
      if (!longevity || Number(longevity) <= 0) return alert('Enter loan longevity in months.');
      if (!monthlyPayment || Number(monthlyPayment) <= 0) return alert('Enter monthly payment.');
      onAdd('loans', {
        id: uid(),
        name: loanName,
        amount: Number(loanAmount),
        longevity: Number(longevity),
        monthlyPayment: Number(monthlyPayment),
        startDate: date,
        paid: loanPaid,
        paidDate: loanPaid ? date : null,
        note
      });
    }
    reset();
  };

  return (
    <div>
      <h1 className="page-title">Add Entry</h1>
      <p className="page-sub">Log income, expenses, or new loans.</p>

      <div className="section">
        <div className="toolbar" style={{ marginBottom: 20 }}>
          <button className={kind === 'expense' ? 'primary' : ''} onClick={() => setKind('expense')}>Expense</button>
          <button className={kind === 'income' ? 'primary' : ''} onClick={() => setKind('income')}>Income</button>
          <button className={kind === 'loan' ? 'primary' : ''} onClick={() => setKind('loan')}>Loan</button>
        </div>

        <form onSubmit={submit}>
          {kind === 'expense' && (
            <>
              <div className="form-row">
                <div>
                  <label>Type</label>
                  <select value={expenseType} onChange={e => setExpenseType(e.target.value)}>
                    {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label>Amount</label>
                  <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label>Note (optional)</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Weekly grocery run" />
                </div>
              </div>
            </>
          )}

          {kind === 'income' && (
            <>
              <div className="form-row">
                <div>
                  <label>Type</label>
                  <select value={incomeType} onChange={e => setIncomeType(e.target.value)}>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Amount</label>
                  <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Date Received</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label>Note (optional)</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. May payroll" />
                </div>
              </div>
              {incomeType === 'Salary' && (
                <p style={{ color: 'var(--muted)', fontSize: 12, margin: '0 0 12px 0' }}>
                  Adding a Salary resets the budget cycle. The next salary is expected one month from this date.
                </p>
              )}
            </>
          )}

          {kind === 'loan' && (
            <>
              <div className="form-row">
                <div>
                  <label>Loan Name</label>
                  <input type="text" value={loanName} onChange={e => setLoanName(e.target.value)} placeholder="e.g. Car loan" />
                </div>
                <div>
                  <label>Total Loan Amount</label>
                  <input type="number" step="0.01" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Longevity (months)</label>
                  <input type="number" value={longevity} onChange={e => setLongevity(e.target.value)} placeholder="e.g. 36" />
                </div>
                <div>
                  <label>Payment per Month</label>
                  <input type="number" step="0.01" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Start Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label>Note (optional)</label>
                  <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="" />
                </div>
              </div>
              <div className="checkbox-row" style={{ marginBottom: 12 }}>
                <input id="loanPaid" type="checkbox" checked={loanPaid} onChange={e => setLoanPaid(e.target.checked)} />
                <label htmlFor="loanPaid">Already paid in full</label>
              </div>
              {/* hidden amount field reuse */}
              <input type="hidden" value={amount || loanAmount} />
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="primary">Add {kind}</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
