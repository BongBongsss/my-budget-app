import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getTransactions, getCategories, Transaction, CategoryItem, importFile, bulkAddTransactions, deleteTransaction, bulkDeleteTransactions, updateTransaction } from './api';
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
  const [activeTab, setActiveTab] = useState<'all' | 'recurring'>('all');
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
    await bulkDeleteTransactions(ids);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: Partial<Transaction>) => {
    await updateTransaction(id, updates);
    fetchData();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await importFile(file);
      await bulkAddTransactions(res.data);
      fetchData();
    } catch (err: any) {
      alert('Error importing file');
    }
  };

  // 공통 필터링 로직
  const filteredData = transactions.filter(t => {
    if (period === 'all') return true;
    if (period === 'month') return t.date.startsWith(`${year}-${String(month).padStart(2, '0')}`);
    if (period === 'year') return t.date.startsWith(`${year}`);
    return true;
  });

  const filteredTransactions = (activeTab === 'all' 
    ? filteredData.filter(t => t.type !== 'recurring')
    : filteredData.filter(t => t.type === 'recurring')
  );

  if (!isAuthenticated) {
    return <Login onLogin={fetchData} />;
  }

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
        transactions={filteredData} 
        period={period} setPeriod={setPeriod} 
        year={year} setYear={setYear} 
        month={month} setMonth={setMonth} 
      />
      <SummaryCharts transactions={filteredData} period={period} />
      <TransactionForm onSuccess={fetchData} categories={categories} />
      
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={activeTab === 'all' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('all')}>Transactions</button>
        <button className={activeTab === 'recurring' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setActiveTab('recurring')} style={{ marginLeft: '10px' }}>Recurring Expenses</button>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        categories={categories}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onUpdate={handleUpdate}
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
