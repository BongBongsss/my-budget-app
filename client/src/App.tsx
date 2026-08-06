import { useState, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import api from './api';
import { getTransactions, getCategories, getAssets, Transaction, CategoryItem, Asset, importFile, exportTransactionsBackup, deleteTransaction, bulkDeleteTransactions, updateTransaction, bulkUpdateTransactions, verifyTransactions, restoreAuditLogs } from './api';
import SuggestionNotification from './components/SuggestionNotification';
import ErrorBoundary from './components/ErrorBoundary';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import SettingsModal from './components/SettingsModal';
import AssetManager from './components/AssetManager';
import EntryModal from './components/EntryModal';
import AuditLogView from './components/AuditLogView';
import NoticeCenter from './components/NoticeCenter';
import Login from './components/Login';
import { getGroupName } from './utils/categoryUtils';
import './index.css';
import { Settings, Upload, Download, LogOut, BarChart3, Wallet, History, Undo2, X, Plus, Menu } from 'lucide-react';

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

type UndoAction = { label: string; auditLogIds: string[] };
type FloatingButtonPosition = { left: number; top: number };
type FloatingButtonDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  originLeft: number;
  originTop: number;
  width: number;
  height: number;
  isDragging: boolean;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'duplicate' | 'invalid'>('all');
  const [currentView, setCurrentView] = useState<'budget' | 'assets' | 'logs'>('budget');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('viewer');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [entryButtonPosition, setEntryButtonPosition] = useState<FloatingButtonPosition | null>(() => {
    try {
      const savedPosition = window.localStorage.getItem('mobile-entry-button-position');
      if (!savedPosition) return null;
      const parsed = JSON.parse(savedPosition);
      return Number.isFinite(parsed?.left) && Number.isFinite(parsed?.top) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [isEntryButtonDragging, setIsEntryButtonDragging] = useState(false);

  
  const [lastUndoAction, setLastUndoAction] = useState<UndoAction | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyingRef = useRef(false);
  const entryButtonHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryButtonDragRef = useRef<FloatingButtonDrag | null>(null);
  const suppressEntryButtonClickRef = useRef(false);

  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [memberFilter, setMemberFilter] = useState<'all' | '효' | '굥' | '미지정'>('all');
  const [chartFilter, setChartFilter] = useState<{type: 'income' | 'expense', group: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearEntryButtonHoldTimer = () => {
    if (entryButtonHoldTimerRef.current) {
      clearTimeout(entryButtonHoldTimerRef.current);
      entryButtonHoldTimerRef.current = null;
    }
  };

  useEffect(() => () => clearEntryButtonHoldTimer(), []);

  useEffect(() => {
    try {
      if (entryButtonPosition) {
        window.localStorage.setItem('mobile-entry-button-position', JSON.stringify(entryButtonPosition));
      }
    } catch {
      // 위치 저장을 지원하지 않는 환경에서는 현재 화면 내 위치만 사용한다.
    }
  }, [entryButtonPosition]);

  const clampEntryButtonPosition = (left: number, top: number, width = 52, height = 52): FloatingButtonPosition => ({
    left: Math.min(Math.max(8, left), Math.max(8, window.innerWidth - width - 8)),
    top: Math.min(Math.max(8, top), Math.max(8, window.innerHeight - height - 8)),
  });

  const handleEntryButtonPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    button.setPointerCapture(event.pointerId);
    entryButtonDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      width: rect.width,
      height: rect.height,
      isDragging: false,
    };
    clearEntryButtonHoldTimer();
    entryButtonHoldTimerRef.current = setTimeout(() => {
      const drag = entryButtonDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.isDragging = true;
      suppressEntryButtonClickRef.current = true;
      setIsEntryButtonDragging(true);
    }, 350);
  };

  const handleEntryButtonPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = entryButtonDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const movedDistance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.isDragging) {
      if (movedDistance > 8) clearEntryButtonHoldTimer();
      return;
    }

    event.preventDefault();
    setEntryButtonPosition(clampEntryButtonPosition(
      drag.originLeft + event.clientX - drag.startX,
      drag.originTop + event.clientY - drag.startY,
      drag.width,
      drag.height,
    ));
  };

  const finishEntryButtonDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = entryButtonDragRef.current;
    clearEntryButtonHoldTimer();
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.isDragging) {
      setIsEntryButtonDragging(false);
      window.setTimeout(() => { suppressEntryButtonClickRef.current = false; }, 0);
    }
    entryButtonDragRef.current = null;
  };

  const entryButtonStyle: CSSProperties | undefined = entryButtonPosition
    ? { left: `${entryButtonPosition.left}px`, top: `${entryButtonPosition.top}px`, right: 'auto', bottom: 'auto' }
    : undefined;

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
    const result = await deleteTransaction(id);
    showUndoMessage({
      label: '거래 1건을 삭제했습니다.',
      auditLogIds: result.data.auditLogIds,
    });
    fetchData();
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (userRole !== 'admin') return;
    const itemsToDelete = transactions.filter(t => ids.includes(t.id!));
    if (itemsToDelete.length === 0) return;
    if (!window.confirm(`${ids.length}개의 항목을 삭제하시겠습니까?`)) return;
    const result = await bulkDeleteTransactions(ids);
    showUndoMessage({
      label: `거래 ${itemsToDelete.length}건을 삭제했습니다.`,
      auditLogIds: result.data.auditLogIds,
    });
    fetchData();
  };

  const handleUpdate = async (id: string, updates: Partial<Transaction>) => {
    if (userRole !== 'admin') return;
    try {
      const result = await updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      showUndoMessage({
        label: '거래를 수정했습니다.',
        auditLogIds: result.data.auditLogIds,
      });
    } catch (err) {
      fetchData();
    }
  };

  const handleBulkUpdate = async (ids: string[], updates: Partial<Transaction>) => {
    if (userRole !== 'admin' || ids.length === 0) return;
    const before = transactions.filter((transaction) => transaction.id && ids.includes(transaction.id));
    if (before.length === 0) return;

    try {
      const result = await bulkUpdateTransactions(ids, updates);
      if (result.data.count !== ids.length) {
        alert(`일괄 수정이 일부만 적용되었습니다. 요청 ${ids.length}건 중 ${result.data.count}건 처리됨.`);
      }
      setTransactions((current) => current.map((transaction) => (
        transaction.id && ids.includes(transaction.id) ? { ...transaction, ...updates } : transaction
      )));
      showUndoMessage({
        label: `거래 ${before.length}건을 수정했습니다.`,
        auditLogIds: result.data.auditLogIds,
      });
      await fetchData();
    } catch (err) {
      console.error('Bulk update failed:', err);
      alert('일괄 수정 중 오류가 발생했습니다.');
      await fetchData();
    }
  };

  const handleBulkUpdateMember = async (ids: string[], member: string) => {
    if (userRole !== 'admin') return;
    if (ids.length === 0) return;
    const before = transactions.filter((transaction) => transaction.id && ids.includes(transaction.id));
    if (before.length === 0) return;
    try {
      const res = await bulkUpdateTransactions(ids, { member });
      if (res.data.count !== ids.length) {
        alert(`멤버 변경이 일부만 적용되었습니다. 요청 ${ids.length}건 중 ${res.data.count}건 처리됨`);
      }
      setTransactions(prev => prev.map(t => ids.includes(t.id!) ? { ...t, member } : t));
      showUndoMessage({
        label: `거래 ${before.length}건을 수정했습니다.`,
        auditLogIds: res.data.auditLogIds,
      });
      await fetchData();
    } catch (err) {
      console.error('Bulk member update failed:', err);
      alert('멤버 일괄 변경 중 오류가 발생했습니다.');
      await fetchData();
    }
  };

  const handleUndo = async () => {
    if (userRole !== 'admin' || !lastUndoAction) return;
    try {
      await restoreAuditLogs(lastUndoAction.auditLogIds);
      setShowUndo(false);
      setLastUndoAction(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      await fetchData();
    } catch (err) {
      alert('복구에 실패했습니다.');
    }
  };

  const showUndoMessage = (action: UndoAction) => {
    setLastUndoAction(action);
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false);
      setLastUndoAction(null);
    }, 30000);
  };

  const dismissUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    setLastUndoAction(null);
  };

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

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
      alert(err.response?.data?.message || 'Import failed. Please check the file and try again.');
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
    if (userRole !== 'admin' || verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    try {
      await verifyTransactions(ids);
      await fetchData();
      setActiveTab('all');
    } catch (err) {
      alert('승인 중 오류가 발생했습니다.');
    } finally {
      verifyingRef.current = false;
      setIsVerifying(false);
    }
  };

  const handleChartHighlight = (filter: { type: 'income' | 'expense'; group: string } | null) => {
    setChartFilter(filter);
    if (filter) setActiveTab('all');
  };

  const closeTransactionForm = () => setIsTransactionFormOpen(false);
  const closeAssetForm = () => setIsAssetFormOpen(false);

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
        <button
          type="button"
          className="mobile-header-menu-toggle"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={21} />
          {unreadNoticeCount > 0 && (
            <span className="mobile-header-menu-badge" aria-label={`읽지 않은 공지 ${unreadNoticeCount}개`}>
              {unreadNoticeCount > 9 ? '9+' : unreadNoticeCount}
            </span>
          )}
        </button>
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
        <div className={`header-actions ${isMobileMenuOpen ? 'is-mobile-open' : ''}`}>
          <NoticeCenter isAdmin={userRole === 'admin'} onUnreadCountChange={setUnreadNoticeCount} />

          {/* Admin 전용 버튼: Import */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => {
              setIsMobileMenuOpen(false);
              fileInputRef.current?.click();
            }}>
                <Upload size={16} /> Import
            </button>
          )}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => {
              setIsMobileMenuOpen(false);
              handleExportBackup();
            }}>
                <Download size={16} /> Export
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv,.xlsx" />
          
          {/* Admin 전용 버튼: Settings */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSettingsModalOpen(true);
            }}>
                <Settings size={16} /> Settings
            </button>
          )}
          
          <button className="btn btn-danger header-action-btn" onClick={() => {
            setIsMobileMenuOpen(false);
            handleLogout();
          }}>
            LogOut
          </button>
        </div>
      </header>

      {currentView === 'budget' ? (
        <div className="view-budget animate-fadeIn">
          <div className="view-action-bar">
            <h2>가계부 관리</h2>
            {userRole === 'admin' && <button type="button" className="btn btn-primary desktop-entry-button" onClick={() => setIsTransactionFormOpen(true)}>
              <Plus size={18} /> 거래 입력
            </button>}
          </div>
          <Summary 
            transactions={allVerifiedForPeriod} 
            period={period} setPeriod={setPeriod} 
            year={year} setYear={setYear} 
            month={month} setMonth={setMonth} 
            memberFilter={memberFilter} setMemberFilter={setMemberFilter}
          />
          <SuggestionNotification onRuleApproved={fetchData} />
          <ErrorBoundary title="차트를 불러오지 못했습니다.">
            <SummaryCharts transactions={allVerifiedForPeriod} categories={categories} period={period} onHighlight={handleChartHighlight} />
          </ErrorBoundary>
          
          {userRole === 'admin' && isTransactionFormOpen && (
            <EntryModal title="거래 입력" onClose={closeTransactionForm}>
              <TransactionForm onSuccess={() => { closeTransactionForm(); fetchData(); }} onCancel={closeTransactionForm} categories={categories} compact />
            </EntryModal>
          )}
          
          <div className="tabs transaction-tabs" style={{ marginBottom: 0, display: 'flex', alignItems: 'center' }}>
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

          <ErrorBoundary title="거래 목록을 불러오지 못했습니다.">
            <TransactionList
              transactions={filteredTransactions}
              categories={categories}
              onDelete={handleDelete}
              onBulkDelete={handleBulkDelete}
              onUpdate={handleUpdate}
              onBulkUpdate={handleBulkUpdate}
              onBulkUpdateMember={handleBulkUpdateMember}
              onVerify={handleVerify}
              isVerifying={isVerifying}
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
          </ErrorBoundary>
        </div>
      ) : currentView === 'assets' ? (
        <div className="view-assets animate-fadeIn">
          <div className="view-action-bar">
            <h2>자산 관리</h2>
            {userRole === 'admin' && <button type="button" className="btn btn-primary desktop-entry-button" onClick={() => setIsAssetFormOpen(true)}>
              <Plus size={18} /> 자산 등록
            </button>}
          </div>
          <ErrorBoundary title="자산 관리를 불러오지 못했습니다.">
            <AssetManager userRole={userRole} isAddOpen={isAssetFormOpen} onCloseAdd={closeAssetForm} />
          </ErrorBoundary>
        </div>
      ) : (
          <ErrorBoundary title="활동 로그를 불러오지 못했습니다.">
            <AuditLogView isAdmin={userRole === 'admin'} onRestored={fetchData} />
          </ErrorBoundary>
      )}

      {userRole === 'admin' && currentView !== 'logs' && (
        <button
          type="button"
          className="mobile-entry-fab"
          style={entryButtonStyle}
          onPointerDown={handleEntryButtonPointerDown}
          onPointerMove={handleEntryButtonPointerMove}
          onPointerUp={finishEntryButtonDrag}
          onPointerCancel={finishEntryButtonDrag}
          onClick={() => {
            if (suppressEntryButtonClickRef.current) return;
            currentView === 'budget' ? setIsTransactionFormOpen(true) : setIsAssetFormOpen(true);
          }}
          data-dragging={isEntryButtonDragging}
          aria-label={currentView === 'budget' ? '거래 입력' : '자산 등록'}
          title={currentView === 'budget' ? '거래 입력' : '자산 등록'}
        >
          <Plus size={24} />
          <span>{currentView === 'budget' ? '거래 입력' : '자산 등록'}</span>
        </button>
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

      {showUndo && userRole === 'admin' && lastUndoAction && (
        <div className="undo-toast">
          <span>{lastUndoAction.label}</span>
          <button onClick={handleUndo} className="undo-btn"><Undo2 size={15} /> 직전 작업 일괄 되돌리기</button>
          <button onClick={dismissUndo} className="undo-close" aria-label="되돌리기 알림 닫기" title="닫기"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

export default App;
