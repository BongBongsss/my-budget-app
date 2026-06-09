import { useState, useEffect, useRef } from 'react';
import api from './api';
import { getTransactions, getCategories, getAssets, Transaction, CategoryItem, Asset, importFile, exportTransactionsBackup, bulkAddTransactions, deleteTransaction, bulkDeleteTransactions, updateTransaction, bulkUpdateTransactions, verifyTransactions } from './api';
import SuggestionNotification from './components/SuggestionNotification';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import SettingsModal from './components/SettingsModal';
import AssetManager from './components/AssetManager';
import AuditLogView from './components/AuditLogView';
import NoticeCenter from './components/NoticeCenter';
import Login from './components/Login';
import { getGroupName } from './utils/categoryUtils';
import './index.css';
import { Settings, Upload, Download, LogOut, BarChart3, Wallet, History } from 'lucide-react';

type ImportSummary = {
  total: number;
  newCount: number;
  duplicateCount: number;
  invalidCount: number;
  replaced?: {
    total: number;
    newCount: number;
    duplicateCount: number;
    invalidCount: number;
  };
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'duplicate' | 'invalid'>('all');
  const [currentView, setCurrentView] = useState<'budget' | 'assets' | 'logs'>('budget');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('viewer');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  
  const [lastDeleted, setLastDeleted] = useState<Transaction[] | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [memberFilter, setMemberFilter] = useState<'all' | '효' | '굥' | '미지정'>('all');
  const [chartFilter, setChartFilter] = useState<{type: 'income' | 'expense', group: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      // 1. 인증 상태 및 역할 확인
      const authRes = await api.get('/auth-status');
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
    await api.post('/logout');
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

  const handleBulkUpdateMember = async (ids: string[], member: string) => {
    if (userRole !== 'admin') return;
    try {
      await bulkUpdateTransactions(ids, { member });
      setTransactions(prev => prev.map(t => ids.includes(t.id!) ? { ...t, member } : t));
      await fetchData();
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
      setTransactions(res.data.transactions);
      await fetchData();
      setActiveTab('new');
      setImportSummary(res.data.summary);
    } catch (err: any) {
      alert('Error importing file');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportBackup = async () => {
    if (userRole !== 'admin') return;
    try {
      const res = await exportTransactionsBackup();
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || `transactions-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleVerify = async (ids: string[]) => {
    if (userRole !== 'admin') return;
    try {
      await verifyTransactions(ids);
      await fetchData();
      setActiveTab('all');
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

  const allVerifiedForPeriod = filteredByPeriod.filter(t => {
    const isVerified = t.isVerified !== false;
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;
    return isVerified && matchesMember;
  });

  const unverifiedTransactions = filteredByPeriod.filter(t => {
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;
    return t.isVerified === false && matchesMember;
  });
  const newCount = unverifiedTransactions.filter(t => t.importStatus === 'new' || (!t.importStatus && !t.isDuplicate)).length;
  const duplicateCount = unverifiedTransactions.filter(t => t.importStatus === 'duplicate' || (!t.importStatus && t.isDuplicate)).length;
  const invalidCount = unverifiedTransactions.filter(t => t.importStatus === 'invalid' || t.isInvalid).length;
  const verifiedCount = allVerifiedForPeriod.length;

  const filteredTransactions = filteredByPeriod.filter(t => {
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;
    if (!matchesMember) return false;

    // getGroupName helper for filtering
    // 차트 필터 적용
    if (chartFilter) {
      const groupName = getGroupName(t.category, categories);
      if (t.type !== chartFilter.type || groupName !== chartFilter.group) return false;
    }

    if (activeTab === 'all') return t.isVerified !== false;
    if (activeTab === 'new') return t.isVerified === false && (t.importStatus === 'new' || (!t.importStatus && !t.isDuplicate));
    if (activeTab === 'duplicate') return t.isVerified === false && (t.importStatus === 'duplicate' || (!t.importStatus && t.isDuplicate));
    if (activeTab === 'invalid') return t.isVerified === false && (t.importStatus === 'invalid' || t.isInvalid);
    return true;
  });

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="container">
      <header className="header app-header">
        <h1 className="app-title">Smart Budget Manager</h1>
        <nav className="main-nav app-nav">
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
          <button
            className={`nav-item ${currentView === 'logs' ? 'active' : ''}`}
            onClick={() => setCurrentView('logs')}
          >
            <History size={18} /> 활동 로그
          </button>
        </nav>
        <div className="header-actions">
          <NoticeCenter isAdmin={userRole === 'admin'} />

          {/* Admin 전용 버튼: Import */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> Import
            </button>
          )}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={handleExportBackup}>
                <Download size={16} /> Export
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv,.xlsx,.xls" />
          
          {/* Admin 전용 버튼: Settings */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => setIsSettingsModalOpen(true)}>
                <Settings size={16} /> Settings
            </button>
          )}
          
          <button className="btn btn-danger header-action-btn" onClick={handleLogout}>
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
            memberFilter={memberFilter} setMemberFilter={setMemberFilter}
          />
          <SuggestionNotification onRuleApproved={fetchData} />
          <SummaryCharts transactions={allVerifiedForPeriod} categories={categories} period={period} onHighlight={setChartFilter} />
          
          {userRole === 'admin' && <TransactionForm onSuccess={fetchData} categories={categories} />}
          
          <div className="tabs" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            {/* Force cache refresh: v2 */}
            <button 
              className={activeTab === 'all' ? 'btn btn-primary' : 'btn btn-secondary'} 
              onClick={() => setActiveTab('all')}
              style={{ marginRight: '10px' }}
            >
              전체 ({verifiedCount})
            </button>
            <button 
              className={activeTab === 'new' ? 'btn btn-danger' : 'btn btn-secondary'} 
              onClick={() => setActiveTab('new')}
              style={{ marginRight: '10px' }}
            >
              신규 ({newCount})
            </button>
            <button 
              className={activeTab === 'duplicate' ? 'btn btn-warning' : 'btn btn-secondary'} 
              onClick={() => setActiveTab('duplicate')}
              style={{ marginRight: '10px', backgroundColor: activeTab === 'duplicate' ? '#f59e0b' : '', color: activeTab === 'duplicate' ? 'white' : '' }}
            >
              중복 ({duplicateCount})
            </button>

            <button
              className={activeTab === 'invalid' ? 'btn btn-danger' : 'btn btn-secondary'}
              onClick={() => setActiveTab('invalid')}
              style={{ backgroundColor: activeTab === 'invalid' ? '#7f1d1d' : '', color: activeTab === 'invalid' ? 'white' : '' }}
            >
              무효 ({invalidCount})
            </button>

            {chartFilter && (
                <div style={{ marginLeft: '10px', padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span>차트 필터: <strong>{chartFilter.group}</strong> ({chartFilter.type === 'income' ? '수입' : '지출'})</span>
                    <button onClick={() => setChartFilter(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                </div>
            )}

            {(['new', 'duplicate', 'invalid'].includes(activeTab)) && userRole === 'admin' && filteredTransactions.length > 0 && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                {activeTab !== 'invalid' && (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        if (window.confirm(`표시된 ${filteredTransactions.length}개의 항목을 모두 '효'로 설정하시겠습니까?`)) {
                          handleBulkUpdateMember(filteredTransactions.map(t => t.id!), '효');
                        }
                      }}
                      style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' }}
                    >
                      모두 효
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        if (window.confirm(`표시된 ${filteredTransactions.length}개의 항목을 모두 '굥'으로 설정하시겠습니까?`)) {
                          handleBulkUpdateMember(filteredTransactions.map(t => t.id!), '굥');
                        }
                      }}
                      style={{ backgroundColor: '#db2777', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' }}
                    >
                      모두 굥
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-danger" 
                  style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' }}
                  onClick={() => {
                    if (window.confirm('표시된 모든 내역을 삭제하시겠습니까?')) {
                      handleBulkDelete(filteredTransactions.map(t => t.id!));
                    }
                  }}
                >
                  모두 삭제
                </button>
                {activeTab !== 'invalid' && (
                  <button
                    className="btn btn-primary"
                    style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500' }}
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
            )}
          </div>

          <TransactionList 
            transactions={filteredTransactions} 
            categories={categories}
            onDelete={handleDelete} 
            onBulkDelete={handleBulkDelete}
            onUpdate={handleUpdate}
            onBulkUpdateMember={handleBulkUpdateMember}
            onVerify={handleVerify}
            onRefresh={fetchData}
            period={period}
            setPeriod={setPeriod}
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
            memberFilter={memberFilter}
            setMemberFilter={setMemberFilter}
            isAdmin={userRole === 'admin'}
            pageScope={activeTab}
            externalFilterActive={!!chartFilter}
          />
        </div>
      ) : currentView === 'assets' ? (
        <div className="view-assets animate-fadeIn">
          <AssetManager userRole={userRole} />
        </div>
      ) : (
        <AuditLogView isAdmin={userRole === 'admin'} onRestored={fetchData} />
      )}

      {importSummary && (
        <div className="modal-overlay">
          <div className="import-result-modal">
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Import 완료</h3>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  방금 가져온 파일의 검토 결과입니다.
                </p>
              </div>
            </div>

            {importSummary.replaced && importSummary.replaced.total > 0 && (
              <div className="import-result-note">
                <strong>이전 검토 목록 정리</strong>
                <p>
                  새 파일을 가져오면 검토 중이던 후보를 이전 목록으로 넘기고,
                  방금 가져온 결과만 보여줍니다. 같은 파일을 다시 가져와도 항목이 누적되지 않습니다.
                </p>
                <div className="import-result-grid compact">
                  <div><span>정리됨</span><strong>{importSummary.replaced.total.toLocaleString()}건</strong></div>
                  <div><span>신규</span><strong>{importSummary.replaced.newCount.toLocaleString()}건</strong></div>
                  <div><span>중복</span><strong>{importSummary.replaced.duplicateCount.toLocaleString()}건</strong></div>
                  <div><span>무효</span><strong>{importSummary.replaced.invalidCount.toLocaleString()}건</strong></div>
                </div>
              </div>
            )}

            <div className="import-result-section-title">
              <strong>이번 import 결과</strong>
              <span>아래 건수만 신규/중복/무효 탭에 표시됩니다.</span>
            </div>
            <div className="import-result-grid">
              <div><span>이번 전체</span><strong>{importSummary.total.toLocaleString()}건</strong></div>
              <div><span>이번 신규</span><strong>{importSummary.newCount.toLocaleString()}건</strong></div>
              <div><span>이번 중복</span><strong>{importSummary.duplicateCount.toLocaleString()}건</strong></div>
              <div><span>이번 무효</span><strong>{importSummary.invalidCount.toLocaleString()}건</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button className="btn btn-primary" onClick={() => setImportSummary(null)}>
                확인
              </button>
            </div>
          </div>
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
