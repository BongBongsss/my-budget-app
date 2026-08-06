import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface EntryModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const EntryModal: React.FC<EntryModalProps> = ({ title, onClose, children }) => (
  <div className="entry-modal-overlay" role="presentation" onMouseDown={onClose}>
    <section
      className="entry-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <header className="entry-modal-header">
        <h2>{title}</h2>
        <button type="button" className="entry-modal-close" onClick={onClose} aria-label={`${title} 닫기`} title="닫기">
          <X size={20} />
        </button>
      </header>
      {children}
    </section>
  </div>
);

export default EntryModal;
