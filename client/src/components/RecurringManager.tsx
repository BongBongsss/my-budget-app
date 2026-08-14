import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Trash2, X } from 'lucide-react';
import {
  CategoryItem, IgnoredRecurringSuggestion, MissingRecurringTransaction, RecurringCandidate, RecurringTransaction, Transaction,
  addRecurring, deferRecurringCandidate, deleteRecurring, getRecurring, getRecurringCandidates,
  addMissingRecurring, getIgnoredRecurringCandidates, getMissingRecurring, ignoreRecurringCandidate, restoreIgnoredRecurringCandidate, updateRecurring,
  confirmRecurringMatch,
} from '../api';
import { getGroupName } from '../utils/categoryUtils';

type MemberFilter = 'all' | '효' | '굥' | '봉' | '공동' | '미지정';
const desktopMembers: MemberFilter[] = ['all', '효', '굥', '미지정'];
const mobileMembers: MemberFilter[] = ['all', '효', '굥', '봉', '공동'];
const labelMember = (member: MemberFilter) => member === 'all' ? '전체' : member;
const money = (amount: number) => `${Math.round(amount).toLocaleString()}원`;
const RECURRING_GROUP_COLORS = ['#e99494', '#f0b16c', '#f3d36b', '#dc93ca', '#b6a3f6', '#8fc5ed'];

interface Props {
  categories: CategoryItem[];
  transactions: Transaction[];
  canManage: boolean;
  onSuccess?: (message: string) => void;
}

const RecurringManager = ({ categories, transactions, canManage, onSuccess }: Props) => {
  const [list, setList] = useState<RecurringTransaction[]>([]);
  const [candidates, setCandidates] = useState<RecurringCandidate[]>([]);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [activeList, setActiveList] = useState<'candidates' | 'registered'>('registered');
  const [candidatePane, setCandidatePane] = useState<'candidates' | 'ignored'>('candidates');
  const [ignoredCandidates, setIgnoredCandidates] = useState<IgnoredRecurringSuggestion[]>([]);
  const [isCandidatePaneLoading, setIsCandidatePaneLoading] = useState(false);
  const [registeredPane, setRegisteredPane] = useState<'registered' | 'missing'>('registered');
  const [missingItems, setMissingItems] = useState<MissingRecurringTransaction[]>([]);
  const [missingEditingId, setMissingEditingId] = useState<string | null>(null);
  const [missingAmount, setMissingAmount] = useState('');
  const [editing, setEditing] = useState<Partial<RecurringTransaction> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [compositionView, setCompositionView] = useState<'group' | 'category'>('group');
  const [isCompositionExpanded, setIsCompositionExpanded] = useState(false);
  const [selectedCompositionGroup, setSelectedCompositionGroup] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const availableMonths = [...new Set(transactions
    .filter((transaction) => transaction.isVerified !== false && transaction.type === 'expense')
    .map((transaction) => transaction.date.slice(0, 7)))].sort().reverse();
  const [selectedYearMonth, setSelectedYearMonth] = useState<string | null>(null);
  const activeYearMonth = selectedYearMonth || availableMonths[0] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const availableYears = [...new Set(availableMonths.map((yearMonth) => yearMonth.slice(0, 4)))].sort().reverse();
  const activeYear = activeYearMonth.slice(0, 4);
  const availableMonthNumbers = availableMonths.filter((yearMonth) => yearMonth.startsWith(`${activeYear}-`)).map((yearMonth) => yearMonth.slice(5));

  const load = async () => {
    const [recurring, suggested] = await Promise.all([getRecurring(activeYearMonth), getRecurringCandidates()]);
    setList(recurring.data); setCandidates(suggested.data);
  };
  useEffect(() => { void load(); }, [activeYearMonth]);

  const currentMonth = activeYearMonth;
  const currentMonthLabel = `${Number(currentMonth.slice(5))}월`;
  const matchesForMonth = (item: RecurringTransaction) => transactions.some((transaction) =>
    transaction.isVerified !== false && transaction.type === item.type && transaction.vendor.trim().toLowerCase().includes(item.vendor.trim().toLowerCase()) &&
    transaction.date.startsWith(currentMonth) && Math.abs(Number(transaction.date.slice(-2)) - item.day_of_month) <= 5,
  );
  const getCardMemo = (item: RecurringTransaction) => {
    const savedMemo = item.memo?.trim();
    if (savedMemo) return savedMemo;

    const itemVendor = item.vendor.trim().toLowerCase().replace(/\s+/g, ' ');
    return [...transactions]
      .filter((transaction) => {
        const transactionVendor = transaction.vendor.trim().toLowerCase().replace(/\s+/g, ' ');
        return transaction.isVerified !== false
          && transaction.type === item.type
          && transaction.source !== 'recurring_manual'
          && (!item.member || transaction.member === item.member)
          && (transactionVendor.includes(itemVendor) || itemVendor.includes(transactionVendor))
          && Boolean(transaction.memo?.trim());
      })
      .sort((left, right) => right.date.localeCompare(left.date))[0]?.memo?.trim();
  };
  const filteredList = list.filter((item) => item.type === 'expense' && (memberFilter === 'all' || item.member === memberFilter));
  const visibleRegisteredList = selectedCompositionGroup
    ? filteredList.filter((item) => getGroupName(item.category, categories) === selectedCompositionGroup)
    : filteredList;
  const filteredCandidates = candidates.filter((item) => memberFilter === 'all' || item.member === memberFilter);
  const activeItems = filteredList.filter((item) => item.isActive !== false);
  const verifiedCount = activeItems.filter(matchesForMonth).length;
  const dueTotal = activeItems.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const recurringExpenseGroups = useMemo(() => {
    const grouped = activeItems.reduce<Record<string, number>>((result, item) => {
      const key = compositionView === 'group' ? getGroupName(item.category, categories) : item.category || '미지정';
      result[key] = (result[key] || 0) + item.amount;
      return result;
    }, {});
    const entries = Object.entries(grouped).sort(([, left], [, right]) => right - left);
    return { entries, total: entries.reduce((sum, [, amount]) => sum + amount, 0) };
  }, [activeItems, categories, compositionView]);
  const recurringGroupColorMap = useMemo(() => {
    const totals = activeItems.reduce<Record<string, number>>((result, item) => {
      const groupName = getGroupName(item.category, categories);
      result[groupName] = (result[groupName] || 0) + item.amount;
      return result;
    }, {});
    return Object.entries(totals)
      .sort(([, left], [, right]) => right - left)
      .reduce<Record<string, string>>((result, [groupName], index) => {
        result[groupName] = RECURRING_GROUP_COLORS[index % RECURRING_GROUP_COLORS.length];
        return result;
      }, {});
  }, [activeItems, categories]);
  const hiddenRecurringGroups = recurringExpenseGroups.entries.slice(9);
  const visibleRecurringExpenseGroups = !isCompositionExpanded
    ? recurringExpenseGroups.entries.slice(0, 9)
    : recurringExpenseGroups.entries;
  const hiddenRecurringGroupAmount = hiddenRecurringGroups.reduce((sum, [, amount]) => sum + amount, 0);
  const openEditor = (item?: Partial<RecurringTransaction>) => setEditing(item || { vendor: '', amount: 0, category: categories[0]?.name || '', type: 'expense', day_of_month: 1, member: memberFilter === '효' || memberFilter === '굥' ? memberFilter : '', isVariable: false, isActive: true, memo: '' });
  const addFromCandidate = (candidate: RecurringCandidate) => openEditor({ vendor: candidate.vendor, amount: candidate.averageAmount, category: candidate.category, type: 'expense', day_of_month: candidate.dayOfMonth, member: candidate.member, isVariable: candidate.isVariable, isActive: true });

  const save = async () => {
    if (!editing?.vendor?.trim() || !editing.category || Number(editing.amount) <= 0 || !Number.isInteger(Number(editing.day_of_month)) || Number(editing.day_of_month) < 1 || Number(editing.day_of_month) > 28 || !editing.member) return;
    setIsSaving(true);
    try {
      const isUpdate = Boolean(editing.id);
      if (editing.id) await updateRecurring(editing.id, editing);
      else await addRecurring(editing);
      setEditing(null); await load();
      onSuccess?.(isUpdate ? '고정비 항목 수정이 완료되었습니다.' : '고정비 항목 등록이 완료되었습니다.');
    } finally { setIsSaving(false); }
  };
  const handleCandidate = async (action: 'defer' | 'ignore', candidate: RecurringCandidate) => {
    if (action === 'defer') await deferRecurringCandidate(candidate.vendor);
    else await ignoreRecurringCandidate(candidate.vendor);
    await load();
    onSuccess?.(action === 'defer' ? '고정비 추천을 나중에 다시 확인합니다.' : '고정비 추천에서 제외했습니다.');
  };
  const toggleCandidatePane = async () => {
    if (isCandidatePaneLoading) return;
    if (candidatePane === 'candidates') {
      setCandidatePane('ignored');
      setIgnoredCandidates([]);
      setIsCandidatePaneLoading(true);
      try {
        const response = await getIgnoredRecurringCandidates();
        setIgnoredCandidates(response.data);
      } finally {
        setIsCandidatePaneLoading(false);
      }
      return;
    }
    setCandidatePane('candidates');
  };
  const restoreCandidate = async (vendorKey: string) => {
    await restoreIgnoredRecurringCandidate(vendorKey);
    setIgnoredCandidates((previous) => previous.filter((item) => item.vendorKey !== vendorKey));
    await load();
    onSuccess?.('고정비 추천에 다시 포함했습니다.');
  };
  const toggleRegisteredPane = async () => {
    if (registeredPane === 'registered') {
      const response = await getMissingRecurring(currentMonth);
      setMissingItems(response.data.filter((item) => memberFilter === 'all' || item.member === memberFilter));
      setRegisteredPane('missing');
      return;
    }
    setRegisteredPane('registered');
  };
  const selectYearMonth = (value: string) => {
    setExpandedMatchId(null);
    setMissingItems([]);
    setRegisteredPane('registered');
    setSelectedYearMonth(value);
  };
  const selectYear = (year: string) => {
    const firstMonth = availableMonths.find((yearMonth) => yearMonth.startsWith(`${year}-`));
    if (firstMonth) selectYearMonth(firstMonth);
  };
  const addMissingItem = async (item: MissingRecurringTransaction) => {
    await addMissingRecurring(item.id!, item.scheduledDate.slice(0, 7), Number(missingAmount));
    setMissingItems((previous) => previous.filter((current) => current.id !== item.id));
    setMissingEditingId(null);
    await load();
    onSuccess?.('미반영 고정비를 거래에 추가했습니다.');
  };
  const confirmMatch = async (item: RecurringTransaction, transactionId: string) => {
    if (!item.id || !item.matchYearMonth) return;
    await confirmRecurringMatch(item.id, transactionId, item.matchYearMonth);
    setExpandedMatchId(null);
    await load();
    onSuccess?.('고정비 수동 매칭이 완료되었습니다.');
  };
  const toggleActive = async (item: RecurringTransaction) => {
    if (!item.id) return;
    await updateRecurring(item.id, { isActive: !item.isActive });
    await load();
    onSuccess?.(item.isActive === false ? '고정비 항목을 재개했습니다.' : '고정비 항목을 중지했습니다.');
  };
  const removeRecurring = async (item: RecurringTransaction) => {
    if (!item.id) return;
    await deleteRecurring(item.id);
    await load();
    onSuccess?.('고정비 항목을 삭제했습니다.');
  };

  const status = (item: RecurringTransaction) => {
    if (!item.isActive) return '중지됨';
    if (item.matchStatus === 'confirmed') return '수동 매칭 완료';
    if (item.matchStatus === 'auto_matched') return '자동 매칭 완료';
    if (item.matchStatus === 'review_required') return '확인 필요';
    if (item.matchStatus === 'duplicate_suspected') return '중복 의심';
    return matchesForMonth(item) ? '확인됨' : '매칭 데이터 없음';
  };
  const canExpandMatch = (item: RecurringTransaction) => item.matchStatus === 'review_required' || item.matchStatus === 'duplicate_suspected';
  const matchStatusClass = (item: RecurringTransaction) => {
    if (item.matchStatus === 'auto_matched' || item.matchStatus === 'confirmed') return 'recurring-match-success';
    return item.type === 'income' ? 'income-text' : 'expense-text';
  };
  const candidateSummary = useMemo(() => candidates.length, [candidates]);

  return <div className="recurring-view animate-fadeIn">
    <div className="view-action-bar">
      <h2>고정비 관리</h2>
      {canManage && <button type="button" className="btn btn-primary desktop-entry-button" onClick={() => openEditor()}><Plus size={18} /> 고정비 항목 등록</button>}
    </div>
    <div className="summary-filter-bar recurring-filter-bar">
      <div className="recurring-mobile-switch recurring-filter-switch">
        <button className={`btn ${activeList === 'registered' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('registered')}>등록된 항목</button>
        <button className={`btn ${activeList === 'candidates' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('candidates')}>추천 후보</button>
      </div>
      <div className="member-filter recurring-desktop-members">{desktopMembers.map((member) => <button key={member} type="button" className={`btn ${memberFilter === member ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMemberFilter(member)}>{labelMember(member)}</button>)}</div>
    </div>
    <div className="grid grid-cols-3 gap-6 summary-cards recurring-summary-cards">
      <div className="card-summary expense"><div className="details"><span>{currentMonthLabel} 예정 지출</span><h2>{money(dueTotal)}</h2></div></div>
      <div className="card-summary income"><div className="details"><span>{currentMonthLabel} 확인 완료</span><h2>{verifiedCount}건</h2></div></div>
      <div className="card-summary balance"><div className="details"><span>{currentMonthLabel} 미확인 예정</span><h2>{Math.max(activeItems.length - verifiedCount, 0)}건</h2></div></div>
    </div>
    <section className="recurring-composition-card" aria-label="고정비 항목 구성">
      <div className="recurring-composition-header"><h3>고정비 항목 구성</h3><button type="button" className="btn btn-secondary recurring-composition-toggle" onClick={() => { setCompositionView((view) => view === 'group' ? 'category' : 'group'); setIsCompositionExpanded(false); setSelectedCompositionGroup(null); }}>{compositionView === 'group' ? '대분류별' : '상위그룹별'}</button></div>
      {recurringExpenseGroups.entries.length === 0 ? <p className="recurring-empty">등록된 고정비 항목이 없습니다.</p> : <div className={`recurring-composition-list ${isCompositionExpanded ? 'is-expanded' : ''}`}>
        {visibleRecurringExpenseGroups.map(([groupName, amount], index) => {
          const percentage = recurringExpenseGroups.total ? (amount / recurringExpenseGroups.total) * 100 : 0;
          const parentGroupName = compositionView === 'category' ? getGroupName(groupName, categories) : null;
          const isSelected = compositionView === 'group' && selectedCompositionGroup === groupName;
          return <button type="button" className={`recurring-composition-bar ${isSelected ? 'is-selected' : ''}`} key={groupName} aria-pressed={isSelected} onClick={() => {
            if (compositionView !== 'group') return;
            setSelectedCompositionGroup((selected) => selected === groupName ? null : groupName);
            setRegisteredPane('registered');
            setActiveList('registered');
          }}>
            <span className="recurring-composition-fill" style={{ width: `${Math.max(percentage, 2)}%`, backgroundColor: recurringGroupColorMap[parentGroupName || groupName] || RECURRING_GROUP_COLORS[index % RECURRING_GROUP_COLORS.length] }} />
            <span className="recurring-composition-content"><span>{groupName} ({percentage.toFixed(1)}%)</span><span className="recurring-composition-meta">{parentGroupName && <span className="recurring-composition-parent">{parentGroupName}</span>}<span>{money(amount)}</span></span></span>
          </button>;
        })}
        {hiddenRecurringGroups.length > 0 && <button type="button" className="recurring-composition-bar recurring-composition-more" aria-expanded={isCompositionExpanded} onClick={() => setIsCompositionExpanded((expanded) => !expanded)}>
          <span className="recurring-composition-fill" style={{ width: `${Math.max(recurringExpenseGroups.total ? (hiddenRecurringGroupAmount / recurringExpenseGroups.total) * 100 : 0, 2)}%` }} />
          <span className="recurring-composition-content"><span>{isCompositionExpanded ? '상위 9개만 보기' : `그 외 ${hiddenRecurringGroups.length}개`} ({recurringExpenseGroups.total ? ((hiddenRecurringGroupAmount / recurringExpenseGroups.total) * 100).toFixed(1) : '0.0'}%)</span><span>{money(hiddenRecurringGroupAmount)}</span></span>
        </button>}
      </div>}
    </section>
    <div className="recurring-layout">
      <section className={`recurring-panel ${activeList !== 'candidates' ? 'is-mobile-hidden' : ''}`}>
        <div className="recurring-panel-header"><h3><CalendarClock size={20} /> {candidatePane === 'candidates' ? <>추천 후보 {candidateSummary > 0 && <span className="count-badge">{candidateSummary}</span>}</> : '추천 제외 목록'}</h3><button type="button" className="btn btn-secondary recurring-pane-toggle" disabled={isCandidatePaneLoading} onClick={() => void toggleCandidatePane()}>{candidatePane === 'candidates' ? '추천 제외 목록' : '추천 후보'}</button></div>
        {candidatePane === 'ignored' ? (
          isCandidatePaneLoading ? <p className="recurring-empty">추천 제외 목록을 불러오는 중입니다.</p> : ignoredCandidates.length === 0 ? <p className="recurring-empty">추천 제외 항목이 없습니다.</p> : <div className="recurring-card-list">{ignoredCandidates.map((item) => <article className="recurring-card recurring-ignored-card" key={item.id}>
            <div className="recurring-card-title"><strong title={item.vendorKey}>{item.vendorKey}</strong></div>
            <p>추천 제외됨 · {new Date(item.createdAt).toLocaleDateString('ko-KR')}</p>
            {canManage && <div className="recurring-actions"><button className="btn btn-secondary" onClick={() => void restoreCandidate(item.vendorKey)}>다시 추천받기</button></div>}
          </article>)}</div>
        ) : filteredCandidates.length === 0 ? <p className="recurring-empty">새 고정비 후보가 없습니다.</p> : <div className="recurring-card-list">{filteredCandidates.map((candidate) => <article className="recurring-card" key={candidate.id}>
          <div className="recurring-card-title"><strong title={candidate.vendor}>{candidate.vendor}</strong><span className="expense-text">지출</span></div>
          <p>매월 {candidate.dayOfMonth}일 전후 · {candidate.isVariable ? '변동 금액' : '고정 금액'}</p>
          <p>평균 {money(candidate.averageAmount)}{candidate.isVariable ? ` · 범위 ${money(candidate.minAmount)}~${money(candidate.maxAmount)}` : ''}</p>
          <p>최근 {candidate.monthCount}개월 {candidate.occurrenceCount}회</p>
          <p className="recurring-evidence">최근 {candidate.lastUsedAt} · {candidate.category}</p>
          <p className="recurring-evidence">신뢰도 {candidate.confidence}점 · {candidate.reasons.join(' · ')}</p>
          {canManage && <div className="recurring-actions"><button className="btn btn-primary" onClick={() => addFromCandidate(candidate)}>추가</button><button className="btn btn-secondary" onClick={() => void handleCandidate('defer', candidate)}>나중에</button><button className="btn btn-secondary" onClick={() => void handleCandidate('ignore', candidate)}>제외</button></div>}
        </article>)}</div>}
      </section>
      <section className={`recurring-panel ${activeList !== 'registered' ? 'is-mobile-hidden' : ''}`}>
        <div className="recurring-panel-header"><h3><CheckCircle2 size={20} /> {registeredPane === 'registered' ? `등록된 고정비 항목 (${visibleRegisteredList.length}건)` : `미반영 고정비 항목 (${missingItems.length}건)`}</h3><div className="recurring-panel-controls"><span className="recurring-month-selector"><select value={activeYear} onChange={(event) => selectYear(event.target.value)} aria-label="검증 연도">{availableYears.map((year) => <option key={year} value={year}>{year}년</option>)}</select><select value={activeYearMonth.slice(5)} onChange={(event) => selectYearMonth(`${activeYear}-${event.target.value}`)} aria-label="검증 월">{availableMonthNumbers.map((month) => <option key={month} value={month}>{Number(month)}월</option>)}</select></span><button type="button" className="btn btn-secondary recurring-pane-toggle" onClick={() => void toggleRegisteredPane()}>{registeredPane === 'registered' ? '미반영 고정비 항목' : '등록된 고정비 항목'}</button></div></div>
        {registeredPane === 'missing' ? (
          missingItems.length === 0 ? <p className="recurring-empty">미반영 고정비 항목이 없습니다.</p> : <div className="recurring-card-list">{missingItems.map((item) => {
            const cardMemo = getCardMemo(item);
            return <article className="recurring-card recurring-missing-card" key={item.id}>
              <div className="recurring-card-title"><strong title={item.vendor}>{item.vendor}</strong><span className={item.type === 'income' ? 'income-text' : 'expense-text'}>{item.scheduledDate}</span></div>
              <p>{item.category} · {item.member} · 예상 {money(item.amount)}</p>
              {cardMemo && <p className="recurring-card-memo" title={cardMemo}>메모: {cardMemo}</p>}
              {canManage && (missingEditingId === item.id ? <div className="recurring-missing-inline-edit"><input className="edit-input" type="number" min="1" value={missingAmount} onChange={(event) => setMissingAmount(event.target.value)} aria-label={`${item.vendor} 실제 금액`} /><button className="btn btn-primary" disabled={Number(missingAmount) <= 0} onClick={() => void addMissingItem(item)}>추가</button><button className="btn btn-secondary" onClick={() => setMissingEditingId(null)}>취소</button></div> : <div className="recurring-actions"><button className="btn btn-primary" onClick={() => { setMissingEditingId(item.id!); setMissingAmount(String(Math.round(item.amount))); }}>거래에 추가</button></div>)}
            </article>;
          })}</div>
        ) : visibleRegisteredList.length === 0 ? <p className="recurring-empty">등록된 고정비 항목이 없습니다.</p> : <div className="recurring-card-list">{visibleRegisteredList.map((item) => {
          const cardMemo = getCardMemo(item);
          return <article className="recurring-card" key={item.id}>
            <div className="recurring-card-title"><strong title={item.vendor}>{item.vendor}</strong>{canExpandMatch(item) ? <button type="button" className={`${matchStatusClass(item)} recurring-match-toggle`} aria-expanded={expandedMatchId === item.id} onClick={() => setExpandedMatchId((current) => current === item.id ? null : item.id || null)}>{status(item)}</button> : <span className={matchStatusClass(item)}>{status(item)}</span>}</div>
            <p>매월 {item.day_of_month}일 · {item.category} · {item.member || '공동'}</p><p>{item.isVariable ? '예상 ' : ''}{money(item.amount)}</p>
            {item.isActive && item.matchStatus && item.matchStatus !== 'missing' && <p className="recurring-evidence">매칭 {item.matchScore}점 · {item.matchReasons?.join(' · ')}</p>}
            {canExpandMatch(item) && expandedMatchId === item.id && <div className="recurring-match-details">
              <strong>{item.matchStatus === 'duplicate_suspected' ? '중복 후보 거래' : '확인할 후보 거래'}</strong>
              {item.matchCandidates?.map((candidate) => <div className="recurring-match-candidate" key={candidate.id}>
                <span>{candidate.date.slice(5)} · {candidate.vendor}</span><span>{money(candidate.amount)} · {candidate.category}</span><span>{candidate.score}점 · {candidate.reasons.join(' · ')}</span>
                {canManage && <button type="button" className="btn btn-primary recurring-match-confirm" onClick={() => void confirmMatch(item, candidate.id)}>이 거래로 확인</button>}
              </div>)}
            </div>}
            {cardMemo && <p className="recurring-card-memo" title={cardMemo}>메모: {cardMemo}</p>}
            {canManage && <div className="recurring-actions"><button className="btn btn-secondary" onClick={() => openEditor(item)}>수정</button><button className="btn btn-secondary" onClick={() => void toggleActive(item)}>{item.isActive === false ? '재개' : '중지'}</button><button className="btn btn-secondary danger-action" onClick={() => void removeRecurring(item)} aria-label={`${item.vendor} 삭제`}><Trash2 size={16} /></button></div>}
          </article>;
        })}</div>}
      </section>
    </div>
    <div className="recurring-mobile-switch"><button className={`btn ${activeList === 'registered' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('registered')}>등록된 항목</button><button className={`btn ${activeList === 'candidates' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveList('candidates')}>추천 후보</button></div>
    {canManage && <button type="button" className="mobile-entry-fab recurring-mobile-add" onClick={() => openEditor()} aria-label="고정비 항목 등록"><Plus size={22} /></button>}
    {editing && <div className="entry-modal-overlay"><section className="entry-modal recurring-editor" role="dialog" aria-modal="true" aria-label="고정비 항목 등록">
      <div className="entry-modal-header"><h3>{editing.id ? '고정비 항목 수정' : '고정비 항목 등록'}</h3><button className="btn-icon" onClick={() => setEditing(null)}><X size={20} /></button></div>
      <form className="entry-form recurring-editor-form" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <label>내용<input className="edit-input" value={editing.vendor || ''} onChange={(event) => setEditing({ ...editing, vendor: event.target.value })} required /></label>
        <label>예상 금액<input className="edit-input" type="number" min="1" value={editing.amount || ''} onChange={(event) => setEditing({ ...editing, amount: Number(event.target.value) })} required /></label>
        <label>대분류<select className="edit-input" value={editing.category || ''} onChange={(event) => setEditing({ ...editing, category: event.target.value })} required>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
        <label>예정일<input className="edit-input" type="number" min="1" max="28" value={editing.day_of_month || 1} onChange={(event) => setEditing({ ...editing, day_of_month: Number(event.target.value) })} required /></label>
        <label>구성원<select className="edit-input" value={editing.member || ''} onChange={(event) => setEditing({ ...editing, member: event.target.value })} required><option value="">구성원 선택</option>{['효', '굥'].map((member) => <option key={member} value={member}>{member}</option>)}</select></label>
        <label className="recurring-variable"><input type="checkbox" checked={Boolean(editing.isVariable)} onChange={(event) => setEditing({ ...editing, isVariable: event.target.checked })} /> 변동 금액</label>
        <label className="recurring-memo">메모<input className="edit-input" value={editing.memo || ''} onChange={(event) => setEditing({ ...editing, memo: event.target.value })} /></label>
        <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>취소</button><button type="submit" className="btn btn-primary" disabled={isSaving}>저장</button></div>
      </form>
    </section></div>}
  </div>;
};

export default RecurringManager;
