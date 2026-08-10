import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Trash2, X } from 'lucide-react';
import {
  CategoryItem, RecurringCandidate, RecurringTransaction, Transaction,
  addRecurring, deferRecurringCandidate, deleteRecurring, getRecurring, getRecurringCandidates,
  ignoreRecurringCandidate, updateRecurring,
} from '../api';

type MemberFilter = 'all' | '효' | '굥' | '봉' | '공동';
const members: MemberFilter[] = ['all', '효', '굥', '봉', '공동'];
const labelMember = (member: MemberFilter) => member === 'all' ? '전체' : member;
const money = (amount: number) => `${Math.round(amount).toLocaleString()}원`;

interface Props {
  categories: CategoryItem[];
  transactions: Transaction[];
  canManage: boolean;
}

const RecurringManager = ({ categories, transactions, canManage }: Props) => {
  const [list, setList] = useState<RecurringTransaction[]>([]);
  const [candidates, setCandidates] = useState<RecurringCandidate[]>([]);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [activeList, setActiveList] = useState<'candidates' | 'registered'>('candidates');
  const [editing, setEditing] = useState<Partial<RecurringTransaction> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    const [recurring, suggested] = await Promise.all([getRecurring(), getRecurringCandidates()]);
    setList(recurring.data); setCandidates(suggested.data);
  };
  useEffect(() => { void load(); }, []);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const matchesForMonth = (item: RecurringTransaction) => transactions.some((transaction) =>
    transaction.isVerified !== false && transaction.type === item.type && transaction.vendor.trim().toLowerCase().includes(item.vendor.trim().toLowerCase()) &&
    transaction.date.startsWith(currentMonth) && Math.abs(Number(transaction.date.slice(-2)) - item.day_of_month) <= 5,
  );
  const filteredList = list.filter((item) => memberFilter === 'all' || item.member === memberFilter);
  const filteredCandidates = candidates.filter((item) => memberFilter === 'all' || item.member === memberFilter);
  const activeItems = filteredList.filter((item) => item.isActive !== false);
  const verifiedCount = activeItems.filter(matchesForMonth).length;
  const dueTotal = activeItems.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const openEditor = (item?: Partial<RecurringTransaction>) => setEditing(item || { vendor: '', amount: 0, category: categories[0]?.name || '', type: 'expense', day_of_month: 1, member: memberFilter === 'all' ? '공동' : memberFilter, isVariable: false, isActive: true, memo: '' });
  const addFromCandidate = (candidate: RecurringCandidate) => openEditor({ vendor: candidate.vendor, amount: candidate.averageAmount, category: candidate.category, type: candidate.type, day_of_month: candidate.dayOfMonth, member: candidate.member, isVariable: candidate.isVariable, isActive: true });

  const save = async () => {
    if (!editing?.vendor?.trim() || !editing.category || !editing.amount || !editing.day_of_month) return;
    setIsSaving(true);
    try {
      if (editing.id) await updateRecurring(editing.id, editing);
      else await addRecurring(editing);
      setEditing(null); await load();
    } finally { setIsSaving(false); }
  };
  const handleCandidate = async (action: 'defer' | 'ignore', candidate: RecurringCandidate) => {
    if (action === 'defer') await deferRecurringCandidate(candidate.vendor);
    else await ignoreRecurringCandidate(candidate.vendor);
    await load();
  };

  const status = (item: RecurringTransaction) => !item.isActive ? '중지됨' : matchesForMonth(item) ? '확인됨' : `매월 ${item.day_of_month}일`;
  const candidateSummary = useMemo(() => candidates.length, [candidates]);

  return <div className="recurring-view animate-fadeIn">
    <div className="view-action-bar">
      <h2>정기 관리</h2>
      {canManage && <button type="button" className="btn btn-primary desktop-entry-button" onClick={() => openEditor()}><Plus size={18} /> 정기거래 등록</button>}
    </div>
    <div className="summary-filter-bar recurring-filter-bar">
      <div className="member-filter">{members.map((member) => <button key={member} type="button" className={`btn ${memberFilter === member ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMemberFilter(member)}>{labelMember(member)}</button>)}</div>
    </div>
    <div className="summary-cards recurring-summary-cards">
      <div className="card-summary expense"><div className="details"><span>이번 달 예정 지출</span><h2>{money(dueTotal)}</h2></div></div>
      <div className="card-summary income"><div className="details"><span>확인 완료</span><h2>{verifiedCount}건</h2></div></div>
      <div className="card-summary balance"><div className="details"><span>미확인 예정</span><h2>{Math.max(activeItems.length - verifiedCount, 0)}건</h2></div></div>
    </div>
    <div className="recurring-layout">
      <section className={`recurring-panel ${activeList !== 'candidates' ? 'is-mobile-hidden' : ''}`}>
        <div className="recurring-panel-header"><h3><CalendarClock size={20} /> 추천 후보 {candidateSummary > 0 && <span className="count-badge">{candidateSummary}</span>}</h3><span>반복 거래 분석</span></div>
        {filteredCandidates.length === 0 ? <p className="recurring-empty">새 정기거래 후보가 없습니다.</p> : <div className="recurring-card-list">{filteredCandidates.map((candidate) => <article className="recurring-card" key={candidate.id}>
          <div className="recurring-card-title"><strong title={candidate.vendor}>{candidate.vendor}</strong><span className={candidate.type === 'income' ? 'income-text' : 'expense-text'}>{candidate.type === 'income' ? '수입' : '지출'}</span></div>
          <p>매월 {candidate.dayOfMonth}일 전후 · {candidate.isVariable ? '변동 금액' : '고정 금액'}</p>
          <p>{money(candidate.averageAmount)} · 최근 {candidate.monthCount}개월 {candidate.occurrenceCount}회</p>
          <p className="recurring-evidence">최근 {candidate.lastUsedAt} · {candidate.category}</p>
          {canManage && <div className="recurring-actions"><button className="btn btn-primary" onClick={() => addFromCandidate(candidate)}>추가</button><button className="btn btn-secondary" onClick={() => void handleCandidate('defer', candidate)}>나중에</button><button className="btn btn-secondary" onClick={() => void handleCandidate('ignore', candidate)}>제외</button></div>}
        </article>)}</div>}
      </section>
      <section className={`recurring-panel ${activeList !== 'registered' ? 'is-mobile-hidden' : ''}`}>
        <div className="recurring-panel-header"><h3><CheckCircle2 size={20} /> 등록된 정기거래</h3><span>{filteredList.length}건</span></div>
        {filteredList.length === 0 ? <p className="recurring-empty">등록된 정기거래가 없습니다.</p> : <div className="recurring-card-list">{filteredList.map((item) => <article className="recurring-card" key={item.id}>
          <div className="recurring-card-title"><strong title={item.vendor}>{item.vendor}</strong><span className={item.type === 'income' ? 'income-text' : 'expense-text'}>{status(item)}</span></div>
          <p>매월 {item.day_of_month}일 · {item.category} · {item.member || '공동'}</p><p>{item.isVariable ? '예상 ' : ''}{money(item.amount)}</p>
          {canManage && <div className="recurring-actions"><button className="btn btn-secondary" onClick={() => openEditor(item)}>수정</button><button className="btn btn-secondary" onClick={() => void updateRecurring(item.id!, { isActive: !item.isActive }).then(load)}>{item.isActive === false ? '재개' : '중지'}</button><button className="btn btn-secondary danger-action" onClick={() => item.id && void deleteRecurring(item.id).then(load)} aria-label={`${item.vendor} 삭제`}><Trash2 size={16} /></button></div>}
        </article>)}</div>}
      </section>
    </div>
    <div className="recurring-mobile-switch"><button className={`btn ${activeList === 'candidates' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('candidates')}>추천 후보</button><button className={`btn ${activeList === 'registered' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('registered')}>등록된 거래</button></div>
    {canManage && <button type="button" className="mobile-entry-fab recurring-mobile-add" onClick={() => openEditor()} aria-label="정기거래 등록"><Plus size={22} /></button>}
    {editing && <div className="entry-modal-overlay"><section className="entry-modal recurring-editor" role="dialog" aria-modal="true" aria-label="정기거래 등록">
      <div className="entry-modal-header"><h3>{editing.id ? '정기거래 수정' : '정기거래 등록'}</h3><button className="btn-icon" onClick={() => setEditing(null)}><X size={20} /></button></div>
      <div className="entry-form recurring-editor-form">
        <label>내용<input className="edit-input" value={editing.vendor || ''} onChange={(event) => setEditing({ ...editing, vendor: event.target.value })} /></label>
        <label>예상 금액<input className="edit-input" type="number" min="0" value={editing.amount || ''} onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })} /></label>
        <label>구분<select className="edit-input" value={editing.type || 'expense'} onChange={(event) => setEditing({ ...editing, type: event.target.value as 'income' | 'expense' })}><option value="expense">지출</option><option value="income">수입</option></select></label>
        <label>대분류<select className="edit-input" value={editing.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
        <label>예정일<input className="edit-input" type="number" min="1" max="28" value={editing.day_of_month || 1} onChange={(event) => setEditing({ ...editing, day_of_month: Number(event.target.value) })} /></label>
        <label>구성원<select className="edit-input" value={editing.member || '공동'} onChange={(event) => setEditing({ ...editing, member: event.target.value })}>{members.slice(1).map((member) => <option key={member} value={member}>{member}</option>)}</select></label>
        <label className="recurring-variable"><input type="checkbox" checked={Boolean(editing.isVariable)} onChange={(event) => setEditing({ ...editing, isVariable: event.target.checked })} /> 변동 금액</label>
        <label className="recurring-memo">메모<input className="edit-input" value={editing.memo || ''} onChange={(event) => setEditing({ ...editing, memo: event.target.value })} /></label>
        <div className="form-actions"><button className="btn btn-secondary" onClick={() => setEditing(null)}>취소</button><button className="btn btn-primary" disabled={isSaving} onClick={() => void save()}>저장</button></div>
      </div>
    </section></div>}
  </div>;
};

export default RecurringManager;
