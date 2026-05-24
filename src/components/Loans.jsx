import { fmtMoney, unpaidLoansNextMonth } from '../budget.js';

export default function Loans({ loans, settings, onUpdate, onDelete }) {
  const currency = settings.currency;
  const dueNextMonth = new Set(unpaidLoansNextMonth(loans).map(l => l.id));

  const totalDebt = loans
    .filter(l => !l.paid)
    .reduce((s, l) => s + Number(l.amount || 0), 0);

  const monthlyOut = loans
    .filter(l => !l.paid)
    .reduce((s, l) => s + Number(l.monthlyPayment || 0), 0);

  const togglePaid = (loan) => {
    onUpdate('loans', {
      ...loan,
      paid: !loan.paid,
      paidDate: !loan.paid ? new Date().toISOString().slice(0, 10) : null
    });
  };

  return (
    <div>
      <h1 className="page-title">Loans</h1>
      <p className="page-sub">Track outstanding loans and monthly obligations.</p>

      <div className="cards">
        <div className="card">
          <div className="label">Total Outstanding Debt</div>
          <div className="value">{fmtMoney(totalDebt, currency)}</div>
          <div className="sub">{loans.filter(l => !l.paid).length} active loan{loans.filter(l => !l.paid).length === 1 ? '' : 's'}</div>
        </div>
        <div className="card">
          <div className="label">Monthly Loan Obligations</div>
          <div className="value">{fmtMoney(monthlyOut, currency)}</div>
          <div className="sub">Active loans</div>
        </div>
        <div className="card warn">
          <div className="label">Due Next Month</div>
          <div className="value">{dueNextMonth.size}</div>
          <div className="sub">Loan{dueNextMonth.size === 1 ? '' : 's'} requiring payment</div>
        </div>
      </div>

      <div className="section">
        <h2>All Loans</h2>
        {loans.length === 0 ? (
          <div className="empty">No loans recorded yet. Add one on the "Add Entry" page.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Months</th>
                <th>Monthly</th>
                <th>Start</th>
                <th>Status</th>
                <th>Next Month?</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{fmtMoney(l.amount, currency)}</td>
                  <td>{l.longevity}</td>
                  <td>{fmtMoney(l.monthlyPayment, currency)}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`pill ${l.paid ? 'good' : 'warn'}`}>
                      {l.paid ? '✓ Paid' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {dueNextMonth.has(l.id) ? <span className="pill warn">Due</span> : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => togglePaid(l)}>{l.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>
                    <button className="danger" onClick={() => onDelete('loans', l.id)}>Delete</button>
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
