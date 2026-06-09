import React, { useEffect, useState } from 'react';
import {
  CategoryItem,
  ReviewRequest,
  Transaction,
  createReviewRequest,
  deleteReviewRequest,
  getReviewRequests,
  updateReviewRequestStatus,
} from '../api';
import { Trash2, Check, X, Edit2, Search, RefreshCw, ListChecks, ThumbsUp, MessageCircle, Download } from 'lucide-react';
import { getGroupName } from '../utils/categoryUtils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onBulkUpdateMember?: (ids: string[], member: string) => void;
  onVerify?: (ids: string[]) => void;
  onRefresh: () => void | Promise<void>;
  period: 'all' | 'month' | 'year';
  setPeriod: (p: 'all' | 'month' | 'year') => void;
  year: number;
  setYear: (y: number) => void;
  month: number;
  setMonth: (m: number) => void;
  memberFilter: 'all' | '효' | '굥' | '미지정';
  setMemberFilter: (m: 'all' | '효' | '굥' | '미지정') => void;
  isAdmin?: boolean;
  pageScope?: string;
  externalFilterActive?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions = [], categories = [], onDelete, onBulkDelete, onUpdate, onBulkUpdateMember, onVerify, onRefresh,
  period, setPeriod, year, setYear, month, setMonth, 
  memberFilter, setMemberFilter, isAdmin = true, pageScope = 'default', externalFilterActive = false
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [pageByScope, setPageByScope] = useState<Record<string, number>>({});
  const currentPage = pageByScope[pageScope] || 1;
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'date' | 'type' | 'group' | 'category' | 'subcategory' | 'vendor' | 'source' | 'memo'>('group');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkType, setBulkType] = useState<'expense' | 'income' | 'exclude' | ''>('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkMemo, setBulkMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'none' | 'resolved' | 'open'>('all');
  const [reviewTarget, setReviewTarget] = useState<Transaction | null>(null);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewType, setReviewType] = useState<'question' | 'change_request'>('question');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  const refreshReviewState = async (target: Transaction) => {
    await loadReviewRequests(target);
    await onRefresh();
  };

  const setCurrentPage = (value: number | ((prev: number) => number)) => {
    setPageByScope((pages) => {
      const prev = pages[pageScope] || 1;
      const next = typeof value === 'function' ? value(prev) : value;
      return { ...pages, [pageScope]: next };
    });
  };

  useEffect(() => {
    setSelectedIds([]);
    setEditingId(null);
  }, [pageScope]);

  const uniqueValues = {
    types: Array.from(new Set(transactions.map(t => t.type === 'expense' ? '지출' : t.type === 'income' ? '수입' : '미반영'))),
    groups: Array.from(new Set(transactions.map(t => getGroupName(t.category, categories)))).sort(),
    categories: Array.from(new Set(transactions.map(t => t.category))).sort(),
    subcategories: Array.from(new Set(transactions.map(t => t.subcategory || '').filter(Boolean))).sort(),
    sources: Array.from(new Set(transactions.map(t => t.source || '').filter(Boolean))).sort(),
  };

  const handleBulkUpdate = async () => {
    if (!isAdmin) return;
    if (selectedIds.length === 0) return;
    const updates: Partial<Transaction> = {};
    if (bulkCategory) updates.category = bulkCategory;
    if (bulkType) updates.type = bulkType;
    if (bulkSubcategory !== undefined && bulkSubcategory !== '') updates.subcategory = bulkSubcategory;
    if (bulkMemo !== undefined && bulkMemo !== '') updates.memo = bulkMemo;

    if (Object.keys(updates).length === 0) {
      alert('필드를 하나 이상 선택해 주세요.');
      return;
    }
    for (const id of selectedIds) { await onUpdate(id, updates); }
    setBulkCategory(''); setBulkType(''); setBulkSubcategory(''); setBulkMemo(''); setSelectedIds([]);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (reviewFilter !== 'all' && (tx.reviewStatus || 'none') !== reviewFilter) return false;

    if (filterType === 'date') {
      if (!startDate && !endDate) return true;
      const txDate = tx.date;
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    if (filterType === 'vendor') return tx.vendor.toLowerCase().includes(q);
    if (filterType === 'memo') return (tx.memo || '').toLowerCase().includes(q);
    
    if (filterType === 'type') {
        const typeLabel = tx.type === 'expense' ? '지출' : tx.type === 'income' ? '수입' : '미반영';
        return typeLabel === searchQuery;
    }
    if (filterType === 'category') return tx.category === searchQuery;
    if (filterType === 'group') return getGroupName(tx.category, categories) === searchQuery;
    if (filterType === 'subcategory') return (tx.subcategory || '') === searchQuery;
    if (filterType === 'source') return (tx.source || '') === searchQuery;
    
    return false;
  });

  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const reviewCounts = transactions.reduce((acc, tx) => {
    const status = tx.reviewStatus || 'none';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { none: 0, resolved: 0, open: 0 } as Record<'none' | 'resolved' | 'open', number>);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aVal: any = key === 'group' ? getGroupName(a.category, categories) : (a as any)[key];
    let bVal: any = key === 'group' ? getGroupName(b.category, categories) : (b as any)[key];
    
    if (key === 'type') {
      aVal = a.type === 'expense' ? '지출' : a.type === 'income' ? '수입' : '미반영';
      bVal = b.type === 'expense' ? '지출' : b.type === 'income' ? '수입' : '미반영';
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(Math.ceil(sortedTransactions.length / itemsPerPage), 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toCsvCell = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const getTypeLabel = (type: Transaction['type']) => {
    if (type === 'income') return '수입';
    if (type === 'expense') return '지출';
    if (type === 'exclude') return '미반영';
    return type;
  };

  const handleExportCsv = () => {
    const headers = ['날짜', '시간', '효/굥', '타입', '상위 그룹', '대분류', '소분류', '내용', '금액', '결제수단', '메모'];
    const rows = sortedTransactions.map((tx) => [
      tx.date,
      tx.time || '',
      tx.member || '',
      getTypeLabel(tx.type),
      getGroupName(tx.category, categories),
      tx.category || '',
      tx.subcategory || '',
      tx.vendor || '',
      tx.amount ?? '',
      tx.source || '',
      tx.memo || '',
    ]);
    const csv = [
      headers.map(toCsvCell).join(','),
      ...rows.map((row) => row.map(toCsvCell).join(',')),
    ].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const scope = pageScope === 'all' ? 'all' : pageScope;
    link.href = url;
    link.download = `transactions-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelect = (id: string) => {
    if (!isAdmin) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startEdit = (tx: Transaction) => {
    if (!isAdmin) return;
    setEditingId(tx.id!);
    setEditValues(tx);
  };

  const saveEdit = async (id: string) => {
    if (!isAdmin) return;
    await onUpdate(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const handleSingleVerify = async (id: string) => {
    if (!isAdmin) return;
    if (onVerify) {
      await onVerify([id]);
      return;
    }

    await onUpdate(id, { isVerified: true });
    onRefresh();
  };

  const getReviewTargetType = (tx: Transaction): 'transaction' | 'importRow' => (
    tx.reviewTargetType || (tx.isVerified === false ? 'importRow' : 'transaction')
  );

  const loadReviewRequests = async (tx: Transaction) => {
    if (!tx.id) return;
    setReviewLoading(true);
    try {
      const res = await getReviewRequests({
        targetType: getReviewTargetType(tx),
        targetId: tx.id,
      });
      setReviewRequests(res.data);
    } finally {
      setReviewLoading(false);
    }
  };

  const openReviewPanel = async (tx: Transaction) => {
    setReviewTarget(tx);
    setReviewType('question');
    setReviewTitle(`${tx.vendor} 확인요청`);
    setReviewBody('');
    await loadReviewRequests(tx);
  };

  const handleCreateReview = async () => {
    if (!reviewTarget?.id || !reviewTitle.trim() || !reviewBody.trim()) return;
    await createReviewRequest({
      targetType: getReviewTargetType(reviewTarget),
      targetId: reviewTarget.id,
      type: reviewType,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
    });
    setReviewBody('');
    await refreshReviewState(reviewTarget);
  };

  const handleToggleReviewStatus = async (request: ReviewRequest) => {
    if (!reviewTarget) return;
    await updateReviewRequestStatus(request.id, request.status === 'open' ? 'done' : 'open');
    await refreshReviewState(reviewTarget);
  };

  const handleDeleteReview = async (request: ReviewRequest) => {
    if (!reviewTarget || !window.confirm('이 확인요청을 삭제하시겠습니까?')) return;
    await deleteReviewRequest(request.id);
    await refreshReviewState(reviewTarget);
  };

  const renderPagination = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        pages.push('...');
      }
    }

    const uniquePages = pages.filter((item, pos, self) => self.indexOf(item) === pos);

    return uniquePages.map((page, index) => (
      <React.Fragment key={index}>
        {page === '...' ? (
          <span style={{ padding: '0 5px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</span>
        ) : (
          <button 
            className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setCurrentPage(page as number)}
            style={{ minWidth: '35px', padding: '2px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {page}
          </button>
        )}
      </React.Fragment>
    ));
  };

  const cellEllipsisStyle: React.CSSProperties = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%'
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getReviewColor = (tx: Transaction) => {
    if ((tx.openReviewCount || 0) > 0) return '#dc2626';
    if ((tx.reviewCount || 0) > 0) return '#2563eb';
    return '#94a3b8';
  };

  return (
    <div className="transaction-list">
      <div className="flex justify-start items-center gap-2 mb-4">
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="edit-input" style={{ fontSize: '0.8rem', padding: '1px 3px', width: 'auto' }}>
          <option value="all">전체</option>
          <option value="month">월별</option>
          <option value="year">연별</option>
        </select>

        {(period === 'month' || period === 'year') && (
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="edit-input" style={{ fontSize: '0.75rem', padding: '0px 2px', width: 'auto' }}>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
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
          <button
            className={`btn ${memberFilter === '미지정' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMemberFilter('미지정')}
            style={{ fontSize: '0.75rem', padding: '2px 8px' }}
          >
            미지정
          </button>
        </div>

        <div style={{ borderLeft: '1px solid #ddd', height: '20px', margin: '0 10px' }}></div>

        <div className="flex gap-1 items-center">
          <span style={{ fontSize: '0.75rem', color: '#475569', marginRight: '2px' }}>요청</span>
          <button className={`btn ${reviewFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setReviewFilter('all'); setCurrentPage(1); }} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>전체</button>
          <button className={`btn ${reviewFilter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setReviewFilter('resolved'); setCurrentPage(1); }} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>처리됨 ({reviewCounts.resolved})</button>
          <button className={`btn ${reviewFilter === 'open' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setReviewFilter('open'); setCurrentPage(1); }} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>미확인 ({reviewCounts.open})</button>
        </div>
      </div>

      <div className="list-actions mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1 items-center">
            <select value={filterType} onChange={e => { setFilterType(e.target.value as any); setSearch(''); setSearchQuery(''); }} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }}>
              <option value="date">날짜</option>
              <option value="type">타입</option>
              <option value="group">상위 그룹</option>
              <option value="category">대분류</option>
              <option value="subcategory">소분류</option>
              <option value="vendor">내용</option>
              <option value="source">결제수단</option>
              <option value="memo">메모</option>
            </select>
            
            {filterType === 'date' ? (
              <div className="flex gap-1 items-center">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setSearchQuery('range'), setCurrentPage(1))} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }} />
                <span>~</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setSearchQuery('range'), setCurrentPage(1))} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }} />
              </div>
            ) : ['type', 'group', 'category', 'subcategory', 'source'].includes(filterType) ? (
              <select 
                value={search} 
                onChange={e => { setSearch(e.target.value); setSearchQuery(e.target.value); setCurrentPage(1); }} 
                className="edit-input" 
                style={{ fontSize: '0.8rem', padding: '2px 5px', width: 'auto' }}
              >
                <option value="">항목 선택...</option>
                {filterType === 'type' && uniqueValues.types.map(v => <option key={v} value={v}>{v}</option>)}
                {filterType === 'group' && uniqueValues.groups.map(v => <option key={v} value={v}>{v}</option>)}
                {filterType === 'category' && uniqueValues.categories.map(v => <option key={v} value={v}>{v}</option>)}
                {filterType === 'subcategory' && uniqueValues.subcategories.map(v => <option key={v} value={v}>{v}</option>)}
                {filterType === 'source' && uniqueValues.sources.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : (
              <input type="text" placeholder="검색어..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setSearchQuery(search), setCurrentPage(1))} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '120px' }} />
            )}
            
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={() => { setSearchQuery(search); setCurrentPage(1); }}><Search size={16} /></button>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={() => { setSearch(''); setSearchQuery(''); setStartDate(''); setEndDate(''); setCurrentPage(1); onRefresh(); }} title="검색 초기화"><RefreshCw size={16} /></button>
          </div>

          {(externalFilterActive || searchQuery || startDate || endDate || search) && (
            <div className="flex gap-4" style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '5px' }}>
              <span style={{ color: '#2563eb', marginRight: '15px' }}>합계 수입: {filteredIncome.toLocaleString()}원</span>
              <span style={{ color: '#dc2626' }}>합계 지출: {filteredExpense.toLocaleString()}원</span>
            </div>
          )}

          <div className="flex gap-1 items-center">
            <button
              className="btn btn-secondary"
              onClick={handleExportCsv}
              disabled={sortedTransactions.length === 0}
              style={{ fontSize: '0.8rem', padding: '2px 8px' }}
              title="현재 필터 결과 CSV export"
            >
              <Download size={16} style={{ marginRight: '4px' }} /> CSV
            </button>
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="edit-input" style={{ fontSize: '0.8rem', padding: '1px 3px', width: 'auto' }}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {isAdmin && selectedIds.length > 0 && (
        <div className="flex gap-2 items-center mb-6 p-2 bg-gray-100 rounded border border-blue-200">
            <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '2px 8px' }} onClick={() => { onBulkDelete(selectedIds); setSelectedIds([]); }} title="Delete Selected"><Trash2 size={16} /></button>
            <div style={{ borderLeft: '1px solid #cbd5e1', height: '20px', margin: '0 5px' }}></div>
            <select value={bulkType} onChange={(e) => setBulkType(e.target.value as any)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '80px' }}>
                <option value="">타입</option>
                <option value="expense">지출</option>
                <option value="income">수입</option>
                <option value="exclude">미반영</option>
            </select>
            <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '110px' }}>
                <option value="">대분류</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <input type="text" placeholder="소분류 입력" value={bulkSubcategory} onChange={(e) => setBulkSubcategory(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '100px' }} />
            <input type="text" placeholder="메모 일괄 입력" value={bulkMemo} onChange={(e) => setBulkMemo(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '150px' }} />
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '2px 8px' }} onClick={handleBulkUpdate} title="Apply Batch Changes"><ListChecks size={16} className="mr-1" /> 일괄 적용</button>
            <span className="text-sm text-blue-600 font-bold ml-2">{selectedIds.length}개 선택됨</span>
        </div>
      )}

      <table style={{ tableLayout: 'fixed', width: '100%', minWidth: '1000px' }}>
        <thead>
          <tr>
            <th style={{ width: '25px' }}>{isAdmin && <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? paginatedTransactions.map(t => t.id!) : [])} />}</th>
            <th style={{ width: '75px', cursor: 'pointer' }} onClick={() => requestSort('date')}>날짜</th>
            <th style={{ width: '40px', cursor: 'pointer' }} onClick={() => requestSort('time')}>시간</th>
            <th style={{ width: '50px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => requestSort('member')}>효/굥</th>
            <th style={{ width: '45px', cursor: 'pointer' }} onClick={() => requestSort('type')}>타입</th>
            <th style={{ width: '70px', cursor: 'pointer' }} onClick={() => requestSort('group')}>상위 그룹</th>
            <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => requestSort('category')}>대분류</th>
            <th style={{ width: '70px', cursor: 'pointer' }} onClick={() => requestSort('subcategory')}>소분류</th>
            <th style={{ width: '110px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('vendor')}>내용</th>
            <th style={{ width: '85px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('amount')}>금액</th>
            <th style={{ width: '120px', cursor: 'pointer' }} onClick={() => requestSort('source')}>결제수단</th>
            <th>메모</th>
            <th style={{ width: '100px', textAlign: 'center' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((tx) => (
            <tr key={tx.id!}>
              <td>{isAdmin && <input type="checkbox" checked={selectedIds.includes(tx.id!)} onChange={() => toggleSelect(tx.id!)} />}</td>
              {editingId === tx.id! ? (
                <>
                  <td><input type="date" value={editValues.date || ''} onChange={e => setEditValues({...editValues, date: e.target.value})} style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} disabled /></td>
                  <td><input type="time" value={editValues.time || ''} onChange={e => setEditValues({...editValues, time: e.target.value})} style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} disabled /></td>
                  <td><select value={editValues.member || '미지정'} onChange={e => setEditValues({...editValues, member: e.target.value})} style={{ width: '100%' }}><option value="효">효</option><option value="굥">굥</option><option value="미지정">미지정</option></select></td>
                  <td><select value={editValues.type || 'expense'} onChange={e => setEditValues({...editValues, type: e.target.value as any})} style={{ width: '100%' }}><option value="expense">지출</option><option value="income">수입</option><option value="exclude">미반영</option></select></td>
                  <td>{getGroupName(editValues.category || '', categories)}</td>
                  <td><select value={editValues.category || ''} onChange={e => setEditValues({...editValues, category: e.target.value})} style={{ width: '100%' }}>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></td>
                  <td><input type="text" value={editValues.subcategory || ''} onChange={e => setEditValues({...editValues, subcategory: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={editValues.vendor || ''} onChange={e => setEditValues({...editValues, vendor: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={editValues.amount || 0} onChange={e => setEditValues({...editValues, amount: parseFloat(e.target.value)})} style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} disabled /></td>
                  <td><input type="text" value={editValues.source || ''} onChange={e => setEditValues({...editValues, source: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={editValues.memo || ''} onChange={e => setEditValues({...editValues, memo: e.target.value})} style={{ width: '100%' }} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-icon" onClick={() => saveEdit(tx.id!)}><Check size={16} /></button>
                    <button className="btn-icon" onClick={() => setEditingId(null)}><X size={16} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td title={tx.date}>{tx.date}</td>
                  <td title={tx.time}>{tx.time}</td>
                  <td>{tx.member}</td>
                  <td>{tx.type === 'expense' ? '지출' : tx.type === 'income' ? '수입' : '미반영'}</td>
                  <td title={getGroupName(tx.category, categories)}><div style={cellEllipsisStyle}>{getGroupName(tx.category, categories)}</div></td>
                  <td title={tx.category}><div style={cellEllipsisStyle}>{tx.category}</div></td>
                  <td title={tx.subcategory}><div style={cellEllipsisStyle}>{tx.subcategory}</div></td>
                  <td title={tx.vendor}><div style={cellEllipsisStyle}>{tx.vendor}</div></td>
                  <td style={{ textAlign: 'right' }}>{tx.amount.toLocaleString()}</td>
                  <td title={tx.source}><div style={cellEllipsisStyle}>{tx.source}</div></td>
                  <td title={tx.memo}><div style={cellEllipsisStyle}>{tx.memo}</div></td>
                  <td style={{ textAlign: 'center' }}>
                    {isAdmin ? (
                      <div className="flex gap-1 justify-center">
                        {!tx.isVerified && !tx.isInvalid && (
                          <button onClick={() => handleSingleVerify(tx.id!)} className="btn-icon" title="승인">
                            <ThumbsUp size={16} color="green" />
                          </button>
                        )}
                        <button onClick={() => openReviewPanel(tx)} className="btn-icon" title="확인요청" style={{ position: 'relative' }}>
                          <MessageCircle size={16} color={getReviewColor(tx)} />
                          {(tx.reviewCount || 0) > 0 && (
                            <span style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              minWidth: '14px',
                              height: '14px',
                              padding: '0 3px',
                              borderRadius: '999px',
                              background: (tx.openReviewCount || 0) > 0 ? '#dc2626' : '#2563eb',
                              color: '#fff',
                              fontSize: '10px',
                              lineHeight: '14px',
                              textAlign: 'center',
                            }}>
                              {(tx.openReviewCount || 0) > 0 ? tx.openReviewCount : tx.reviewCount}
                            </span>
                          )}
                        </button>
                        <button onClick={() => startEdit(tx)} className="btn-icon" title="수정"><Edit2 size={16} /></button>
                        <button
                          onClick={() => {
                            if (window.confirm(`이 항목을 삭제하시겠습니까?\n${tx.date} ${tx.time || ''} ${tx.vendor} ${tx.amount.toLocaleString()}원`)) {
                              onDelete(tx.id!);
                            }
                          }}
                          className="btn-icon"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => openReviewPanel(tx)} className="btn-icon" title="확인요청" style={{ position: 'relative' }}>
                        <MessageCircle size={16} color={getReviewColor(tx)} />
                        {(tx.reviewCount || 0) > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            minWidth: '14px',
                            height: '14px',
                            padding: '0 3px',
                            borderRadius: '999px',
                            background: (tx.openReviewCount || 0) > 0 ? '#dc2626' : '#2563eb',
                            color: '#fff',
                            fontSize: '10px',
                            lineHeight: '14px',
                            textAlign: 'center',
                          }}>
                            {(tx.openReviewCount || 0) > 0 ? tx.openReviewCount : tx.reviewCount}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination mt-2 flex justify-center gap-2">
        <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>이전</button>
        {renderPagination()}
        <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>다음</button>
      </div>

      {reviewTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{ width: 'min(680px, 100%)', maxHeight: '85vh', overflow: 'auto', background: '#fff', borderRadius: '8px', padding: '18px', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.25)' }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>확인요청</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  {reviewTarget.date} {reviewTarget.vendor} {reviewTarget.amount.toLocaleString()}원
                </p>
              </div>
              <button className="btn-icon" onClick={() => setReviewTarget(null)} title="닫기"><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '6px', marginBottom: '12px' }}>
              <div className="flex gap-2">
                <select value={reviewType} onChange={(e) => setReviewType(e.target.value as any)} className="edit-input" style={{ width: '120px' }}>
                  <option value="question">확인요청</option>
                  <option value="change_request">수정요청</option>
                </select>
                <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} className="edit-input" placeholder="제목" style={{ flex: 1 }} />
              </div>
              <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} className="edit-input" placeholder="내용을 입력하세요" rows={3} style={{ width: '100%', resize: 'vertical' }} />
              <div className="flex justify-end">
                <button className="btn btn-primary" onClick={handleCreateReview} disabled={!reviewTitle.trim() || !reviewBody.trim()}>등록</button>
              </div>
            </div>

            {reviewLoading ? (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>불러오는 중...</div>
            ) : reviewRequests.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '14px 0' }}>아직 확인요청이 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
                {reviewRequests.map((request) => (
                  <div key={request.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', background: request.status === 'open' ? '#fff7ed' : '#f8fafc' }}>
                    <div className="flex justify-between gap-2">
                      <div>
                        <div style={{ fontWeight: 700 }}>{request.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {request.type === 'change_request' ? '수정요청' : '확인요청'} · {request.status === 'open' ? '미확인' : '완료'} · {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => handleToggleReviewStatus(request)}>
                          {request.status === 'open' ? '완료' : '다시 열기'}
                        </button>
                        {isAdmin && (
                          <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }} onClick={() => handleDeleteReview(request)}>삭제</button>
                        )}
                      </div>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', marginTop: '8px', fontSize: '0.9rem' }}>{request.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
