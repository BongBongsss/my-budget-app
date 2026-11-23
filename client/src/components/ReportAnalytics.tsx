import { useState } from 'react';
import type { CategoryItem, Transaction } from '../api';
import { getGroupName } from '../utils/categoryUtils';
import { categoryChanges, groups, inPeriod, totals } from '../utils/report';
import { monthlyHistory, patternInsight } from '../utils/reportAnalytics';

type Props = { rows: Transaction[]; previous: Transaction[]; approved: Transaction[]; allApproved: Transaction[]; scoped: Transaction[]; categories: CategoryItem[]; year: number; month: number; mode: 'month' | 'year'; comparison: string; currentYear: boolean };
const money = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
const signedMoney = (n: number) => { const value = Math.round(n); return `${value > 0 ? '+' : value < 0 ? '−' : ''}${money(Math.abs(value))}`; };

export default function ReportAnalytics({ rows, previous, approved, allApproved, scoped, categories, year, month, mode, comparison, currentYear }: Props) {
  const [showPeople, setShowPeople] = useState(false);
  const end = new Date(year, mode === 'month' ? month - 1 : currentYear ? new Date().getMonth() : 11, 1);
  const chartApproved = currentYear ? approved.filter(t => t.date.slice(0, 4) !== String(year) || Number(t.date.slice(5, 7)) <= end.getMonth() + 1) : approved;
  const history = monthlyHistory(chartApproved, mode === 'month' ? end : new Date(year, 11, 1), mode === 'month' ? 6 : 12, null, categories);
  const max = Math.max(1, ...history.flatMap(m => [m.income, m.expense]));
  const changes = rows.length && previous.length ? categoryChanges(rows, previous, categories) : [];
  const increasing = changes.filter(c => c.difference > 0).slice(0, 3);
  const decreasing = changes.filter(c => c.difference < 0).slice(0, 3);
  const pattern = patternInsight(approved, scoped, end, categories);
  const allRows = allApproved.filter(t => inPeriod(t, year, mode === 'month' ? month : undefined) && (!currentYear || Number(t.date.slice(5, 7)) <= end.getMonth() + 1));
  const peopleWithData = groups(allRows, t => t.member?.trim() || '미지정');
  const people = ['효', '굥', ...peopleWithData.map(p => p.name).filter(name => name !== '효' && name !== '굥')].map(name => ({ name, data: peopleWithData.find(p => p.name === name) }));
  return <>
    <section className="trial-card trial-chart-card"><div className="trial-heading"><div><span>THE FLOW</span><h2>월별 수입·지출 추세</h2><p>{mode === 'month' ? '선택한 달을 포함한 최근 6개월' : '선택한 해의 월별 기록'} · 선택한 구성원 기준</p></div><div className="trial-legend"><i />수입 <i />지출</div></div>
      <div className="trial-chart-viewport"><div className={`trial-chart ${mode === 'year' ? 'is-annual' : ''}`} aria-label="월별 수입 지출 추세">{history.map(item => { const difference = item.income - item.expense; return <div className="trial-chart-column" key={item.key}><div className="trial-bars">{item.hasData ? <><span className="income" style={{height:`${Math.max(0, item.income / max * 100)}%`}} /><span className="expense" style={{height:`${Math.max(0, item.expense / max * 100)}%`}} /></> : <span className="empty" />}</div><span className="trial-chart-month">{item.key.slice(5)}월</span><strong className={`trial-chart-difference ${!item.hasData ? 'missing' : difference > 0 ? 'positive' : difference < 0 ? 'negative' : ''}`} aria-label={`${item.key} 차액 ${item.hasData ? signedMoney(difference) : '데이터 없음'}`}>{item.hasData ? signedMoney(difference) : '—'}</strong></div>; })}</div></div>
      <details className="trial-details"><summary>월별 금액 보기</summary>{history.map(item => <div key={item.key}><span>{item.key}</span><span>{item.hasData ? `수입 ${money(item.income)} · 지출 ${money(item.expense)} · 차액 ${signedMoney(item.income - item.expense)}` : '데이터 없음'}</span></div>)}</details><small>차액은 수입 − 지출이며, 빈 표시는 기록이 없는 달이에요. 입력이 모두 완료됐는지는 별도로 확인해 주세요.<span className="trial-scroll-hint"> 그래프를 좌우로 밀어 전체 월을 볼 수 있어요.</span></small>
    </section>
    <section className="trial-card trial-causes"><span className="trial-eyebrow">WHAT CHANGED</span><h2>무엇이 달라졌을까요?</h2><p>{comparison} 대비 카테고리별 지출 변화</p>{rows.length && previous.length ? <div className="trial-change-columns">{[["늘어난 지출", increasing], ["줄어든 지출", decreasing]].map(([title, items]) => <div key={title as string}><h3>{title as string}</h3>{(items as typeof changes).length ? (items as typeof changes).map(item => <div className="trial-change" key={item.name}><span>{item.name}</span><strong className={item.difference > 0 ? 'up' : 'down'}>{item.difference > 0 ? '+' : '−'}{money(Math.abs(item.difference))}</strong></div>) : <p>해당 항목이 없어요.</p>}</div>)}</div> : <p>비교할 기간의 승인 거래가 없어 변화를 표시할 수 없어요.</p>}<small>두 기간에 미승인 거래가 있다면 승인 후 변화가 달라질 수 있어요.</small></section>
    <section className="trial-card trial-pattern"><span className="trial-eyebrow">A CLOSER LOOK</span><h2>평소와 비교해 보면</h2>{pattern?.item ? <><p><strong>{pattern.item.name}</strong>의 {pattern.period} 지출은 <strong>{money(pattern.item.amount)}</strong>으로, 직전 3개월 평균 <strong>{money(pattern.item.average)}</strong>보다 {money(pattern.item.amount - pattern.item.average)} 높아요.</p><small>비교 기간 {pattern.start}~{pattern.end}. 일시적인 지출인지 확인해 보세요. 승인된 거래 기준이며 입력 누락 여부는 직접 확인해 주세요.</small></> : <p>{pattern ? '직전 3개월 평균보다 높아진 항목이 없거나 비교 기준 금액이 없어요.' : '선택 월과 직전 3개월의 승인 거래가 모두 있고 미승인 거래가 없을 때 표시해요.'}</p>}{mode === 'year' && <small>연간 화면은 {year}-{String(end.getMonth() + 1).padStart(2, '0')}을 기준 월로 분석합니다.</small>}</section>
    <section className="trial-card trial-people"><div className="trial-heading"><div><span>TOGETHER</span><h2>효·굥 함께 보기</h2><p>상단 구성원 선택과 관계없이 전체 구성원을 비교해요.</p></div><button type="button" className="trial-people-toggle" aria-expanded={showPeople} onClick={() => setShowPeople(!showPeople)}>{showPeople ? '접기' : '비교하기'}</button></div>{showPeople && <><div className="trial-people-grid">{people.map(person => { const personRows = allRows.filter(t => (t.member?.trim() || '미지정') === person.name && t.type === 'expense'); const top = groups(personRows, t => getGroupName(t.category, categories))[0]; return <div className="trial-person" key={person.name}><h3>{person.name}</h3>{person.data ? <><p>수입 <strong>{money(person.data.income)}</strong></p><p>지출 <strong>{money(person.data.expense)}</strong></p><small>주요 지출 {top ? `${top.name} · ${money(top.expense)}` : '없음'}</small></> : <p>이 기간의 승인 거래가 없어요.</p>}</div>; })}</div><small>공동·미지정 등은 기록된 이름대로 별도 표시하므로 각 구성원의 합이 전체와 일치합니다. 통계 제외 설정이 적용돼요.</small></>}</section>
  </>;
}

export function CategoryHistory({ approved, categories, selectedCategory, end }: { approved: Transaction[]; categories: CategoryItem[]; selectedCategory: string; end: Date }) {
  const history = monthlyHistory(approved, end, 6, selectedCategory, categories);
  const values = history.filter(item => item.hasData).map(item => item.expense);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const scale = max - min || 1;
  const points = history.map((item, i) => ({ ...item, x: 20 + i * 52, y: 55 - (item.expense - min) / scale * 42 }));
  return <div className="trial-category-history" aria-label="선택한 카테고리 월별 추세"><div className="trial-mini-heading"><strong>최근 6개월 지출</strong><span>{selectedCategory}</span></div><svg viewBox="0 0 300 64" preserveAspectRatio="none" role="img" aria-label={`${selectedCategory} 최근 6개월 지출 추이`}><line x1="20" y1="56" x2="280" y2="56" className="trial-mini-baseline" />{points.map((point, i) => i > 0 && point.hasData && points[i - 1].hasData ? <line key={`line-${point.key}`} x1={points[i - 1].x} y1={points[i - 1].y} x2={point.x} y2={point.y} className="trial-mini-line" /> : null)}{points.map(point => point.hasData ? <circle key={point.key} cx={point.x} cy={point.y} r="3.5" className="trial-mini-point"><title>{point.key} {money(point.expense)}</title></circle> : null)}</svg><div className="trial-mini-months">{points.map(point => <span key={point.key} className={!point.hasData ? 'missing' : ''}>{point.key.slice(5)}월</span>)}</div><details><summary>월별 금액 보기</summary><div className="trial-mini-values">{points.map(point => <div key={point.key}><span>{point.key}</span><strong>{point.hasData ? money(point.expense) : '데이터 없음'}</strong></div>)}</div><small>다른 승인 거래만 있는 달은 이 항목을 0원으로 표시해요.</small></details></div>;
}
