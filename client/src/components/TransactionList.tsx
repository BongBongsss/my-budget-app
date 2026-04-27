import React, { useState } from 'react';
import { Transaction, CategoryItem } from '../api';
import { Trash2, Check, X, Edit2, ChevronLeft, ChevronRight, Search, RefreshCw, ListChecks } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryItem[];
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions = [], categories = [], onDelete, onBulkDelete, onUpdate }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Transaction>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'vendor' | 'date' | 'type' | 'category' | 'subcategory' | 'memo' | 'source'>('vendor');
  const [bulkCategory, setBulkCategory] = useState('');

  const handleBulkUpdate = async () => {
    if (!bulkCategory || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await onUpdate(id, { category: bulkCategory });
    }
    setBulkCategory('');
    setSelectedIds([]);
  };

  const filteredTransactions = transactions.filter(tx => {
    // 날짜 기간 검색 처리
    if (filterType === 'date') {
      if (!startDate && !endDate) return true;
      const txDate = tx.date;
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const typeLabel = tx.type === 'expense' ? '지출' : '수입';
    
    if (filterType === 'vendor') return tx.vendor.toLowerCase().includes(q);
    if (filterType === 'type') return typeLabel.includes(q) || tx.type.toLowerCase().includes(q);
    if (filterType === 'category') return tx.category.toLowerCase().includes(q);
    if (filterType === 'subcategory') return (tx.subcategory || '').toLowerCase().includes(q);
    if (filterType === 'memo') return (tx.memo || '').toLowerCase().includes(q);
    if (filterType === 'source') return (tx.source || '').toLowerCase().includes(q);
    return false;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.filter(tx => tx.id).slice(
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

  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="transaction-list">
      <div className="list-actions mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1 items-center">
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }}>
              <option value="date">날짜</option>
              <option value="vendor">내용</option>
              <option value="type">타입</option>
              <option value="category">대분류</option>
              <option value="subcategory">소분류</option>
              <option value="source">결제수단</option>
              <option value="memo">메모</option>
            </select>
            
            {filterType === 'date' ? (
              <div className="flex gap-1 items-center">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }} />
                <span>~</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px' }} />
              </div>
            ) : (
              <input type="text" placeholder="검색어..." value={search} onChange={e => setSearch(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '120px' }} />
            )}
            
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={() => setSearchQuery(search)}><Search size={16} /></button>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={() => { setSearch(''); setSearchQuery(''); setStartDate(''); setEndDate(''); }}><RefreshCw size={16} /></button>
          </div>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="edit-input" style={{ fontSize: '0.8rem', padding: '1px 3px', width: 'auto' }}>
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {searchQuery && (
          <div className="font-bold text-sm text-blue-600">
            Search Total : {filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2 items-center mb-6 p-2 bg-gray-100 rounded">
            <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={() => onBulkDelete(selectedIds)}>
                <Trash2 size={16} />
            </button>
            <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="edit-input" style={{ fontSize: '0.8rem', padding: '2px 5px', width: '120px' }}>
                <option value="">Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '2px 5px' }} onClick={handleBulkUpdate}>
                <ListChecks size={16} />
            </button>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredTransactions.map(t => t.id!) : [])} /></th>
            <th>날짜</th><th>시간</th><th>타입</th><th>대분류</th><th>소분류</th><th>내용</th><th>금액</th><th>화폐</th><th>결제수단</th><th>메모</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((tx) => (
            <tr key={tx.id!}>
              <td><input type="checkbox" checked={selectedIds.includes(tx.id!)} onChange={() => toggleSelect(tx.id!)} /></td>
              {editingId === tx.id! ? (
                <>
                  <td><input type="date" value={editValues.date || ''} onChange={e => setEditValues({...editValues, date: e.target.value})} /></td>
                  <td><input type="time" value={editValues.time || ''} onChange={e => setEditValues({...editValues, time: e.target.value})} /></td>
                  <td><select value={editValues.type || 'expense'} onChange={e => setEditValues({...editValues, type: e.target.value as any})}><option value="expense">지출</option><option value="income">수입</option></select></td>
                  <td><select value={editValues.category || ''} onChange={e => setEditValues({...editValues, category: e.target.value})}>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select></td>
                  <td><input type="text" value={editValues.subcategory || ''} onChange={e => setEditValues({...editValues, subcategory: e.target.value})} /></td>
                  <td><input type="text" value={editValues.vendor || ''} onChange={e => setEditValues({...editValues, vendor: e.target.value})} /></td>
                  <td><input type="number" value={editValues.amount || 0} onChange={e => setEditValues({...editValues, amount: parseFloat(e.target.value)})} /></td>
                  <td><input type="text" value={editValues.currency || 'KRW'} onChange={e => setEditValues({...editValues, currency: e.target.value})} /></td>
                  <td><input type="text" value={editValues.source || ''} onChange={e => setEditValues({...editValues, source: e.target.value})} /></td>
                  <td><input type="text" value={editValues.memo || ''} onChange={e => setEditValues({...editValues, memo: e.target.value})} /></td>
                  <td><button onClick={() => saveEdit(tx.id!)}><Check size={16} /></button><button onClick={() => setEditingId(null)}><X size={16} /></button></td>
                </>
              ) : (
                <>
                  <td>{tx.date}</td><td>{tx.time}</td><td>{tx.type === 'expense' ? '지출' : '수입'}</td><td>{tx.category}</td><td>{tx.subcategory}</td><td>{tx.vendor}</td><td>{tx.amount.toLocaleString()}</td><td>{tx.currency}</td><td>{tx.source}</td><td>{tx.memo}</td>
                  <td><button onClick={() => startEdit(tx)}><Edit2 size={16} /></button><button onClick={() => onDelete(tx.id!)}><Trash2 size={16} /></button></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination mt-4 flex justify-center gap-2">
        <button className="btn btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16}/></button>
        {currentPage > 3 && <button className="btn btn-secondary" onClick={() => setCurrentPage(1)}>1</button>}
        {currentPage > 4 && <span>...</span>}
        {getPaginationNumbers().map(page => (
          <button key={page} className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCurrentPage(page)}>{page}</button>
        ))}
        {currentPage < totalPages - 3 && <span>...</span>}
        {currentPage < totalPages - 2 && <button className="btn btn-secondary" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>}
        <button className="btn btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16}/></button>
      </div>
    </div>
  );
};

export default TransactionList;
