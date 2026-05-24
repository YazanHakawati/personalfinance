export const EXPENSE_TYPES = [
  'Housing',
  'Groceries',
  'Cigarettes',
  'Beverages',
  'Food Delivery',
  'Transportation',
  'Clothes',
  'Lifestyle',
  'Hygiene',
  'Subscriptions',
  'Others'
];

// Map expense types to one of: housing, savings, loans, living
export const TYPE_BUCKET = {
  Groceries: 'living',
  Cigarettes: 'living',
  Beverages: 'living',
  'Food Delivery': 'living',
  Transportation: 'living',
  Clothes: 'living',
  Lifestyle: 'living',
  Hygiene: 'living',
  Subscriptions: 'living',
  Others: 'living',
  Housing: 'housing',
  Loan: 'loans'
};

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function sameMonth(a, b) {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth();
}

export function fmtMoney(n, currency = '$') {
  const v = Number(n) || 0;
  return `${currency}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Determine the last salary date (most recent income entry, prefer "Salary")
export function lastSalaryDate(income) {
  if (!income || income.length === 0) return null;
  const salary = income.filter(i => i.type === 'Salary');
  const pool = salary.length ? salary : income;
  const sorted = [...pool].sort((a, b) => new Date(b.date) - new Date(a.date));
  return new Date(sorted[0].date);
}

// Next expected salary = last salary + 1 month (same day of month)
export function nextSalaryDate(income) {
  const last = lastSalaryDate(income);
  if (!last) return null;
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  return next;
}

// Income for current salary cycle (sum of all income entries in the current cycle)
export function currentCycleIncome(income) {
  const last = lastSalaryDate(income);
  if (!last) return 0;
  const next = nextSalaryDate(income);
  return income
    .filter(i => {
      const d = new Date(i.date);
      return d >= startOfDay(last) && d < next;
    })
    .reduce((s, i) => s + Number(i.amount || 0), 0);
}

// Expenses in current salary cycle
export function expensesInCycle(expenses, income) {
  const last = lastSalaryDate(income);
  if (!last) return [];
  const next = nextSalaryDate(income);
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d >= startOfDay(last) && d < next;
  });
}

export function spentInCycle(expenses, income) {
  return expensesInCycle(expenses, income).reduce((s, e) => s + Number(e.amount || 0), 0);
}

export function spentToday(expenses) {
  const today = startOfDay(new Date());
  return expenses
    .filter(e => isSameDay(e.date, today))
    .reduce((s, e) => s + Number(e.amount || 0), 0);
}

// Days remaining until next salary (inclusive of today, min 1)
export function daysUntilNextSalary(income) {
  const next = nextSalaryDate(income);
  if (!next) return null;
  const today = startOfDay(new Date());
  const diff = Math.ceil((startOfDay(next) - today) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

// Daily allowance: (income left after current spend) / days remaining
export function dailyAllowance(income, expenses) {
  const inc = currentCycleIncome(income);
  if (!inc) return null;
  const spent = spentInCycle(expenses, income);
  const days = daysUntilNextSalary(income);
  if (!days) return null;
  const remaining = Math.max(0, inc - spent);
  return remaining / days;
}

// Budget totals per bucket for current cycle
export function bucketSpend(expenses, income, loans) {
  const inCycle = expensesInCycle(expenses, income);
  const totals = { housing: 0, savings: 0, loans: 0, living: 0 };
  for (const e of inCycle) {
    const bucket = TYPE_BUCKET[e.type] || 'living';
    totals[bucket] += Number(e.amount || 0);
  }
  // Loans paid this cycle count toward "loans" bucket
  const last = lastSalaryDate(income);
  const next = nextSalaryDate(income);
  if (last && loans) {
    for (const l of loans) {
      if (l.paid && l.paidDate) {
        const d = new Date(l.paidDate);
        if (d >= last && d < next) totals.loans += Number(l.monthlyPayment || 0);
      }
    }
  }
  return totals;
}

export function budgetLimits(income, settings) {
  const inc = currentCycleIncome(income);
  const b = settings.budget;
  return {
    housing: (inc * b.housing) / 100,
    savings: (inc * b.savings) / 100,
    loans: (inc * b.loans) / 100,
    living: (inc * b.living) / 100
  };
}

export function unpaidLoansNextMonth(loans) {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  return (loans || []).filter(l => {
    if (l.paid) return false;
    // A payment is due if loan is active during next month
    const start = new Date(l.startDate);
    const months = Number(l.longevity || 1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return start <= nextMonthEnd && end >= nextMonth;
  });
}
