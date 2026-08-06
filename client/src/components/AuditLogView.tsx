import { useEffect, useState } from 'react';
import { Filter, RefreshCw, RotateCcw } from 'lucide-react';
import { AuditLog, getAuditLogs, getLatestAuditBatch, restoreAuditLog, restoreLatestAuditBatch } from '../api';

type Props = {
  isAdmin: boolean;
  onRestored: () => void;
};

const actionLabels: Record<string, string> = {
  create: '추가',
  update: '수정',
  delete: '삭제',
  restore: '복구',
  approve: '승인',
};

const actionColors: Record<string, { bg: string; color: string }> = {
  create: { bg: '#dcfce7', color: '#166534' },
  update: { bg: '#dbeafe', color: '#1d4ed8' },
  delete: { bg: '#fee2e2', color: '#991b1b' },
  restore: { bg: '#fef3c7', color: '#92400e' },
  approve: { bg: '#e0e7ff', color: '#4338ca' },
};

const entityLabels: Record<string, string> = {
  transaction: '거래',
  importRow: 'Import 후보',
  asset: '자산',
};

const formatAmount = (amount?: number) => {
  if (typeof amount !== 'number') return '';
  return `${amount.toLocaleString()}원`;
};

const getTransactionSummary = (log: AuditLog) => {
  const data = log.afterData || log.beforeData || {};
  if (log.entityType === 'asset') {
    const name = data.name || '자산';
    const balance = formatAmount(data.balance);
    const type = data.type ? ` / ${data.type}` : '';
    return `${name}${balance ? ` / ${balance}` : ''}${type}`;
  }

  const vendor = data.vendor || '거래';
  const amount = formatAmount(data.amount);
  const category = data.category ? ` / ${data.category}` : '';

  return `${vendor}${amount ? ` / ${amount}` : ''}${category}`;
};

const transactionFields = ['date', 'time', 'type', 'category', 'subcategory', 'vendor', 'amount', 'memo', 'member'];
const assetFields = ['name', 'type', 'balance', 'memo'];

const fieldLabels: Record<string, string> = {
  date: '날짜',
  time: '시간',
  type: '유형',
  category: '카테고리',
  subcategory: '소분류',
  vendor: '거래처',
  amount: '금액',
  memo: '메모',
  member: '구성원',
  name: '이름',
  balance: '잔액',
};

const formatAuditValue = (field: string, value: unknown) => {
  if (value === null || value === undefined || value === '') return '(없음)';
  if (field === 'amount' || field === 'balance') return formatAmount(Number(value));
  if (field === 'type') {
    if (value === 'income') return '수입';
    if (value === 'expense') return '지출';
  }
  return String(value);
};

const getChangedFields = (log: AuditLog) => {
  if (!log.beforeData || !log.afterData) return [];
  const fields = log.entityType === 'asset' ? assetFields : transactionFields;
  return fields.filter((field) => log.beforeData[field] !== log.afterData[field]);
};

const getDeletedDetails = (log: AuditLog) => {
  if (log.action !== 'delete' || !log.beforeData) return '';
  const fields = log.entityType === 'asset' ? assetFields : transactionFields;
  return fields
    .filter((field) => log.beforeData[field] !== null && log.beforeData[field] !== undefined && log.beforeData[field] !== '')
    .map((field) => `${fieldLabels[field]}: ${formatAuditValue(field, log.beforeData[field])}`)
    .join(' · ');
};

function AuditLogView({ isAdmin, onRestored }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [latestBatch, setLatestBatch] = useState<{ count: number } | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        entityType: entityType || undefined,
        action: action || undefined,
        page,
        limit: itemsPerPage,
      });
      setLogs(res.data.logs);
      setExpandedLogIds(new Set());
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      const batch = await getLatestAuditBatch();
      setLatestBatch(batch.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityType, action, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [entityType, action, itemsPerPage]);

  const handleRestore = async (log: AuditLog) => {
    if (!isAdmin) return;
    const message = log.action === 'update'
      ? '이 수정 시점의 이전 값으로 되돌릴까요? 이후 변경된 값도 영향을 받을 수 있습니다.'
      : '삭제된 항목을 복구할까요?';
    if (!window.confirm(message)) return;

    setRestoringId(log.id);
    try {
      await restoreAuditLog(log.id);
      await fetchLogs();
      onRestored();
    } finally {
      setRestoringId(null);
    }
  };

  const handleRestoreLatestBatch = async () => {
    if (!latestBatch || !isAdmin) return;
    if (!window.confirm(`직전 일괄 작업 ${latestBatch.count}건을 모두 되돌릴까요?`)) return;
    await restoreLatestAuditBatch();
    await fetchLogs();
    onRestored();
  };

  const toggleLogDetails = (id: string) => {
    setExpandedLogIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="transaction-list animate-fadeIn">
      <div className="audit-log-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0 }}>활동 로그</h3>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
            거래와 Import 후보의 추가, 수정, 삭제, 복구 이력을 확인합니다.
          </div>
        </div>

        <div className="audit-log-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#64748b" />
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}
          >
            <option value="">전체 대상</option>
            <option value="transaction">거래</option>
            <option value="importRow">Import 후보</option>
            <option value="asset">자산</option>
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}
          >
            <option value="">전체 작업</option>
            <option value="create">추가</option>
            <option value="update">수정</option>
            <option value="delete">삭제</option>
            <option value="restore">복구</option>
            <option value="approve">승인</option>
          </select>
          <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            새로고침
          </button>
          {isAdmin && latestBatch && (
            <button className="btn btn-primary" onClick={handleRestoreLatestBatch} disabled={loading}>
              <RotateCcw size={16} style={{ marginRight: '6px' }} /> 직전 작업 일괄 되돌리기 ({latestBatch.count})
            </button>
          )}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <table className="audit-log-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>작업</th>
            <th>대상</th>
            <th>내용</th>
            <th>사용자</th>
            <th style={{ textAlign: 'center' }}>복구</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const colors = actionColors[log.action] || { bg: '#e2e8f0', color: '#475569' };
            const canRestore = isAdmin && log.isRestorable;
            const changedFields = getChangedFields(log);
            const deletedDetails = getDeletedDetails(log);

            const isExpanded = expandedLogIds.has(log.id);

            return (
              <tr
                key={log.id}
                className={isExpanded ? 'is-expanded' : ''}
                onClick={() => toggleLogDetails(log.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleLogDetails(log.id);
                  }
                }}
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <span style={{ background: colors.bg, color: colors.color, padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td>{entityLabels[log.entityType] || log.entityType}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{getTransactionSummary(log)}</div>
                  {log.action === 'update' && (
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>
                      {changedFields.length > 0 ? changedFields.map((field) => (
                        <div key={field}>
                          {fieldLabels[field]}: {formatAuditValue(field, log.beforeData[field])} → {formatAuditValue(field, log.afterData[field])}
                        </div>
                      )) : '변경된 항목 없음'}
                    </div>
                  )}
                  {log.action === 'delete' && deletedDetails && (
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '3px' }}>
                      삭제된 항목: {deletedDetails}
                    </div>
                  )}
                </td>
                <td>{log.actorRole || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  {canRestore ? (
                    <button
                      className="btn btn-secondary"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRestore(log);
                      }}
                      disabled={restoringId === log.id}
                      style={{ padding: '5px 10px' }}
                    >
                      <RotateCcw size={15} style={{ marginRight: '5px' }} />
                      {log.action === 'update' ? '되돌리기' : '복구'}
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                표시할 로그가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination mt-2 flex justify-center gap-2" style={{ alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          disabled={page === 1 || loading}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          이전
        </button>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {page} / {totalPages} ({total.toLocaleString()}건)
        </span>
        <button
          className="btn btn-secondary"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default AuditLogView;
