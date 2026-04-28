import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getTransactions, getCategories, Transaction, CategoryItem, importFile, bulkAddTransactions, deleteTransaction, bulkDeleteTransactions, updateTransaction, verifyTransactions } from './api';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import SettingsModal from './components/SettingsModal';
import Login from './components/Login';
import './index.css';
import { Settings, Upload, LogOut } from 'lucide-react';

axios.defaults.withCredentials = true;

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'card' | 'transfer' | 'unclassified'>('card');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 상태 끌어올리기: 필터링 조건
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([getTransactions(), getCategories()]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
      }
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await axios.post('https://my-budget-app-nwm8.onrender.com/api/logout');
    setIsAuthenticated(false);
    setTransactions([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    fetchData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} selected items?`)) return;
    await bulkDeleteTransactions(ids);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: Partial<Transaction>) => {
    try {
      await updateTransaction(id, updates);
      // 서버에서 다시 가져오지 않고, 현재 상태에서 해당 데이터만 수정 (순서 유지)
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) {
      console.error('Update failed', err);
      fetchData(); // 에러 시에만 서버 데이터와 동기화
    }
  };

  const handleRefresh = () => {
    fetchData(); // 수동 새로고침 시 정렬 적용
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await importFile(file);
      await bulkAddTransactions(res.data);
      await fetchData();
      setActiveTab('new'); // 가져오기 성공 후 신규 내역 탭으로 이동
    } catch (err: any) {
      alert('Error importing file');
    }
  };

  const handleVerify = async (ids: string[]) => {
    try {
      await verifyTransactions(ids);
      await fetchData();
      // 신규 내역 탭에서 승인 후, 데이터가 없으면 카드 탭으로 이동
      const remainingNew = transactions.filter(t => t.isVerified === false).length - ids.length;
      if (remainingNew <= 0) setActiveTab('card');
    } catch (err) {
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  // 공통 필터링 로직
  const filteredByPeriod = transactions.filter(t => {
    if (period === 'all') return true;
    if (period === 'month') return t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`);
    if (period === 'year') return t.date.startsWith(`${year}`);
    return true;
  });

  const filteredTransactions = filteredByPeriod.filter(t => {
    const source = (t.source || '').toLowerCase();
    const isCard = source.includes('카드');
    const isTransfer = source.includes('이체');

    if (activeTab === 'new') return t.isVerified === false;
    
    // 일반 탭에서는 승인된(verified) 내역만 보여줌
    if (t.isVerified === false) return false;

    if (activeTab === 'card') return isCard;
    if (activeTab === 'transfer') return isTransfer;
    if (activeTab === 'unclassified') return !isCard && !isTransfer;
    return true;
  });

  if (!isAuthenticated) {
    return <Login onLogin={fetchData} />;
  }

  const unverifiedCount = transactions.filter(t => t.isVerified === false).length;

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Budget Automation</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} style={{ marginRight: '5px' }} /> Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv,.xlsx,.xls" />
          <button className="btn btn-secondary" onClick={() => setIsSettingsModalOpen(true)}>
            <Settings size={18} /> Settings
          </button>
          <button className="btn btn-danger" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
            LogOut
          </button>
        </div>
      </header>

      <Summary 
        transactions={filteredTransactions} 
        period={period} setPeriod={setPeriod} 
        year={year} setYear={setYear} 
        month={month} setMonth={setMonth} 
      />
      <SummaryCharts transactions={filteredTransactions} categories={categories} period={period} />
      <TransactionForm onSuccess={fetchData} categories={categories} />
      
      <div className="tabs" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        {unverifiedCount > 0 && (
          <button 
            className={activeTab === 'new' ? 'btn btn-primary' : 'btn btn-danger'} 
            onClick={() => setActiveTab('new')}
            style={{ marginRight: '10px' }}
          >
            신규 내역 ({unverifiedCount})
          </button>
        )}
        <div style={{ borderLeft: unverifiedCount > 0 ? '2px solid #ddd' : 'none', paddingLeft: unverifiedCount > 0 ? '10px' : '0', display: 'flex' }}>
          <button className={activeTab === 'card' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('card')}>카드결제</button>
          <button className={activeTab === 'transfer' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('transfer')} style={{ marginLeft: '10px' }}>계좌이체</button>
          <button className={activeTab === 'unclassified' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('unclassified')} style={{ marginLeft: '10px' }}>미분류</button>
        </div>
        
        {activeTab === 'new' && filteredTransactions.length > 0 && (
          <button 
            className="btn btn-primary" 
            style={{ marginLeft: 'auto', backgroundColor: '#16a34a' }}
            onClick={() => {
              if (window.confirm('표시된 모든 내역을 승인하시겠습니까?')) {
                handleVerify(filteredTransactions.map(t => t.id!));
              }
            }}
          >
            모두 승인하기
          </button>
        )}
      </div>

      <TransactionList 
        transactions={filteredTransactions} 
        categories={categories}
        onDelete={handleDelete} 
        onBulkDelete={handleBulkDelete}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
        period={period}
        setPeriod={setPeriod}
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        categories={categories}
        onRefresh={fetchData}
      />
    </div>
  );
}

export default App;
