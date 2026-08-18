import React from 'react';
import { Transaction } from '../api';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import PeriodMemberFilter, { MemberFilterValue, PeriodFilterValue } from './PeriodMemberFilter';
import { getGroupName } from '../utils/categoryUtils';

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
  trendTransactions?: Transaction[];
  trendGroups?: { income: string | null; expense: string | null };
  categories?: import('../api').CategoryItem[];
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
  trendTransactions = [],
  trendGroups = { income: null, expense: null },
  categories = [],
}) => {
  const income = transactions.filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = transactions.filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balance = income - expense;
  const hasTrendSummary = Boolean(trendGroups.income || trendGroups.expense);
  const getTwelveMonthGroupTotal = (type: 'income' | 'expense', group: string | null) => {
    if (!group) return 0;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
    const endMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return trendTransactions.filter((transaction) => transaction.type === type
      && transaction.date >= startKey
      && transaction.date.substring(0, 7) <= endMonthKey
      && getGroupName(transaction.category, categories) === group)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };
  const trendIncome = getTwelveMonthGroupTotal('income', trendGroups.income);
  const trendExpense = getTwelveMonthGroupTotal('expense', trendGroups.expense);
  const incomeTrendLabel = trendGroups.income ?? trendGroups.expense ?? '선택 항목';
  const expenseTrendLabel = trendGroups.expense ?? trendGroups.income ?? '선택 항목';
  const balanceTrendLabel = trendGroups.income && trendGroups.expense && trendGroups.income !== trendGroups.expense
    ? `${trendGroups.income} · ${trendGroups.expense}`
    : incomeTrendLabel;

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
            <span>{hasTrendSummary ? `수입(${incomeTrendLabel})` : '수입'}</span>
            <h2>{hasTrendSummary ? trendIncome.toLocaleString() : income.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card-summary expense">
          <div className="icon"><ArrowDownCircle size={24} /></div>
          <div className="details">
            <span>{hasTrendSummary ? `지출(${expenseTrendLabel})` : '지출'}</span>
            <h2>{hasTrendSummary ? trendExpense.toLocaleString() : expense.toLocaleString()}</h2>
          </div>
        </div>
        <div className="card-summary balance">
          <div className="icon"><Wallet size={24} /></div>
          <div className="details">
            <span>{hasTrendSummary ? `잔액(${balanceTrendLabel})` : '잔액'}</span>
            <h2>{hasTrendSummary ? (trendIncome - trendExpense).toLocaleString() : balance.toLocaleString()}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
