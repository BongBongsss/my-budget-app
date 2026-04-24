import React, { useState } from 'react';
import { importFile, bulkAddTransactions, Transaction } from '../api';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

interface FileImportProps {
  onImportSuccess: () => void;
}

const FileImport: React.FC<FileImportProps> = ({ onImportSuccess }) => {
  const [preview, setPreview] = useState<Transaction[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    try {
      const res = await importFile(file);
      setPreview(res.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error parsing file';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setIsImporting(true);
    try {
      await bulkAddTransactions(preview);
      setPreview(null);
      onImportSuccess();
    } catch (err) {
      alert('Error importing data');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="import-section mb-8">
      <h3>Import CSV/Excel</h3>
      {!preview ? (
        <div className="file-upload">
          <input 
            type="file" 
            id="fileInput" 
            onChange={handleFileChange} 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
          />
          <label htmlFor="fileInput" className="upload-label">
            <Upload className="mr-2" /> Select File
          </label>
        </div>
      ) : (
        <div className="preview-container">
          <h4>Preview ({preview.length} items)</h4>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td>{p.date}</td>
                    <td>{p.vendor}</td>
                    <td>₩{p.amount.toLocaleString()}</td>
                    <td>{p.category}</td>
                  </tr>
                ))}
                {preview.length > 5 && <tr><td colSpan={4}>...and {preview.length - 5} more</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="preview-actions mt-4">
            <button className="btn btn-primary mr-2" onClick={handleConfirm} disabled={isImporting}>
              <CheckCircle size={18} className="mr-2" /> Confirm Import
            </button>
            <button className="btn btn-secondary" onClick={() => setPreview(null)}>
              <XCircle size={18} className="mr-2" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileImport;
