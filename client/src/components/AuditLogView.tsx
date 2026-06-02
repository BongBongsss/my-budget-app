import { useEffect, useMemo, useState } from 'react';
import { Filter, RefreshCw, RotateCcw } from 'lucide-react';
import { AuditLog, getAuditLogs, restoreAuditLog } from '../api';

type Props = {
  isAdmin: boolean;
  onRestored: () => void;
};

const actionLabels: Record<string, string> = {
  create: '추가',
  update: '수정',
  delete: '삭제',
  restore: '복구',
};

const actionColors: Record<string, { bg: string; color: string }> = {
  create: { bg: '#dcfce7', color: '#166534' },
  update: { bg: '#dbeafe', color: '#1d4ed8' },
  delete: { bg: '#fee2e2', color: '#991b1b' },
  restore: { bg: '#fef3c7', color: '#92400e' },
};

const formatAmount = (amount?: number) => {
  if (typeof amount !== 'number') return '';
  return `${amount.toLocaleString()}원`;
};

const getTransactionSummary = (log: AuditLog) => {
  const data = log.afterData || log.beforeData || {};
  const vendor = data.vendor || '거래';
  const amount = formatAmount(data.amount);
  const category = data.category ? ` / ${data.category}` : '';

  return `${vendor}${amount ? ` / ${amount}` : ''}${category}`;
};

const getChangeSummary = (log: AuditLog) => {
  if (log.action !== 'update' || !log.beforeData || !log.afterData) {
    return '';
  }

  const fields = ['date', 'type', 'category', 'vendor', 'amount', 'memo', 'member'];
  const changed = fields.filter((field) => log.beforeData[field] !== log.afterData[field]);

  if (changed.length === 0) return '변경된 필드 없음';
  return `변경: ${changed.join(', ')}`;
};

function AuditLogView({ isAdmin, onRestored }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        entityType: 'transaction',
        action: action || undefined,
        limit: 150,
      });
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [action]);

  const restoredAfterDeleteLogIds = useMemo(() => {
    return new Set(
      logs
        .filter((log) => log.action === 'delete')
        .filter((deleteLog) => logs.some((restoreLog) => (
          restoreLog.entityId === deleteLog.entityId
          && restoreLog.action === 'restore'
          && new Date(restoreLog.createdAt).getTime() > new Date(deleteLog.createdAt).getTime()
        )))
        .map((log) => log.id)
    );
  }, [logs]);

  const handleRestore = async (log: AuditLog) => {
    if (!isAdmin) return;
    if (!window.confirm('이 삭제 거래를 복구할까요?')) return;

    setRestoringId(log.id);
    try {
      await restoreAuditLog(log.id);
      await fetchLogs();
      onRestored();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="transaction-list animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0 }}>활동 로그</h3>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
            거래 추가, 수정, 삭제, 복구 이력을 확인합니다.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#64748b" />
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
          </select>
          <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            새로고침
          </button>
        </div>
      </div>

      <table>
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
            const canRestore = isAdmin
              && log.action === 'delete'
              && log.entityType === 'transaction'
              && !restoredAfterDeleteLogIds.has(log.id);

            return (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <span style={{ background: colors.bg, color: colors.color, padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    {actionLabels[log.action] || log.action}
                  </span>
                </td>
                <td>{log.entityType === 'transaction' ? '거래' : log.entityType}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{getTransactionSummary(log)}</div>
                  {getChangeSummary(log) && (
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{getChangeSummary(log)}</div>
                  )}
                </td>
                <td>{log.actorRole || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  {canRestore ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleRestore(log)}
                      disabled={restoringId === log.id}
                      style={{ padding: '5px 10px' }}
                    >
                      <RotateCcw size={15} style={{ marginRight: '5px' }} />
                      복구
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
    </div>
  );
}

export default AuditLogView;
