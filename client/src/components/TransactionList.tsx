import React, { useState } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Trash2, Check, X, Edit2, Search, RefreshCw, ListChecks, ThumbsUp } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onRefresh: () => void;
  period: 'all' | 'month' | 'year';
  setPeriod: (p: 'all' | 'month' | 'year') => void;
  year: number;
  setYear: (y: number) => void;
  month: number;
  setMonth: (m: number) => void;
  isAdmin?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions = [], categories = [], onDelete, onBulkDelete, onUpdate, onRefresh,
  period, setPeriod, year, setYear, month, setMonth, isAdmin = true
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

  const categoryToGroupMap: Record<string, string> = {};
  categories.forEach(cat => {
    categoryToGroupMap[cat.name] = cat.groupName || '미분류';
  });

  const getGroupName = (categoryName: string) => categoryToGroupMap[categoryName] || '미분류';

  const uniqueValues = {
    types: Array.from(new Set(transactions.map(t => t.type === 'expense' ? '지출' : t.type === 'income' ? '수입' : '미반영'))),
    groups: Array.from(new Set(transactions.map(t => getGroupName(t.category)))).sort(),
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
    if (filterType === 'group') return getGroupName(tx.category) === searchQuery;
    if (filterType === 'subcategory') return (tx.subcategory || '') === searchQuery;
    if (filterType === 'source') return (tx.source || '') === searchQuery;
    
    return false;
  });

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
    
    let aVal: any = key === 'group' ? getGroupName(a.category) : (a as any)[key];
    let bVal: any = key === 'group' ? getGroupName(b.category) : (b as any)[key];
    
    if (key === 'type') {
      aVal = a.type === 'expense' ? '지출' : a.type === 'income' ? '수입' : '미반영';
      bVal = b.type === 'expense' ? '지출' : b.type === 'income' ? '수입' : '미반영';
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.filter(tx => tx.id).slice(
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

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="transaction-list">
      {/* Search & Actions */}
      <div className="flex justify-start items-center gap-2 mb-4">
        {/* ... (기존 검색 필터 로직) ... */}
      </div>

      <table style={{ tableLayout: 'fixed', width: '100%', minWidth: '1100px' }}>
        <thead>
          <tr>
            <th style={{ width: '30px' }}><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? paginatedTransactions.map(t => t.id!) : [])} /></th>
            <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => requestSort('date')}>날짜</th>
            <th style={{ width: '50px', cursor: 'pointer' }} onClick={() => requestSort('time')}>시간</th>
            <th style={{ width: '60px', cursor: 'pointer' }} onClick={() => requestSort('type')}>타입</th>
            <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => requestSort('group')}>상위 그룹</th>
            <th style={{ width: '90px', cursor: 'pointer' }} onClick={() => requestSort('category')}>대분류</th>
            <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => requestSort('subcategory')}>소분류</th>
            <th style={{ width: '120px', textAlign: 'left', cursor: 'pointer' }} onClick={() => requestSort('vendor')}>내용</th>
            <th style={{ width: '80px', textAlign: 'center', cursor: 'pointer' }} onClick={() => requestSort('amount')}>금액</th>
            <th style={{ width: '100px', cursor: 'pointer' }} onClick={() => requestSort('source')}>결제수단</th>
            <th>메모</th>
            <th style={{ width: '120px', textAlign: 'center' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((tx) => (
            <tr key={tx.id!}>
              <td><input type="checkbox" checked={selectedIds.includes(tx.id!)} onChange={() => toggleSelect(tx.id!)} /></td>
              {editingId === tx.id! ? (
                <>
                  <td><input type="date" value={editValues.date || ''} onChange={e => setEditValues({...editValues, date: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="time" value={editValues.time || ''} onChange={e => setEditValues({...editValues, time: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><select value={editValues.type || 'expense'} onChange={e => setEditValues({...editValues, type: e.target.value as any})} style={{ width: '100%' }}><option value="expense">지출</option><option value="income">수입</option></select></td>
                  <td>{getGroupName(editValues.category || '')}</td>
                  <td><select value={editValues.category || ''} onChange={e => setEditValues({...editValues, category: e.target.value})} style={{ width: '100%' }}>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></td>
                  <td><input type="text" value={editValues.subcategory || ''} onChange={e => setEditValues({...editValues, subcategory: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="text" value={editValues.vendor || ''} onChange={e => setEditValues({...editValues, vendor: e.target.value})} style={{ width: '100%' }} /></td>
                  <td><input type="number" value={editValues.amount || 0} onChange={e => setEditValues({...editValues, amount: parseFloat(e.target.value)})} style={{ width: '100%' }} /></td>
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
                  <td>{tx.type === 'expense' ? '지출' : tx.type === 'income' ? '수입' : '미반영'}</td>
                  <td>{getGroupName(tx.category)}</td>
                  <td>{tx.category}</td>
                  <td>{tx.subcategory}</td>
                  <td>{tx.vendor}</td>
                  <td style={{ textAlign: 'right' }}>{tx.amount.toLocaleString()}</td>
                  <td>{tx.source}</td>
                  <td>{tx.memo}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex gap-1 justify-center">
                      {!tx.isVerified && (
                          <button onClick={() => handleSingleVerify(tx.id!)} className="btn-icon" title="승인">
                            <ThumbsUp size={16} color="green" />
                          </button>
                        )}

                      <button onClick={() => startEdit(tx)} className="btn-icon" title="수정"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(tx.id!)} className="btn-icon" title="삭제"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
