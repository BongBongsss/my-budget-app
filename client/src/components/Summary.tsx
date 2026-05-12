import React, { useState } from 'react';
import { Transaction } from '../api';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface SummaryProps {
  transactions: Transaction[];
  period: 'all' | 'month' | 'year';
  setPeriod: (p: 'all' | 'month' | 'year') => void;
  year: number;
  setYear: (y: number) => void;
  month: number;
  setMonth: (m: number) => void;
  memberFilter: 'all' | '효' | '굥';
  setMemberFilter: (m: 'all' | '효' | '굥') => void;
}

const Summary: React.FC<SummaryProps> = ({ transactions, period, setPeriod, year, setYear, month, setMonth, memberFilter, setMemberFilter }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  // exclude 타입은 자동으로 위 필터링에서 걸러집니다.
  const balance = income - expense;

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-start items-center gap-2 mb-4">
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="edit-input" style={{ fontSize: '0.8rem', padding: '1px 3px', width: 'auto' }}>
          <option value="all">All</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
        {(period === 'month' || period === 'year') && (
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="edit-input" style={{ fontSize: '0.75rem', padding: '0px 2px', width: 'auto' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {period === 'month' && (
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="edit-input" style={{ fontSize: '0.75rem', padding: '0px 2px', width: 'auto' }}>
            {months.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
        )}

        <div style={{ borderLeft: '1px solid #ddd', height: '20px', margin: '0 10px' }}></div>
        
        <div className="flex gap-1">
          <button 
            className={`btn ${memberFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMemberFilter('all')}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            전체
          </button>
          <button 
            className={`btn ${memberFilter === '효' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMemberFilter('효')}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            효
          </button>
          <button 
            className={`btn ${memberFilter === '굥' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMemberFilter('굥')}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            굥
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-8">
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
