import { Suspense, lazy, useState, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent } from 'react';
import api from './api';
import { getTransactions, getCategories, getAssets, getChartStatisticsSettings, getRecurringCandidates, getMissingRecurring, MissingRecurringTransaction, Transaction, CategoryItem, Asset, importFile, exportTransactionsBackup, deleteTransaction, bulkDeleteTransactions, updateTransaction, bulkUpdateTransactions, verifyTransactions, restoreAuditLogs } from './api';
import SuggestionNotification from './components/SuggestionNotification';
import ErrorBoundary from './components/ErrorBoundary';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import EntryModal from './components/EntryModal';
import NoticeCenter from './components/NoticeCenter';
import RecurringMissingModal from './components/RecurringMissingModal';
import Login from './components/Login';
import { getGroupName } from './utils/categoryUtils';
import './index.css';
import { Settings, Upload, Download, LogOut, BarChart3, Wallet, History, Undo2, X, Plus, Menu, CalendarClock, CheckCircle2, RefreshCw } from 'lucide-react';

const SettingsModal = lazy(() => import('./components/SettingsModal'));
const AssetManager = lazy(() => import('./components/AssetManager'));
const AuditLogView = lazy(() => import('./components/AuditLogView'));
const RecurringManager = lazy(() => import('./components/RecurringManager'));
const LazyViewFallback = () => <div className="card-form" role="status">화면을 불러오는 중입니다.</div>;

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
type StatisticsExclusions = { income: string[]; expense: string[] };
const RELEASE_NOTES = [
  {
    version: 'v1.2',
    releasedAt: '2026.08',
    summary: '초기 로딩과 개발 환경 안정성 개선',
    changes: [
      '자산 관리·고정비 관리·수정 로그·설정 화면을 필요할 때 불러오도록 개선',
      '첫 화면의 초기 로딩 용량을 줄여 더 빠르게 표시',
      'Vite·Vitest 개발 도구 호환성 및 로컬 작업 파일 관리 정리',
    ],
  },
  {
    version: 'v1.1',
    releasedAt: '2026.08',
    summary: '추이 탐색과 그룹명 수정 편의성 개선',
    changes: [
      '12개월 추이의 월을 선택하면 해당 항목·월 거래만 목록에 표시',
      '모바일·PC에서 선택한 월 행을 강조 표시',
      '상위 그룹명 수정 시 카드 하단에서 저장·취소 가능',
    ],
  },
  {
    version: 'v1.0',
    releasedAt: '2026.08',
    summary: '첫 정식 버전',
    changes: [
      '수입·지출 구성 항목별 최근 12개월 추이 제공',
      '월별 금액과 12개월 합계 대비 비율 표시',
      '선택 항목 기준 수입·지출·잔액 비교 서머리 제공',
    ],
  },
];
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
  const [assetTypesVersion, setAssetTypesVersion] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpdateHistoryOpen, setIsUpdateHistoryOpen] = useState(false);
  const [expandedReleaseVersion, setExpandedReleaseVersion] = useState<string | null>(RELEASE_NOTES[0].version);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);
  const [recurringCandidateCount, setRecurringCandidateCount] = useState(0);
  const [missingRecurringItems, setMissingRecurringItems] = useState<MissingRecurringTransaction[] | null>(null);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'duplicate' | 'invalid'>('all');
  const [currentView, setCurrentView] = useState<'budget' | 'assets' | 'recurring' | 'logs'>('budget');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
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
  const [isEntryButtonExpanded, setIsEntryButtonExpanded] = useState(false);
  const [entryButtonExpandedOffset, setEntryButtonExpandedOffset] = useState(0);
  const [statisticsExclusions, setStatisticsExclusions] = useState<StatisticsExclusions>(() => {
    try { return JSON.parse(window.localStorage.getItem('statistics-exclusions') || '') || { income: [], expense: [] }; }
    catch { return { income: [], expense: [] }; }
  });
  useEffect(() => { getChartStatisticsSettings().then((response) => setStatisticsExclusions(response.data)).catch(() => undefined); }, []);

  
  const [lastUndoAction, setLastUndoAction] = useState<UndoAction | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pullRefreshDistance, setPullRefreshDistance] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyingRef = useRef(false);
  const entryButtonHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryButtonExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entryButtonDragRef = useRef<FloatingButtonDrag | null>(null);
  const entryButtonRef = useRef<HTMLButtonElement>(null);
  const suppressEntryButtonClickRef = useRef(false);
  const hasCompletedInitialAuthCheckRef = useRef(false);
  const initialAuthCheckStartedAtRef = useRef<number | null>(null);
  const pullRefreshStartYRef = useRef<number | null>(null);
  const isPullRefreshTrackingRef = useRef(false);
  const isPullRefreshInFlightRef = useRef(false);

  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [memberFilter, setMemberFilter] = useState<'all' | '효' | '굥' | '미지정'>('all');
  const [chartFilter, setChartFilter] = useState<{type: 'income' | 'expense', group: string, monthKey?: string} | null>(null);
  const [trendSummaryGroups, setTrendSummaryGroups] = useState<{ income: string | null; expense: string | null }>({ income: null, expense: null });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearEntryButtonHoldTimer = () => {
    if (entryButtonHoldTimerRef.current) {
      clearTimeout(entryButtonHoldTimerRef.current);
      entryButtonHoldTimerRef.current = null;
    }
  };

  const clearEntryButtonExpandTimer = () => {
    if (entryButtonExpandTimerRef.current) {
      clearTimeout(entryButtonExpandTimerRef.current);
      entryButtonExpandTimerRef.current = null;
    }
  };

  const expandEntryButton = () => {
    setIsEntryButtonExpanded(true);
    clearEntryButtonExpandTimer();
    entryButtonExpandTimerRef.current = setTimeout(() => {
      setIsEntryButtonExpanded(false);
      entryButtonExpandTimerRef.current = null;
    }, 3000);
  };

  useEffect(() => () => {
    clearEntryButtonHoldTimer();
    clearEntryButtonExpandTimer();
  }, []);

  useEffect(() => {
    if (!isEntryButtonExpanded) {
      setEntryButtonExpandedOffset(0);
      return;
    }
    const updateExpandedOffset = () => {
      const rect = entryButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      // 현재 적용된 이동값을 더해 원래 저장 위치 기준의 오른쪽 넘침을 계산한다.
      setEntryButtonExpandedOffset(Math.max(0, rect.right + entryButtonExpandedOffset - window.innerWidth + 8));
    };
    const frame = window.requestAnimationFrame(updateExpandedOffset);
    const transitionTimer = window.setTimeout(updateExpandedOffset, 220);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(transitionTimer);
    };
  }, [isEntryButtonExpanded, entryButtonPosition, entryButtonExpandedOffset, currentView]);

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
      clearEntryButtonExpandTimer();
      setIsEntryButtonExpanded(false);
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
    ? { left: `${entryButtonPosition.left}px`, top: `${entryButtonPosition.top}px`, right: 'auto', bottom: 'auto', transform: entryButtonExpandedOffset ? `translateX(-${entryButtonExpandedOffset}px)` : undefined }
    : entryButtonExpandedOffset ? { transform: `translateX(-${entryButtonExpandedOffset}px)` } : undefined;

  const fetchData = async () => {
    if (!hasCompletedInitialAuthCheckRef.current && initialAuthCheckStartedAtRef.current === null) {
      initialAuthCheckStartedAtRef.current = Date.now();
    }

    try {
      // 1. 인증 상태 및 역할 확인
      const authRes = await api.get('/auth-status');
      setUserRole(authRes.data.role || 'viewer');
      setIsAuthenticated(true);

      // 2. 데이터 조회
      const [txRes, catRes, assetRes, recurringCandidatesRes] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAssets(),
        getRecurringCandidates(),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setAssets(assetRes.data);
      setRecurringCandidateCount(recurringCandidatesRes.data.length);
      return true;
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setIsAuthenticated(false);
      }
      console.error(err);
      return false;
    } finally {
      if (!hasCompletedInitialAuthCheckRef.current) {
        const previewDelay = import.meta.env.DEV
          ? Number(new URLSearchParams(window.location.search).get('authLoadingPreview'))
          : Number.NaN;
        const minimumDisplayMs = Number.isFinite(previewDelay) && previewDelay > 0
          ? Math.min(previewDelay, 10000)
          : 1500;
        const elapsedMs = Date.now() - (initialAuthCheckStartedAtRef.current ?? Date.now());
        const remainingMs = Math.max(0, minimumDisplayMs - elapsedMs);
        if (remainingMs > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
        }
      }
      hasCompletedInitialAuthCheckRef.current = true;
      setIsAuthChecking(false);
    }
  };

  const resetPullRefresh = () => {
    pullRefreshStartYRef.current = null;
    isPullRefreshTrackingRef.current = false;
    setPullRefreshDistance(0);
  };

  const handlePullRefreshStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1 || isPullRefreshing || window.innerWidth > 768 || window.scrollY > 0) return;
    pullRefreshStartYRef.current = event.touches[0].clientY;
    isPullRefreshTrackingRef.current = true;
  };

  const handlePullRefreshMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const startY = pullRefreshStartYRef.current;
    if (!isPullRefreshTrackingRef.current || startY === null) return;

    const distance = event.touches[0].clientY - startY;
    if (distance <= 0) {
      resetPullRefresh();
      return;
    }

    event.preventDefault();
    setPullRefreshDistance(Math.min(distance * 0.55, 96));
  };

  const handlePullRefreshEnd = async () => {
    const shouldRefresh = pullRefreshDistance >= 64 && !isPullRefreshInFlightRef.current;
    resetPullRefresh();
    if (!shouldRefresh) return;

    isPullRefreshInFlightRef.current = true;
    setIsPullRefreshing(true);
    const refreshed = await fetchData();
    setIsPullRefreshing(false);
    isPullRefreshInFlightRef.current = false;
    if (refreshed) showSuccessMessage('최신 데이터를 불러왔습니다.');
  };

  const handleLoginSuccess = (role: 'admin' | 'viewer') => {
    setUserRole(role);
    setIsAuthenticated(true);
    setIsAuthChecking(false);
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
      showSuccessMessage('거래 수정이 완료되었습니다.');
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
      showSuccessMessage(`${before.length}건의 거래 일괄 변경이 완료되었습니다.`);
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
      showSuccessMessage(`${before.length}건을 ${member}로 변경했습니다.`);
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
    }, 10000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    if (successToastTimerRef.current) clearTimeout(successToastTimerRef.current);
    successToastTimerRef.current = setTimeout(() => {
      setSuccessMessage(null);
      successToastTimerRef.current = null;
    }, 3000);
  };

  const dismissUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setShowUndo(false);
    setLastUndoAction(null);
  };

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (successToastTimerRef.current) clearTimeout(successToastTimerRef.current);
  }, []);

  useEffect(() => {
    if (isAuthChecking || !import.meta.env.DEV) return;
    const preview = new URLSearchParams(window.location.search).get('successToastPreview');
    const messages: Record<string, string> = {
      transaction: '거래 추가가 완료되었습니다.',
      transactionEdit: '거래 수정이 완료되었습니다.',
      bulk: '12건의 거래 일괄 변경이 완료되었습니다.',
      member: '12건을 효로 변경했습니다.',
      memberGung: '12건을 굥으로 변경했습니다.',
      import: '12건의 거래를 불러왔습니다.',
      approve: '12건의 거래 승인 처리가 완료되었습니다.',
      recurring: '고정비 수동 매칭이 완료되었습니다.',
      recurringAdd: '고정비 항목 등록이 완료되었습니다.',
      recurringPause: '고정비 항목을 중지했습니다.',
      recurringDelete: '고정비 항목을 삭제했습니다.',
      asset: '자산 수정이 완료되었습니다.',
      assetAdd: '자산 추가가 완료되었습니다.',
      assetDelete: '자산 삭제가 완료되었습니다.',
    };
    if (preview && messages[preview]) showSuccessMessage(messages[preview]);
  }, [isAuthChecking]);

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
      showSuccessMessage(`${res.data.summary.total}건의 거래를 불러왔습니다.`);
    } catch (err: any) {
      alert(err.response?.data?.message || '가져오기에 실패했습니다. 파일을 확인한 후 다시 시도해 주세요.');
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
      alert('내보내기에 실패했습니다.');
    }
  };

  const handleVerify = async (ids: string[]) => {
    if (userRole !== 'admin' || verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    try {
      await verifyTransactions(ids);
      await fetchData();
      const missingRecurring = await getMissingRecurring();
      if (missingRecurring.data.length > 0) setMissingRecurringItems(missingRecurring.data);
      setActiveTab('all');
      showSuccessMessage(ids.length === 1 ? '거래 승인 처리가 완료되었습니다.' : `${ids.length}건의 거래 승인 처리가 완료되었습니다.`);
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

  const handleTrendMonthSelect = (selection: { type: 'income' | 'expense'; group: string; monthKey: string } | null) => {
    setChartFilter(selection);
    if (selection) setActiveTab('all');
  };

  const closeTransactionForm = () => setIsTransactionFormOpen(false);
  const closeAssetForm = () => setIsAssetFormOpen(false);

  const filteredByPeriod = transactions.filter(t => {
    if (period === 'all') return true;
    if (period === 'month') return t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`);
    if (period === 'year') return t.date.startsWith(`${year}`);
    return true;
  });

  const allVerifiedForMember = transactions.filter(t => {
    const isVerified = t.isVerified !== false;
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;
    return isVerified && matchesMember;
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

  const statisticsTransactionsForPeriod = allVerifiedForPeriod.filter((transaction) => !statisticsExclusions[transaction.type as 'income' | 'expense']?.includes(getGroupName(transaction.category, categories)));
  const newCount = unverifiedTransactions.filter(t => t.importStatus === 'new' || (!t.importStatus && !t.isDuplicate)).length;
  const duplicateCount = unverifiedTransactions.filter(t => t.importStatus === 'duplicate' || (!t.importStatus && t.isDuplicate)).length;
  const invalidCount = unverifiedTransactions.filter(t => t.importStatus === 'invalid' || t.isInvalid).length;
  const verifiedCount = allVerifiedForPeriod.length;

  const transactionsForList = chartFilter?.monthKey ? transactions : filteredByPeriod;
  const filteredTransactions = transactionsForList.filter(t => {
    const matchesMember = memberFilter === 'all' || t.member === memberFilter;
    if (!matchesMember) return false;

    // getGroupName helper for filtering
    // 차트 필터 적용
      if (chartFilter) {
        const groupName = getGroupName(t.category, categories);
        if (t.type !== chartFilter.type || groupName !== chartFilter.group) return false;
        if (chartFilter.monthKey && !t.date.startsWith(chartFilter.monthKey)) return false;
    }

    if (activeTab === 'all') return t.isVerified !== false;
    if (activeTab === 'new') return t.isVerified === false && (t.importStatus === 'new' || (!t.importStatus && !t.isDuplicate));
    if (activeTab === 'duplicate') return t.isVerified === false && (t.importStatus === 'duplicate' || (!t.importStatus && t.isDuplicate));
    if (activeTab === 'invalid') return t.isVerified === false && (t.importStatus === 'invalid' || t.isInvalid);
    return true;
  });

  if (isAuthChecking) {
    return (
      <main className="app-auth-loading" aria-live="polite" aria-label="로그인 상태 확인 중">
        <div className="app-auth-loading-card">
          <div className="app-auth-loading-mark" aria-hidden="true" />
          <span>로그인 정보 확인 중</span>
          <small>잠시만 기다려 주세요</small>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div
      className="container"
      onTouchStart={handlePullRefreshStart}
      onTouchMove={handlePullRefreshMove}
      onTouchEnd={handlePullRefreshEnd}
      onTouchCancel={resetPullRefresh}
    >
      {(pullRefreshDistance > 0 || isPullRefreshing) && (
        <div className="pull-refresh-indicator" role="status" aria-live="polite">
          <RefreshCw size={17} className={isPullRefreshing ? 'is-spinning' : ''} aria-hidden="true" />
          <span>{isPullRefreshing ? '새로고침 중...' : pullRefreshDistance >= 64 ? '놓으면 새로고침' : '당겨서 새로고침'}</span>
        </div>
      )}
      <header className="header app-header">
        <div className="app-title-group">
          <h1 className="app-title">효굥봉 가계부</h1>
          <button type="button" className="app-version-link" onClick={() => setIsUpdateHistoryOpen(true)}>
            v1.2
          </button>
        </div>
        <button
          type="button"
          className="header-menu-toggle"
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
          <button
            className={`nav-item ${currentView === 'recurring' ? 'active' : ''}`}
            onClick={() => setCurrentView('recurring')}
          >
            <CalendarClock size={18} /> 고정비 관리{recurringCandidateCount > 0 ? ` (${recurringCandidateCount})` : ''}
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
                <Upload size={16} /> 가져오기
            </button>
          )}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => {
              setIsMobileMenuOpen(false);
              handleExportBackup();
            }}>
                <Download size={16} /> 내보내기
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".csv,.xlsx" />
          
          {/* Admin 전용 버튼: Settings */}
          {userRole === 'admin' && (
            <button className="btn btn-secondary header-action-btn" onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSettingsModalOpen(true);
            }}>
                <Settings size={16} /> 설정
            </button>
          )}

          <button type="button" className="btn btn-secondary header-action-btn" onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUpdateHistoryOpen(true);
          }}>
            <History size={16} /> 버전 정보
          </button>

          <button className="btn btn-danger header-action-btn" onClick={() => {
            setIsMobileMenuOpen(false);
            handleLogout();
          }}>
            <LogOut size={16} /> 로그아웃
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
            transactions={statisticsTransactionsForPeriod}
            period={period} setPeriod={setPeriod} 
            year={year} setYear={setYear} 
            month={month} setMonth={setMonth} 
            memberFilter={memberFilter} setMemberFilter={setMemberFilter}
            trendTransactions={allVerifiedForMember}
            trendGroups={trendSummaryGroups}
            categories={categories}
          />
          <SuggestionNotification onRuleApproved={fetchData} />
          <ErrorBoundary title="차트를 불러오지 못했습니다.">
            <SummaryCharts
              transactions={allVerifiedForPeriod}
              trendTransactions={allVerifiedForMember}
              categories={categories}
              period={period}
              onHighlight={handleChartHighlight}
              onTrendGroupsChange={setTrendSummaryGroups}
              onTrendMonthSelect={handleTrendMonthSelect}
              excludedGroups={statisticsExclusions}
              onExcludedGroupsChange={setStatisticsExclusions}
            />
          </ErrorBoundary>
          
          {userRole === 'admin' && isTransactionFormOpen && (
            <EntryModal title="거래 입력" onClose={closeTransactionForm}>
              <TransactionForm onSuccess={() => { closeTransactionForm(); fetchData(); showSuccessMessage('거래 추가가 완료되었습니다.'); }} onCancel={closeTransactionForm} categories={categories} compact />
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
              <div className="bulk-transaction-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                    모두 승인
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
              onRefresh={() => { void fetchData(); }}
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
            <Suspense fallback={<LazyViewFallback />}>
              <AssetManager userRole={userRole} isAddOpen={isAssetFormOpen} onCloseAdd={closeAssetForm} assetTypesVersion={assetTypesVersion} onSuccess={showSuccessMessage} />
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : currentView === 'recurring' ? (
        <ErrorBoundary title="고정비 관리 정보를 불러오지 못했습니다.">
            <Suspense fallback={<LazyViewFallback />}>
              <RecurringManager categories={categories} transactions={transactions} canManage={userRole === 'admin'} onSuccess={showSuccessMessage} />
            </Suspense>
        </ErrorBoundary>
      ) : (
          <ErrorBoundary title="활동 로그를 불러오지 못했습니다.">
            <Suspense fallback={<LazyViewFallback />}>
              <AuditLogView isAdmin={userRole === 'admin'} onRestored={fetchData} />
            </Suspense>
          </ErrorBoundary>
      )}

      {userRole === 'admin' && (currentView === 'budget' || currentView === 'assets') && (
        <button
          ref={entryButtonRef}
          type="button"
          className="mobile-entry-fab"
          style={entryButtonStyle}
          onPointerDown={handleEntryButtonPointerDown}
          onPointerMove={handleEntryButtonPointerMove}
          onPointerUp={finishEntryButtonDrag}
          onPointerCancel={finishEntryButtonDrag}
          onClick={() => {
            if (suppressEntryButtonClickRef.current) return;
            if (!isEntryButtonExpanded) {
              expandEntryButton();
              return;
            }
            clearEntryButtonExpandTimer();
            setIsEntryButtonExpanded(false);
            currentView === 'budget' ? setIsTransactionFormOpen(true) : setIsAssetFormOpen(true);
          }}
          data-dragging={isEntryButtonDragging}
          data-expanded={isEntryButtonExpanded}
          aria-label={currentView === 'budget' ? '거래 입력' : '자산 등록'}
          title={currentView === 'budget' ? '거래 입력' : '자산 등록'}
        >
          <Plus size={24} />
          <span>{currentView === 'budget' ? '거래 입력' : '자산 등록'}</span>
        </button>
      )}

      {missingRecurringItems && <RecurringMissingModal
        items={missingRecurringItems}
        onClose={() => setMissingRecurringItems(null)}
        onAdded={() => { void fetchData(); }}
      />}

      {importSummary && (
        <div className="modal-overlay">
          <div className="import-result-modal">
            <div className="modal-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>가져오기 완료</h3>
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

      {isUpdateHistoryOpen && (
        <EntryModal title="버전 정보" onClose={() => setIsUpdateHistoryOpen(false)}>
          <div className="version-history">
            {RELEASE_NOTES.map((release) => (
              <button
                type="button"
                className={`version-history-release ${expandedReleaseVersion === release.version ? 'is-expanded' : ''}`}
                key={release.version}
                aria-expanded={expandedReleaseVersion === release.version}
                onClick={() => setExpandedReleaseVersion((current) => current === release.version ? null : release.version)}
              >
                <div className="version-history-release-heading">
                  <h3>{release.version}</h3>
                  <span>{release.releasedAt}</span>
                </div>
                <p>{release.summary}</p>
                <ul>
                  {release.changes.map((change) => <li key={change}>{change}</li>)}
                </ul>
              </button>
            ))}
          </div>
        </EntryModal>
      )}

      {isSettingsModalOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            categories={categories}
            onRefresh={fetchData}
            onAssetTypesChanged={() => setAssetTypesVersion((version) => version + 1)}
          />
        </Suspense>
      )}

      {showUndo && userRole === 'admin' && lastUndoAction && (
        <div className="undo-toast">
          <span>{lastUndoAction.label}</span>
          <button onClick={handleUndo} className="undo-btn"><Undo2 size={15} /> 직전 작업 일괄 되돌리기</button>
          <button onClick={dismissUndo} className="undo-close" aria-label="되돌리기 알림 닫기" title="닫기"><X size={16} /></button>
        </div>
      )}
      {successMessage && (
        <div className={`success-toast${showUndo ? ' success-toast-above-undo' : ''}`} role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
