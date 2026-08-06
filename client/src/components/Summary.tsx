import React from 'react';
import { Transaction } from '../api';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import PeriodMemberFilter, { MemberFilterValue, PeriodFilterValue } from './PeriodMemberFilter';

interface SummaryProps {
  transactions: Transaction[];
  period: PeriodFilterValue;
  setPeriod: (period: PeriodFilterValue) => void;
  year: number;
  setYear: (year: number) => void;
  month: number;
  setMonth: (month: number) => void;
  memberFilter: MemberFilterValue;
  setMemberFilter: (member: MemberFilterValue) => void;
}

const Summary: React.FC<SummaryProps> = ({
  transactions,
  period,
  setPeriod,
  year,
  setYear,
  month,
  setMonth,
  memberFilter,
  setMemberFilter,
}) => {
  const income = transactions.filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions.filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = income - expense;

  return (
    <div>
      <PeriodMemberFilter
        className="summary-filter-bar"
        period={period}
        setPeriod={setPeriod}
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
        memberFilter={memberFilter}
        setMemberFilter={setMemberFilter}
      />

      <div className="grid grid-cols-3 gap-6 mb-8 summary-cards">
        <div className="card-summary income">
          <div className="icon"><ArrowUpCircle size={24} /></div>
          <div className="details">
            <span>Total Income</span>
            <h2>{income.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card-summary expense">
          <div className="icon"><ArrowDownCircle size={24} /></div>
          <div className="details">
            <span>Total Expenses</span>
            <h2>{expense.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card-summary balance">
          <div className="icon"><Wallet size={24} /></div>
          <div className="details">
            <span>Balance</span>
            <h2>{balance.toLocaleString()}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
