import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, ClipboardList } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import type { Notification, NotificationType } from '../../types';
import './NotificationsPanel.css';

const TYPE_ICONS: Record<NotificationType, string> = {
  task_assigned:  '📋',
  task_comment:   '💬',
  task_submitted: '📤',
  task_approved:  '✅',
  task_rejected:  '❌',
  task_status:    '🔄',
};

function fmtTime(iso: string) {
  const now  = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

interface Props {
  onCountChange?: (n: number) => void;
}

export default function NotificationsPanel({ onCountChange }: Props) {
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notification[]>([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.notifications);
      setUnread(res.unread_count);
      onCountChange?.(res.unread_count);
    } catch { /* silent */ }
  }, [onCountChange]);

  useEffect(() => {
    fetchNotifs();
    pollRef.current = setInterval(fetchNotifs, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => { setOpen(o => !o); };

  const handleRead = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
      setUnread(u => Math.max(0, u - 1));
      onCountChange?.(Math.max(0, unread - 1));
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    await markAllAsRead();
    setNotifs(prev => prev.map(x => ({ ...x, is_read: 1 })));
    setUnread(0);
    onCountChange?.(0);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifs(prev => {
      const updated = prev.filter(x => x.id !== id);
      const newUnread = updated.filter(x => !x.is_read).length;
      setUnread(newUnread);
      onCountChange?.(newUnread);
      return updated;
    });
  };

  return (
    <div className="np-wrap" ref={panelRef}>
      <button className="np-bell-btn" onClick={handleOpen} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="np-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="np-panel" role="dialog" aria-label="Notifications panel">
          <div className="np-head">
            <span className="np-head-title">Notifications</span>
            <div className="np-head-actions">
              {unread > 0 && (
                <button className="np-action-btn" onClick={handleMarkAll} disabled={loading} title="Mark all as read">
                  <CheckCheck size={15} />
                </button>
              )}
              <button className="np-action-btn" onClick={() => setOpen(false)}>
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="np-list">
            {notifs.length === 0 && (
              <div className="np-empty">
                <ClipboardList size={30} />
                <p>No notifications yet</p>
              </div>
            )}
            {notifs.map(n => (
              <div
                key={n.id}
                className={`np-item ${!n.is_read ? 'np-unread' : ''}`}
                onClick={() => handleRead(n)}
              >
                <span className="np-item-icon">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                <div className="np-item-body">
                  <p className="np-item-title">{n.title}</p>
                  {n.message && <p className="np-item-msg">{n.message}</p>}
                  <span className="np-item-time">{fmtTime(n.created_at)}</span>
                </div>
                <button className="np-del-btn" onClick={e => handleDelete(e, n.id)} title="Dismiss">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
