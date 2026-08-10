import { useState } from 'react';
import { CalendarX2, Plus, X } from 'lucide-react';
import { MissingRecurringTransaction, addMissingRecurring } from '../api';

interface Props {
  items: MissingRecurringTransaction[];
  onClose: () => void;
  onAdded: () => Promise<void> | void;
}

const money = (amount: number) => `${Math.round(amount).toLocaleString()}원`;

const RecurringMissingModal = ({ items, onClose, onAdded }: Props) => {
  const [remaining, setRemaining] = useState(items);
  const [addingId, setAddingId] = useState<string | null>(null);
  const add = async (item: MissingRecurringTransaction) => {
    setAddingId(item.id!);
    try {
      await addMissingRecurring(item.id!, item.scheduledDate.slice(0, 7));
      setRemaining((previous) => previous.filter((current) => current.id !== item.id));
      await onAdded();
      if (remaining.length === 1) onClose();
    } finally { setAddingId(null); }
  };
  if (remaining.length === 0) return null;
  return <div className="entry-modal-overlay recurring-missing-overlay">
    <section className="entry-modal recurring-missing-modal" role="dialog" aria-modal="true" aria-label="미확인 정기거래">
      <div className="entry-modal-header"><div><h3>미확인 정기거래</h3><p>승인된 거래와 비교해, 예정일이 지난 항목입니다.</p></div><button className="btn-icon" onClick={onClose}><X size={20} /></button></div>
      <div className="recurring-missing-list">{remaining.map((item) => <article className="recurring-missing-item" key={item.id}>
        <div><strong title={item.vendor}>{item.vendor}</strong><p><CalendarX2 size={14} /> {item.scheduledDate} · {item.category} · {money(item.amount)}</p></div>
        <button className="btn btn-primary" disabled={addingId === item.id} onClick={() => void add(item)}><Plus size={16} /> 거래에 추가</button>
      </article>)}</div>
      <div className="form-actions recurring-missing-actions"><button className="btn btn-secondary" onClick={onClose}>나중에</button></div>
    </section>
  </div>;
};

export default RecurringMissingModal;
