import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, CheckCheck, Trash2,
  ClipboardList, MessageSquare, Upload,
  CheckCircle2, XCircle, Clock, BarChart2,
  TrendingUp, Star,
} from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import type { Notification, NotificationType } from '../../types';
import './NotificationsPanel.css';

// ── Icon + colour per notification type ───────────────────────────────────────
interface TypeStyle { icon: ReactNode; color: string; bg: string; }

function getTypeStyle(type: NotificationType, title = ''): TypeStyle {
  const t = title.toLowerCase();

  if (type === 'task_assigned')  return { icon: <ClipboardList  size={14} />, color: '#1565c0', bg: '#dbeafe' };
  if (type === 'task_comment')   return { icon: <MessageSquare  size={14} />, color: '#7b1fa2', bg: '#f3e5f5' };
  if (type === 'task_submitted') return { icon: <Upload         size={14} />, color: '#00695c', bg: '#d1fae5' };
  if (type === 'task_approved')  return { icon: <CheckCircle2   size={14} />, color: '#2D5016', bg: '#dcfce7' };
  if (type === 'task_rejected')  return { icon: <XCircle        size={14} />, color: '#c62828', bg: '#fee2e2' };

  // task_status — differentiate by title keyword
  if (t.includes('deadline') || t.includes('approaching'))
    return { icon: <Clock       size={14} />, color: '#c2410c', bg: '#ffedd5' };
  if (t.includes('kpi') || t.includes('cycle') || t.includes('evaluation'))
    return { icon: <BarChart2   size={14} />, color: '#0e7490', bg: '#cffafe' };
  if (t.includes('performance'))
    return { icon: <TrendingUp  size={14} />, color: '#1565c0', bg: '#dbeafe' };
  if (t.includes('approved') || t.includes('approve'))
    return { icon: <CheckCircle2 size={14} />, color: '#2D5016', bg: '#dcfce7' };
  if (t.includes('reject') || t.includes('returned'))
    return { icon: <XCircle    size={14} />, color: '#c62828', bg: '#fee2e2' };

  return { icon: <Star size={14} />, color: '#78716c', bg: '#f5f5f4' };
}

function fmtTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

interface Props { onCountChange?: (n: number) => void; }

export default function NotificationsPanel({ onCountChange }: Props) {
  const navigate = useNavigate();
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
    pollRef.current = setInterval(fetchNotifs, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRead = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: 1 } : x));
      const next = Math.max(0, unread - 1);
      setUnread(next); onCountChange?.(next);
    }
    if (n.task_id) {
      const parts   = window.location.pathname.split('/');
      const dashIdx = parts.indexOf('dashboard');
      if (dashIdx !== -1 && parts[dashIdx + 1]) {
        setOpen(false);
        navigate(`/dashboard/${parts[dashIdx + 1]}/tasks/${n.task_id}`);
      }
    }
  };

  const handleMarkAll = async () => {
    setLoading(true);
    await markAllAsRead();
    setNotifs(prev => prev.map(x => ({ ...x, is_read: 1 })));
    setUnread(0); onCountChange?.(0);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteNotification(id);
    setNotifs(prev => {
      const updated  = prev.filter(x => x.id !== id);
      const newUnread = updated.filter(x => !x.is_read).length;
      setUnread(newUnread); onCountChange?.(newUnread);
      return updated;
    });
  };

  const today   = notifs.filter(n =>  isToday(n.created_at));
  const earlier = notifs.filter(n => !isToday(n.created_at));

  return (
    <div className="np-wrap" ref={panelRef}>
      {/* Bell button */}
      <button className="np-bell-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && (
          <span className="np-badge">{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="np-panel" role="dialog" aria-label="Notifications panel">

          {/* Header */}
          <div className="np-head">
            <div className="np-head-left">
              <span className="np-head-title">Notifications</span>
              {unread > 0 && (
                <span className="np-head-badge">{unread} new</span>
              )}
            </div>
            <div className="np-head-actions">
              {unread > 0 && (
                <button className="np-mark-all-btn" onClick={handleMarkAll} disabled={loading} title="Mark all as read">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button className="np-close-btn" onClick={() => setOpen(false)} title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="np-list">
            {notifs.length === 0 && (
              <div className="np-empty">
                <div className="np-empty-icon"><Bell size={26} /></div>
                <p className="np-empty-title">All caught up!</p>
                <p className="np-empty-sub">No notifications yet.</p>
              </div>
            )}

            {today.length > 0 && (
              <>
                <p className="np-group-label">Today</p>
                {today.map(n => <NotifItem key={n.id} n={n} onRead={handleRead} onDelete={handleDelete} />)}
              </>
            )}

            {earlier.length > 0 && (
              <>
                <p className="np-group-label">Earlier</p>
                {earlier.map(n => <NotifItem key={n.id} n={n} onRead={handleRead} onDelete={handleDelete} />)}
              </>
            )}
          </div>

          {notifs.length > 0 && unread === 0 && (
            <div className="np-footer">
              <CheckCircle2 size={13} /> You're all caught up
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Single notification item ──────────────────────────────────────────────────
interface ItemProps {
  n: Notification;
  onRead:   (n: Notification) => void;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

function NotifItem({ n, onRead, onDelete }: ItemProps) {
  const style   = getTypeStyle(n.type, n.title);
  const unread  = !n.is_read;

  return (
    <div className={`np-item${unread ? ' np-unread' : ''}`}
      style={unread ? { '--np-accent': style.color } as React.CSSProperties : undefined}
      onClick={() => onRead(n)}
    >
      {/* Unread dot */}
      {unread && <span className="np-dot" style={{ background: style.color }} />}

      {/* Icon bubble */}
      <div className="np-icon-bubble" style={{ background: style.bg, color: style.color }}>
        {style.icon}
      </div>

      {/* Body */}
      <div className="np-item-body">
        <p className="np-item-title">{n.title}</p>
        {n.message && <p className="np-item-msg">{n.message}</p>}
        <span className="np-item-time">{fmtTime(n.created_at)}</span>
      </div>

      {/* Delete */}
      <button className="np-del-btn" onClick={e => onDelete(e, n.id)} title="Dismiss">
        <X size={12} />
      </button>
    </div>
  );
}
