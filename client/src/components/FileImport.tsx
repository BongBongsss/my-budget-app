import React, { useState } from 'react';
import { importFile, bulkAddTransactions, Transaction } from '../api';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FileImportProps {
  onImportSuccess: () => void;
}

const FileImport: React.FC<FileImportProps> = ({ onImportSuccess }) => {
  const [preview, setPreview] = useState<Transaction[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsSubmitting(true);
    try {
      const res = await importFile(file);
      setPreview(res.data);
    } catch (err: any) {
      console.error('File parsing failed:', err);
      alert(`파일 분석 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
      // 같은 파일을 다시 선택할 수 있도록 input 초기화
      e.target.value = '';
    }
  };

  const handleConfirm = async () => {
    if (!preview || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await bulkAddTransactions(preview);
      setPreview(null);
      onImportSuccess();
      alert('데이터를 성공적으로 가져왔습니다.');
    } catch (err: any) {
      console.error('Import failed:', err);
      alert(`데이터를 가져오는 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="import-section mb-8">
      <h3 className="text-lg font-bold mb-4">CSV/Excel 가져오기</h3>
      {!preview ? (
        <div className="file-upload">
          <input 
            type="file" 
            id="fileInput" 
            onChange={handleFileChange} 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
            disabled={isSubmitting}
          />
          <label htmlFor="fileInput" className={`upload-label ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />} 
            {isSubmitting ? '파일 분석 중...' : '파일 선택'}
          </label>
        </div>
      ) : (
        <div className="preview-container bg-white p-4 rounded shadow-sm border">
          <h4 className="font-bold mb-3">미리보기 ({preview.length}개 항목)</h4>
          <div className="preview-table overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border-b text-left">날짜</th>
                  <th className="p-2 border-b text-left">내용</th>
                  <th className="p-2 border-b text-right">금액</th>
                  <th className="p-2 border-b text-left">카테고리</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td className="p-2 border-b">{p.date}</td>
                    <td className="p-2 border-b">{p.vendor}</td>
                    <td className="p-2 border-b text-right">₩{p.amount.toLocaleString()}</td>
                    <td className="p-2 border-b">{p.category}</td>
                  </tr>
                ))}
                {preview.length > 5 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-center text-gray-500 bg-gray-50">
                      ...외 {preview.length - 5}개의 항목이 더 있습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="preview-actions mt-4 flex gap-2">
            <button 
              className="btn btn-primary flex items-center" 
              onClick={handleConfirm} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <CheckCircle size={18} className="mr-2" />} 
              가져오기 확정
            </button>
            <button 
              className="btn btn-secondary flex items-center" 
              onClick={() => setPreview(null)}
              disabled={isSubmitting}
            >
              <XCircle size={18} className="mr-2" /> 취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileImport;
