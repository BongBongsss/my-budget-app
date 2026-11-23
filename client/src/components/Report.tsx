import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Sparkles } from 'lucide-react';
import type { CategoryItem, Transaction } from '../api';
import { getGroupName } from '../utils/categoryUtils';
import { categoryChanges, groups, inPeriod, reportRows, totals, type Exclusions } from '../utils/report';
import { shiftPeriod } from '../utils/reportAnalytics';
import ReportAnalytics, { CategoryHistory } from './ReportAnalytics';
import './Report.css';
import './ReportAnalytics.css';

type Props = { transactions: Transaction[]; categories: CategoryItem[]; exclusions: Exclusions };
const money = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
const detailMoney = (value: number) => `${value.toLocaleString('ko-KR')}원`;

export default function Report({ transactions, categories, exclusions }: Props) {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [periodPickerOpen, setPeriodPickerOpen] = useState(false);
  const periodPickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!periodPickerOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !periodPickerRef.current?.contains(event.target)) setPeriodPickerOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [periodPickerOpen]);
  const [year, setYear] = useState(lastMonth.getFullYear());
  const [month, setMonth] = useState(lastMonth.getMonth() + 1);
  const [member, setMember] = useState<'all' | '효' | '굥'>('all');
  const [category, setCategory] = useState('');
  const scoped = useMemo(() => member === 'all' ? transactions : transactions.filter(t => t.member === member), [transactions, member]);
  const approved = useMemo(() => reportRows(scoped, categories, exclusions), [scoped, categories, exclusions]);
  const allApproved = useMemo(() => reportRows(transactions, categories, exclusions), [transactions, categories, exclusions]);
  const currentYear = mode === 'year' && year === now.getFullYear();
  const matches = (t: Transaction) => inPeriod(t, year, mode === 'month' ? month : undefined) && (!currentYear || Number(t.date.slice(5, 7)) <= now.getMonth() + 1);
  const rows = approved.filter(matches);
  const pending = scoped.filter(t => t.isVerified === false && matches(t));
  const total = totals(rows);
  const previousDate = mode === 'month' ? new Date(year, month - 2, 1) : new Date(year - 1, 0, 1);
  const previous = approved.filter(t => inPeriod(t, previousDate.getFullYear(), mode === 'month' ? previousDate.getMonth() + 1 : undefined) && (!currentYear || Number(t.date.slice(5, 7)) <= now.getMonth() + 1));
  const canCompare = rows.length > 0 && previous.length > 0;
  const delta = total.expense - totals(previous).expense;
  const changes = canCompare ? categoryChanges(rows, previous, categories) : [];
  const comparison = mode === 'month' ? '지난달' : currentYear ? '지난해 같은 기간' : '지난해';
  const direction = delta > 0 ? '늘었어요' : '줄었어요';
  const years = [...new Set([year, now.getFullYear(), ...transactions.map(t => Number(t.date.slice(0, 4))).filter(n => n >= 1900 && n <= 9999)])].sort((a, b) => b - a);
  const dateLabel = mode === 'month' ? `${year}년 ${month}월` : `${year}년${currentYear ? ' 누적' : ''}`;
  const expense = rows.filter(t => t.type === 'expense');
  const categoryRows = groups(expense, t => getGroupName(t.category, categories));
  const selectedCategory = categoryRows.some(g => g.name === category) ? category : categoryRows[0]?.name;
  const selected = expense.filter(t => getGroupName(t.category, categories) === selectedCategory);
  const vendors = groups(selected, t => t.vendor?.trim() || '거래처 미지정');
  const before = previous.filter(t => t.type === 'expense' && getGroupName(t.category, categories) === selectedCategory);
  const beforeAmount = totals(before).expense;
  const categoryDelta = totals(selected).expense - beforeAmount;
  const move = (step: number) => { const next = shiftPeriod(year, month, mode, step); if (next.year >= 1900 && next.year <= 9999) { setYear(next.year); setMonth(next.month); } };
  const trendEnd = new Date(year, mode === 'month' ? month - 1 : currentYear ? now.getMonth() : 11, 1);

  return <section className="rp trial" aria-label="리포트">
    <div className="rp-period"><span>{dateLabel} 리포트</span><span>승인 거래 {rows.length}건 · 통계 제외 설정 적용</span></div>
    <div className="rp-toolbar">
    <nav className="trial-period-nav" aria-label="기간 이동"><button type="button" aria-label={mode === 'month' ? '이전 달' : '이전 해'} onClick={() => move(-1)} disabled={year === 1900 && (mode === 'year' || month === 1)}>‹</button><div ref={periodPickerRef} className="trial-period-picker" onKeyDown={e => { if (e.key === 'Escape') setPeriodPickerOpen(false); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPeriodPickerOpen(false); }}><button type="button" className="trial-period-label" aria-label="기간 선택" aria-expanded={periodPickerOpen} onClick={() => setPeriodPickerOpen(open => !open)}>{dateLabel}</button>{periodPickerOpen && <div className="trial-period-options"><select aria-label="연도" value={year} onChange={e => setYear(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}년</option>)}</select>{mode === 'month' && <select aria-label="월" value={month} onChange={e => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}월</option>)}</select>}</div>}</div><button type="button" aria-label={mode === 'month' ? '다음 달' : '다음 해'} onClick={() => move(1)} disabled={year === 9999 && (mode === 'year' || month === 12)}>›</button></nav>
    <div className="rp-controls"><div className="rp-segment" role="group" aria-label="리포트 기간"><button aria-pressed={mode === 'month'} onClick={() => setMode('month')}>월간</button><button aria-pressed={mode === 'year'} onClick={() => setMode('year')}>연간</button></div><label><span className="rp-sr">구성원</span><select aria-label="구성원" value={member} onChange={e => setMember(e.target.value as 'all' | '효' | '굥')}><option value="all">전체</option><option value="효">효</option><option value="굥">굥</option></select></label></div>
    </div>
    {pending.length > 0 && <div className="rp-warning" role="status"><strong>확인이 필요한 거래 {pending.length}건</strong><span>미승인 거래는 집계에서 제외돼요. 승인 후 금액과 분석이 달라질 수 있어요.</span></div>}
    <div className="rp-grid">
      <section className="rp-feature"><div className="rp-feature-top"><span><Sparkles size={15} /> 이 기간의 한 줄</span><span>{dateLabel}</span></div><div className="rp-feature-content">
        <div className="rp-feature-copy"><h2>{!rows.length ? <>아직 정리된<br />거래가 없어요</> : canCompare ? <>{comparison}보다 지출이<br /><em>{delta === 0 ? '같아요' : `${money(Math.abs(delta))} ${direction}`}</em></> : <>이번 지출은<br /><em>{money(total.expense)}</em>이에요</>}</h2><p>{!rows.length ? '거래가 입력되고 승인되면 이곳에 이야기를 채워드릴게요.' : changes.length ? `${changes[0].name} 항목이 ${comparison}보다 ${money(Math.abs(changes[0].difference))} ${changes[0].difference > 0 ? '늘어' : '줄어'} 가장 크게 달라졌어요.` : canCompare ? '전체 지출의 변화를 확인해 보세요.' : `${comparison}에 비교할 승인 거래가 없어 증감은 표시하지 않았어요.`}</p></div>
        <div className="rp-feature-mark" aria-hidden="true"><span>✳</span></div></div><div className="rp-feature-bottom"><span>지출 변화는 해당 기간의 승인된 거래 기준이에요.</span></div>
      </section>
      <aside className="rp-summary"><div className="rp-section-label">THE OVERVIEW <span>01</span></div><h2>이 기간의 흐름</h2><div className="rp-stat"><span><i className="rp-stat-icon income"><ArrowUpCircle size={18}/></i>수입</span><strong>{money(total.income)}</strong></div><div className="rp-stat"><span><i className="rp-stat-icon expense"><ArrowDownCircle size={18}/></i>지출</span><strong>{money(total.expense)}</strong></div><div className="rp-balance"><span>수입 − 지출</span><strong>{money(total.income - total.expense)}</strong></div><p>차액은 자산 잔액이나 저축액과 다를 수 있어요.</p></aside>
      <section className="rp-explorer"><div className="trial-explorer-head"><div className="rp-explorer-title"><span>CATEGORY EXPLORER</span><h2>어떤 지출이 쌓였을까요?</h2><p>카테고리를 선택하면 해당 항목의 거래처와 비교 금액을 볼 수 있어요.</p></div>{selectedCategory && <div className="trial-selected-overview"><div className="trial-selected-summary"><strong>{selectedCategory} · {detailMoney(totals(selected).expense)}</strong><small>{previous.length ? `${comparison} ${detailMoney(beforeAmount)} · ${categoryDelta === 0 ? '변화 없음' : `${detailMoney(Math.abs(categoryDelta))} ${categoryDelta > 0 ? '증가' : '감소'}`}${beforeAmount > 0 && categoryDelta !== 0 ? ` (${categoryDelta > 0 ? '+' : '−'}${Math.abs(categoryDelta / beforeAmount * 100).toFixed(1)}%)` : ''}` : `${comparison} 비교 자료 없음`}</small></div><CategoryHistory approved={approved} categories={categories} selectedCategory={selectedCategory} end={trendEnd} /></div>}</div>{categoryRows.length ? <div className="rp-explorer-grid"><div className="rp-option-list" role="group" aria-label="지출 카테고리 선택">{categoryRows.map(item => <button key={item.name} aria-pressed={item.name === selectedCategory} onClick={() => setCategory(item.name)}><span>{item.name}</span><strong>{detailMoney(item.expense)}</strong></button>)}</div><div className="rp-explorer-detail"><div className="trial-detail-heading"><h3>거래처별 지출</h3><p>(승인된 지출 {selected.length}건)</p></div>{vendors.map(v => <div className="rp-detail-row" key={v.name}><span>{v.name}</span><strong>{detailMoney(v.expense)}</strong></div>)}</div></div> : <p>집계할 지출이 없습니다.</p>}</section>
      <ReportAnalytics rows={rows} previous={previous} approved={approved} allApproved={allApproved} scoped={scoped} categories={categories} year={year} month={month} mode={mode} comparison={comparison} currentYear={currentYear} />
    </div><footer className="rp-footer">이 리포트는 현재 가계부에 기록된 거래를 기준으로 계산돼요. 거래가 수정되거나 승인되면 내용이 달라질 수 있어요.</footer>
  </section>;
}
