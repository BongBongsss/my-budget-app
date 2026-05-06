import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getTransactions, getCategories, getAssets, Transaction, CategoryItem, Asset, importFile, bulkAddTransactions, deleteTransaction, bulkDeleteTransactions, updateTransaction, verifyTransactions } from './api';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import SettingsModal from './components/SettingsModal';
import AssetManager from './components/AssetManager';
import Login from './components/Login';
import './index.css';
import { Settings, Upload, LogOut, BarChart3, Wallet } from 'lucide-react';

axios.defaults.withCredentials = true;

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'card' | 'transfer' | 'unclassified'>('all');
  const [currentView, setCurrentView] = useState<'budget' | 'assets'>('budget');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('viewer');

  
  const [lastDeleted, setLastDeleted] = useState<Transaction[] | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      // 1. 인증 상태 및 역할 확인
      const authRes = await axios.get('https://my-budget-app-nwm8.onrender.com/api/auth-status');
      setUserRole(authRes.data.role || 'viewer');
      setIsAuthenticated(true);

      // 2. 데이터 조회
      const [txRes, catRes, assetRes] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAssets()
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setAssets(assetRes.data);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
      }
      console.error(err);
    }
  };

  const handleLoginSuccess = (role: 'admin' | 'viewer') => {
    setUserRole(role);
    setIsAuthenticated(true);
    fetchData();
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
    if (userRole !== 'admin') return;
    const itemToDelete = transactions.find(t => t.id === id);
    if (!itemToDelete) return;
    await deleteTransaction(id);
    showUndoMessage([itemToDelete]);
    fetchData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (userRole !== 'admin') return;
    const itemsToDelete = transactions.filter(t => ids.includes(t.id!));
    if (itemsToDelete.length === 0) return;
    if (!window.confirm(`${ids.length}개의 항목을 삭제하시겠습니까?`)) return;
    await bulkDeleteTransactions(ids);
    showUndoMessage(itemsToDelete);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: Partial<Transaction>) => {
    if (userRole !== 'admin') return;
    try {
      await updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) {
      fetchData();
    }
  };

  const handleUndo = async () => {
    if (userRole !== 'admin' || !lastDeleted) return;
    try {
      await bulkAddTransactions(lastDeleted);
      setShowUndo(false);
      setLastDeleted(null);
      fetchData();
    } catch (err) {
      alert('복구에 실패했습니다.');
    }
  };

  const showUndoMessage = (deletedItems: Transaction[]) => {
    setLastDeleted(deletedItems);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false);
      setLastDeleted(null);
    }, 5000);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole !== 'admin') return;
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await importFile(file);
      await bulkAddTransactions(res.data);
      await fetchData();
      setActiveTab('new');
    } catch (err: any) {
      alert('Error importing file');
    }
  };

  const handleVerify = async (ids: string[]) => {
    if (userRole !== 'admin') return;
    try {
      await verifyTransactions(ids);
      await fetchData();
      const remainingNew = transactions.filter(t => t.isVerified === false).length - ids.length;
      if (remainingNew <= 0) setActiveTab('all');
    } catch (err) {
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const filteredByPeriod = transactions.filter(t => {
    if (period === 'all') return true;
    if (period === 'month') return t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`);
    if (period === 'year') return t.date.startsWith(`${year}`);
    return true;
  });

  const allVerifiedForPeriod = filteredByPeriod.filter(t => t.isVerified !== false);

  const filteredTransactions = filteredByPeriod.filter(t => {
    const source = (t.source || '').toLowerCase();
    const isCard = source.includes('카드');
    const isTransfer = source.includes('이체');
    if (activeTab === 'new') return t.isVerified === false;
    if (t.isVerified === false) return false;
    if (activeTab === 'card') return isCard;
    if (activeTab === 'transfer') return isTransfer;
    if (activeTab === 'unclassified') return !isCard && !isTransfer;
    return true;
  });

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const unverifiedCount = transactions.filter(t => t.isVerified === false).length;

  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0 }}>Smart Budget</h1>
          <nav className="main-nav" style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`nav-item ${currentView === 'budget' ? 'active' : ''}`}
              onClick={() => setCurrentView('budget')}
            >
              <BarChart3 size={18} /> 가계부 관리
            </button>
            <button 
              className={`nav-item ${currentView === 'assets' ? 'active' : ''}`}
              onClick={() => setCurrentView('assets')}
            >
              <Wallet size={18} /> 자산 관리
            </button>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Admin 전용 버튼: Import */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} style={{ marginRight: '5px' }} /> Import
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv,.xlsx,.xls" />
          
          {/* Admin 전용 버튼: Settings */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings size={18} /> Settings
            </button>
          )}
          
          <button className="btn btn-danger" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
            LogOut
          </button>
        </div>
      </header>

      {currentView === 'budget' ? (
        <div className="view-budget animate-fadeIn">
          <Summary 
            transactions={allVerifiedForPeriod} 
            period={period} setPeriod={setPeriod} 
            year={year} setYear={setYear} 
            month={month} setMonth={setMonth} 
          />
          <SummaryCharts transactions={allVerifiedForPeriod} categories={categories} period={period} />
          
          {userRole === 'admin' && <TransactionForm onSuccess={fetchData} categories={categories} />}
          
          <div className="tabs" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            {unverifiedCount > 0 && userRole === 'admin' && (
              <button 
                className={activeTab === 'new' ? 'btn btn-primary' : 'btn btn-danger'} 
                onClick={() => setActiveTab('new')}
                style={{ marginRight: '10px' }}
              >
                신규 내역 ({unverifiedCount})
              </button>
            )}
            <div style={{ borderLeft: unverifiedCount > 0 && userRole === 'admin' ? '2px solid #ddd' : 'none', paddingLeft: unverifiedCount > 0 && userRole === 'admin' ? '10px' : '0', display: 'flex' }}>
              <button className={activeTab === 'all' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('all')}>전체</button>
              <button className={activeTab === 'card' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('card')} style={{ marginLeft: '10px' }}>카드결제</button>
              <button className={activeTab === 'transfer' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('transfer')} style={{ marginLeft: '10px' }}>계좌이체</button>
              <button className={activeTab === 'unclassified' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('unclassified')} style={{ marginLeft: '10px' }}>미분류</button>
            </div>
            
            {activeTab === 'new' && userRole === 'admin' && filteredTransactions.length > 0 && (
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
            onRefresh={fetchData}
            period={period}
            setPeriod={setPeriod}
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
            isAdmin={userRole === 'admin'}
          />
        </div>
      ) : (
        <div className="view-assets animate-fadeIn">
          <AssetManager userRole={userRole} />
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        categories={categories}
        onRefresh={fetchData}
      />

      {showUndo && userRole === 'admin' && lastDeleted && (
        <div className="undo-toast">
          <span>{lastDeleted.length}개의 항목이 삭제되었습니다.</span>
          <button onClick={handleUndo} className="undo-btn">삭제 취소</button>
        </div>
      )}
    </div>
  );
}

export default App;
