import axios from 'axios';

// 환경 변수에서 API base URL을 가져오고, 없으면 기본값으로 운영 환경 URL을 사용
const API_BASE = import.meta.env.VITE_API_BASE || 'https://my-budget-app-nwm8.onrender.com/api';

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

/**
 * Global Error Interceptor
 * 서버에서 오는 공통 에러 포맷({ status, code, message })을 처리합니다.
 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
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
  member?: string;
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
}

export interface Asset {
  id?: string;
  name: string;
  type: 'cash' | 'bank' | 'stock' | 'realestate' | 'pension' | 'insurance' | 'liability' | 'other';
  balance: number;
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRule {
  id?: string;
  paymentType: 'card' | 'transfer';
  keyword: string;
}

// --- API Methods ---

// Transactions
export const getTransactions = () => instance.get<Transaction[]>('/transactions');
export const applyAutoRules = () => instance.post<{ success: boolean, count: number }>('/transactions/apply-rules');
export const addTransaction = (tx: Partial<Transaction>) => instance.post<Transaction>('/transactions', tx);
export const updateTransaction = (id: string, tx: Partial<Transaction>) => instance.put(`/transactions/${id}`, tx);
export const deleteTransaction = (id: string) => instance.delete(`/transactions/${id}`);
export const bulkDeleteTransactions = (ids: string[]) => instance.delete('/transactions/bulk', { data: { ids } });
export const verifyTransactions = (ids: string[]) => instance.post('/transactions/verify', { ids });
export const cleanupTransactions = () => instance.post('/transactions/cleanup');

export const importFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return instance.post<Transaction[]>('/transactions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const bulkAddTransactions = (txs: Transaction[]) => instance.post('/transactions/bulk', txs);

// Rules
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
export const deleteCategory = (id: string) => instance.delete(`/categories/${id}`);

// Recurring
export const getRecurring = () => instance.get<RecurringTransaction[]>('/recurring');
export const addRecurring = (rec: Partial<RecurringTransaction>) => instance.post<RecurringTransaction>('/recurring', rec);
export const deleteRecurring = (id: string) => instance.delete(`/recurring/${id}`);

// Assets
export const getAssets = () => instance.get<Asset[]>('/assets');
export const getAssetHistory = () => instance.get<any[]>('/assets/history');
export const saveAssetHistory = () => instance.post('/assets/history/save');
export const addAsset = (asset: Partial<Asset>) => instance.post<Asset>('/assets', asset);
export const updateAsset = (id: string, asset: Partial<Asset>) => instance.put<Asset>(`/assets/${id}`, asset);
export const deleteAsset = (id: string) => instance.delete(`/assets/${id}`);
