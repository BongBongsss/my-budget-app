import axios from 'axios';

const API_BASE = 'https://my-budget-app-nwm8.onrender.com/api';

// 모든 요청에 대해 쿠키(세션) 정보를 포함하도록 설정
axios.defaults.withCredentials = true;

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

export const getTransactions = () => axios.get<Transaction[]>(`${API_BASE}/transactions`);
export const applyAutoRules = () => axios.post<{ success: boolean, count: number }>(`${API_BASE}/transactions/apply-rules`);
export const addTransaction = (tx: Partial<Transaction>) => axios.post<Transaction>(`${API_BASE}/transactions`, tx);
export const updateTransaction = (id: string, tx: Partial<Transaction>) => axios.put(`${API_BASE}/transactions/${id}`, tx);
export const deleteTransaction = (id: string) => axios.delete(`${API_BASE}/transactions/${id}`);
export const bulkDeleteTransactions = (ids: string[]) => axios.delete(`${API_BASE}/transactions/bulk`, { data: { ids } });
export const verifyTransactions = (ids: string[]) => axios.post(`${API_BASE}/transactions/verify`, { ids });
export const cleanupTransactions = () => axios.post(`${API_BASE}/transactions/cleanup`);

export const importFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<Transaction[]>(`${API_BASE}/transactions/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const bulkAddTransactions = (txs: Transaction[]) => axios.post(`${API_BASE}/transactions/bulk`, txs);

export const getRules = () => axios.get<CategoryRule[]>(`${API_BASE}/rules`);
export const addRule = (rule: Partial<CategoryRule>) => axios.post<CategoryRule>(`${API_BASE}/rules`, rule);
export const updateRule = (id: string, rule: Partial<CategoryRule>) => axios.put(`${API_BASE}/rules/${id}`, rule);
export const deleteRule = (id: string) => axios.delete(`${API_BASE}/rules/${id}`);

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

// ... 기존 API 코드 ...

export interface PaymentRule {
  id?: string;
  paymentType: 'card' | 'transfer';
  keyword: string;
}

// ... (기존 코드들)

export const getPaymentRules = () => axios.get<PaymentRule[]>(`${API_BASE}/payment-rules`);
export const addPaymentRule = (rule: Partial<PaymentRule>) => axios.post<PaymentRule>(`${API_BASE}/payment-rules`, rule);
export const deletePaymentRule = (id: string) => axios.delete(`${API_BASE}/payment-rules/${id}`);
export const applyPaymentRules = () => axios.post<{ success: boolean, updatedCount: number }>(`${API_BASE}/payment-rules/apply`);

export const getCategories = () => axios.get<CategoryItem[]>(`${API_BASE}/categories`);
export const autoCategorizeVendor = (vendor: string) => axios.get<{ category: string }>(`${API_BASE}/categories/auto`, { params: { vendor } });
export const updateCategoryBatchGroup = (categoryIds: string[], groupName: string) => axios.post(`${API_BASE}/categories/batch-group`, { categoryIds, groupName });
export const addCategory = (cat: Partial<CategoryItem>) => axios.post<CategoryItem>(`${API_BASE}/categories`, cat);
export const deleteCategory = (id: string) => axios.delete(`${API_BASE}/categories/${id}`);

export const getRecurring = () => axios.get<RecurringTransaction[]>(`${API_BASE}/recurring`);
export const addRecurring = (rec: Partial<RecurringTransaction>) => axios.post<RecurringTransaction>(`${API_BASE}/recurring`, rec);
export const deleteRecurring = (id: string) => axios.delete(`${API_BASE}/recurring/${id}`);

export const getAssets = () => axios.get<Asset[]>(`${API_BASE}/assets`);
export const getAssetHistory = () => axios.get<any[]>(`${API_BASE}/assets/history`);
export const saveAssetHistory = () => axios.post(`${API_BASE}/assets/history/save`);
export const addAsset = (asset: Partial<Asset>) => axios.post<Asset>(`${API_BASE}/assets`, asset);
export const updateAsset = (id: string, asset: Partial<Asset>) => axios.put<Asset>(`${API_BASE}/assets/${id}`, asset);
export const deleteAsset = (id: string) => axios.delete(`${API_BASE}/assets/${id}`);
