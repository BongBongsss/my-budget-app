import React, { useState } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Trash2, Check, X, Edit2, Search, RefreshCw, ListChecks, ThumbsUp } from 'lucide-react';
import { getGroupName } from '../utils/categoryUtils';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onBulkUpdateMember?: (ids: string[], member: string) => void;
  onRefresh: () => void;
  period: 'all' | 'month' | 'year';
  setPeriod: (p: 'all' | 'month' | 'year') => void;
  year: number;
  setYear: (y: number) => void;
  month: number;
  setMonth: (m: number) => void;
  memberFilter: 'all' | '효' | '굥';
  setMemberFilter: (m: 'all' | '효' | '굥') => void;
  isAdmin?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions = [], categories = [], onDelete, onBulkDelete, onUpdate, onBulkUpdateMember, onRefresh,
  period, setPeriod, year, setYear, month, setMonth, 
  memberFilter, setMemberFilter, isAdmin = true
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'date' | 'type' | 'group' | 'category' | 'subcategory' | 'vendor' | 'source' | 'memo'>('group');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkType, setBulkType] = useState<'expense' | 'income' | ''>('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkMemo, setBulkMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uniqueValues = {
    types: Array.from(new Set(transactions.map(t => t.type === 'expense' ? '지출' : t.type === 'income' ? '수입' : '미반영'))),
    groups: Array.from(new Set(transactions.map(t => getGroupName(t.category, categories)))).sort(),
    categories: Array.from(new Set(transactions.map(t => t.category))).sort(),
    subcategories: Array.from(new Set(transactions.map(t => t.subcategory || '').filter(Boolean))).sort(),
    sources: Array.from(new Set(transactions.map(t => t.source || '').filter(Boolean))).sort(),
  };

  const handleBulkUpdate = async () => {
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

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id!);
    setEditValues(tx);
  };

  const saveEdit = async (id: string) => {
    await onUpdate(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const handleSingleVerify = async (id: string) => {
    await onUpdate(id, { isVerified: true });
    onRefresh();
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

          {(searchQuery || startDate || endDate || search) && (
            <div className="flex gap-4" style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '5px' }}>
              <span style={{ color: '#2563eb', marginRight: '15px' }}>합계 수입: {filteredIncome.toLocaleString()}원</span>
              <span style={{ color: '#dc2626' }}>합계 지출: {filteredExpense.toLocaleString()}원</span>
            </div>
          )}

          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="edit-input" style={{ fontSize: '0.8rem', padding: '1px 3px', width: 'auto' }}>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
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
            <th style={{ width: '25px' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? paginatedTransactions.map(t => t.id!) : [])} /></th>
            <th style={{ width: '75px', cursor: 'pointer' }} onClick={() => requestSort('date')}>날짜</th>
            <th style={{ width: '40px', cursor: 'pointer' }} onClick={() => requestSort('time')}>시간</th>
            <th style={{ width: '35px', cursor: 'pointer' }} onClick={() => requestSort('member')}>효/굥</th>
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
              <td><input type="checkbox" checked={selectedIds.includes(tx.id!)} onChange={() => toggleSelect(tx.id!)} /></td>
              {editingId === tx.id! ? (
                <>
                  <td><input type="date" value={editValues.date || ''} onChange={e => setEditValues({...editValues, date: e.target.value})} style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} disabled /></td>
                  <td><input type="time" value={editValues.time || ''} onChange={e => setEditValues({...editValues, time: e.target.value})} style={{ width: '100%', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }} disabled /></td>
                  <td><select value={editValues.member || '효'} onChange={e => setEditValues({...editValues, member: e.target.value})} style={{ width: '100%' }}><option value="효">효</option><option value="굥">굥</option></select></td>
                  <td><select value={editValues.type || 'expense'} onChange={e => setEditValues({...editValues, type: e.target.value as any})} style={{ width: '100%' }}><option value="expense">지출</option><option value="income">수입</option></select></td>
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
                    <div className="flex gap-1 justify-center">
                      {!tx.isVerified && (
                        <button onClick={() => handleSingleVerify(tx.id!)} className="btn-icon" title="승인">
                          <ThumbsUp size={16} color="green" />
                        </button>
                      )}
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
    </div>
  );
};

export default TransactionList;
