import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Trash2, X } from 'lucide-react';
import { Notice, createNotice, deleteNotice, getNotices, markNoticeRead } from '../api';

interface NoticeCenterProps {
  isAdmin: boolean;
  onUnreadCountChange?: (count: number) => void;
}

const NoticeCenter: React.FC<NoticeCenterProps> = ({ isAdmin, onUnreadCountChange }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadNotices, setUnreadNotices] = useState<Notice[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [popupNotice, setPopupNotice] = useState<Notice | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const unreadCount = unreadNotices.length;

  const sortedNotices = useMemo(
    () => [...notices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notices]
  );

  const loadNotices = async () => {
    const [allRes, unreadRes] = await Promise.all([
      getNotices(),
      getNotices({ unread: true }),
    ]);
    setNotices(allRes.data);
    setUnreadNotices(unreadRes.data);
    setPopupNotice((current) => current || unreadRes.data[0] || null);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await createNotice({ title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      await loadNotices();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRead = async (notice: Notice) => {
    await markNoticeRead(notice.id);
    setPopupNotice(null);
    await loadNotices();
  };

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm('이 공지를 삭제하시겠습니까?')) return;
    await deleteNotice(notice.id);
    if (popupNotice?.id === notice.id) setPopupNotice(null);
    await loadNotices();
  };

  return (
    <>
      <button className="btn btn-secondary header-action-btn" onClick={() => setIsListOpen(true)} style={{ position: 'relative' }}>
        <Bell size={16} />
        공지
        {unreadCount > 0 && (
          <span className="notice-badge">{unreadCount}</span>
        )}
      </button>

      {popupNotice && createPortal(
        <div className="modal-overlay">
          <div className="notice-popup">
            <div className="notice-header">
              <div>
                <h3>{popupNotice.title}</h3>
                <p>{new Date(popupNotice.createdAt).toLocaleString()}</p>
              </div>
              <button className="btn-icon" onClick={() => setPopupNotice(null)} title="나중에 보기">
                <X size={18} />
              </button>
            </div>
            <div className="notice-body">{popupNotice.body}</div>
            <div className="notice-actions">
              <button className="btn btn-secondary" onClick={() => setPopupNotice(null)}>나중에 보기</button>
              <button className="btn btn-primary" onClick={() => handleRead(popupNotice)}>확인</button>
            </div>
          </div>
        </div>
      , document.body)}

      {isListOpen && createPortal(
        <div className="modal-overlay">
          <div className="notice-list-modal">
            <div className="notice-header">
              <div>
                <h3>공지사항</h3>
                <p>확인한 공지도 이곳에서 다시 볼 수 있습니다.</p>
              </div>
              <button className="btn-icon" onClick={() => setIsListOpen(false)} title="닫기">
                <X size={18} />
              </button>
            </div>

            {isAdmin && (
              <div className="notice-form">
                <input
                  className="edit-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목"
                />
                <textarea
                  className="edit-input"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="내용"
                  rows={4}
                />
                <div className="notice-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={!title.trim() || !body.trim() || isSaving}
                  >
                    등록
                  </button>
                </div>
              </div>
            )}

            <div className="notice-list">
              {sortedNotices.length === 0 ? (
                <div className="notice-empty">등록된 공지가 없습니다.</div>
              ) : (
                sortedNotices.map((notice) => {
                  const isUnread = unreadNotices.some((item) => item.id === notice.id);
                  return (
                    <div key={notice.id} className={`notice-item ${isUnread ? 'unread' : ''}`}>
                      <div className="notice-item-main">
                        <div className="notice-item-title">
                          {isUnread && <span className="notice-dot" />}
                          {notice.title}
                        </div>
                        <div className="notice-item-date">{new Date(notice.createdAt).toLocaleString()}</div>
                        <div className="notice-body">{notice.body}</div>
                      </div>
                      <div className="notice-item-actions">
                        {isUnread && (
                          <button className="btn btn-secondary" onClick={() => handleRead(notice)}>확인</button>
                        )}
                        {isAdmin && (
                          <button className="btn-icon" onClick={() => handleDelete(notice)} title="삭제">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default NoticeCenter;
