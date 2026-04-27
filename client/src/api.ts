import axios from 'axios';

const API_BASE = 'https://my-budget-app-nwm8.onrender.com/api';

// 모든 요청에 대해 쿠키(세션) 정보를 포함하도록 설정
axios.defaults.withCredentials = true;

export interface Transaction {
  id?: string;
  date: string;
  time?: string;
  type: 'income' | 'expense' | 'recurring';
  category: string;
  subcategory?: string;
  vendor: string;
  amount: number;
  currency?: string;
  source: string;
  memo?: string;
}

export interface CategoryRule {
  id?: string;
  keyword: string;
  assigned_category: string;
}

export interface CategoryItem {
  id?: string;
  name: string;
}

export const getTransactions = () => axios.get<Transaction[]>(`${API_BASE}/transactions`);
export const applyAutoRules = () => axios.post<{ success: boolean, count: number }>(`${API_BASE}/transactions/apply-rules`);
export const addTransaction = (tx: Partial<Transaction>) => axios.post<Transaction>(`${API_BASE}/transactions`, tx);
export const updateTransaction = (id: string, tx: Partial<Transaction>) => axios.put(`${API_BASE}/transactions/${id}`, tx);
export const deleteTransaction = (id: string) => axios.delete(`${API_BASE}/transactions/${id}`);
export const bulkDeleteTransactions = (ids: string[]) => axios.delete(`${API_BASE}/transactions/bulk`, { data: { ids } });

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
export const deleteRule = (id: string) => axios.delete(`${API_BASE}/rules/${id}`);

export interface RecurringTransaction {
  id?: string;
  vendor: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'recurring';
  day_of_month: number;
}

// ... 기존 API 코드 ...

export const getCategories = () => axios.get<CategoryItem[]>(`${API_BASE}/categories`);
export const autoCategorizeVendor = (vendor: string) => axios.get<{ category: string }>(`${API_BASE}/categories/auto`, { params: { vendor } });
export const addCategory = (cat: Partial<CategoryItem>) => axios.post<CategoryItem>(`${API_BASE}/categories`, cat);
export const deleteCategory = (id: string) => axios.delete(`${API_BASE}/categories/${id}`);

export const getRecurring = () => axios.get<RecurringTransaction[]>(`${API_BASE}/recurring`);
export const addRecurring = (rec: Partial<RecurringTransaction>) => axios.post<RecurringTransaction>(`${API_BASE}/recurring`, rec);
export const deleteRecurring = (id: string) => axios.delete(`${API_BASE}/recurring/${id}`);
