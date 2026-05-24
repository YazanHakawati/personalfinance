import {
  currentCycleIncome,
  spentInCycle,
  spentToday,
  dailyAllowance,
  bucketSpend,
  budgetLimits,
  unpaidLoansNextMonth,
  fmtMoney,
  lastSalaryDate
} from '../budget.js';

export default function Alerts({ income, expenses, loans, settings }) {
  const alerts = [];
  const currency = settings.currency;

  if (!lastSalaryDate(income)) {
    alerts.push({
      level: 'warn',
      title: 'No income recorded yet',
      desc: 'Add your salary on the "Add Entry" page to start tracking your budget cycle.'
    });
  } else {
    const inc = currentCycleIncome(income);
    const spent = spentInCycle(expenses, income);
    const allowance = dailyAllowance(income, expenses);
    const today = spentToday(expenses);

    if (allowance !== null && today > allowance) {
      alerts.push({
        level: 'bad',
        title: `You've exceeded today's daily allowance`,
        desc: `Today: ${fmtMoney(today, currency)} · Allowance: ${fmtMoney(allowance, currency)}`
      });
    }

    if (spent > inc) {
      alerts.push({
        level: 'bad',
        title: `You've spent more than this cycle's income`,
        desc: `Spent ${fmtMoney(spent, currency)} of ${fmtMoney(inc, currency)}`
      });
    }

    const buckets = bucketSpend(expenses, income, loans);
    const limits = budgetLimits(income, settings);
    const labels = { housing: 'Housing', savings: 'Savings', loans: 'Loans', living: 'Living Expenses' };
    for (const k of Object.keys(buckets)) {
      if (k === 'savings') continue; // savings is a target, not a cap on spending
      if (limits[k] > 0 && buckets[k] > limits[k]) {
        alerts.push({
          level: 'bad',
          title: `Over ${labels[k]} budget`,
          desc: `${fmtMoney(buckets[k], currency)} of ${fmtMoney(limits[k], currency)} (${settings.budget[k]}%)`
        });
      } else if (limits[k] > 0 && buckets[k] > limits[k] * 0.85) {
        alerts.push({
          level: 'warn',
          title: `Approaching ${labels[k]} budget`,
          desc: `${fmtMoney(buckets[k], currency)} of ${fmtMoney(limits[k], currency)} (${Math.round((buckets[k] / limits[k]) * 100)}%)`
        });
      }
    }
  }

  const dueLoans = unpaidLoansNextMonth(loans);
  if (dueLoans.length > 0) {
    const total = dueLoans.reduce((s, l) => s + Number(l.monthlyPayment || 0), 0);
    alerts.push({
      level: 'warn',
      title: `${dueLoans.length} loan payment${dueLoans.length > 1 ? 's' : ''} due next month`,
      desc: `Total: ${fmtMoney(total, currency)} — ${dueLoans.map(l => l.name).join(', ')}`
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="alerts">
        <div className="alert good">
          <span className="icon">✓</span>
          <div className="body">
            <div className="title">All on track</div>
            <div className="desc">You're within all budgets and below your daily spending allowance.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts">
      {alerts.map((a, i) => (
        <div key={i} className={`alert ${a.level}`}>
          <span className="icon">{a.level === 'bad' ? '⚠' : a.level === 'warn' ? '!' : '✓'}</span>
          <div className="body">
            <div className="title">{a.title}</div>
            <div className="desc">{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
