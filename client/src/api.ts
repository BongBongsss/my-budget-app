import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export interface Transaction {
  id?: string;
  date: string;
  amount: number;
  vendor: string;
  category: string;
  type: 'income' | 'expense';
  source?: string;
  is_recurring?: number;
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
  type: 'income' | 'expense';
  day_of_month: number;
}

// ... 기존 API 코드 ...

export const getCategories = () => axios.get<CategoryItem[]>(`${API_BASE}/categories`);
export const addCategory = (cat: Partial<CategoryItem>) => axios.post<CategoryItem>(`${API_BASE}/categories`, cat);
export const deleteCategory = (id: string) => axios.delete(`${API_BASE}/categories/${id}`);

export const getRecurring = () => axios.get<RecurringTransaction[]>(`${API_BASE}/recurring`);
export const addRecurring = (rec: Partial<RecurringTransaction>) => axios.post<RecurringTransaction>(`${API_BASE}/recurring`, rec);
export const deleteRecurring = (id: string) => axios.delete(`${API_BASE}/recurring/${id}`);
