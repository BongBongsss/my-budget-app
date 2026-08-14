import axios from 'axios';

// 환경 변수에서 API base URL을 가져오고, 없으면 기본값으로 운영 환경 URL을 사용
const API_BASE = import.meta.env.VITE_API_BASE || 'https://my-budget-app-nwm8.onrender.com/api';

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// A rapid double-click must not turn into two writes. Keep this at the API
// boundary so the safeguard also covers every settings screen.
const pendingMutationKeys = new Set<string>();

const stableSerialize = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value !== 'object') return JSON.stringify(value);
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
};

export const mutationRequestKey = (config: any) => {
  const method = String(config.method || 'get').toLowerCase();
  if (!['post', 'put', 'patch', 'delete'].includes(method)) return null;

  const data = config.data;
  const body = data instanceof FormData
    ? [...data.entries()].map(([key, value]) => `${key}:${value instanceof File ? `${value.name}:${value.size}:${value.lastModified}` : String(value)}`).join('|')
    : typeof data === 'string' ? data : stableSerialize(data || {});
  return `${method}:${config.baseURL || ''}:${config.url || ''}:${body}`;
};

instance.interceptors.request.use((config: any) => {
  const mutationKey = mutationRequestKey(config);
  if (!mutationKey) return config;
  if (pendingMutationKeys.has(mutationKey)) {
    const error = new axios.CanceledError('This change is already being processed.');
    (error as any).isDuplicateMutation = true;
    return Promise.reject(error);
  }
  pendingMutationKeys.add(mutationKey);
  config.__mutationKey = mutationKey;
  return config;
});

/**
 * Global Error Interceptor
 * 서버에서 오는 공통 에러 포맷({ status, code, message })을 처리합니다.
 */
instance.interceptors.response.use(
  (response) => {
    if ((response.config as any).__mutationKey) pendingMutationKeys.delete((response.config as any).__mutationKey);
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (originalRequest?.__mutationKey) pendingMutationKeys.delete(originalRequest.__mutationKey);
    if ((error as any).isDuplicateMutation) return Promise.reject(error);
    
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || 'An unexpected error occurred';
      const errorCode = data?.code || 'UNKNOWN_ERROR';

      // 401 Unauthorized: 인증 만료 시 로그인 페이지로 리다이렉트 권장
      if (status === 401 && !originalRequest._retry) {
        console.error('Session expired or unauthorized. Redirecting to login...');
        // window.location.href = '/login'; // 실제 환경에 맞게 조정 가능
      }

      // 에러 객체에 서버에서 온 정보를 담아 다시 던짐 (컴포넌트에서 활용 가능)
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = status;
      (enhancedError as any).code = errorCode;
      (enhancedError as any).details = data?.details;

      return Promise.reject(enhancedError);
    }

    return Promise.reject(error);
  }
);

export default instance;

// --- Interfaces ---

export interface Transaction {
  id?: string;
  date: string;
  time?: string;
  type: 'income' | 'expense' | 'recurring' | 'exclude';
  category: string;
  subcategory?: string;
  vendor: string;
  amount: number;
  currency?: string;
  source: string;
  memo?: string;
  isVerified?: boolean;
  isDuplicate?: boolean;
  isInvalid?: boolean;
  importStatus?: 'new' | 'duplicate' | 'invalid' | 'committed' | 'ignored';
  invalidReason?: string;
  rowNumber?: number;
  batchId?: string;
  member?: string;
  reviewTargetType?: 'transaction' | 'importRow';
  reviewCount?: number;
  openReviewCount?: number;
  reviewStatus?: 'none' | 'resolved' | 'open';
}

export interface ReviewRequest {
  id: string;
  targetType: 'general' | 'transaction' | 'importRow' | 'asset';
  targetId?: string | null;
  type: 'question' | 'change_request';
  title: string;
  body: string;
  status: 'open' | 'done';
  authorRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  readByAdmin: boolean;
  readByViewer: boolean;
  authorRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRule {
  id?: string;
  keyword: string;
  assigned_category: string;
}

export interface CategoryItem {
  id?: string;
  name: string;
  groupName?: string;
}

export interface RecurringTransaction {
  id?: string;
  vendor: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'recurring' | 'exclude';
  day_of_month: number;
  member?: string;
  isActive?: boolean;
  isVariable?: boolean;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
  matchStatus?: 'inactive' | 'missing' | 'auto_matched' | 'confirmed' | 'review_required' | 'duplicate_suspected';
  matchScore?: number;
  matchReasons?: string[];
  matchYearMonth?: string;
  matchCandidates?: Array<{
    id: string;
    date: string;
    vendor: string;
    amount: number;
    category: string;
    score: number;
    reasons: string[];
  }>;
}

export interface RecurringCandidate {
  id: string;
  vendor: string;
  type: 'income' | 'expense';
  member: string;
  category: string;
  occurrenceCount: number;
  monthCount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  dayOfMonth: number;
  isVariable: boolean;
  lastUsedAt: string;
  confidence: number;
  reasons: string[];
}

export interface MissingRecurringTransaction extends RecurringTransaction {
  scheduledDate: string;
}

export interface IgnoredRecurringSuggestion {
  id: string;
  vendorKey: string;
  createdAt: string;
}

export interface RuleReviewCandidate {
  id: string;
  keyword: string;
  assignedCategory: string;
  suggestedCategory: string;
  occurrenceCount: number;
  totalOccurrences: number;
  confidence: number;
  lastUsedAt: string;
}

export interface Asset {
  id?: string;
  name: string;
  type: string;
  balance: number;
  member: '효' | '굥' | '봉' | '공동';
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRule {
  id?: string;
  paymentType: 'card' | 'transfer';
  keyword: string;
}

export interface AssetType { id: string; name: string; isLiability: boolean; isDeleted?: boolean; }

export interface RuleSuggestion {
  id: string;
  vendor: string;
  suggestedCategory: string;
  occurrenceCount: number;
  totalOccurrences: number;
  confidence: number;
  lastUsedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  beforeData?: any;
  afterData?: any;
  actorRole?: string;
  ipAddress?: string;
  createdAt: string;
  isRestorable?: boolean;
}

export interface AuditLogPage {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- API Methods ---

// Transactions
export const getTransactions = () => instance.get<Transaction[]>('/transactions');
export const applyAutoRules = () => instance.post<{ success: boolean, count: number }>('/transactions/apply-rules');
export const addTransaction = (tx: Partial<Transaction>) => instance.post<Transaction>('/transactions', tx);
export const updateTransaction = (id: string, tx: Partial<Transaction>) => instance.put<{ success: boolean; auditLogIds: string[] }>(`/transactions/${id}`, tx);
export const bulkUpdateTransactions = (ids: string[], updates: Partial<Transaction>) =>
  instance.post<{ success: boolean; count: number; auditLogIds: string[] }>('/transactions/bulk-update', { ids, updates });
export const deleteTransaction = (id: string) => instance.delete<{ success: boolean; auditLogIds: string[] }>(`/transactions/${id}`);
export const bulkDeleteTransactions = (ids: string[]) => instance.delete<{ success: boolean; count: number; auditLogIds: string[] }>('/transactions/bulk', { data: { ids } });
export const verifyTransactions = (ids: string[]) => instance.post('/transactions/verify', { ids });
export const cleanupTransactions = () => instance.post('/transactions/cleanup');
export const exportTransactionsBackup = () =>
  instance.get<Blob>('/transactions/export', { responseType: 'blob' });

// Review Requests
export const getReviewRequests = (params?: { targetType?: string; targetId?: string; status?: string }) =>
  instance.get<ReviewRequest[]>('/review-requests', { params });
export const createReviewRequest = (request: Partial<ReviewRequest>) =>
  instance.post<ReviewRequest>('/review-requests', request);
export const updateReviewRequestStatus = (id: string, status: 'open' | 'done') =>
  instance.patch<ReviewRequest>(`/review-requests/${id}/status`, { status });
export const deleteReviewRequest = (id: string) => instance.delete(`/review-requests/${id}`);

// Notices
export const getNotices = (params?: { unread?: boolean }) =>
  instance.get<Notice[]>('/notices', { params });
export const createNotice = (notice: { title: string; body: string }) =>
  instance.post<Notice>('/notices', notice);
export const markNoticeRead = (id: string) => instance.patch<Notice>(`/notices/${id}/read`);
export const deleteNotice = (id: string) => instance.delete(`/notices/${id}`);

export const importFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return instance.post<{
    success: boolean;
    summary: {
      batchId: string;
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
    transactions: Transaction[];
  }>('/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const bulkAddTransactions = (txs: Transaction[]) => instance.post('/transactions/bulk', txs);

// Audit logs
export const getAuditLogs = (params?: { entityType?: string; action?: string; page?: number; limit?: number }) => (
  instance.get<AuditLogPage>('/audit-logs', { params })
);
export const restoreAuditLog = (id: string) => instance.post(`/audit-logs/${id}/restore`);
export const restoreAuditLogs = (auditLogIds: string[]) => instance.post<{ success: boolean; count: number }>('/audit-logs/restore', { auditLogIds });
export const getLatestAuditBatch = () => instance.get<{ batchId: string; count: number; createdAt: string } | null>('/audit-logs/latest-batch');
export const restoreLatestAuditBatch = () => instance.post<{ success: boolean; count: number }>('/audit-logs/latest-batch/restore');

// Rules
export const getRuleSuggestions = () => instance.get<RuleSuggestion[]>('/suggestions/candidates');
export const approveRuleSuggestion = (vendor: string, category: string) =>
  instance.post<CategoryRule>('/suggestions/approve', { vendor, category });
export const deferRuleSuggestion = (vendor: string) => instance.post('/suggestions/defer', { vendor });
export const ignoreRuleSuggestion = (vendor: string) => instance.post('/ignored-rules', { keyword: vendor });
export const getRuleReviewCandidates = () => instance.get<RuleReviewCandidate[]>('/suggestions/rule-reviews');
export const getRules = () => instance.get<CategoryRule[]>('/rules');
export const addRule = (rule: Partial<CategoryRule>) => instance.post<CategoryRule>('/rules', rule);
export const updateRule = (id: string, rule: Partial<CategoryRule>) => instance.put(`/rules/${id}`, rule);
export const deleteRule = (id: string) => instance.delete(`/rules/${id}`);

// Payment Rules
export const getPaymentRules = () => instance.get<PaymentRule[]>('/payment-rules');
export const addPaymentRule = (rule: Partial<PaymentRule>) => instance.post<PaymentRule>('/payment-rules', rule);
export const deletePaymentRule = (id: string) => instance.delete(`/payment-rules/${id}`);
export const applyPaymentRules = () => instance.post<{ success: boolean, updatedCount: number }>('/payment-rules/apply');

// Categories
export const getCategories = () => instance.get<CategoryItem[]>('/categories');
export const autoCategorizeVendor = (vendor: string) => instance.get<{ category: string }>('/categories/auto', { params: { vendor } });
export const updateCategoryBatchGroup = (categoryIds: string[], groupName: string) => instance.post('/categories/batch-group', { categoryIds, groupName });
export const addCategory = (cat: Partial<CategoryItem>) => instance.post<CategoryItem>('/categories', cat);
export const deleteCategory = (id: string) => instance.delete('/categories', { data: { id } });
export const getChartStatisticsSettings = () => instance.get<{ income: string[]; expense: string[] }>('/chart-statistics-settings');
export const saveChartStatisticsSettings = (settings: { income: string[]; expense: string[] }) => instance.put('/chart-statistics-settings', settings);

// Recurring
export const getRecurring = (yearMonth?: string) => instance.get<RecurringTransaction[]>('/recurring', { params: yearMonth ? { yearMonth } : undefined });
export const addRecurring = (rec: Partial<RecurringTransaction>) => instance.post<RecurringTransaction>('/recurring', rec);
export const updateRecurring = (id: string, rec: Partial<RecurringTransaction>) => instance.put<RecurringTransaction>(`/recurring/${id}`, rec);
export const deleteRecurring = (id: string) => instance.delete(`/recurring/${id}`);
export const getRecurringCandidates = () => instance.get<RecurringCandidate[]>('/recurring/candidates');
export const deferRecurringCandidate = (vendor: string) => instance.post('/recurring/candidates/defer', { vendor });
export const ignoreRecurringCandidate = (vendor: string) => instance.post('/recurring/candidates/ignore', { vendor });
export const getIgnoredRecurringCandidates = () => instance.get<IgnoredRecurringSuggestion[]>('/recurring/candidates/ignored');
export const restoreIgnoredRecurringCandidate = (vendorKey: string) => instance.delete(`/recurring/candidates/ignored/${encodeURIComponent(vendorKey)}`);
export const getMissingRecurring = (yearMonth?: string) => instance.get<MissingRecurringTransaction[]>('/recurring/missing', { params: yearMonth ? { yearMonth } : undefined });
export const addMissingRecurring = (id: string, yearMonth?: string, amount?: number) => instance.post<Transaction>(`/recurring/${id}/add-missing`, { yearMonth, amount });
export const confirmRecurringMatch = (id: string, transactionId: string, yearMonth: string) => instance.post(`/recurring/${id}/confirm-match`, { transactionId, yearMonth });

// Assets
export const getAssets = () => instance.get<Asset[]>('/assets');
export const getAssetTypes = () => instance.get<AssetType[]>('/asset-types');
export const addAssetType = (name: string, isLiability: boolean) => instance.post<AssetType>('/asset-types', { name, isLiability });
export const updateAssetType = (id: string, name: string, isLiability: boolean) => instance.put<AssetType>(`/asset-types/${id}`, { name, isLiability });
export const deleteAssetType = (id: string) => instance.delete(`/asset-types/${id}`);
export const getAssetHistory = () => instance.get<any[]>('/assets/history');
export const saveAssetHistory = () => instance.post('/assets/history/save');
export const addAsset = (asset: Partial<Asset>) => instance.post<Asset>('/assets', asset);
export const updateAsset = (id: string, asset: Partial<Asset>) => instance.put<Asset>(`/assets/${id}`, asset);
export const deleteAsset = (id: string) => instance.delete(`/assets/${id}`);
