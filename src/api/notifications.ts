import client from './client';
import type { Notification, NotificationType } from '../types';

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const { data } = await client.get<NotificationsResponse>('/notifications');
  return data;
}

export async function markAsRead(id: number): Promise<void> {
  await client.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await client.patch('/notifications/read-all');
}

export async function deleteNotification(id: number): Promise<void> {
  await client.delete(`/notifications/${id}`);
}

// ── Client portal notifications ──────────────────────────────────────────────

interface RawClientNotif {
  id: number;
  client_id: number;
  type: 'project_added' | 'project_updated' | 'new_message';
  title: string;
  body: string | null;
  is_read: number;
  created_at: string;
}

interface RawClientResponse {
  success: boolean;
  notifications: RawClientNotif[];
  unread: number;
}

export async function getClientNotifications(): Promise<NotificationsResponse> {
  const { data } = await client.get<RawClientResponse>('/client/notifications');
  return {
    success: data.success,
    notifications: data.notifications.map(n => ({
      id: n.id,
      users_id: 0,
      type: n.type as NotificationType,
      title: n.title,
      message: n.body ?? undefined,
      is_read: n.is_read,
      created_at: n.created_at,
    })),
    unread_count: data.unread,
  };
}

export async function markAllClientRead(): Promise<void> {
  await client.put('/client/notifications/read');
}
