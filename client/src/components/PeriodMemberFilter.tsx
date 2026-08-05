import React from 'react';

export type PeriodFilterValue = 'all' | 'month' | 'year';
export const MEMBER_OPTIONS = ['효', '굥', '미지정'] as const;
export type MemberFilterValue = 'all' | (typeof MEMBER_OPTIONS)[number];

interface PeriodMemberFilterProps {
  period: PeriodFilterValue;
  setPeriod: (period: PeriodFilterValue) => void;
  year: number;
  setYear: (year: number) => void;
  month: number;
  setMonth: (month: number) => void;
  memberFilter: MemberFilterValue;
  setMemberFilter: (member: MemberFilterValue) => void;
  className?: string;
}

const PeriodMemberFilter: React.FC<PeriodMemberFilterProps> = ({
  period,
  setPeriod,
  year,
  setYear,
  month,
  setMonth,
  memberFilter,
  setMemberFilter,
  className = '',
}) => {
  const years = Array.from({ length: 20 }, (_, index) => new Date().getFullYear() - 10 + index);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  return (
    <div className={`period-member-filter ${className}`.trim()}>
      <div className="period-filter">
        <select
          aria-label="기간 선택"
          value={period}
          onChange={(event) => setPeriod(event.target.value as PeriodFilterValue)}
          className="edit-input"
        >
          <option value="all">전체</option>
          <option value="month">월별</option>
          <option value="year">연별</option>
        </select>

        {(period === 'month' || period === 'year') && (
          <select
            aria-label="연도 선택"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="edit-input"
          >
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        )}

        {period === 'month' && (
          <select
            aria-label="월 선택"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="edit-input"
          >
            {months.map((value) => <option key={value} value={value}>{value}월</option>)}
          </select>
        )}
      </div>

      <div className="filter-divider" aria-hidden="true" />

      <div className="member-filter" aria-label="구성원 필터">
        {(['all', ...MEMBER_OPTIONS] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={`btn ${memberFilter === value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMemberFilter(value)}
          >
            {value === 'all' ? '전체' : value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodMemberFilter;
