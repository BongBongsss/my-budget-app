import React, { useState } from 'react';
import { importFile } from '../api';
import { Upload, Loader2 } from 'lucide-react';

interface FileImportProps {
  onImportSuccess: () => void;
}

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

const FileImport: React.FC<FileImportProps> = ({ onImportSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsSubmitting(true);
    try {
      const res = await importFile(file);
      onImportSuccess();
      setImportSummary(res.data.summary);
    } catch (err: any) {
      console.error('File import failed:', err);
      alert(`가져오기에 실패했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setIsSubmitting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="import-section mb-8">
      <h3 className="text-lg font-bold mb-4">CSV/Excel 가져오기</h3>
      <div className="file-upload">
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          accept=".csv,.xlsx"
          className="hidden"
          disabled={isSubmitting}
        />
        <label htmlFor="fileInput" className={`upload-label ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
          {isSubmitting ? '가져오는 중...' : '파일 선택'}
        </label>
      </div>

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
    </div>
  );
};

export default FileImport;
